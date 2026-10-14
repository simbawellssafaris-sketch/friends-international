"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RES_CATS, resPkgs } from "@/data/site";
import Icon, { EmojiIcon } from "./Icon";
import Footer from "./Footer";
import WaFloat from "./WaFloat";
import { PackageCard } from "./Cards";

const TIERS = [["", "All"], ["budget", "Budget"], ["mid", "Mid-range"], ["luxury", "Luxury"]];
const STYLES = [["", "Any travel style"], ["family", "Family travel"], ["group", "Group travel"], ["couples", "Couples getaway"]];

export default function ResidentsView({ initialCat = "" }) {
  const urlCat = initialCat;
  const [cat, setCat] = useState(RES_CATS.some((c) => c.id === urlCat) ? urlCat : "");
  const [tier, setTier] = useState("");
  const [sty, setSty] = useState("");

  // follow the menu links (/residents?cat=asia) when already on this page
  useEffect(() => {
    setCat(RES_CATS.some((c) => c.id === urlCat) ? urlCat : "");
    setTier("");
  }, [urlCat]);

  const pickCat = (id) => {
    setCat(id);
    setTier("");
    window.history.replaceState(null, "", id ? `?cat=${id}` : window.location.pathname);
  };

  const cur = RES_CATS.find((c) => c.id === cat);
  const base = resPkgs(cat);
  const list = base.filter((p) => (!tier || p.tier === tier) && (!sty || p.style === sty));

  return (
    <>
      <section className="phero chero">
        <div className="phero-bg" style={{ backgroundImage: "linear-gradient(180deg,#0004,#000b),url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=70'),linear-gradient(135deg,#8a5a1c,#1f4d3a)" }} />
        <div className="wrap phero-in">
          <Link className="back" href="/">← Home</Link>
          <h1>Packages for residents</h1>
          <p className="sub2">We pick you up from your home or our head office. No airport to reach, no long queues, just get in and go.</p>
        </div>
      </section>

      <div className="wrap">
        <section className="cs" style={{ border: 0, paddingBottom: 20 }}>
          <div className="steps">
            <div><b>1</b><h4>We collect you</h4><p>Pick-up from your home or from our head office at an agreed time.</p></div>
            <div><b>2</b><h4>Enjoy the trip</h4><p>Kenya safaris and beach holidays go by road (or by flight on luxury trips). Dubai, Europe and Asia start with a transfer to the airport.</p></div>
            <div><b>3</b><h4>We bring you back</h4><p>Drop-off at your home or head office when the trip ends.</p></div>
          </div>
          <div className="cats2">
            <button className={cat === "" ? "on" : ""} onClick={() => pickCat("")}><b><Icon name="globe" size={26} /></b>All<small>{resPkgs().length}</small></button>
            {RES_CATS.map((c) => (
              <button key={c.id} className={cat === c.id ? "on" : ""} onClick={() => pickCat(c.id)}>
                <b><EmojiIcon emoji={c.icon} /></b>{c.label}<small>{resPkgs(c.id).length}</small>
              </button>
            ))}
          </div>
          <p className="muted">{cur ? cur.blurb : "Choose a category to narrow the list."}</p>
        </section>

        <section className="cs" style={{ border: 0, paddingTop: 0 }}>
          <div className="filters">
            {STYLES.map(([v, l]) => <button key={v} className={sty === v ? "on" : ""} onClick={() => setSty(v)}>{l}</button>)}
          </div>
          <div className="filters">
            {TIERS.map(([v, l]) => (
              <button key={v} className={tier === v ? "on" : ""} onClick={() => setTier(v)}>
                {l} ({v ? base.filter((p) => p.tier === v).length : base.length})
              </button>
            ))}
          </div>
          <div className="grid">
            {list.length
              ? list.map((p) => <PackageCard key={p.id} p={p} alwaysRes resLabel="Pick-up from home" />)
              : <p>No trips in this style yet. Ask us for a custom quote.</p>}
          </div>
          <p className="note">Package prices are on request and depend on season and group size. Resident park rates apply on safaris. Return international flights are included in Dubai, Europe, Asia and Zanzibar packages. Dubai, Europe and Asia packages are a minimum of 8 days.</p>
        </section>
      </div>

      <Footer />
      <WaFloat text="Hello Friends International, I am a resident and would like to enquire about a trip." />
    </>
  );
}
