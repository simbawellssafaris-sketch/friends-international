import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for the password-recovery e-mail link. It turns the one-time code into a session,
// then sends the person to the page named in ?next= (only pages inside /admin are allowed).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  // Behind Hostinger's proxy the server sees an internal address, so build the public address from the forwarded headers.
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host && host.startsWith("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "") : `${proto}://${host}`;

  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/admin/reset-password";
  const safeNext = next.startsWith("/admin/") && !next.startsWith("//") ? next : "/admin/reset-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/admin/login?reason=link`);
}
