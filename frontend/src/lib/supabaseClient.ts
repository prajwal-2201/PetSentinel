import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { type CookieOptions, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── Types ────────────────────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      owners: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          kyc_verified: boolean;
          kyc_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: string;
          breed: string | null;
          date_of_birth: string | null;
          weight_kg: number | null;
          microchip_id: string | null;
          status: "active" | "transferred" | "deceased";
          created_at: string;
          updated_at: string;
        };
      };
      health_records: {
        Row: {
          id: string;
          pet_id: string;
          owner_id: string;
          record_type: string;
          title: string;
          description: string | null;
          administered_by: string | null;
          administered_at: string;
          next_due_at: string | null;
          document_url: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
      };
      ownership_transfers: {
        Row: {
          id: string;
          pet_id: string;
          from_owner_id: string;
          to_owner_id: string;
          initiated_at: string;
          completed_at: string | null;
          status: "pending" | "completed" | "rejected" | "cancelled";
          records_transferred: number;
          transfer_hash: string | null;
          notes: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      transfer_health_vault: {
        Args: {
          p_pet_id: string;
          p_from_owner_id: string;
          p_to_owner_id: string;
          p_notes?: string;
        };
        Returns: {
          transfer_id: string;
          pet_id: string;
          from_owner_id: string;
          to_owner_id: string;
          records_transferred: number;
          integrity_hash: string;
          status: string;
        };
      };
    };
  };
};

// ── Browser Client (for Client Components) ───────────────────────────────────
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ── Server Client (for Server Components / Route Handlers) ───────────────────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            );
          } catch {
            // Suppress: called from Server Component (cookies are read-only)
          }
        },
      },
    }
  );
}

// ── Admin/Service Role Client (for trusted server-side ops) ──────────────────
// Never expose in browser — server-only
export function createAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("Admin client must only be used server-side.");
  }
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
