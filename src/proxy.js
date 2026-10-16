import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Runs before every /admin request. It keeps the sign-in session fresh, sends visitors who are not
// signed in to the login page, and signs people out after 30 minutes of inactivity.
// This is only the first gate: every admin page, server action and database call checks authorisation again.

const IDLE_MS = 30 * 60 * 1000;
const OPEN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/auth/callback"];
const SEEN = "fi_admin_seen";

const secure = process.env.NODE_ENV === "production";

function harden(res) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  let response = harden(NextResponse.next({ request }));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = harden(NextResponse.next({ request }));
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, { ...options, secure: secure || options?.secure }));
        },
      },
    },
  );

  // Behind Hostinger's proxy the server may see an internal address, so build the public one from the forwarded headers.
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host && host.startsWith("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "") : `${proto}://${host}`;

  const redirectTo = (path, reason) => {
    const url = new URL(path, origin);
    if (reason) url.searchParams.set("reason", reason);
    const res = harden(NextResponse.redirect(url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;
  const open = OPEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const lastSeen = Number(request.cookies.get(SEEN)?.value || 0);
  if (signedIn && lastSeen && Date.now() - lastSeen > IDLE_MS) {
    await supabase.auth.signOut();
    const res = redirectTo("/admin/login", "idle");
    res.cookies.delete(SEEN);
    return res;
  }

  if (!signedIn && !open) {
    return redirectTo("/admin/login");
  }

  if (signedIn) {
    response.cookies.set(SEEN, String(Date.now()), { httpOnly: true, sameSite: "lax", secure, path: "/admin", maxAge: 60 * 60 * 12 });
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
