import Link from "next/link";

// Previous / next links that keep the current search and filters. `base` is the path, `params` the active filters.
export default function Pager({ base, params, page, perPage, total }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return <p className="adm-pager"><span>{total} record{total === 1 ? "" : "s"}</span></p>;
  const href = (p) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <p className="adm-pager">
      {page > 1 ? <Link className="adm-chip" href={href(page - 1)}>Previous</Link> : <span className="adm-chip off">Previous</span>}
      <span>Page {page} of {pages} · {total} records</span>
      {page < pages ? <Link className="adm-chip" href={href(page + 1)}>Next</Link> : <span className="adm-chip off">Next</span>}
    </p>
  );
}
