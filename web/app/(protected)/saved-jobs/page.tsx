import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { redirect } from "next/navigation";
import SavedJobsClient from "./SavedJobsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Saved Jobs — Recruiter in Your Pocket",
    description: "View all the jobs you've captured with the RIYP browser extension. See your match scores and run full analyses.",
};

interface SavedJob {
    id: string;
    external_id: string;
    title: string;
    company: string;
    url: string;
    source: string;
    job_description_preview: string;
    score: number | null;
    created_at: string;
}

export default async function SavedJobsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login?from=saved-jobs");
    }

    // Fetch saved jobs
    const { data: jobs, error } = await supabase
        .from("saved_jobs")
        .select("id, external_id, title, company, url, source, job_description_preview, score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[SavedJobs] Error fetching jobs:", error);
    }

    return (
        <main className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-2">
                    Saved Jobs
                </h1>
                <p className="text-muted-foreground">
                    Jobs you&apos;ve captured with the RIYP browser extension
                </p>
            </div>

            <SavedJobsClient initialJobs={(jobs as SavedJob[]) ?? []} />
        </main>
    );
}
