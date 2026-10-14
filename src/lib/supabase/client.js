import { createBrowserClient } from "@supabase/ssr";

// Supabase client for the browser (client components). Uses the publishable key, which is safe to expose:
// what visitors can do is limited by the Row Level Security policies in supabase/migrations.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null; // not configured: the site keeps working, it just can't save requests
  return createBrowserClient(url, key);
}
