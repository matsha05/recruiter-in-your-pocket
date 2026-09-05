import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Support",
  description: "Help with reports, sign-in, billing, privacy, and account controls.",
};

const supportTopics = [
  {
    title: "Report or upload issue",
    body: "Tell us what you were trying to do, the file type, and the error you saw. Do not email your resume unless we specifically ask for it.",
  },
  {
    title: "Sign-in or restore access",
    body: "Use the email from checkout or your existing account. Include the email address and the approximate purchase date, but never send a password or card number.",
  },
  {
    title: "Billing or refund",
    body: "Include the email you used at checkout and the purchase date. A receipt ID helps too, if you have it. We can investigate duplicate or unrecognized charges.",
  },
  {
    title: "Privacy or deletion",
    body: "You can export your data or permanently delete your account from Settings. Contact support if either action fails.",
  },
];

export default function SupportPage() {
  return (
    <LegalShell
      pageKey="support"
      eyebrow="Support"
      title="Help with your report or account"
      description="Tell us where you got stuck and what you expected to happen. We will never ask for your password or full card number."
    >
      <section className="border-y border-line bg-surface-sky/30 px-5 py-7 md:px-7 md:py-9">
        <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Support inbox</p>
        <h2 className="mt-3 break-all font-display text-xl riyp-weight-560 tracking-[-0.025em] text-foreground sm:text-2xl">support@recruiterinyourpocket.com</h2>
        <p className="mt-3 text-[1.0625rem] leading-8 text-muted-foreground">
          A screenshot can help us understand the problem. Remove personal information before sending it.
        </p>
        <Link
          href="mailto:support@recruiterinyourpocket.com?subject=Recruiter%20in%20Your%20Pocket%20support"
          className="focus-ring mt-5 inline-flex min-h-12 items-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          Email support
        </Link>
      </section>

      <section className="grid gap-x-8 border-t border-line py-7 md:grid-cols-2 md:py-9">
        {supportTopics.map((topic) => (
          <article key={topic.title} className="border-t border-line py-5">
            <h2 className="text-base font-semibold text-foreground">{topic.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.body}</p>
          </article>
        ))}
      </section>

      <section className="border-y border-line py-7 md:py-9">
        <h2 className="font-display text-2xl riyp-weight-560 tracking-[-0.025em] text-foreground">Things you can do now</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <SupportLink href="/auth">Sign in</SupportLink>
          <SupportLink href="/purchase/restore">Restore a purchase</SupportLink>
          <SupportLink href="/settings/account">Account settings</SupportLink>
          <SupportLink href="/faq">Read the FAQ</SupportLink>
          <SupportLink href="/security">Security details</SupportLink>
        </div>
      </section>
    </LegalShell>
  );
}

function SupportLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="focus-ring inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/45 hover:bg-brand/5">
      {children}
    </Link>
  );
}
