"use client";
import { useActionState } from "react";
import { signIn } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} noValidate>
      {state?.error ? <div className="adm-alert err" role="alert">{state.error}</div> : null}
      <label className="adm-field"><span>Email</span>
        <input name="email" type="email" autoComplete="username" required autoFocus />
      </label>
      <label className="adm-field"><span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="adm-btn" disabled={pending}>{pending ? "Signing in..." : "Continue"}</button>
    </form>
  );
}
