import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, History, ArrowRight, Chrome } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { AppPageIntro } from "@/components/layout/AppPageIntro";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report History — Recruiter in Your Pocket",
  description: "View, revisit, and manage your saved resume and LinkedIn reports.",
};

export default async function ReportsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/auth?from=reports&next=/reports");
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("id, score, score_label, resume_preview, name, target_role, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = reports || [];

  return (
    <section className="flex-1 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <AppPageIntro
          eyebrow="Report history"
          title="Your saved reviews"
          description="Reopen past reviews, compare your progress, and keep a clean record of the versions you want to revisit."
          meta={
            <>
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                {items.length} saved review{items.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                Signed in as {user.email}
              </span>
            </>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/extension"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
              >
                <Chrome className="h-4 w-4" />
                Extension
              </Link>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              >
                Run another review
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          }
        />

        <div className="rounded-xl border border-brand/15 bg-brand/[0.045] px-4 py-3 text-sm text-muted-foreground">
          Signed-in reviews stay attached to this account until you delete them. Extension-saved jobs can send role context back into the studio when you want a fresh comparison.
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
              <History className="h-6 w-6 text-brand" />
            </div>
            <h2 className="font-display text-2xl text-foreground">No saved reports yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Run a review from the workspace and save it while signed in to build your history.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={report.score ?? 0} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-foreground">
                        {report.name || report.target_role || "Saved review"}
                      </h2>
                      {report.resume_preview ? (
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                          {report.resume_preview}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="group-hover:text-foreground">Open report</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
