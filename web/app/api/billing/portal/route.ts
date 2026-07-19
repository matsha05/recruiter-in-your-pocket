import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { getAppUrlForRequest } from "@/lib/runtime/appUrl";
import { createStripeClient } from "@/lib/billing/stripeClient";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { hashForLogs, logError } from "@/lib/observability/logger";

const stripe = createStripeClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveCustomerIdByEmail(email: string, userId: string): Promise<string | null> {
  if (!stripe) return null;

  const directLookup = await stripe.customers.list({ email, limit: 10 });
  return directLookup.data.find((customer) => (
    !customer.deleted &&
    customer.metadata?.riyp_app === "recruiter-in-your-pocket" &&
    customer.metadata?.riyp_user_id === userId
  ))?.id || null;
}

export async function POST(req: Request) {
  try {
    if (!isLaunchFlagEnabled("billingUnlock")) {
      return NextResponse.json({ ok: false, message: "Billing portal is temporarily unavailable." }, { status: 503 });
    }

    if (!stripe) {
      return NextResponse.json({ ok: false, message: "Payments are not configured yet." }, { status: 500 });
    }

    let returnTo: "settings" | "restore" = "settings";
    const body = await readJsonWithLimit<any>(req, 16 * 1024);
    if (body?.returnTo === "restore") {
      returnTo = "restore";
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user?.email) {
      return NextResponse.json({ ok: false, message: "Please log in first." }, { status: 401 });
    }

    const portalLimit = await rateLimitAsync(
      `user:${hashForLogs(user.id)}:billing-portal`,
      10,
      10 * 60 * 1000,
    );
    if (!portalLimit.ok) {
      const response = NextResponse.json(
        { ok: false, message: "Too many billing portal requests. Try again shortly." },
        { status: 429 },
      );
      response.headers.set("retry-after", String(Math.ceil(portalLimit.resetMs / 1000)));
      return response;
    }

    const { data: customerPasses } = await supabase
      .from("passes")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);
    let customerId = customerPasses?.[0]?.stripe_customer_id || null;

    if (!customerId) {
      customerId = await resolveCustomerIdByEmail(user.email.toLowerCase(), user.id);
    }

    if (!customerId) {
      // Fallback: try from latest checkout session id stored in passes.
      const { data: recentPasses } = await supabase
        .from("passes")
        .select("checkout_session_id")
        .eq("user_id", user.id)
        .not("checkout_session_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);

      for (const pass of recentPasses || []) {
        const sessionId = pass.checkout_session_id;
        if (!sessionId || typeof sessionId !== "string") continue;

        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (typeof session.customer === "string" && session.customer) {
            customerId = session.customer;
            break;
          }
        } catch {
          // Ignore invalid or old session ids.
        }
      }
    }

    if (!customerId) {
      return NextResponse.json(
        {
          ok: false,
          message: "No billing account found yet. If you just paid, try again in a minute."
        },
        { status: 404 }
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnTo === "restore"
        ? `${getAppUrlForRequest(req)}/purchase/restore?billing=updated`
        : `${getAppUrlForRequest(req)}/settings/billing?billing=updated`
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (err: any) {
    logError({
      msg: "billing.portal.failed",
      outcome: "provider_error",
      err: { name: err?.name || "BillingPortalError", message: err?.message || "Portal failed" },
    });
    const requestStatus = Number(err?.httpStatus);
    if (requestStatus === 400 || requestStatus === 413) {
      return NextResponse.json(
        { ok: false, message: requestStatus === 413 ? "Request body too large." : "Invalid request body." },
        { status: requestStatus },
      );
    }
    return NextResponse.json({ ok: false, message: "Failed to open billing portal." }, { status: 500 });
  }
}
