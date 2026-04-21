/**
 * Health Vault Transfer Logic
 * 
 * Implements the atomic ownership transfer using the `transfer_health_vault`
 * Supabase RPC function. This moves all health records (vaccine certificates,
 * deworming history, lab results) to the new owner atomically with an audit trail.
 */
"use client";

import { createBrowserSupabaseClient } from "./supabaseClient";

export type TransferResult = {
  success: boolean;
  transfer_id?: string;
  records_transferred?: number;
  integrity_hash?: string;
  error?: string;
};

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  date_of_birth: string;
  status: string;
  owner_id: string;
};

export type HealthRecord = {
  id: string;
  record_type: string;
  title: string;
  description: string | null;
  administered_at: string;
  next_due_at: string | null;
  administered_by: string | null;
  document_url: string | null;
};

/**
 * Fetches all pets owned by the current user.
 */
export async function getMyPets(): Promise<Pet[]> {
  const supabase = createBrowserSupabaseClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data: owner } = await supabase
    .from("owners")
    .select("id")
    .eq("auth_user_id", user.user.id)
    .single() as { data: { id: string } | null };

  if (!owner) return [];

  const { data } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", owner.id)
    .eq("status", "active");

  return (data as Pet[]) ?? [];
}

/**
 * Fetches the biological identity (health records) for a specific pet.
 */
export async function getPetHealthVault(petId: string): Promise<HealthRecord[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("health_records")
    .select("*")
    .eq("pet_id", petId)
    .order("administered_at", { ascending: false });

  return (data as HealthRecord[]) ?? [];
}

/**
 * Initiates a Health Vault Transfer.
 * 
 * Calls the `transfer_health_vault` Supabase RPC which:
 * 1. Verifies ownership
 * 2. Atomically updates all health_records.owner_id
 * 3. Updates pets.owner_id + pets.status = 'transferred'
 * 4. Creates an audit row in ownership_transfers
 * 5. Computes MD5 integrity hash of transferred record IDs
 * 
 * All steps run inside a single Postgres transaction.
 */
export async function initiateHealthVaultTransfer(
  petId: string,
  fromOwnerId: string,
  toOwnerId: string,
  notes?: string
): Promise<TransferResult> {
  const supabase = createBrowserSupabaseClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("transfer_health_vault", {
      p_pet_id: petId,
      p_from_owner_id: fromOwnerId,
      p_to_owner_id: toOwnerId,
      p_notes: notes ?? null,
    });

    if (error) {
      console.error("[HealthVault] Transfer RPC error:", error);
      return { success: false, error: error.message };
    }

    const result = data as {
      transfer_id: string;
      records_transferred: number;
      integrity_hash: string;
      status: string;
    };

    return {
      success: result.status === "completed",
      transfer_id: result.transfer_id,
      records_transferred: result.records_transferred,
      integrity_hash: result.integrity_hash,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[HealthVault] Unexpected error:", message);
    return { success: false, error: message };
  }
}

/**
 * Looks up an owner by email to resolve their owner ID before initiating a transfer.
 */
export async function lookupOwnerByEmail(
  email: string
): Promise<{ id: string; full_name: string } | null> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("owners")
    .select("id, full_name")
    .eq("email", email.toLowerCase().trim())
    .single();

  return data ?? null;
}

/**
 * Fetches transfer history for a specific pet (audit trail).
 */
export async function getPetTransferHistory(petId: string) {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("ownership_transfers")
    .select("*")
    .eq("pet_id", petId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
