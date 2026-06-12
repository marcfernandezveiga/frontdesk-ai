import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Slot, Appointment, CallLog } from "./types";

// ---------------------------------------------------------------------------
// Database generic: one place to add table typings
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      slots: {
        Row: Slot;
        Insert: Omit<Slot, "id"> & { id?: string };
        Update: Partial<Slot>;
        Relationships: [];
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Appointment>;
        Relationships: [];
      };
      call_logs: {
        Row: CallLog;
        Insert: Omit<CallLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CallLog>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
};

// ---------------------------------------------------------------------------
// Env guards
// ---------------------------------------------------------------------------

export const hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ---------------------------------------------------------------------------
// Browser client (anon, safe to use in Client Components)
// ---------------------------------------------------------------------------

export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ---------------------------------------------------------------------------
// Server client (cookies-aware, for Route Handlers / Server Components)
// ---------------------------------------------------------------------------

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Route Handlers can't set cookies when called from Server Components;
          // safe to swallow here.
        }
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Service-role client (server-only, bypasses RLS for trusted API routes)
// ---------------------------------------------------------------------------

export function createServiceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  }) as ReturnType<typeof createClient>;
}
