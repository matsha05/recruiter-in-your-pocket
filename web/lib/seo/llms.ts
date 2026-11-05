import { categories } from "@/components/research/ResearchHubData";
import { PUBLIC_PAGES, publicPage } from "./public-pages";
import { SITE_NAME, SITE_URL, absoluteUrl } from "./site";

// /llms.txt (app/llms.txt/route.ts): the site in the shape llmstxt.org proposes, for a model that
// is handed the file. One line per page, the same answer the Research hub shows, with the date the
// page's content last changed. The evidence says the mainstream engines rarely fetch this file, so
// nothing here is written for it alone: every line is a page's own answer or summary, read from the
// same data the pages render. Plan: docs/growth/2026-11-aeo-and-internal-linking.md, phase 5.

export type LlmsComparison = { title: string; path: string; summary: string };

type LlmsInput = {
  comparisons: readonly LlmsComparison[];
  /** "November 4, 2026": the day the other tools' pricing pages were read (comparisons.tsx). */
  pricesRead: string;
};

const REPORT_PAGES: Array<{ path: string; name: string; note: string }> = [
  { path: "/", name: "Get your free report", note: "Upload the resume you have and read what a recruiter would question before you send it." },
  { path: "/sample-report", name: "A sample report", note: "One complete report on one resume: the Verdict, the Critical Misses in the order to fix them, and the rewrites." },
  { path: "/pricing", name: "Pricing", note: "The first report is free, with no card and no account. Then $29 once for five more reports, good for 90 days. Nothing renews." },
  { path: "/methodology", name: "How the report works", note: "" },
  { path: "/help", name: "Help", note: "Plain answers about the score, applicant tracking systems, privacy, and the pass." },
];

const line = (name: string, path: string, note: string) => `- [${name}](${absoluteUrl(path)}): ${note}`;

const dated = (path: string, text: string) => `${text} Updated ${publicPage(path).updated}.`;

export function llmsText({ comparisons, pricesRead }: LlmsInput) {
  const answers = categories.flatMap((category) => category.articles);
  const answerFor = (path: string) => answers.find((article) => article.href === path);
  const research = answers.filter((article) => article.href.startsWith("/research/"));
  const guides = answers.filter((article) => article.href.startsWith("/resources/"));

  const report = REPORT_PAGES.map((page) => {
    const note = page.note || answerFor(page.path)?.answer || "";
    return line(page.name, page.path, dated(page.path, note));
  });

  const sections = [
    `# ${SITE_NAME}`,
    "",
    "> A free report that reads the resume you already have the way a recruiter would: a Verdict, the Critical Misses that could cost you the interview, and rewrites built only from your facts. The first report is free; then $29 once for five more, good for 90 days. No subscription.",
    "",
    `${SITE_NAME} is at ${SITE_URL}. It is AI applying a recruiter's review criteria, not a person reading each resume. It gives no keyword score and no interview odds, and it does not build, design, or track resumes. The pages below are the questions job seekers ask, each answered in one line from the article's own sources; the full article and its citations are behind the link. Dates are the day a page's content last changed.`,
    "",
    "## The report",
    "",
    ...report,
    "",
    "## Research",
    "",
    "Short answers from studies, recruiter experiments, and platform documentation, each with its sources.",
    "",
    ...research.map((article) => line(article.question, article.href, dated(article.href, article.answer))),
    "",
    "## After the offer",
    "",
    ...guides.map((article) => line(article.title ?? article.question, article.href, dated(article.href, article.answer))),
    "",
    "## Compared with other tools",
    "",
    `What each tool sells and costs beside the report, with prices quoted from the tool's own pricing page, read on ${pricesRead}. We have not run the other tools and ours on the same resume.`,
    "",
    line("Resume review tools compared", "/compare", dated("/compare", "Builder, keyword scanner, writer, or a recruiter's read: which one you need, and the report's limits.")),
    ...comparisons.map((entry) => line(entry.title, entry.path, dated(entry.path, entry.summary))),
    "",
    "## Optional",
    "",
    line("Privacy", "/privacy", dated("/privacy", "What the report keeps, what it deletes, and the vendors it uses.")),
    line("Terms", "/terms", dated("/terms", "The terms of the free report and the pass.")),
    "",
  ];

  // Every listed page is a public page, so the file can never point at a retired or private route.
  for (const entry of [...REPORT_PAGES, ...research, ...guides, ...comparisons]) {
    const path = "href" in entry ? entry.href : entry.path;
    if (!PUBLIC_PAGES.some((page) => page.path === path)) throw new Error(`${path} is in llms.txt but not in PUBLIC_PAGES (lib/seo/public-pages.ts).`);
  }

  return sections.join("\n");
}
