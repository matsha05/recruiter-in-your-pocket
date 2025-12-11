import { createSupabaseBrowserClient } from "./browserClient";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "resumes";

export type UploadedFile = {
  path: string;
  signedUrl: string | null;
};

/**
 * Uploads a resume file to Supabase Storage (authenticated user required).
 * Returns a short-lived signed URL for backend processing.
 */
export async function uploadResumeFile(file: File): Promise<UploadedFile> {
  const supabase = createSupabaseBrowserClient();
  const filePath = `uploads/${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-${file.name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream"
    });

  if (error) {
    throw new Error(error.message);
  }

  // Create a signed URL (1 hour) for downstream processing.
  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 3600);

  return { path: filePath, signedUrl: signed?.signedUrl || null };
}

