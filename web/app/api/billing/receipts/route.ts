import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { createStripeClient } from "@/lib/billing/stripeClient";
import { hashForLogs, logError } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";

const stripe = createStripeClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReceiptItem = {
  id: string;
  number: string | null;
  status: string | null;
  amount_paid: number;
  currency: string | null;
  created_at: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
};

export async function GET() {
  try {
    if (!isLaunchFlagEnabled("billingUnlock")) {
      return NextResponse.json({ ok: false, receipts: [], message: "Receipts are temporarily unavailable." }, { status: 503 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user?.email) {
      return NextResponse.json({ ok: false, receipts: [], message: "Please log in first." }, { status: 401 });
    }

    const receiptLimit = await rateLimitAsync(
      `user:${hashForLogs(user.id)}:billing-receipts`,
      20,
      10 * 60 * 1000,
    );
    if (!receiptLimit.ok) {
      const response = NextResponse.json(
        { ok: false, receipts: [], message: "Too many receipt requests. Try again shortly." },
        { status: 429 },
      );
      response.headers.set("retry-after", String(Math.ceil(receiptLimit.resetMs / 1000)));
      return response;
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, receipts: [], message: "Database is not configured." }, { status: 500 });
    }

    // DB-first: authoritative app view, populated by webhook.
    const { data: storedReceipts, error: storedError } = await admin
      .from("billing_receipts")
      .select("id, stripe_invoice_id, invoice_number, status, amount_paid, currency, created_at, hosted_invoice_url, invoice_pdf")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (storedError) {
      return NextResponse.json(
        { ok: false, receipts: [], message: "Failed to load stored receipts." },
        { status: 500 },
      );
    }

    if (Array.isArray(storedReceipts) && storedReceipts.length > 0) {
      const receipts: ReceiptItem[] = storedReceipts.map((receipt: any) => ({
        id: receipt.stripe_invoice_id || receipt.id,
        number: receipt.invoice_number || null,
        status: receipt.status || null,
        amount_paid: typeof receipt.amount_paid === "number" ? receipt.amount_paid : 0,
        currency: receipt.currency || null,
        created_at: receipt.created_at,
        hosted_invoice_url: receipt.hosted_invoice_url || null,
        invoice_pdf: receipt.invoice_pdf || null,
      }));

      return NextResponse.json({ ok: true, receipts });
    }

    // Fallback to Stripe live data for environments where webhook/table is not ready.
    if (!stripe) {
      return NextResponse.json({ ok: true, receipts: [] });
    }

    const { data: passCustomers, error: passCustomerError } = await supabase
      .from("passes")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(10);

    if (passCustomerError) {
      return NextResponse.json({ ok: false, receipts: [], message: "Failed to load billing account links." }, { status: 500 });
    }

    const customerIds = [...new Set((passCustomers || [])
      .map((pass: any) => pass.stripe_customer_id)
      .filter((value: unknown): value is string => typeof value === "string" && value.length > 0))];

    if (customerIds.length === 0) {
      return NextResponse.json({ ok: true, receipts: [] });
    }

    const invoiceLists = await Promise.all(customerIds.map((customer) => stripe.invoices.list({ customer, limit: 50 })));
    const invoices = invoiceLists
      .flatMap((list) => list.data)
      .sort((a, b) => b.created - a.created)
      .slice(0, 50);

    const receipts: ReceiptItem[] = invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number || null,
      status: invoice.status || null,
      amount_paid: typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0,
      currency: invoice.currency || null,
      created_at: new Date(invoice.created * 1000).toISOString(),
      hosted_invoice_url: invoice.hosted_invoice_url || null,
      invoice_pdf: invoice.invoice_pdf || null
    }));

    return NextResponse.json({ ok: true, receipts });
  } catch (err: any) {
    logError({
      msg: "billing.receipts_failed",
      outcome: "internal_error",
      err: { name: err?.name || "Error", message: err?.message || "Failed to load receipts", code: err?.code },
    });
    return NextResponse.json(
      { ok: false, receipts: [], message: "Failed to load receipts." },
      { status: 500 }
    );
  }
}
