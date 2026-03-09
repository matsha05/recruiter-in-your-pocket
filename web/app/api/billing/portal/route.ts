import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { getAppUrlForRequest } from "@/lib/runtime/appUrl";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
  : null;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveCustomerIdByEmail(email: string): Promise<string | null> {
  if (!stripe) return null;

  const directLookup = await stripe.customers.list({ email, limit: 1 });
  if (directLookup.data.length > 0) {
    return directLookup.data[0].id;
  }

  return null;
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
    try {
      const body = await req.json();
      if (body?.returnTo === "restore") {
        returnTo = "restore";
      }
    } catch {
      // Body is optional.
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user?.email) {
      return NextResponse.json({ ok: false, message: "Please log in first." }, { status: 401 });
    }

    let customerId = await resolveCustomerIdByEmail(user.email.toLowerCase());

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
    console.error("[billing.portal] error:", err?.message);
    return NextResponse.json({ ok: false, message: "Failed to open billing portal." }, { status: 500 });
  }
}
