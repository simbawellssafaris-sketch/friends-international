import AuthShell from "../../_components/AuthShell";
import ForgotForm from "../../_components/ForgotForm";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" sub="Enter your admin email and we will send you a link.">
      <ForgotForm />
      <p className="adm-links"><a href="/admin/login">Back to sign in</a></p>
    </AuthShell>
  );
}
