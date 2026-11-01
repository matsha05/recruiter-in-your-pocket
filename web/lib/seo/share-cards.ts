import { categories, type ResearchArticle } from "@/components/research/ResearchHubData";
import { publicPage, shareImageUrl } from "./public-pages";

export type ShareImage = { url: string; alt: string };

const SITE_SHARE_ALT = "Recruiter in Your Pocket: see what a recruiter sees";

export const hubAnswers: ResearchArticle[] = categories.flatMap((category) => category.articles);

/**
 * Pages that answer a question on the Research hub share that question and its
 * one-line answer (app/og/research/[id]/route.tsx), so the card says what the
 * page says. Server-only: it reads the hub's copy for the alt text.
 */
export function shareImageForPath(path: string): ShareImage {
  const { card } = publicPage(path);
  const answer = card ? hubAnswers.find((article) => article.id === card) : undefined;
  if (card && !answer) throw new Error(`${path} names card "${card}", which isn't on the Research hub.`);
  return { url: shareImageUrl(path), alt: answer ? `${answer.question} ${answer.answer}` : SITE_SHARE_ALT };
}
