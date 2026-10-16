import { redirect } from "next/navigation";
import AuthShell from "../../_components/AuthShell";
import ResetForm from "../../_components/ResetForm";
import { getSession } from "@/lib/admin/session";

export const metadata = { title: "Choose a new password" };

export default async function ResetPage() {
  const s = await getSession();
  if (!s || !s.profile) redirect("/admin/login?reason=link");
  const { data } = await s.supabase.auth.mfa.listFactors();
  const needsCode = (data?.totp ?? []).some((f) => f.status === "verified");
  return (
    <AuthShell title="Choose a new password">
      <ResetForm needsCode={needsCode} />
    </AuthShell>
  );
}
