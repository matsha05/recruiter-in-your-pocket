import { NextResponse } from "next/server";
import { isGenerationPaused } from "@/lib/operations/generationBudget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public, side-effect free: lets the workspace say reports are paused before anyone uploads. */
export async function GET() {
  return NextResponse.json(
    { ok: true, paused: isGenerationPaused() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
