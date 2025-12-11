import { createSupabaseServerClient } from "../../../lib/supabase/serverClient";
import WorkspaceClient from "@/components/workspace/WorkspaceClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume Workspace — Recruiter in Your Pocket",
  description: "Get recruiter-grade feedback on your resume. Upload your resume and job description to see how you read to hiring managers at top companies.",
};

export default async function WorkspacePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  const session = data.session;

  // Don't require auth - workspace is accessible to everyone
  // Auth is only needed for features like history, paid passes, etc.
  const userEmail = session?.user?.email;
  const userMeta = session?.user?.user_metadata;
  const firstName = userMeta?.first_name || userMeta?.name?.split(" ")[0];

  return (
    <WorkspaceClient />
  );
}
