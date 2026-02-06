"use client";

import Footer from "@/components/landing/Footer";
import { LegalNav } from "@/components/legal/LegalNav";
import { Lock, ShieldCheck } from "lucide-react";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";

export default function SecurityClient() {
  return (
    <>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <LegalNav />

        <header className="mb-14 text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
            Security & Data Handling
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Plain-English detail on what we collect, how long we keep it, and how you stay in control.
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-3">Last updated: {LEGAL_LAST_UPDATED}</p>
        </header>

        <section className="rounded-xl border border-border/50 bg-card p-6 mb-8 overflow-x-auto">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand" />
            Data handling truth table
          </h2>
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Data Type</th>
                <th className="py-2 pr-3 font-semibold">Purpose</th>
                <th className="py-2 pr-3 font-semibold">Retention</th>
                <th className="py-2 pr-3 font-semibold">Your Control</th>
                <th className="py-2 font-semibold">Processor</th>
              </tr>
            </thead>
            <tbody>
              {DATA_HANDLING_ROWS.map((row) => (
                <tr key={row.dataType} className="border-b border-border/20 align-top">
                  <td className="py-3 pr-3 text-foreground font-medium">{row.dataType}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{row.purpose}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{row.retention}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{row.userControl}</td>
                  <td className="py-3 text-muted-foreground">{row.processor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-brand/20 bg-brand/5 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-foreground">Operational commitments</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {TRUST_PROMISES.map((line, index) => (
              <li key={line}>
                {index + 1}. {line}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
