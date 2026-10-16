"use client";
import { useActionState } from "react";
import { requestReset } from "../actions";

export default function ForgotForm() {
  const [state, action, pending] = useActionState(requestReset, null);
  return (
    <form action={action} noValidate>
      {state?.ok ? <div className="adm-alert ok" role="status">{state.ok}</div> : null}
      <label className="adm-field"><span>Email</span>
        <input name="email" type="email" autoComplete="username" required autoFocus />
      </label>
      <button className="adm-btn" disabled={pending}>{pending ? "Sending..." : "Send reset link"}</button>
    </form>
  );
}
