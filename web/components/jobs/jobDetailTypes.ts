export type JobStatus = "saved" | "interested" | "applying" | "interviewing" | "archived";

export interface JobDetail {
  id: string;
  external_id?: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  source: "linkedin" | "indeed";
  status: JobStatus;
  match_score: number | null;
  captured_at: string;
  job_description_text?: string;
  matchedSkills: string[];
  missingSkills: string[];
  topGaps: string[];
}

export const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bgColor: string }
> = {
  saved: { label: "Saved", color: "text-muted-foreground", bgColor: "bg-muted" },
  interested: { label: "Interested", color: "text-brand", bgColor: "bg-brand/10" },
  applying: { label: "Applying", color: "text-premium", bgColor: "bg-premium/10" },
  interviewing: { label: "Interviewing", color: "text-success", bgColor: "bg-success/10" },
  archived: { label: "Archived", color: "text-muted-foreground/70", bgColor: "bg-muted/30" }
};
