"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/admin/session";
import { tooMany } from "@/lib/admin/ratelimit";

const BAD_LOGIN = "That email or password is not correct.";
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || (host && host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Step 1 of signing in: email + password. Only people on the administrator list continue.
export async function signIn(_prev, formData) {
  const email = str(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: BAD_LOGIN };
  if (tooMany(`login:${await clientIp()}`, 10) || tooMany(`login:${email}`, 6)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error && (error.name === "AuthRetryableFetchError" || !error.status || error.status >= 500)) {
    return { error: "Sign-in is temporarily unavailable. Please wait a moment and try again." };
  }
  if (error || !data?.user) return { error: BAD_LOGIN };

  const { data: profile } = await supabase.from("admin_profiles").select("active").eq("user_id", data.user.id).maybeSingle();
  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return { error: BAD_LOGIN }; // same message: do not reveal which accounts exist
  }
  // restart the inactivity timer so an old visit's timestamp cannot sign this new session straight out again
  (await cookies()).set("fi_admin_seen", String(Date.now()), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 60 * 60 * 12 });
  redirect("/admin/mfa");
}

export async function signOutAction() {
  (await cookies()).delete({ name: "fi_admin_seen", path: "/admin" });
  const s = await getSession();
  if (s) {
    if (s.aal === "aal2" && s.profile) {
      await s.supabase.from("audit_logs").insert({ actor_id: s.claims.sub, actor_email: s.email, action: "logout" });
    }
    await s.supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// Password recovery e-mail. The answer is always the same, so nobody can check which e-mails are registered.
export async function requestReset(_prev, formData) {
  const email = str(formData.get("email")).toLowerCase();
  const done = { ok: "If that address belongs to an administrator, a reset link is on its way." };
  if (!email || tooMany(`reset:${await clientIp()}`, 5) || tooMany(`reset:${email}`, 3)) return done;
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/admin/auth/callback?next=/admin/reset-password`,
  });
  return done;
}

// Starts authenticator-app setup for a signed-in administrator who has no authenticator yet.
export async function startEnrollment() {
  const s = await getSession();
  if (!s || !s.profile) return { error: "Please sign in again." };
  const { data: list } = await s.supabase.auth.mfa.listFactors();
  if ((list?.totp ?? []).some((f) => f.status === "verified")) {
    return { error: "An authenticator is already set up for this account." };
  }
  for (const f of (list?.all ?? []).filter((x) => x.status !== "verified")) {
    await s.supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await s.supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator app", issuer: "Friends International Admin" });
  if (error || !data) return { error: "Could not start setup. Please try again." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

// Step 2 of signing in (and the last step of authenticator setup): the 6-digit code.
export async function verifyCode(_prev, formData) {
  const factorId = str(formData.get("factorId"), 80);
  const code = str(formData.get("code"), 10).replace(/\s/g, "");
  if (!factorId || !/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };
  if (tooMany(`mfa:${await clientIp()}`, 10)) return { error: "Too many attempts. Please wait a few minutes." };

  const s = await getSession();
  if (!s || !s.profile) redirect("/admin/login");
  const { error } = await s.supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: "That code is not correct or has expired. Try the newest code." };

  const { data } = await s.supabase.auth.getClaims();
  await s.supabase.from("audit_logs").insert({ actor_id: s.claims.sub, actor_email: s.email, action: "login", details: { aal: data?.claims?.aal } });
  redirect("/admin");
}

// Sets a new password after the recovery link. Accounts with an authenticator must enter a code too.
export async function setNewPassword(_prev, formData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const code = str(formData.get("code"), 10).replace(/\s/g, "");
  if (password.length < 12) return { error: "Use at least 12 characters." };
  if (password !== confirm) return { error: "The two passwords do not match." };

  const s = await getSession();
  if (!s || !s.profile) return { error: "This reset link has expired. Please request a new one." };
  const { data: list } = await s.supabase.auth.mfa.listFactors();
  const factor = (list?.totp ?? []).find((f) => f.status === "verified");
  if (factor) {
    if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };
    const { error } = await s.supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (error) return { error: "That code is not correct or has expired." };
  }
  const { error } = await s.supabase.auth.updateUser({ password });
  if (error) return { error: "The password could not be changed. It may be too weak or recently used." };
  await s.supabase.from("audit_logs").insert({ actor_id: s.claims.sub, actor_email: s.email, action: "password_reset" });
  await s.supabase.auth.signOut();
  redirect("/admin/login?reason=reset");
}
