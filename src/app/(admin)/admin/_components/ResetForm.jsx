"use client";
import { useActionState } from "react";
import { setNewPassword } from "../actions";

export default function ResetForm({ needsCode }) {
  const [state, action, pending] = useActionState(setNewPassword, null);
  return (
    <form action={action} noValidate>
      {state?.error ? <div className="adm-alert err" role="alert">{state.error}</div> : null}
      <label className="adm-field"><span>New password (at least 12 characters)</span>
        <input name="password" type="password" autoComplete="new-password" minLength={12} required autoFocus />
      </label>
      <label className="adm-field"><span>Repeat new password</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </label>
      {needsCode ? (
        <label className="adm-field"><span>Code from your authenticator app</span>
          <input className="adm-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} />
        </label>
      ) : null}
      <button className="adm-btn" disabled={pending}>{pending ? "Saving..." : "Save new password"}</button>
    </form>
  );
}
