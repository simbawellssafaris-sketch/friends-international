"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG } from "@/data/config";
import { PACKAGES, COUNTRIES, STAYS, RES_CATS, countryPkgs, resPkgs } from "@/data/site";
import { matches, norm } from "@/lib/search";
import Icon, { EmojiIcon } from "./Icon";
import { PackageCard, tierName } from "./Cards";
import Footer from "./Footer";
import HeroCarousel from "./HeroCarousel";
import WaFloat from "./WaFloat";

const FEATURED = ["mara-amboseli-mid", "northern-circuit-lodge", "kenya-luxury-samburu-mara", "mara-3day-mid", "dubai-city-break", "bali-mid"];
const stayKeys = Object.keys(STAYS);
const countryName = (c) => (c.short ? c.short.split(" (")[0] : c.name);
const placeNames = [...new Set([...stayKeys, ...COUNTRIES.map(countryName), "Safari", "Beach"])].sort();
// real photos from the package pages (public/images)
const bg = (src, extra) => ({ backgroundImage: `${extra ? extra + "," : ""}url('${src}'), linear-gradient(135deg,#d9912b,#1f4d3a)` });

const TIER_BTNS = [["", "All styles"], ["budget", "Budget"], ["mid", "Mid-range"], ["luxury", "Luxury"]];
const STY_BTNS = [["", "Any travel style"], ["family", "Family travel"], ["group", "Group travel"], ["couples", "Couples getaway"]];
const AUD_BTNS = [["", "Everyone"], ["visitor", "Visitors (airport start)"], ["resident", "Residents (home pick-up)"]];
const TYPE_BTNS = [["", "Everywhere"], ["Kenya", "Kenya"], ["Tanzania", "Tanzania"], ["Combo", "Multi-country combos"], ["Beach", "Beach"], ["Dubai", "Dubai"], ["Europe", "Europe"], ["Asia", "Asia"]];

function Filters({ items, value, onPick, small }) {
  return (
    <div className={`filters${small ? " small" : ""}`}>
      {items.map(([v, label]) => (
        <button key={v} className={value === v ? "on" : ""} onClick={() => onPick(v)}>{label}</button>
      ))}
    </div>
  );
}

function PortalItem({ href, label, sub }) {
  return (
    <li>
      <Link href={href}><span>{label}<small>{sub}</small></span><i>→</i></Link>
    </li>
  );
}

