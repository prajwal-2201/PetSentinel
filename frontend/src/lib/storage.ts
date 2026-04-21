"use client";

import { createBrowserSupabaseClient } from "./supabaseClient";

export interface UploadMeta {
  record_type: string;
  title: string;
  description?: string;
  administered_at: string;
  administered_by?: string;
  next_due_at?: string;
}

/**
 * Uploads a health document to Supabase Storage and creates a health_record row.
 * Falls back gracefully if the storage bucket doesn't exist yet.
 */
export async function uploadHealthDoc(
  petId: string,
  ownerId: string,
  file: File,
  meta: UploadMeta
): Promise<{ document_url: string | null; error: string | null }> {
  const supabase = createBrowserSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { document_url: null, error: "Not authenticated" };

  let document_url: string | null = null;

  // Try to upload to storage (bucket may not exist — graceful fallback)
  try {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${userData.user.id}/${petId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("health-docs")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage
        .from("health-docs")
        .getPublicUrl(path);
      document_url = urlData?.publicUrl ?? null;
    }
  } catch {
    // Storage bucket may not be configured — continue without URL
  }

  // Always insert the health_record row
  const { error: dbErr } = await (supabase as any)
    .from("health_records")
    .insert({
      pet_id: petId,
      owner_id: ownerId,
      record_type: meta.record_type,
      title: meta.title,
      description: meta.description ?? null,
      administered_at: meta.administered_at,
      administered_by: meta.administered_by ?? null,
      next_due_at: meta.next_due_at ?? null,
      document_url,
      metadata: {},
    });

  if (dbErr) return { document_url: null, error: dbErr.message };
  return { document_url, error: null };
}
