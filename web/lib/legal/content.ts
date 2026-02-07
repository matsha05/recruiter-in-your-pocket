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
    description: "What we claim, where to verify it, and what controls you have in product.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        type: "card_grid",
        columns: 2,
        items: [
          {
            icon: ShieldCheck,
            title: "Evidence before claims",
            body: "Scores are presented as hiring-signal estimates, not guaranteed outcomes.",
          },
          {
            icon: Lock,
            title: "Clear data handling",
            body: "Retention and processors are documented in plain language on Security and Privacy.",
          },
          {
            icon: Receipt,
            title: "Transparent billing controls",
            body: "Checkout, invoices, renewals, and cancellation are managed through Stripe.",
          },
          {
            icon: Trash2,
            title: "User-controlled deletion",
            body: "Delete account removes reports and usage history from our app database.",
          },
        ],
      },
      {
        type: "checklist",
        title: "Commitments you can verify",
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
    title: "How we handle data, in plain English",
    description: "What data flows through the product, why it exists, and how you can remove or export it.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        type: "card",
        title: "1. Scope",
        paragraphs: [
          [
            {
              type: "text",
              value: "This policy covers resume and LinkedIn inputs, account identity, usage metadata, and billing events used by the web app.",
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
              value: "OpenAI supports review generation, Supabase supports authentication and database storage, Stripe handles billing, and Vercel provides hosting/runtime. Stripe controls card data and billing retention in Stripe systems.",
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
              value: "You can delete reports, export account data, and delete account data from Settings. The product does not sell candidate data.",
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
              value: "Questions about this policy can be sent to support@recruiterinyourpocket.com.",
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
              value: "By using Recruiter in Your Pocket, you agree to these terms. The service provides model-assisted resume and LinkedIn feedback designed for iteration support, not guaranteed hiring outcomes.",
            },
          ],
        ],
      },
      {
        type: "bullet_list",
        title: "2. User responsibilities",
        items: [
          "You are responsible for content submitted for review.",
          "Do not upload illegal, harmful, or rights-infringing content.",
          "Do not attempt to bypass security or abuse system limits.",
          "Review output for factual and contextual accuracy before use.",
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
            { type: "text", value: ". Signed-in usage may store report history until removed by report deletion or account deletion." },
          ],
        ],
      },
      {
        type: "card",
        title: "4. Payment and refunds",
        paragraphs: [
          [
            { type: "text", value: "One full review is free. Paid plans add additional capabilities. Stripe handles billing and invoices. If payment succeeds and access appears locked, use " },
            { type: "link", label: "Restore Access", href: "/purchase/restore" },
            { type: "text", value: " before opening support. Refund requests are reviewed case by case." },
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
              value: "The service is provided as-is. We do not guarantee interviews, offers, or employment outcomes. To the extent permitted by law, liability is limited for indirect or consequential damages.",
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
    title: "Questions and answers",
    description: "Practical details on product behavior, privacy, and billing controls.",
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
                a: "Initial recruiter read, quantified impact, clarity/readability, and role fit. Output includes score context and rewrite guidance.",
              },
              {
                q: "How is this different from ATS keyword tools?",
                a: "ATS tools focus on parser compliance. RIYP models human recruiter judgment and ties recommendations to evidence lines.",
              },
              {
                q: "What file formats are supported?",
                a: "PDF and Word documents (.doc, .docx). If parsing fails, paste text directly in Workspace.",
              },
            ],
          },
          {
            category: "Privacy & Security",
            questions: [
              {
                q: "What happens to uploaded resume data?",
                a: "Anonymous runs are not stored unless you choose save paths. Signed-in runs can store report history. You can delete reports or account data at any time.",
              },
              {
                q: "Is my data used to train public models?",
                a: "No. We use OpenAI API services that do not train public models on your content.",
              },
              {
                q: "How do I delete my data?",
                a: "Use Settings to delete reports, export account data, or delete your account.",
              },
            ],
          },
          {
            category: "Pricing & Billing",
            questions: [
              {
                q: "Is the first review really free?",
                a: "Yes. One full review is free and does not require a card.",
              },
              {
                q: "What is monthly vs lifetime?",
                a: "Monthly ($9) fits active search cycles and can be canceled anytime. Lifetime ($79 one-time) gives long-term access with no recurring charges.",
              },
              {
                q: "How do I restore access and get receipts?",
                a: "Open Settings > Billing or use Restore Access. Stripe provides invoices and receipts.",
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
