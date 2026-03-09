import type { ComponentType } from "react";
import { CheckCircle2, Lock, Receipt, ShieldCheck, Trash2 } from "lucide-react";
import { DATA_HANDLING_ROWS, LEGAL_LAST_UPDATED, TRUST_PROMISES } from "@/lib/legal/dataHandling";

export type LegalIcon = ComponentType<{ className?: string }>;

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
            body: "Scores estimate your resume's hiring signal — they don't guarantee outcomes.",
          },
          {
            icon: Lock,
            title: "Clear data handling",
            body: "How we store and process your review data and extension capture data is documented clearly on our Security and Privacy pages.",
          },
          {
            icon: Receipt,
            title: "Simple billing",
            body: "Checkout, invoices, renewals, cancellation, and restore paths are all handled through Stripe-backed billing flows.",
          },
          {
            icon: Trash2,
            title: "You control deletion",
            body: "Deleting your account removes your reports and usage history from our database.",
          },
        ],
      },
      {
        type: "checklist",
        title: "Things you can verify yourself",
        items: TRUST_PROMISES,
        icon: CheckCircle2,
        variant: "soft",
      },
      {
        type: "callout",
        paragraphs: [
          [
            { type: "text", value: "Verify details in " },
            { type: "link", label: "Security", href: "/security" },
            { type: "text", value: " · " },
            { type: "link", label: "Status", href: "/status" },
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
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        type: "card",
        title: "1. Scope",
        paragraphs: [
          [
            {
              type: "text",
              value: "This policy covers resume and LinkedIn inputs, account info, usage data, extension capture data, analytics metadata, and billing events processed by the web app.",
            },
          ],
        ],
      },
      {
        type: "table",
        title: "2. Data handling table",
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
              value: "OpenAI generates reviews, Supabase handles auth and database storage, Stripe handles billing, Vercel provides hosting, Sentry handles error monitoring, and Mixpanel handles product analytics when enabled. Stripe manages card data on their systems — we never have access to it.",
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
              value: "You can delete reports, export your data, and delete your account from Settings. We don't sell your data, and anonymous history is not auto-attached to an account.",
            },
          ],
        ],
      },
      {
        type: "card",
        title: "5. Contact",
        paragraphs: [
          [
            {
              type: "text",
              value: "Questions about this policy can be sent to support@recruiterinyourpocket.com. Security disclosures should follow the instructions on /security or /.well-known/security.txt.",
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
              value: "By using Recruiter in Your Pocket, you agree to these terms. The service provides AI-assisted resume and LinkedIn feedback designed to help you improve — but it doesn't guarantee hiring outcomes.",
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
            { type: "text", value: "Your first review is free. Paid plans give you repeated use, history, and exports. Stripe handles billing and invoices. If you paid but your access looks locked, try " },
            { type: "link", label: "Restore Access", href: "/purchase/restore" },
            { type: "text", value: " before reaching out to support. Refunds are reviewed case by case." },
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
                q: "What does the review analyze?",
                a: "We look at the first impression a recruiter would have, the impact of your bullets, how clear your resume is, and how well it fits the role. You get a score breakdown and specific rewrites.",
              },
              {
                q: "How is this different from ATS keyword tools?",
                a: "ATS tools check if a parser can read your file. We focus on what a human recruiter really thinks when they read it — and tie every suggestion to evidence from your resume.",
              },
              {
                q: "What file formats are supported?",
                a: "PDF and Word documents (.doc, .docx). If parsing doesn't work, you can paste your text directly in the Workspace.",
              },
            ],
          },
          {
            category: "Privacy & Security",
            questions: [
              {
                q: "What happens to uploaded resume data?",
                a: "Anonymous reviews aren't saved unless you choose to. Signed-in reviews save your history. You can delete reports or your entire account at any time.",
              },
              {
                q: "Is my data used to train public models?",
                a: "No. We use OpenAI's API, which doesn't train public models on your content.",
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
                q: "Is the first review really free?",
                a: "Yes. One complete review, free, no credit card.",
              },
              {
                q: "What is monthly vs lifetime?",
                a: "Monthly ($9/mo) is great while you're actively job hunting — cancel anytime. Lifetime ($79 one-time) is there if you want access forever with no recurring charges.",
              },
              {
                q: "How do I restore access and get receipts?",
                a: "Go to Settings > Billing, or use the Restore Access page. Stripe handles all your invoices and receipts.",
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
