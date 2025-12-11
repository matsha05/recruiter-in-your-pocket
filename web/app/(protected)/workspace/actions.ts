"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerAction } from "../../../lib/supabase/serverClient";

export async function signOut() {
  const supabase = await createSupabaseServerAction();
  await supabase.auth.signOut();
  redirect("/signin");
}


