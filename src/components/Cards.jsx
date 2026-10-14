import Link from "next/link";
import Icon from "./Icon";
import SafeImg from "./SafeImg";
import { STYLE_INFO, pkgIncSummary } from "@/data/site";

export const tierName = { budget: "Budget", mid: "Mid-range", luxury: "Luxury" };

export function StyleBadge({ p }) {
  const s = STYLE_INFO[p.style];
  return (
    <span className={`sty ${p.style}`}>
      <Icon name={s.icon} size={13} /> {s.label}
    </span>
  );
}

export function IncBlock({ p }) {
  const s = pkgIncSummary(p);
  return (
    <div className="incmini">
      <div>
        <b>✓ Included</b>
        {s.inc.map((x) => <span key={x}>{x}</span>)}
      </div>
      <div className="no">
        <b>✕ Not included</b>
        {s.exc.map((x) => <span key={x}>{x}</span>)}
      </div>
    </div>
  );
}

// One package card. Used on the home page, country pages and the residents page.
// resLabel: text of the resident badge ("Residents · pick-up from home" or "Pick-up from home").
export function PackageCard({ p, pax = 0, resLabel = "Residents · pick-up from home", alwaysRes = false }) {
  const url = `/packages/${p.id}${pax > 1 ? `?pax=${pax}` : ""}`;
  return (
    <article className="card">
      <Link className="ph" href={url}>
        <SafeImg src={p.img} alt={p.title} />
        <StyleBadge p={p} />
        <span className={`tag ${p.tier}`}>{tierName[p.tier]}</span>
        <span className="days">{p.days} days</span>
      </Link>
      <div className="cb">
        <div className="badges">
          {(p.resident || alwaysRes) && (
            <span className="res"><Icon name="house" size={13} /> {resLabel}</span>
          )}
          {p.multi && <span>Multi-destination</span>}
          {p.flights && <span className="fl"><Icon name="plane" size={13} /> Internal flights included</span>}
        </div>
        <h3><Link href={url}>{p.title}</Link></h3>
        <p className="route">{p.route.map((r) => r.d).join(" · ")}</p>
        <IncBlock p={p} />
        <div className="cf">
          <div><span className="p">Price</span><strong className="onreq">On request</strong></div>
          <Link className="btn sm" href={url}>View trip</Link>
        </div>
      </div>
    </article>
  );
}
