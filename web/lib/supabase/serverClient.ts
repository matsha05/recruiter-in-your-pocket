import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getOptionalSupabaseAnonKey, getOptionalSupabaseUrl, getSupabaseAnonKey, getSupabaseUrl } from "../env";

/**
 * Read-only Supabase client for Server Components
 * Use for auth checks, data reads; no cookie writes allowed
 * NOTE: This is now async due to Next.js 16 changes
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      }
      // No set/remove: read-only in Server Components
    }
  });
}

/**
 * Optional Supabase client (returns null if env vars are missing).
 * Useful for routes that should work for anonymous users without requiring Supabase setup.
 */
export async function maybeCreateSupabaseServerClient() {
  const url = getOptionalSupabaseUrl();
  const anonKey = getOptionalSupabaseAnonKey();
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      }
    }
  });
}

/**
 * Full read-write Supabase client for Server Actions and Route Handlers
 * Use when you need to mutate auth state (sign in/out, refresh)
 * NOTE: This is now async due to Next.js 16 changes
 */
export async function createSupabaseServerAction() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      }
    }
  });
}
