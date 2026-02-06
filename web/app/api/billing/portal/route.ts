import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
  : null;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

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
        ? `${getBaseUrl()}/purchase/restore?billing=updated`
        : `${getBaseUrl()}/settings/billing?billing=updated`
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (err: any) {
    console.error("[billing.portal] error:", err?.message);
    return NextResponse.json({ ok: false, message: "Failed to open billing portal." }, { status: 500 });
  }
}
