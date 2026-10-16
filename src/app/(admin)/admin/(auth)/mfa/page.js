import { redirect } from "next/navigation";
import AuthShell from "../../_components/AuthShell";
import MfaPanel from "../../_components/MfaPanel";
import { getSession } from "@/lib/admin/session";
import { signOutAction } from "../../actions";

export const metadata = { title: "Second step" };

export default async function MfaPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!s.profile) redirect("/admin/login?reason=denied");
  if (s.aal === "aal2") redirect("/admin");
  const { data } = await s.supabase.auth.mfa.listFactors();
  const verified = (data?.totp ?? []).find((f) => f.status === "verified");
  return (
    <AuthShell
      title={verified ? "Enter your code" : "Secure your account"}
      sub={verified ? "Open your authenticator app and type the current 6-digit code." : "Admin accounts need an authenticator app as a second step."}
    >
      <MfaPanel factorId={verified?.id} />
      <form action={signOutAction} className="adm-links"><button className="adm-btn ghost inline" style={{ marginTop: 6 }}>Cancel and sign out</button></form>
    </AuthShell>
  );
}
