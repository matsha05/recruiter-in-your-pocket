import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  FREE_COOKIE,
  FREE_RUN_LIMIT,
  freeCookieOptions,
  getCurrentMonthKey,
  makeFreeCookie,
  parseFreeCookie
} from "@/lib/backend/freeCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(FREE_COOKIE)?.value;
    const parsed = parseFreeCookie(raw);

    const meta = parsed || { used: 0, last_free_ts: null, reset_month: getCurrentMonthKey(), needs_reset: true };
    const freeUsesRemaining = Math.max(0, FREE_RUN_LIMIT - (meta.used || 0));

    const res = NextResponse.json({
      ok: true,
      free_uses_left: freeUsesRemaining,
      free_uses_remaining: freeUsesRemaining,
      reset_month: meta.reset_month
    });

    // If cookie missing/invalid or month reset occurred, persist updated cookie.
    if (!parsed || meta.needs_reset) {
      const newMeta = {
        used: meta.used || 0,
        last_free_ts: meta.last_free_ts || null,
        reset_month: meta.reset_month
      };
      res.cookies.set(FREE_COOKIE, makeFreeCookie(newMeta), freeCookieOptions());
    }

    return res;
  } catch (error) {
    console.error("API /free-status error:", error);
    return NextResponse.json({ ok: false, free_uses_left: 0, free_uses_remaining: 0 }, { status: 500 });
  }
}
