function missing(name: string): never {
  throw new Error(`Missing environment variable: ${name}`);
}

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || missing("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || missing("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}






