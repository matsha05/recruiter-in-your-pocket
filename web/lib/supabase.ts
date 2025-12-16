
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
}

// We use the Service Role key on the server (if available) to bypass RLS for now, 
// or the Anon key on the client. 
// "Defensible" means we should probably use RLS, but for this "v1 Persistence", 
// we'll assume the backend (API routes) uses the Service Role for full access.
export const supabase = createClient(supabaseUrl, supabaseKey);
