import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Who is signed in right now? The sign-in token is verified (getClaims), never just read from the cookie.
// `profile` is only present for people on the administrator list (admin_profiles).
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id, email, full_name, role, active")
    .eq("user_id", claims.sub)
    .maybeSingle();
  return { supabase, claims, aal: claims.aal, email: claims.email, profile: profile && profile.active ? profile : null };
});

// Every admin page and server action starts with this. It redirects unless the visitor is an
// authorised administrator who has completed the second sign-in step (authenticator code).
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!s.profile) redirect("/admin/login?reason=denied");
  if (s.aal !== "aal2") redirect("/admin/mfa");
  return s;
}

// Same as requireAdmin, and the person must be the owner.
export async function requireOwner() {
  const s = await requireAdmin();
  if (s.profile.role !== "owner") redirect("/admin?reason=owner-only");
  return s;
}

// Writes an entry to the audit log as the signed-in administrator. Never throws.
export async function audit(s, action, entity, entityId, details) {
  try {
    await s.supabase.from("audit_logs").insert({
      actor_id: s.claims.sub,
      actor_email: s.email,
      action,
      entity: entity ?? null,
      entity_id: entityId ? String(entityId) : null,
      details: details ?? null,
    });
  } catch {
    // an audit failure must never block the action itself
  }
}
