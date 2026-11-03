import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ANONYMOUS_ID_COOKIE,
  FREE_COOKIE,
  FREE_RUN_LIMIT,
  ensureAnonymousIdentity,
  freeCookieOptions,
  getCurrentMonthKey,
  makeFreeCookie,
  parseFreeCookie,
} from "@/lib/backend/freeCookie";
import { maybeCreateSupabaseServerClient } from "@/lib/supabase/serverClient";
import { isDevelopmentPaywallBypassEnabled } from "@/lib/billing/access";
import {
  anonymousGenerationAccessBackend,
  resolveAnonymousFreeUsesRemaining,
} from "@/lib/billing/anonymousGenerationAccess";
import {
  anonymousNetworkHashFromRequest,
  hashAnonymousIdentity,
} from "@/lib/billing/anonymousIdentity";
import { assertGenerationAuthLookup } from "@/lib/billing/generationAccess";
import { hashForLogs, logError, logWarn } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Dev bypass for testing
    if (isDevelopmentPaywallBypassEnabled()) {
      return NextResponse.json({
        ok: true,
        free_uses_left: 99,
        free_uses_remaining: 99,
        source: "bypass"
      });
    }

    // Check if user is logged in
    const supabase = await maybeCreateSupabaseServerClient();
    const userData = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    assertGenerationAuthLookup("error" in userData ? userData.error : null);
    const user = userData.data.user || null;

    let freeUsesRemaining = 0;

    if (user && supabase) {
      // Account usage survives browser-cookie deletion; a new account has its own allowance.
      const { data: usageData, error } = await supabase
        .from('user_usage')
        .select('free_report_used_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logWarn({
          msg: "free_status.query_failed",
          user_id: hashForLogs(user.id),
          supabase: { table: "user_usage", op: "select", error_code: error.code },
        });
        throw new Error("Free status database lookup failed");
      }
      // If no record or no free_report_used_at, they have 1 free remaining
      freeUsesRemaining = (!usageData || !usageData.free_report_used_at) ? 1 : 0;

      return NextResponse.json({
        ok: true,
        free_uses_left: freeUsesRemaining,
        free_uses_remaining: freeUsesRemaining,
        source: "database"
      });
    } else {
      // The cookie is a signed client hint. The shared ledger is authoritative
      // for an in-flight or completed anonymous report on this identity.
      const cookieStore = await cookies();
      const raw = cookieStore.get(FREE_COOKIE)?.value;
      const parsed = parseFreeCookie(raw);
      const meta = parsed || { used: 0, last_free_ts: null, reset_month: getCurrentMonthKey(), needs_reset: true };
      const identityResult = ensureAnonymousIdentity(
        cookieStore.get(ANONYMOUS_ID_COOKIE)?.value
      );
      const identityHash = hashAnonymousIdentity(identityResult.identity);
      const shadowHash = anonymousNetworkHashFromRequest(request);
      if (!shadowHash) throw new Error("Anonymous network identity is unavailable");
      const monthKey = getCurrentMonthKey();
      // This is a GET: it reads the ledger and never writes it. A signed used
      // cookie refuses a reservation on its own at generation time; it does
      // not seed the ledger here, because a cookie proves this visitor minted
      // a report, not that this network did.
      const ledger = await anonymousGenerationAccessBackend.inspect({
        identityHash,
        shadowHash,
        monthKey,
      });
      const ledgerStatus = ledger.status;
      freeUsesRemaining = resolveAnonymousFreeUsesRemaining(
        ledgerStatus,
        meta.used || 0,
        FREE_RUN_LIMIT,
      );

      const res = NextResponse.json({
        ok: true,
        free_uses_left: freeUsesRemaining,
        free_uses_remaining: freeUsesRemaining,
        reset_month: meta.reset_month,
        source: ledgerStatus === "available" ? "cookie" : "anonymous_ledger"
      });

      // A successful streaming response commits the shared ledger after the
      // response headers are fixed. Synchronize the signed cookie here so a
      // later network change cannot make that completed report look unused.
      // Only the visitor's own identity key may mark the cookie: a network
      // where someone else minted a report must not follow this visitor home.
      const shouldPersistCommittedUse = ledger.identity === "committed" && (meta.used || 0) < FREE_RUN_LIMIT;
      if (identityResult.cookieValue) {
        res.cookies.set(
          ANONYMOUS_ID_COOKIE,
          identityResult.cookieValue,
          freeCookieOptions()
        );
      }
      if (!parsed || meta.needs_reset || shouldPersistCommittedUse) {
        const newMeta = {
          used: shouldPersistCommittedUse ? FREE_RUN_LIMIT : meta.used || 0,
          last_free_ts: shouldPersistCommittedUse
            ? meta.last_free_ts || new Date().toISOString()
            : meta.last_free_ts || null,
          reset_month: meta.reset_month
        };
        res.cookies.set(FREE_COOKIE, makeFreeCookie(newMeta), freeCookieOptions());
      }

      return res;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown free-status error");
    logError({
      msg: "free_status.failed",
      route: "GET /api/free-status",
      err: { name: err.name, message: err.message, stack: err.stack },
    });
    return NextResponse.json({ ok: false, free_uses_left: 0, free_uses_remaining: 0 }, { status: 500 });
  }
}
