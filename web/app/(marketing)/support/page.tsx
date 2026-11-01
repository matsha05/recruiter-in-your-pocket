import { Button } from "@/components/ui/button";
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
      <section className="rounded-xl border border-border bg-muted px-5 py-6 md:px-6 md:py-7">
        <p className="text-label text-brand">Support inbox</p>
        <h2 className="mt-3 break-all font-display text-heading text-foreground">support@recruiterinyourpocket.com</h2>
        <p className="mt-3 text-prose text-muted-foreground">
          A screenshot can help us understand the problem. Remove personal information before sending it.
        </p>
        <Button asChild className="mt-5">
            <Link
              href="mailto:support@recruiterinyourpocket.com?subject=Recruiter%20in%20Your%20Pocket%20support"
            >
              Email support
            </Link>
        </Button>
      </section>

      <section className="grid gap-x-8 py-3 md:grid-cols-2 md:py-5">
        {supportTopics.map((topic) => (
          <article key={topic.title} className="border-t border-line py-5">
            <h2 className="text-base font-medium text-foreground">{topic.title}</h2>
            <p className="mt-2 text-base text-muted-foreground">{topic.body}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-border pt-7 md:pt-9">
        <h2 className="font-display text-heading text-foreground">Things you can do now</h2>
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
    <Button asChild variant="secondary">
        <Link href={href}>
          {children}
        </Link>
    </Button>
  );
}
