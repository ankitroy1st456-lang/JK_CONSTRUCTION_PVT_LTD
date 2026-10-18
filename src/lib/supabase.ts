import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================
//  Supabase Storage (where photos and documents are kept).
//  The project address and key are read from SUPABASE_URL and
//  SUPABASE_KEY. They are never written in the code.
//
//  Use the "service_role" key (Supabase → Project Settings → API).
//  It is a secret: keep it only in .env.local / Vercel settings,
//  never in the browser.
// ============================================================

// The Storage bucket that holds every file. Create it in Supabase and make it PUBLIC.
export const BUCKET = "company-files";

let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be set. Add them to .env.local (or to the Environment Variables in Vercel).");
  }
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
