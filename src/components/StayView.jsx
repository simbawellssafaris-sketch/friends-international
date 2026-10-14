"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { COUNTRIES, PACKAGES, STAYS } from "@/data/site";
import Icon from "./Icon";
import Footer from "./Footer";
import WaFloat from "./WaFloat";
import { tierName } from "./Cards";
import { useBooking } from "./BookingProvider";
import { useScrollSpy } from "./useScrollSpy";

const packagesFor = (dest, tier) => PACKAGES.filter((p) => p.tier === tier && p.route.some((r) => r.d === dest));
// only hotels for a destination + style that at least one package actually uses
const DATA = COUNTRIES.map((c) => ({
  c,
  dests: c.dests.map((d) => ({
    d,
    tiers: ["budget", "mid", "luxury"].map((t) => {
      const pk = packagesFor(d, t);
      return { t, pk, hotels: pk.length ? ((STAYS[d] || {})[t] || []) : [] };
    }).filter((x) => x.hotels.length),
  })).filter((x) => x.tiers.length),
})).filter((x) => x.dests.length);
const allHotels = DATA.reduce((n, x) => n + x.dests.reduce((m, d) => m + d.tiers.reduce((k, t) => k + t.hotels.length, 0), 0), 0);
const cName = (c) => (c.short ? c.short.split(" (")[0] : c.name);

export default function StayView() {
  const { open } = useBooking();
  const [tier, setTier] = useState("");
  const [q, setQ] = useState("");

  const sections = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return DATA.map(({ c, dests }) => {
      let count = 0;
      const groups = dests.map(({ d, tiers }) => {
        const cards = [];
        tiers.filter((x) => !tier || x.t === tier).forEach(({ t, pk, hotels }) => {
          hotels.filter((h) => !ql || (h[0] + " " + h[2] + " " + d + " " + c.name).toLowerCase().includes(ql))
            .forEach((h) => { cards.push({ h, t, pk }); count++; });
        });
        return { d, cards };
      }).filter((g) => g.cards.length);
      return { c, groups, count };
    }).filter((s) => s.groups.length);
  }, [tier, q]);

  useScrollSpy("#countryTabs a", ".cs");

  return (
    <>
      <section className="phero chero">
        <div className="phero-bg" style={{ backgroundImage: "linear-gradient(180deg,#0004,#000b),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=70'),linear-gradient(135deg,#8a5a1c,#1f4d3a)" }} />
        <div className="wrap phero-in">
          <Link className="back" href="/">← Home</Link>
          <h1>Where to stay</h1>
          <p className="sub2">Every hotel, lodge and resort featured in our packages, grouped by country. Budget, mid-range and luxury.</p>
          <div className="cfacts">
            <span><Icon name="building" size={15} /> {allHotels} hotels, lodges and resorts</span>
            <span><Icon name="globe" size={15} /> {DATA.length} countries</span>
            <span><Icon name="package" size={15} /> {PACKAGES.length} packages</span>
          </div>
        </div>
      </section>

      <div className="tabbar" id="tabbar">
        <div className="wrap tabs" id="countryTabs">
          {DATA.map((x, i) => <a key={x.c.slug} href={`#s-${x.c.slug}`} className={i ? "" : "on"}>{cName(x.c)}</a>)}
        </div>
      </div>

      <div className="wrap">
        <div className="staytools">
          <div className="filters">
            {[["", "All styles"], ["budget", "Budget"], ["mid", "Mid-range"], ["luxury", "Luxury"]].map(([v, l]) => (
              <button key={v} className={tier === v ? "on" : ""} onClick={() => setTier(v)}>{l}</button>
            ))}
          </div>
          <input type="search" placeholder="Search hotel or place, e.g. Serena, Bali, Diani" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <p className="muted">Rates are indicative per person per night (safari lodges are usually full board) and change with season. Your exact hotel is confirmed when you book. Open &quot;Packages&quot; on any hotel to see where it is featured.</p>
        <div>
          {sections.length ? sections.map(({ c, groups, count }) => (
            <section className="cs ps" id={`s-${c.slug}`} key={c.slug}>
              <span className="kicker">{c.group}</span>
              <h2>{c.name} <small>{count} hotel{count === 1 ? "" : "s"}</small></h2>
              {groups.map(({ d, cards }) => (
                <div className="dgroup" key={d}>
                  <h3>{d}</h3>
                  <div className="hgrid">
                    {cards.map(({ h, t, pk }) => (
                      <article className={`hcard ${t}`} key={t + h[0]}>
                        <div className="hh"><span className={`tg ${t}`}>{tierName[t]}</span><h4>{h[0]}</h4><p><Icon name="map-pin" size={13} /> {h[2]}</p></div>
                        <div className="hf"><strong>{h[1]}</strong><small>per person / night</small></div>
                        <details>
                          <summary>Featured in {pk.length} package{pk.length === 1 ? "" : "s"}</summary>
                          <ul>
                            {pk.map((p) => (
                              <li key={p.id}><Link href={`/packages/${p.id}`}>{p.title}</Link><small>{p.days} days{p.resident ? " · residents" : ""}</small></li>
                            ))}
                          </ul>
                        </details>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )) : <p className="muted" style={{ padding: "40px 0" }}>No hotels match your search.</p>}
        </div>
        <div className="cta">
          <h2>Need help choosing?</h2>
          <p>Tell us your budget and dates and we will match you with the right hotel and package.</p>
          <button className="btn" type="button" onClick={() => open({ mode: "book", trip: "Hotel and package recommendation" })}>Book a trip</button>
          <button className="btn ghost" type="button" onClick={() => open({ mode: "customize", trip: "Tailor-made trip" })}>Customise a trip</button>
        </div>
      </div>

      <Footer />
      <WaFloat text="Hello Friends International, please help me choose a hotel for my trip." />
    </>
  );
}