export default function HomeClient({ initial = {} }) {
  const { type: iType = "", sty: iSty = "", aud: iAud = "" } = initial;
  const [f, setF] = useState({ tier: "", type: iType, aud: iAud, sty: iSty, q: "", pax: 2 });
  const [expanded, setExpanded] = useState(!!(iType || iSty || iAud));
  const auto = useRef(false);
  const [inp, setInp] = useState({ q: "", tier: "", pax: "2" });
  const [stayKey, setStayKey] = useState(stayKeys[0]);
  const [enqDest, setEnqDest] = useState(stayKeys[0]);
  const [formMsg, setFormMsg] = useState("We reply within 24 hours.");
  const packagesRef = useRef(null);
  const enqRef = useRef(null);

  // ?type= / ?sty= / ?aud= (menu links open the full list, already filtered). The server passes them in as `initial`;
  // this effect re-applies them when you click another menu link while already on the home page.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if ((iType || iSty || iAud) && window.location.hash === "#packages") setTimeout(() => packagesRef.current?.scrollIntoView(), 80);
      return;
    }
    if (iType || iSty || iAud) {
      setF((s) => ({ ...s, type: iType, sty: iSty, aud: iAud }));
      setExpanded(true);
      if (window.location.hash === "#packages") setTimeout(() => packagesRef.current?.scrollIntoView(), 80);
    }
  }, [iType, iSty, iAud]);

  const list = useMemo(() => {
    if (!expanded) return FEATURED.map((id) => PACKAGES.find((p) => p.id === id)).filter(Boolean);
    return PACKAGES.filter((p) =>
      (!f.tier || p.tier === f.tier) && (!f.type || p.type === f.type) && (!f.sty || p.style === f.sty) &&
      (!f.q || matches(p, f.q)) && (!f.aud || p.aud === f.aud));
  }, [expanded, f]);

  const readSearch = (next) => {
    const q = next.q.trim();
    const tier = next.tier;
    const pax = Math.max(1, Math.min(50, parseInt(next.pax, 10) || 1));
    setF({ tier, type: "", aud: "", sty: "", q, pax });
    if (q || tier) { setExpanded(true); auto.current = true; }
    else if (auto.current) { setExpanded(false); auto.current = false; }
    return { q, tier, pax };
  };
  const onInp = (key) => (e) => {
    const next = { ...inp, [key]: e.target.value };
    setInp(next);
    readSearch(next);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const { q } = readSearch(inp);
    setExpanded(true);
    const d = stayKeys.find((k) => norm(k) === norm(q));
    if (d) { setEnqDest(d); setStayKey(d); }
    setTimeout(() => packagesRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
  };
  const toggleExpanded = () => {
    const on = !expanded;
    setExpanded(on);
    if (!on) setTimeout(() => packagesRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
  };

  // ---- contact form ----
  const enqText = (d) => `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nDestination: ${d.dest}\nStyle: ${d.tier}\nDate: ${d.date}\nTravellers: ${d.pax}\n\n${d.msg}`;
  const enqData = () => Object.fromEntries(new FormData(enqRef.current));
  const enqWa = () => window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Trip enquiry\n" + enqText(enqData()))}`, "_blank");
  const enqSubmit = async (e) => {
    e.preventDefault();
    const d = enqData();
    if (CONFIG.formEndpoint) {
      try {
        const r = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
        if (r.ok) { setFormMsg("Thank you! We will contact you shortly."); e.target.reset(); return; }
      } catch (_) { /* fall through */ }
      setFormMsg("Could not send. Please use WhatsApp or email us.");
      return;
    }
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Trip enquiry: " + d.dest)}&body=${encodeURIComponent(enqText(d))}`;
  };

  const ke = COUNTRIES.find((c) => c.slug === "kenya"), tz = COUNTRIES.find((c) => c.slug === "tanzania");
  const vis = (p) => p.aud === "visitor";
  const stay = STAYS[stayKey] || {};
  const noResults = (
    <div className="noresults">
      <h3>No trips found{f.q ? ` for “${f.q}”` : ""}</h3>
      <p>Try a place name such as Amboseli, Zanzibar, Dubai, Bali or Paris, or clear the budget filter. We can also build a custom trip.</p>
      <a className="btn wa" target="_blank" rel="noopener"
        href={`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hello Friends International, I am looking for a trip to " + (f.q || "…"))}`}>
        Ask us on WhatsApp
      </a>
    </div>
  );

  return (
    <>
      <section className="hero" id="top">
        <HeroCarousel />
        <div className="wrap hero-in">
          <p className="eyebrow">Kenya · Tanzania · Dubai · Europe · Asia</p>
          <h1>Your journey begins with friends.</h1>
          <p className="lead">Budget, mid-range and luxury safaris, sun-soaked beaches and city escapes, planned by people who know the land.</p>
          <div className="hero-cta">
            <a href="#start" className="btn">Start exploring</a>
            <a href="#contact" className="btn ghost">Plan My Trip</a>
          </div>
        </div>
        <form className="quick wrap" id="quick" autoComplete="off" onSubmit={onSubmit}>
          <label><span className="lb"><Icon name="map-pin" size={14} /> Where to?</span>
            <input type="search" list="placeList" placeholder="Type a place, e.g. Amboseli, Bali, Paris" value={inp.q} onChange={onInp("q")} />
            <datalist id="placeList">{placeNames.map((n) => <option key={n} value={n} />)}</datalist>
          </label>
          <label><span className="lb"><Icon name="wallet" size={14} /> Budget</span>
            <select value={inp.tier} onChange={onInp("tier")}>
              <option value="">Any budget</option><option value="budget">Budget</option><option value="mid">Mid-range</option><option value="luxury">Luxury</option>
            </select>
          </label>
          <label><span className="lb"><Icon name="users" size={14} /> Travellers</span>
            <input type="number" min="1" max="50" value={inp.pax} onChange={onInp("pax")} />
          </label>
          <button className="btn" type="submit"><Icon name="search" size={16} /> Search</button>
        </form>
      </section>

      <section className="sec portal-sec" id="start">
        <div className="wrap">
          <p className="eyebrow dark">Start here</p>
          <h2>How would you like to travel?</h2>
          <p className="sub">Three ways in. Pick the one that fits you and we will show you the trips, places and hotels.</p>
          <div className="portals">
            <article className="portal">
              <div className="pimg" style={bg("/images/kt/2.jpg", "linear-gradient(180deg,#0000,#0007)")} />
              <div className="pbody">
                <span className="pk">For visitors</span>
                <h3>Safaris</h3>
                <p>Land at the airport and we take it from there. Kenya and Tanzania safaris at budget, mid-range and luxury level.</p>
                <ul className="plist">
                  <PortalItem href="/destinations/kenya?view=safari&aud=visitor" label="Kenya Safaris" sub={`${countryPkgs(ke, true).filter(vis).length} packages · Mara, Amboseli, Tsavo, Samburu`} />
                  <PortalItem href="/destinations/tanzania?view=safari&aud=visitor" label="Tanzania Safaris" sub={`${countryPkgs(tz, true).filter(vis).length} packages · Serengeti, Ngorongoro, Kilimanjaro`} />
                  <PortalItem href="/?type=Combo#packages" label="Kenya + Tanzania Combos" sub={`${PACKAGES.filter((p) => p.type === "Combo").length} multi-country trips`} />
                  <PortalItem href="/?aud=visitor#packages" label="All visitor packages" sub={`${PACKAGES.filter(vis).length} trips`} />
                </ul>
              </div>
            </article>
            <article className="portal">
              <div className="pimg" style={bg("/images/kt/33.jpg", "linear-gradient(180deg,#0000,#0007)")} />
              <div className="pbody">
                <span className="pk">For residents</span>
                <h3>Residents</h3>
                <p>We pick you up from your home or our head office. Weekend safaris, beach breaks and 8+ day trips abroad.</p>
                <ul className="plist">
                  {RES_CATS.map((c) => (
                    <PortalItem key={c.id} href={`/residents?cat=${c.id}`}
                      label={<><EmojiIcon emoji={c.icon} size={18} /> {c.label}</>}
                      sub={`${resPkgs(c.id).length} packages${["dubai", "europe", "asia"].includes(c.id) ? " · 8+ days" : ""}`} />
                  ))}
                </ul>
              </div>
            </article>
            <article className="portal">
              <div className="pimg" style={bg("/images/europe/france.webp", "linear-gradient(180deg,#0000,#0007)")} />
              <div className="pbody">
                <span className="pk">Explore</span>
                <h3>Destinations</h3>
                <p>Fourteen countries across East Africa, the Middle East, Europe and Asia, each with places, hotels and trips.</p>
                <ul className="plist">
                  {["East Africa", "Middle East", "Europe", "Asia"].map((g) => (
                    <li key={g}>
                      <a href="#destinations"><span>{g}<small>{COUNTRIES.filter((c) => c.group === g).map(countryName).join(", ")}</small></span><i>→</i></a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="sec alt" id="destinations">
        <div className="wrap">
          <p className="eyebrow dark">Where we go</p>
          <h2>Explore by country</h2>
          <div className="ctry">
            {COUNTRIES.map((c) => (
              <Link key={c.slug} className="cc" href={`/destinations/${c.slug}`}
                style={{ backgroundImage: `linear-gradient(180deg,#0002,#000b),url('${c.img}'),linear-gradient(135deg,#8a5a1c,#1f4d3a)` }}>
                <span>{c.group}</span><b>{countryName(c)}</b>
                <small>{c.dests.length} place{c.dests.length > 1 ? "s" : ""} · {countryPkgs(c).length} trips</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="packages" ref={packagesRef}>
        <div className="wrap">
          <p className="eyebrow dark">Handpicked for you</p>
          <h2>{expanded ? (f.q ? `Trips for “${f.q}”` : "All packages") : "Featured trips"}</h2>
          <p className="sub">{expanded ? "Filter by style, audience or region." : "A few favourites from our collection. Want more choice? Open the full list."}</p>
          {expanded && (
            <div>
              <Filters items={TIER_BTNS} value={f.tier} onPick={(v) => setF({ ...f, tier: v })} />
              <Filters small items={STY_BTNS} value={f.sty} onPick={(v) => setF({ ...f, sty: v })} />
              <Filters small items={AUD_BTNS} value={f.aud} onPick={(v) => setF({ ...f, aud: v })} />
              <Filters small items={TYPE_BTNS} value={f.type} onPick={(v) => setF({ ...f, type: v })} />
              <p className="muted">
                {f.q ? `${list.length} trip${list.length === 1 ? "" : "s"} include “${f.q}”` : `Showing ${list.length} of ${PACKAGES.length} packages`}
              </p>
            </div>
          )}
          <div className="grid">
            {list.length ? list.map((p) => <PackageCard key={p.id} p={p} pax={f.pax} />) : noResults}
          </div>
          <div className="more-row">
            <button className="btn" type="button" onClick={toggleExpanded}>
              {expanded ? "Hide packages (back to featured)" : `Show more packages (${PACKAGES.length - list.length} more)`}
            </button>
          </div>
          <p className="note">Package prices are on request and depend on season, group size and hotel choice. Park fees, flights and visas may be extra unless listed. Open any trip and ask for a quote.</p>
        </div>
      </section>

      <section className="sec alt" id="styles">
        <div className="wrap">
          <p className="eyebrow dark">Made for you</p>
          <h2>Find a trip that fits you</h2>
          <p className="sub">Whoever you are travelling with, we have trips designed around you.</p>
          <div className="stylecards">
            {[
              ["family", "smile", "Family travel", "Kid-friendly pace, lodges and hotels with pools, and beach days built in.", "See family trips →"],
              ["group", "users", "Group travel", "Friends, teams and larger parties sharing the journey and the cost.", "See group trips →"],
              ["couples", "heart", "Couples getaway", "Romantic escapes, honeymoons and quiet, private moments.", "See couples trips →"],
            ].map(([k, icon, title, text, go]) => (
              <Link key={k} className={`stylecard ${k}`} href={`/?sty=${k}#packages`}>
                <span className="si"><Icon name={icon} size={30} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="cnt">{PACKAGES.filter((p) => p.style === k).length} trips</span>
                <span className="go">{go}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="stay">
        <div className="wrap">
          <p className="eyebrow dark">Accommodation guide</p>
          <h2>Where to stay</h2>
          <p className="sub">Pick a destination to see budget, mid-range and luxury options with indicative nightly rates. <Link href="/stay"><b>See every hotel by country →</b></Link></p>
          <div className="stay-tools">
            <select value={stayKey} onChange={(e) => setStayKey(e.target.value)}>
              {stayKeys.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="stay">
            {["budget", "mid", "luxury"].map((t) => (
              <div key={t} className={`col ${t}`}>
                <h4><i />{tierName[t]}</h4>
                {(stay[t] || []).map(([n, pr, note]) => (
                  <div className="item" key={n}><b>{n}</b><span>{pr}</span><small>{note}</small></div>
                ))}
              </div>
            ))}
          </div>
          <p className="note">Rates are indicative in USD per person per night (safari lodges usually full board; city and beach hotels per room where noted). Sources: published 2026 safari price guides and hotel booking sites. Confirm current prices before booking.</p>
        </div>
      </section>

      <section className="sec alt" id="dubai-europe">
        <div className="wrap split">
          <div>
            <p className="eyebrow dark">For residents</p>
            <h2>Dubai, Europe &amp; Asia from your doorstep</h2>
            <p>Our resident packages start with <b>pick-up from your home or our head office</b>. Choose Dubai, Europe or Asia (Thailand, Bali, Singapore, Malaysia and China), each a minimum of 8 days, with hotels, transfers and sightseeing arranged.</p>
            <ul className="ticks">
              <li>Dubai: desert safari, Burj Khalifa, Palm Jumeirah, Abu Dhabi</li>
              <li>Europe: Paris, Rome, Santorini, London, Barcelona, Swiss Alps</li>
              <li>Asia: Bangkok, Phuket, Bali, Singapore, Kuala Lumpur, Beijing, Shanghai</li>
            </ul>
            <Link href="/residents" className="btn">See resident packages</Link> <a href="#contact" className="btn ghost dark">Request a quote</a>
          </div>
          <div className="collage">
            <div style={bg("/images/uae/dubai.jpg")} /><div style={bg("/images/europe/france.webp")} /><div style={bg("/images/asia/indonesia-7.webp")} /><div style={bg("/images/europe/greece-3.webp")} />
          </div>
        </div>
      </section>

      <section className="sec camp-banner" id="camps">
        <div className="wrap split">
          <div>
            <p className="eyebrow dark">New</p>
            <h2>Summer camps in Europe</h2>
            <p>Send your child on a summer of new friends, languages and adventures. Three hand-picked camps in Switzerland, the UK and Spain for ages 5 to 18, running June to August.</p>
            <ul className="ticks">
              <li>Alpine adventure, a UK activity camp and Spanish by the sea</li>
              <li>Full pages with ages, dates and sessions</li>
              <li>Prices on request</li>
            </ul>
            <Link href="/summer-camps" className="btn">Explore summer camps</Link>
          </div>
          <div className="collage">
            <div style={bg("/images/camps/aiglon.jpg")} /><div style={bg("/images/camps/pgl.avif")} /><div style={bg("/images/camps/barcelona.jpg")} /><div style={bg("/images/europe/switzerland.jpg")} />
          </div>
        </div>
      </section>

      <section className="sec dark" id="why">
        <div className="wrap">
          <p className="eyebrow">Why Friends International</p>
          <h2>Travel with people who care</h2>
          <div className="why">
            <div><b><Icon name="compass" size={30} /></b><h4>Local expertise</h4><p>Itineraries built around the best seasons and parks.</p></div>
            <div><b><Icon name="banknote" size={30} /></b><h4>Every budget</h4><p>From budget lodge safaris to luxury fly-in camps.</p></div>
            <div><b><Icon name="shield-check" size={30} /></b><h4>Hassle-free</h4><p>Transfers, permits, lodging and guides arranged for you.</p></div>
            <div><b><Icon name="target" size={30} /></b><h4>Tailor-made</h4><p>Private trips and group departures, customised to you.</p></div>
          </div>
        </div>
      </section>

      <section className="sec" id="contact">
        <div className="wrap split">
          <div>
            <p className="eyebrow dark">Get in touch</p>
            <h2>Plan your trip</h2>
            <p>Tell us where you want to go and we will send a personalised quote.</p>
            <ul className="ticks">
              <li><Icon name="phone" size={16} /> <span className="c-phone">{CONFIG.phoneDisplay}</span></li>
              <li><Icon name="mail" size={16} /> <span className="c-email">{CONFIG.email}</span></li>
              <li><Icon name="map-pin" size={16} /> Nairobi, Kenya</li>
            </ul>
          </div>
          <form className="form" ref={enqRef} onSubmit={enqSubmit}>
            <input name="name" placeholder="Full name" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="phone" placeholder="Phone / WhatsApp" />
            <select name="dest" value={enqDest} onChange={(e) => setEnqDest(e.target.value)}>
              {stayKeys.map((k) => <option key={k}>{k}</option>)}
            </select>
            <select name="tier"><option>Budget</option><option>Mid-range</option><option>Luxury</option></select>
            <div className="row2"><input name="date" type="date" /><input name="pax" type="number" min="1" placeholder="Travellers" /></div>
            <textarea name="msg" rows="3" placeholder="Anything else?" />
            <button className="btn" type="submit">Send enquiry</button>
            <button className="btn wa" type="button" onClick={enqWa}>Send on WhatsApp</button>
            <small>{formMsg}</small>
          </form>
        </div>
      </section>

      <Footer variant="home" tagline="Safaris · Beaches · Dubai · Europe" />
      <WaFloat />
    </>
  );
}
