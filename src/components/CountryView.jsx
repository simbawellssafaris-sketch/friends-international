"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, PACKAGES, STAYS, ACT, DINFO, countryPkgs, destByKey } from "@/data/site";
import Icon, { EmojiIcon } from "./Icon";
import SafeImg from "./SafeImg";
import Footer from "./Footer";
import WaFloat from "./WaFloat";
import { PackageCard, tierName } from "./Cards";
import { useBooking } from "./BookingProvider";
import { useScrollSpy } from "./useScrollSpy";

export default function CountryView({ slug, view = "", aud = "" }) {
  const c = COUNTRIES.find((x) => x.slug === slug);
  const safariView = view === "safari";
  const audQ = aud;
  const { open } = useBooking();
  useScrollSpy("#tabbar a", ".cs");

  const [ft, setFt] = useState("");
  const [fa, setFa] = useState("");
  const [fs, setFs] = useState("");
  const pkgs = useMemo(() => countryPkgs(c, safariView).filter((p) => !audQ || p.aud === audQ), [c, safariView, audQ]);
  const list = pkgs.filter((p) => (!ft || p.tier === ft) && (!fa || p.aud === fa) && (!fs || p.style === fs));
  const carousel = list.length > 3;
  const trackRef = useRef(null);
  useEffect(() => { if (trackRef.current) trackRef.current.scrollLeft = 0; }, [ft, fa, fs]);
  const step = (dir) => trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.9, behavior: "smooth" });

  const fact = (k) => (c.facts.find((f) => f[0] === k) || [])[1];
  const heading = safariView ? `${c.name} safari packages` : `Trips in ${c.name}`;
  const base = `/destinations/${c.slug}`;

  return (
    <>
      <section className="phero chero">
        <div className="phero-bg" style={{ backgroundImage: `linear-gradient(180deg,#0004,#000b),url('${c.img}'),linear-gradient(135deg,#8a5a1c,#1f4d3a)` }} />
        <div className="wrap phero-in">
          <Link className="back" href="/#destinations">← All destinations</Link>
          <h1>{safariView ? `${c.name} Safaris` : c.name}</h1>
          <p className="sub2">{c.tagline}</p>
          <div className="cfacts">
            <span><Icon name="map-pin" size={15} /> {fact("Capital")}</span>
            <span><Icon name="globe" size={15} /> {fact("Languages") || fact("Language")}</span>
            <span><Icon name="banknote" size={15} /> {fact("Currency")}</span>
          </div>
        </div>
      </section>

      <div className="tabbar" id="tabbar">
        <div className="wrap tabs">
          <a href="#overview" className="on">Overview</a><a href="#known">Known for</a><a href="#cdests">Destinations</a>
          <a href="#packages">Packages ({pkgs.length})</a><a href="#stays">Where to stay</a><a href="#tips">Travel tips</a>
        </div>
      </div>

      <div className="band"><div className="wrap">
        <section id="overview" className="cs ps">
          <span className="kicker">Overview</span><h2>Welcome to {c.name}</h2>
          <div className="ovgrid">
            <div>{c.overview.map((t, i) => <p key={i}>{t}</p>)}</div>
            <div className="factbox">
              {c.facts.filter((f) => f[0] !== "Best time").map((f) => <div key={f[0]}><small>{f[0]}</small>{f[1]}</div>)}
            </div>
          </div>
        </section>

      </div></div>

      <div className="band alt"><div className="wrap">
        <section id="known" className="cs ps">
          <span className="kicker">Why go</span><h2>What {c.name} is known for</h2>
          <div className="known">
            {c.known.map((k) => (
              <div className="kcard" key={k[1]}><b><EmojiIcon emoji={k[0]} /></b><h4>{k[1]}</h4><p>{k[2]}</p></div>
            ))}
          </div>
        </section>

      </div></div>

      <div className="band"><div className="wrap">
        <section id="cdests" className="cs ps">
          <span className="kicker">Places</span><h2>Destinations in {c.name}</h2>
          <div className="cdest">
            {c.dests.map((d) => {
              const dd = destByKey(d) || {}, info = DINFO[d] || {};
              const n = PACKAGES.filter((p) => p.route.some((r) => r.d === d)).length;
              const hi = (ACT[d] || []).filter((a) => a.s === "inc").slice(0, 3);
              return (
                <article className="card" key={d}>
                  <div className="ph"><SafeImg src={dd.img} alt={d} /></div>
                  <div className="cb">
                    <h3>{d}</h3><p>{dd.blurb || info.about || ""}</p>
                    <div className="mini">{hi.map((a) => <span key={a.n}>{a.n.split(" (")[0]}</span>)}</div>
                    <div className="cf"><span className="p">{n} package{n === 1 ? "" : "s"} include this</span></div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </div></div>

      <div className="band alt"><div className="wrap">
        <section id="packages" className="cs ps">
          <span className="kicker">Our trips</span><h2>{heading}</h2>
          <div className="filters">
            {audQ ? (
              <>
                <span className="muted">Showing {audQ === "visitor" ? "visitor" : "resident"} packages.</span>{" "}
                <Link className="btn sm ghost dark" href={`${base}${safariView ? "?view=safari" : ""}`}>Show all</Link>
              </>
            ) : (
              [["", "Everyone"], ["visitor", "Visitors (airport start)"], ["resident", "Residents (home pick-up)"]].map(([v, l]) => (
                <button key={v} className={fa === v ? "on" : ""} onClick={() => setFa(v)}>{l}</button>
              ))
            )}
          </div>
          <div className="filters">
            {[["", "Any travel style"], ["family", "Family travel"], ["group", "Group travel"], ["couples", "Couples getaway"]].map(([v, l]) => (
              <button key={v} className={fs === v ? "on" : ""} onClick={() => setFs(v)}>{l}</button>
            ))}
          </div>
          <div className="filters">
            <button className={ft === "" ? "on" : ""} onClick={() => setFt("")}>All ({pkgs.length})</button>
            {["budget", "mid", "luxury"].map((t) => (
              <button key={t} className={ft === t ? "on" : ""} onClick={() => setFt(t)}>{tierName[t]} ({pkgs.filter((p) => p.tier === t).length})</button>
            ))}
            {safariView
              ? <Link className="btn sm ghost dark" href={base}>Show all {c.name} trips</Link>
              : pkgs.some((p) => p.safari) ? <Link className="btn sm ghost dark" href={`${base}?view=safari`}>Safaris only</Link> : null}
          </div>
          <div className={`carwrap${carousel ? " has-car" : ""}`}>
            <button className="car-b prev" type="button" aria-label="Previous" onClick={() => step(-1)}>‹</button>
            <div className={`grid${carousel ? " carousel" : ""}`} ref={trackRef}>
              {list.length ? list.map((p) => <PackageCard key={p.id} p={p} />) : <p>No trips match yet. Ask us for a custom quote.</p>}
            </div>
            <button className="car-b next" type="button" aria-label="Next" onClick={() => step(1)}>›</button>
          </div>
          <div className="car-count muted">{carousel ? `${list.length} packages: swipe or use the arrows` : ""}</div>
          <p className="note">Package prices are on request and depend on season, group size and availability.</p>
        </section>

      </div></div>

      <div className="band"><div className="wrap">
        <section id="stays" className="cs ps">
          <span className="kicker">Accommodation</span><h2>Where to stay in {c.name}</h2>
          <p className="muted">Indicative nightly rates by style. Safari lodges are usually full board.</p>
          <div className="staygrid">
            {c.dests.map((d) => {
              const s = STAYS[d];
              if (!s) return null;
              return (
                <div className="stcard" key={d}>
                  <h4>{d}</h4>
                  {["budget", "mid", "luxury"].map((t) => {
                    const x = (s[t] || [])[0];
                    return x ? <div key={t}><b><i>{tierName[t]}</i>{x[0]}</b><span>{x[1]}</span></div> : null;
                  })}
                </div>
              );
            })}
          </div>
        </section>

      </div></div>

      <div className="band alt"><div className="wrap">
        <section id="tips" className="cs ps">
          <span className="kicker">Good to know</span><h2>Travel tips</h2>
          <ul className="tips">{c.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>

      </div></div>

      <div className="wrap">
        <div className="cta">
          <h2>Plan your {c.name} trip</h2>
          <p>Tell us your dates and budget and we will build a personal quote.</p>
          <button className="btn" type="button" onClick={() => open({ mode: "book", trip: `${c.name} trip` })}>Book a trip</button>
          <button className="btn ghost" type="button" onClick={() => open({ mode: "customize", trip: `${c.name} trip` })}>Customise a trip</button>
        </div>
      </div>

      <Footer tagline="Safaris · Beaches · Dubai · Europe" />
      <WaFloat />
    </>
  );
}
