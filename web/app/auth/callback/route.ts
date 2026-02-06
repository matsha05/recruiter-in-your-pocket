import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "../../../lib/env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/workspace";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  // Create response first so we can set cookies on it
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      get(name: string) {
        return request.headers.get("cookie")
          ?.split("; ")
          .find((c) => c.startsWith(`${name}=`))
          ?.split("=")[1];
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`);
  }

  return response;
}

