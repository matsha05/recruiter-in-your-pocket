"use client";

import Link from "next/link";
import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";
import { ShieldCheck, Lock, Receipt, Trash2, CheckCircle2 } from "lucide-react";
import { LEGAL_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";

const trustBlocks = [
  {
    icon: ShieldCheck,
    title: "Evidence over overclaim",
    body: "Scores are presented as hiring-signal estimates, not guaranteed outcomes."
  },
  {
    icon: Lock,
    title: "Clear data handling",
    body: "Security and retention behavior is documented in plain language on /security and /privacy."
  },
  {
    icon: Receipt,
    title: "Transparent billing controls",
    body: "Checkout, invoices, cancellations, and card updates are handled through Stripe."
  },
  {
    icon: Trash2,
    title: "User-controlled deletion",
    body: "Delete account removes reports and usage history from our app database."
  }
];

export default function TrustClient() {
  return (
    <>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <LegalNav />

        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
            Trust, In Operational Terms
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            This page summarizes what we claim, where to verify it, and what controls you have in-product.
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-3">Last updated: {LEGAL_LAST_UPDATED}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 mb-8">
          {trustBlocks.map((block) => (
            <div key={block.title} className="rounded-xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <block.icon className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-semibold text-foreground">{block.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{block.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-brand/20 bg-brand/5 p-6 mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Commitments</h2>
          <ul className="space-y-2">
            {TRUST_PROMISES.map((line) => (
              <li key={line} className="text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          Verify details:
          {" "}
          <Link href="/security" className="underline underline-offset-4 hover:text-foreground">Security & Data Handling</Link>
          {" · "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>
          {" · "}
          <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">Methodology</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
