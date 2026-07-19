import { type NextRequest } from "next/server";
import { updateSupabaseSession } from "./lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/workspace/:path*",
    "/reports/:path*",
    "/jobs/:path*",
    "/settings/:path*",
    "/launch/:path*",
    "/dashboard/:path*",
    "/purchase/:path*",
    "/auth/:path*",
    "/signin",
    "/api/:path*",
  ],
};
