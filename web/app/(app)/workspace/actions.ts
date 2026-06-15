"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerAction } from "../../../lib/supabase/serverClient";

export async function signOut() {
  const supabase = await createSupabaseServerAction();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/signin");
  }

  await supabase.auth.signOut();
  redirect("/signin");
}

