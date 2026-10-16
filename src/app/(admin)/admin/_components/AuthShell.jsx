// Centered card used by every sign-in page.
export default function AuthShell({ title, sub, children }) {
  return (
    <main className="adm-auth">
      <div className="adm-auth-card">
        <div className="adm-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width="46" height="44" />
          <div><b>Friends International</b><span>ADMIN</span></div>
        </div>
        <h1>{title}</h1>
        {sub ? <p className="adm-sub">{sub}</p> : null}
        {children}
      </div>
    </main>
  );
}
