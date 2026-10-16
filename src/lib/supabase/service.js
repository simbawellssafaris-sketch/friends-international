import "server-only";
import { createClient } from "@supabase/supabase-js";

// Privileged database client for trusted server code only (saving public form submissions, signed file links).
// It uses the secret key, which bypasses Row Level Security, so it must never be imported by browser code
// and must only be called after the request has been validated. Returns null if the key is not configured.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
