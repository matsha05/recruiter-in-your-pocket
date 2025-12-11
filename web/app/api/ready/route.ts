import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { loadPromptForMode } from "@/lib/backend/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Env sanity (do not return values)
    const missing: string[] = [];

    if (!process.env.SESSION_SECRET) missing.push("SESSION_SECRET");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    const mock = ["1", "true", "TRUE"].includes(String(process.env.USE_MOCK_OPENAI || "").trim());
    if (!mock && !process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");

    if (missing.length > 0) {
      return NextResponse.json({ ok: false, message: `Missing env: ${missing.join(", ")}` }, { status: 500 });
    }

    // Prompts readable
    await loadPromptForMode("resume");
    await loadPromptForMode("resume_ideas");

    // DB connectivity (light check)
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) {
      return NextResponse.json({ ok: false, message: `Database not ready: ${error.message}` }, { status: 500 });
    }

    // PDF readiness is intentionally not a hard requirement here; it’s runtime/platform-dependent.
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || "Not ready" }, { status: 500 });
  }
}

