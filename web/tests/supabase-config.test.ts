import fs from "node:fs";
import path from "node:path";
import { getOptionalSupabaseAnonKey } from "../lib/env";

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

const originalPublishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

try {
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_current";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "legacy_anon";
  assertEqual(getOptionalSupabaseAnonKey(), "sb_publishable_current", "current publishable key takes precedence");

  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  assertEqual(getOptionalSupabaseAnonKey(), "legacy_anon", "legacy anon key remains compatible");

  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assertEqual(getOptionalSupabaseAnonKey(), null, "missing public credentials fail closed");
} finally {
  if (originalPublishable === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalPublishable;
  if (originalAnon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon;
}

const adminSource = fs.readFileSync(path.resolve(process.cwd(), "lib/supabase/adminClient.ts"), "utf8");
assertEqual(adminSource.includes("process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY"), true, "admin client accepts current and legacy secret keys");
assertEqual(adminSource.includes("process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL"), true, "admin client accepts server-only URL alias");

console.log("✅ PASS: current Supabase keys and legacy aliases resolve safely");
