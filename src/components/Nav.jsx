"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PACKAGES, COUNTRIES, RES_CATS, countryPkgs, resPkgs } from "@/data/site";
import Icon, { EmojiIcon } from "./Icon";

const vis = (p) => p.aud === "visitor";
const ke = COUNTRIES.find((c) => c.slug === "kenya");
const tz = COUNTRIES.find((c) => c.slug === "tanzania");
const nKe = countryPkgs(ke, true).filter(vis).length;
const nTz = countryPkgs(tz, true).filter(vis).length;
const nCombo = PACKAGES.filter((p) => p.type === "Combo" && p.safari && vis(p)).length;
const nAll = PACKAGES.filter(vis).length;
const group = (g) => COUNTRIES.filter((c) => c.group === g);

function Group({ g, onNav }) {
  return group(g).map((c) => (
    <Link key={c.slug} href={`/destinations/${c.slug}`} onClick={onNav}>
      {c.short || c.name}<small>{c.dests.join(", ")}</small>
    </Link>
  ));
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDd, setOpenDd] = useState(null);

  useEffect(() => {
    const close = (e) => { if (!e.target.closest(".dd-b")) setOpenDd(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const closeAll = () => { setMenuOpen(false); setOpenDd(null); };
  const toggleDd = (i) => () => setOpenDd(openDd === i ? null : i);

  return (
    <header className="nav" id="nav">
      <div className="wrap nav-in">
        <Link href="/" className="logo" aria-label="Friends International Limited, home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width="52" height="50" />
          <div className="logo-text">Friends <span>International</span><small>LIMITED</small></div>
        </Link>
        <button className="burger" id="burger" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name="menu" size={24} />
        </button>
        <nav id="menu" className={menuOpen ? "open" : ""}>
          <Link className="home-ic" href="/" aria-label="Back to homepage" title="Back to homepage" onClick={closeAll}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h5v-6h4v6h5V10" />
            </svg>
            <span>Home</span>
          </Link>

          <div className={`dd${openDd === 0 ? " open" : ""}`}>
            <button className="dd-b" type="button" onClick={toggleDd(0)}>Safaris <i>▾</i></button>
            <div className="dd-m">
              <h5>Visitor safaris by country</h5>
              <Link href="/destinations/kenya?view=safari&aud=visitor" onClick={closeAll}>Kenya Safaris<small>{nKe} packages · Mara, Amboseli, Tsavo, Samburu, Nakuru</small></Link>
              <Link href="/destinations/tanzania?view=safari&aud=visitor" onClick={closeAll}>Tanzania Safaris<small>{nTz} packages · Serengeti, Ngorongoro, Manyara, Tarangire, Kilimanjaro</small></Link>
              <Link href="/?type=Combo#packages" onClick={closeAll}>Kenya + Tanzania Combos<small>{nCombo} multi-country packages</small></Link>
              <Link className="all" href="/?aud=visitor#packages" onClick={closeAll}>All {nAll} visitor packages →</Link>
            </div>
          </div>

          <div className={`dd${openDd === 1 ? " open" : ""}`}>
            <button className="dd-b" type="button" onClick={toggleDd(1)}>Residents <i>▾</i></button>
            <div className="dd-m">
              <h5>Pick-up from your home or our head office</h5>
              {RES_CATS.map((c) => (
                <Link key={c.id} href={`/residents?cat=${c.id}`} onClick={closeAll}>
                  <EmojiIcon emoji={c.icon} size={16} /> {c.label}
                  <small>{resPkgs(c.id).length} packages{["dubai", "europe", "asia"].includes(c.id) ? " · 8+ days" : ""}</small>
                </Link>
              ))}
              <Link className="all" href="/residents" onClick={closeAll}>All {resPkgs().length} resident packages →</Link>
            </div>
          </div>

          <Link href="/summer-camps" onClick={closeAll}>Summer Camps</Link>

          <div className={`dd${openDd === 2 ? " open" : ""}`}>
            <button className="dd-b" type="button" onClick={toggleDd(2)}>Destinations <i>▾</i></button>
            <div className="dd-m wide">
              <div><h5>East Africa</h5><Group g="East Africa" onNav={closeAll} /><h5>Middle East</h5><Group g="Middle East" onNav={closeAll} /></div>
              <div><h5>Europe</h5><Group g="Europe" onNav={closeAll} /></div>
              <div><h5>Asia</h5><Group g="Asia" onNav={closeAll} /></div>
            </div>
          </div>

          <Link href="/stay" onClick={closeAll}>Where to Stay</Link>
          <Link href="/#why" onClick={closeAll}>Why Us</Link>
          <Link href="/#contact" className="btn sm" onClick={closeAll}>Enquire</Link>
        </nav>
      </div>
    </header>
  );
}
