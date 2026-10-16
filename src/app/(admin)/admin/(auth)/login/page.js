import { redirect } from "next/navigation";
import AuthShell from "../../_components/AuthShell";
import LoginForm from "../../_components/LoginForm";
import { getSession } from "@/lib/admin/session";

export const metadata = { title: "Sign in" };

const NOTES = {
  idle: ["info", "You were signed out after a period of inactivity. Please sign in again."],
  denied: ["err", "This account is not authorised to use the admin area."],
  reset: ["ok", "Your password has been changed. Please sign in."],
  link: ["err", "That link has expired or was already used. Please request a new one."],
};

export default async function LoginPage({ searchParams }) {
  const s = await getSession();
  if (s?.profile) redirect(s.aal === "aal2" ? "/admin" : "/admin/mfa");
  const { reason } = await searchParams;
  const note = NOTES[reason];
  return (
    <AuthShell title="Sign in" sub="Private area for Friends International Limited staff.">
      {note ? <div className={`adm-alert ${note[0]}`} role="status">{note[1]}</div> : null}
      <LoginForm />
      <p className="adm-links"><a href="/admin/forgot-password">Forgot your password?</a></p>
    </AuthShell>
  );
}
