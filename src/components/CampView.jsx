"use client";
import Link from "next/link";
import { CAMPS } from "@/data/camps";
import Icon from "./Icon";
import SafeImg from "./SafeImg";
import Footer from "./Footer";
import WaFloat from "./WaFloat";
import { useBooking } from "./BookingProvider";
import { useScrollSpy } from "./useScrollSpy";

export default function CampView({ id }) {
  const c = CAMPS.find((x) => x.id === id);
  const { open } = useBooking();
  useScrollSpy("#tabbar a", ".ps");
  const others = CAMPS.filter((x) => x.id !== c.id);
  const book = (mode) => open({ mode, trip: c.name, pax: 1, children: 1, camp: true });

  return (
    <>
      <section className="phero">
        <div className="phero-bg" style={{ backgroundImage: `linear-gradient(180deg,#0005,#000a),url('${c.img}'),linear-gradient(135deg,#8a5a1c,#1f4d3a)` }} />
        <div className="wrap phero-in">
          <Link className="back" href="/summer-camps">← All summer camps</Link>
          <div className="chips">
            <span className="chip">{c.country}</span>
            <span className="chip"><Icon name="users" size={14} /> Ages {c.ageLabel}</span>
            {c.cats.map((x) => <span className="chip" key={x}>{x}</span>)}
          </div>
          <h1>{c.name}</h1>
          <p className="proute"><Icon name="map-pin" size={14} /> {c.place}</p>
        </div>
      </section>

      <div className="tabbar" id="tabbar">
        <div className="wrap tabs">
          <a href="#overview" className="on">Overview</a><a href="#programme">Programme</a><a href="#dates">Dates &amp; sessions</a><a href="#know">Good to know</a>
        </div>
      </div>

      <div className="wrap pk-layout">
        <main>
          <section id="overview" className="ps">
            <h2>Overview</h2>
            <p className="lead2">{c.tagline}.</p>
            <div className="glance">
              <div><small>Age</small><b>{c.ageLabel}</b></div>
              <div><small>Price</small><b>On request</b></div>
              <div><small>When</small><b>{c.when}</b></div>
              <div><small>Length</small><b>{c.length}</b></div>
            </div>
            {c.overview.map((t, i) => <p key={i}>{t}</p>)}
            <h3>Highlights</h3>
            <ul className="ticks2">{c.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </section>

          <section id="programme" className="ps">
            <h2>What children do</h2>
            <div className="progrid">{c.programme.map((p) => <div className="prog" key={p[0]}><h4>{p[0]}</h4><p>{p[1]}</p></div>)}</div>
          </section>

          <section id="dates" className="ps">
            <h2>Dates &amp; sessions</h2>
            <table className="jt">
              <tbody>
                <tr><th>Who it is for</th><td>{c.ageDetail}</td></tr>
                <tr><th>When</th><td>{c.when}</td></tr>
                <tr><th>Sessions</th><td>{c.dates.map((d) => <Sess key={d} d={d} />)}</td></tr>
                <tr><th>Length of stay</th><td>{c.length}</td></tr>
                <tr><th>Format</th><td>{c.format}</td></tr>
                <tr><th>Location</th><td>{c.place}</td></tr>
                <tr><th>Price</th><td><b className="onreq">On request</b>: tell us your child&apos;s age and dates and we will send a quote.</td></tr>
              </tbody>
            </table>
            <p className="muted">{c.datesNote}</p>
          </section>

          <section id="know" className="ps">
            <h2>Good to know</h2>
            <ul className="ticks2">{c.goodToKnow.map((g) => <li key={g}>{g}</li>)}</ul>
            {c.url && (
              <p className="muted" style={{ marginTop: 12 }}>
                Programme information: <a className="src" target="_blank" rel="noopener" href={c.url}>official website ↗</a>
              </p>
            )}
            <p className="muted">Camps are run by independent organisations. Dates, ages and availability are confirmed with the camp before booking.</p>
          </section>

          <section className="ps">
            <h2>Other summer camps</h2>
            <div className="otherc">
              {others.map((o) => (
                <Link className="oc" href={`/summer-camps/${o.id}`} key={o.id}>
                  <SafeImg src={o.img} alt="" />
                  <span><b>{o.name}</b><small>{o.country} · Ages {o.ageLabel}</small></span>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside>
          <div className="bookcard">
            <small>Price</small><div className="bprice">On request</div>
            <p className="muted">Ages {c.ageLabel} · {c.country}</p>
            <button className="btn full" type="button" onClick={() => book("book")}>Book this camp</button>
            <button className="btn ghost dark full" type="button" onClick={() => book("customize")}>Customise</button>
            <p className="muted sm">Send us your child&apos;s age and preferred dates and we will confirm availability and a quote.</p>
          </div>
        </aside>
      </div>

      <Footer variant="camps" tagline="Safaris · Beaches · Dubai · Europe · Asia · Summer Camps" />
      <WaFloat text="Hello Friends International, I would like to ask about a summer camp." />
    </>
  );
}

function Sess({ d }) {
  return <><span className="sess">{d}</span>{" "}</>;
}
