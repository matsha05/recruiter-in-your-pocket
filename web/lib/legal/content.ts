import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { CheckCircle, LockKey, Receipt, ShieldCheck, Trash } from "@phosphor-icons/react";
import { FREE_REPORT_ENTITLEMENT } from "../billing/pricing";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED, PRIVACY_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";

export type LegalIcon = ComponentType<IconProps>;

export type LegalInline =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

export type LegalParagraph = LegalInline[];

export type LegalSection =
  | {
    type: "card";
    title: string;
    paragraphs: LegalParagraph[];
  }
  | {
    type: "bullet_list";
    title: string;
    items: string[];
  }
  | {
    type: "table";
    title: string;
    columns: string[];
    rows: typeof DATA_HANDLING_ROWS;
  }
  | {
    type: "card_grid";
    items: Array<{ icon: LegalIcon; title: string; body: string }>;
    columns?: 2 | 3 | 4;
  }
  | {
    type: "checklist";
    title: string;
    items: string[];
    icon: LegalIcon;
    variant?: "soft" | "default";
  }
  | {
    type: "callout";
    paragraphs: LegalParagraph[];
    variant?: "soft" | "default";
    align?: "left" | "center";
  }
  | {
    type: "faq";
    categories: Array<{ category: string; questions: Array<{ q: string; a: string }> }>;
  };

export type LegalPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated?: string;
  sections: LegalSection[];
};

export type LegalPageKey = "trust" | "privacy" | "terms" | "faq";

