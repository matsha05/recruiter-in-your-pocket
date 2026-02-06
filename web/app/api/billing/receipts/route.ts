import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
  : null;

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
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user?.email) {
      return NextResponse.json({ ok: false, receipts: [], message: "Please log in first." }, { status: 401 });
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

    if (!storedError && Array.isArray(storedReceipts) && storedReceipts.length > 0) {
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

    const customers = await stripe.customers.list({ email: user.email.toLowerCase(), limit: 1 });
    const customer = customers.data[0];
    if (!customer?.id) {
      return NextResponse.json({ ok: true, receipts: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 50
    });

    const receipts: ReceiptItem[] = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number || null,
      status: invoice.status || null,
      amount_paid: typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0,
      currency: invoice.currency || null,
      created_at: new Date(invoice.created * 1000).toISOString(),
      hosted_invoice_url: invoice.hosted_invoice_url || null,
      invoice_pdf: invoice.invoice_pdf || null
    }));

    // Best-effort backfill into billing_receipts.
    if (receipts.length > 0) {
      const upserts = invoices.data.map((invoice) => ({
        user_id: user.id,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: customer.id,
        checkout_session_id: (invoice as any).checkout_session || null,
        invoice_number: invoice.number || null,
        status: invoice.status || null,
        currency: invoice.currency || null,
        amount_paid: typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0,
        hosted_invoice_url: invoice.hosted_invoice_url || null,
        invoice_pdf: invoice.invoice_pdf || null,
        created_at: new Date(invoice.created * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }));

      await admin
        .from("billing_receipts")
        .upsert(upserts, { onConflict: "stripe_invoice_id" });
    }

    return NextResponse.json({ ok: true, receipts });
  } catch (err: any) {
    console.error("[billing.receipts] error:", err?.message);
    return NextResponse.json(
      { ok: false, receipts: [], message: "Failed to load receipts." },
      { status: 500 }
    );
  }
}
