import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
            return NextResponse.json(
                { ok: false, errorCode: "AUTH_REQUIRED", message: "Please log in to view analytics." },
                { status: 401 }
            );
        }

        // Fetch all reports for this user
        const { data: reports, error } = await supabase
            .from("reports")
            .select("id, score, score_label, name, created_at, report_json, resume_variant, target_role")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Analytics fetch error:", error);
            return NextResponse.json(
                { ok: false, errorCode: "FETCH_FAILED", message: "Could not load analytics." },
                { status: 500 }
            );
        }

        if (!reports || reports.length === 0) {
            return NextResponse.json({
                ok: true,
                analytics: {
                    totalReviews: 0,
                    averageScore: 0,
                    scoreImprovement: 0,
                    scoreHistory: [],
                    commonGaps: [],
                    topStrengths: [],
                    variants: []
                }
            });
        }

        // Calculate analytics
        const scores = reports.map(r => r.score);
        const totalReviews = reports.length;
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const scoreImprovement = reports.length >= 2
            ? reports[reports.length - 1].score - reports[0].score
            : 0;

        // Get unique variants
        const variants = Array.from(new Set(
            reports.map(r => r.resume_variant).filter(Boolean) as string[]
        ));

        // Score history for chart (include variant for filtering)
        const scoreHistory = reports.map(r => ({
            date: r.created_at,
            score: r.score,
            name: r.name || undefined,
            variant: r.resume_variant || undefined,
            targetRole: r.target_role || undefined
        }));

        // Aggregate gaps and strengths from reports
        const allGaps: string[] = [];
        const allStrengths: string[] = [];

        for (const report of reports) {
            const json = report.report_json as any;
            if (json?.gaps) allGaps.push(...json.gaps);
            if (json?.strengths) allStrengths.push(...json.strengths);
        }

        // Count frequency
        const gapCounts: Record<string, number> = {};
        const strengthCounts: Record<string, number> = {};

        for (const gap of allGaps) {
            const key = gap.slice(0, 50); // Truncate for grouping
            gapCounts[key] = (gapCounts[key] || 0) + 1;
        }
        for (const strength of allStrengths) {
            const key = strength.slice(0, 50);
            strengthCounts[key] = (strengthCounts[key] || 0) + 1;
        }

        // Get top items
        const commonGaps = Object.entries(gapCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([text, count]) => ({ text, count }));

        const topStrengths = Object.entries(strengthCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([text, count]) => ({ text, count }));

        return NextResponse.json({
            ok: true,
            analytics: {
                totalReviews,
                averageScore,
                scoreImprovement,
                scoreHistory,
                commonGaps,
                topStrengths,
                variants
            }
        });
    } catch (error) {
        console.error("Analytics API error:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