export const legalContent: Record<LegalPageKey, LegalPageContent> = {
  trust: {
    eyebrow: "Trust",
    title: "Trust, in plain language",
    description: "What we claim, where you can verify it, and what controls you have.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        type: "card_grid",
        columns: 2,
        items: [
          {
            icon: ShieldCheck,
            title: "Evidence, not promises",
            body: "The clarity summary scores this document review out of 100. The report shows the evidence behind it and never predicts interviews or offers.",
          },
          {
            icon: LockKey,
            title: "Clear data handling",
            body: "How we store and process your report data and extension capture data is documented clearly on our Security and Privacy pages.",
          },
          {
            icon: Receipt,
            title: "Simple billing",
            body: "When paid access is open, Stripe handles checkout and card details. The only offer is a $29 Job Search Pass: five reports over 30 days, with no renewal.",
          },
          {
            icon: Trash,
            title: "You control deletion",
            body: "Saved reports can be deleted from report history. Deleting your account removes reports, saved jobs, default resume profile, and usage history from our database.",
          },
        ],
      },
      {
        type: "checklist",
        title: "Things you can verify yourself",
        items: TRUST_PROMISES,
        icon: CheckCircle,
        variant: "soft",
      },
      {
        type: "callout",
        paragraphs: [
          [
            { type: "text", value: "Verify details in " },
            { type: "link", label: "Security", href: "/security" },
            { type: "text", value: " · " },
            { type: "link", label: "Support", href: "/support" },
            { type: "text", value: " · " },
            { type: "link", label: "Privacy", href: "/privacy" },
            { type: "text", value: " · " },
            { type: "link", label: "Terms", href: "/terms" },
            { type: "text", value: " · " },
            { type: "link", label: "Methodology", href: "/methodology" },
            { type: "text", value: "." },
          ],
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy policy",
    title: "How we handle your data",
    description: "What data flows through the product, why it's there, and how you can remove or export it.",
    lastUpdated: PRIVACY_LAST_UPDATED,
    sections: [
      {
        type: "card",
        title: "1. Who operates the service",
        paragraphs: [
          [
            {
              type: "text",
              value: "Recruiter in Your Pocket (RIYP, we, or us) is an independent software service operated from Colorado, United States. RIYP is the service operator and controller for personal data collected directly through this website and product. Stripe and the other providers listed below act under their own terms or as processors for the services they provide.",
            },
          ],
          [
            {
              type: "text",
              value: "This policy covers resume inputs, account information, usage data, extension capture data, saved job data, analytics metadata, support requests, and billing events processed by the web app.",
            },
          ],
        ],
      },
      {
        type: "table",
        title: "2. What we collect and why",
        columns: ["Data type", "Purpose", "Retention", "Control"],
        rows: DATA_HANDLING_ROWS,
      },
      {
        type: "card",
        title: "3. Third-party processors",
        paragraphs: [
          [
            {
              type: "text",
              value: "OpenAI generates reports, Supabase handles auth and database storage, Stripe handles billing, Vercel provides hosting, Sentry handles error monitoring, and Mixpanel handles product analytics when enabled. Upstash provides shared rate limiting and short-lived idempotency storage. Inngest coordinates background account-export jobs and PDF generation when those features are used. Resend delivers authentication email and receives public support mail; support messages and attachments are forwarded to and handled in Google (Gmail). Stripe manages card data on its systems. We never have access to it.",
            },
          ],
        ],
      },
      {
        type: "card",
        title: "4. Your controls",
        paragraphs: [
          [
            {
              type: "text",
              value: "You can export your account data, delete individual reports, and permanently delete your account from Settings. Account deletion removes user-owned product data from RIYP's application database and cancels any legacy RIYP subscription we can verify. Stripe may retain payment records, and RIYP keeps narrowly scoped deletion and billing-reversal records when needed to prevent restored access, investigate fraud, meet accounting obligations, or comply with law. We don't sell personal data, and anonymous history is not silently attached to an account.",
            },
          ],
        ],
      },
      {
        type: "card",
        title: "5. Privacy requests",
        paragraphs: [
          [
            {
              type: "text",
              value: "To request access, correction, deletion, portability, restriction, or an appeal where those rights apply, email support@recruiterinyourpocket.com with the subject “Privacy request.” We may verify that you control the account email before releasing or changing personal data. We aim to acknowledge requests within 10 days and complete verified requests within 45 days unless the applicable law permits more time. We will explain any extension or denial and will not discriminate against you for making a privacy request.",
            },
          ],
        ],
      },
      {
        type: "card",
        title: "6. Contact and complaints",
        paragraphs: [
          [
            {
              type: "text",
              value: "Questions, privacy complaints, and authorized-agent requests can be sent to support@recruiterinyourpocket.com. If a privacy concern is not resolved, you may contact the regulator or attorney general available in your jurisdiction. Security disclosures should follow the instructions on /security or /.well-known/security.txt.",
            },
          ],
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Terms of service",
    title: "Terms for using RIYP",
    description: "Terms for product use, billing, and account behavior.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        type: "card",
        title: "1. Acceptance and service scope",
        paragraphs: [
          [
            {
              type: "text",
              value: "Recruiter in Your Pocket (RIYP, we, or us) is an independent software service operated from Colorado, United States. By using RIYP, you agree to these terms. The service provides resume reports and educational guidance, but it does not provide legal, tax, financial, or employment advice and does not guarantee interviews, offers, or hiring outcomes.",
            },
          ],
        ],
      },
      {
        type: "bullet_list",
        title: "2. User responsibilities",
        items: [
          "You're responsible for the content you submit.",
          "Don't upload illegal, harmful, or rights-infringing content.",
          "Don't try to bypass security or abuse system limits.",
          "Review the output for accuracy and context before using it.",
        ],
      },
      {
        type: "card",
        title: "3. Privacy and data",
        paragraphs: [
          [
            { type: "text", value: "Privacy behavior is documented at " },
            { type: "link", label: "/privacy", href: "/privacy" },
            { type: "text", value: " and " },
            { type: "link", label: "/security", href: "/security" },
            { type: "text", value: ". If you're signed in, your report history is saved until you delete it." },
          ],
        ],
      },
      {
        type: "card",
        title: "4. Payment and refunds",
        paragraphs: [
          [
            { type: "text", value: `${FREE_REPORT_ENTITLEMENT.promise} ${FREE_REPORT_ENTITLEMENT.anonymousBoundary} When paid access is open, one $29 Job Search Pass adds five paid reports and expires 30 days after purchase. Stripe handles checkout, card data, billing receipts, and refunds on our behalf. If you already paid but your access looks locked, try ` },
            { type: "link", label: "Restore Access", href: "/purchase/restore" },
            { type: "text", value: " before contacting Support." },
          ],
          [
            { type: "text", value: "You may request a full refund within 14 calendar days of purchase if none of the paid reports has been used. A refund revokes the remaining pass immediately. Duplicate charges, processing errors, and legally required refunds are reviewed regardless of usage. If a paid report was used, we may still issue a full or partial refund when the service failed materially, but completed AI reports are otherwise non-refundable. This policy does not limit rights that cannot be waived under applicable law. Send the request from the checkout email through " },
            { type: "link", label: "Support", href: "/support" },
            { type: "text", value: " with the purchase date and receipt identifier." },
          ],
        ],
      },
      {
        type: "card",
        title: "5. Limits and liability",
        paragraphs: [
          [
            {
              type: "text",
              value: "The service is provided as-is. We don't guarantee interviews, offers, or employment outcomes. To the extent permitted by law, liability is limited for indirect or consequential damages.",
            },
          ],
        ],
      },
      {
        type: "card",
        title: "6. Governing law",
        paragraphs: [
          [
            {
              type: "text",
              value: "These terms are governed by the laws of the State of Colorado.",
            },
          ],
        ],
      },
      {
        type: "card",
        title: "7. Accounts, access, and suspension",
        paragraphs: [
          [
            { type: "text", value: "You are responsible for access to your email account and for activity under your account. We may limit or suspend access when needed to investigate abuse, protect the service, comply with law, or prevent harm. Contact " },
            { type: "link", label: "Support", href: "/support" },
            { type: "text", value: " if you believe a restriction was applied in error." },
          ],
        ],
      },
      {
        type: "card",
        title: "8. Ownership and feedback",
        paragraphs: [
          [
            { type: "text", value: "You keep ownership of the resume and job materials you submit. Recruiter in Your Pocket retains ownership of the service, software, brand, templates, and original product content. You may use your report for your own career search. If you send product feedback, you allow us to use it to improve the service without including your confidential resume content in public materials." },
          ],
        ],
      },
      {
        type: "card",
        title: "9. Changes and contact",
        paragraphs: [
          [
            { type: "text", value: "We may update the service or these terms as the product changes. Material revisions will be reflected by the updated date on this page and will apply prospectively unless the law requires otherwise. Questions, billing disputes, privacy requests, and legal notices can be sent through " },
            { type: "link", label: "Support", href: "/support" },
            { type: "text", value: "." },
          ],
        ],
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    description: "Answers to common questions about the product, privacy, and billing.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        type: "faq",
        categories: [
          {
            category: "Product",
            questions: [
              {
                q: "What does the report cover?",
                a: "We look at the first impression a recruiter would have, the impact of your bullets, how clear your resume is, and how well it fits the role. You get a score breakdown and specific rewrites.",
              },
              {
                q: "How is this different from ATS keyword tools?",
                a: "ATS tools check if a parser can read your file. We focus on what a human recruiter really thinks when they read it, and tie every suggestion to evidence from your resume.",
              },
              {
                q: "What file formats are supported?",
                a: "PDF and Word documents (.docx). If parsing doesn't work, you can paste your text directly in the Workspace.",
              },
            ],
          },
          {
            category: "Privacy & Security",
            questions: [
              {
                q: "What happens to uploaded resume data?",
                a: "RIYP does not store the raw resume or job description from an anonymous run. A completed anonymous report output can be recovered in the same browser for up to 24 hours, then expires automatically. Sign in to save it to history; saved reports and your account can be deleted at any time.",
              },
              {
                q: "Is my data used to train public models?",
                a: "No. We do not opt your data into model training, and OpenAI API data is not used to train OpenAI models by default. OpenAI may retain abuse-monitoring logs containing customer content for up to 30 days.",
              },
              {
                q: "How do I delete my data?",
                a: "Go to Settings. You can delete reports, export your data, or delete your account entirely.",
              },
            ],
          },
          {
            category: "Pricing & Billing",
            questions: [
              {
                q: "Is the first report really free?",
                a: `${FREE_REPORT_ENTITLEMENT.promise} ${FREE_REPORT_ENTITLEMENT.anonymousBoundary}`,
              },
              {
                q: "What is the Job Search Pass?",
                a: "When paid access is open, it is a $29 one-time purchase for five additional complete reports. The pass expires 30 days after purchase and never renews automatically.",
              },
              {
                q: "How do I restore access and get receipts?",
                a: "When billing controls are available, go to Settings > Billing or use Restore Access with the email used at checkout. Stripe processes the payment; receipts stay in billing history.",
              },
            ],
          },
        ],
      },
      {
        type: "callout",
        variant: "soft",
        align: "center",
        paragraphs: [
          [
            { type: "text", value: "Still need help? " },
            { type: "link", label: "support@recruiterinyourpocket.com", href: "mailto:support@recruiterinyourpocket.com" },
          ],
        ],
      },
    ],
  },
};
