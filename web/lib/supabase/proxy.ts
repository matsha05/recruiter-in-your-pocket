import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getOptionalSupabaseAnonKey, getOptionalSupabaseUrl } from "../env";

/**
 * Refresh an existing Supabase session before authenticated pages or API routes
 * run. Public marketing and research pages intentionally bypass this path so
 * they remain static and cacheable.
 */
export async function updateSupabaseSession(request: NextRequest) {
  const url = getOptionalSupabaseUrl();
  const anonKey = getOptionalSupabaseAnonKey();

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(cacheHeaders).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  // This verifies the JWT and performs a refresh when needed. Individual
  // routes still own authorization and must not trust an unverified session.
  await supabase.auth.getClaims();

  return response;
}
