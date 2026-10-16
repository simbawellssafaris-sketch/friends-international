"use client";
import { useActionState, useState } from "react";
import { startEnrollment, verifyCode } from "../actions";

// Second sign-in step. First time: scan a QR code with an authenticator app. After that: type the 6-digit code.
export default function MfaPanel({ factorId }) {
  const [setup, setSetup] = useState(null);
  const [setupError, setSetupError] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, action, pending] = useActionState(verifyCode, null);
  const id = factorId || setup?.factorId;

  const begin = async () => {
    setBusy(true);
    setSetupError("");
    const r = await startEnrollment();
    setBusy(false);
    if (r.error) setSetupError(r.error);
    else setSetup(r);
  };

  if (!id) {
    return (
      <div>
        <ol className="adm-steps">
          <li>Install an authenticator app on your phone (Google Authenticator, Microsoft Authenticator or Authy).</li>
          <li>Press the button below and scan the QR code.</li>
          <li>Type the 6-digit code the app shows.</li>
        </ol>
        {setupError ? <div className="adm-alert err" role="alert">{setupError}</div> : null}
        <button type="button" className="adm-btn" onClick={begin} disabled={busy}>{busy ? "Preparing..." : "Set up authenticator"}</button>
      </div>
    );
  }

  return (
    <form action={action} noValidate>
      {setup ? (
        <>
          <div className="adm-qr">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={setup.qr} alt="QR code for your authenticator app" /></div>
          <p className="adm-sub" style={{ marginBottom: 6 }}>Cannot scan? Enter this key in the app instead:</p>
          <div className="adm-secret">{setup.secret}</div>
        </>
      ) : null}
      {state?.error ? <div className="adm-alert err" role="alert">{state.error}</div> : null}
      <input type="hidden" name="factorId" value={id} />
      <label className="adm-field"><span>6-digit code</span>
        <input className="adm-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus />
      </label>
      <button className="adm-btn" disabled={pending}>{pending ? "Checking..." : "Verify and continue"}</button>
    </form>
  );
}
