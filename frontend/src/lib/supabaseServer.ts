import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type Database } from "./supabaseClient";

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

export function createAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("Admin client must only be used server-side.");
  }
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        cookies: {
            getAll() { return []; },
            setAll() { }
        }
    }
  );
}
