"use client";
import Link from "next/link";
import { CAMPS } from "@/data/camps";
import Icon from "./Icon";
import SafeImg from "./SafeImg";
import Footer from "./Footer";
import WaFloat from "./WaFloat";
import { useBooking } from "./BookingProvider";

export default function CampsView() {
  const { open } = useBooking();
  const camp = (mode) => open({ mode, trip: "Summer camp in Europe", pax: 1, children: 1, camp: true });

  return (
    <>
      <section className="phero chero">
        <div className="phero-bg" style={{ backgroundImage: "linear-gradient(180deg,#0003,#000b),url('https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1800&q=70'),linear-gradient(135deg,#d9912b,#1f4d3a)" }} />
        <div className="wrap phero-in">
          <Link className="back" href="/">← Home</Link>
          <h1>Summer camps in Europe</h1>
          <p className="sub2">Three hand-picked camps for a summer of new friends, new skills and new languages. Prices on request.</p>
          <div className="cfacts">
            <span><Icon name="users" size={15} /> Ages 5–18</span>
            <span><Icon name="sun" size={15} /> June to August</span>
            <span><Icon name="globe" size={15} /> Switzerland · UK · Spain</span>
            <span><Icon name="wallet" size={15} /> Prices on request</span>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="cs" style={{ border: 0, paddingBottom: 10 }}>
          <div className="steps">
            <div><b>1</b><h4>Pick a camp</h4><p>Compare the ages, dates and locations below.</p></div>
            <div><b>2</b><h4>Tell us the details</h4><p>Send your child&apos;s age and the dates you prefer.</p></div>
            <div><b>3</b><h4>We send a quote</h4><p>Prices are on request. We confirm availability and help with the booking.</p></div>
          </div>
        </section>

        <section className="cs" style={{ border: 0, paddingTop: 0 }}>
          <div className="campbig">
            {CAMPS.map((c) => {
              const url = `/summer-camps/${c.id}`;
              return (
                <article className="campcard" key={c.id}>
                  <Link className="cimg" href={url}>
                    <SafeImg src={c.img} alt={c.place} />
                    <span className="agepill"><Icon name="users" size={14} /> Ages {c.ageLabel}</span>
                    <span className="ctag">{c.country}</span>
                  </Link>
                  <div className="cbody">
                    <h3><Link href={url}>{c.name}</Link></h3>
                    <p className="route"><Icon name="map-pin" size={13} /> {c.place}</p>
                    <p className="about">{c.tagline}</p>
                    <dl className="ck">
                      <div><dt><Icon name="users" size={15} /> Age</dt><dd>{c.ageDetail}</dd></div>
                      <div><dt><Icon name="calendar" size={15} /> When</dt><dd>{c.when}</dd></div>
                      <div><dt><Icon name="sun" size={15} /> Length</dt><dd>{c.length}</dd></div>
                    </dl>
                    <div className="mini">{c.cats.map((x) => <span key={x}>{x}</span>)}</div>
                    <div className="cf">
                      <div><span className="p">Price</span><strong className="onreq">On request</strong></div>
                      <Link className="btn sm" href={url}>View camp</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="note">Camps are run by independent schools and organisations. Dates shown come from the most recent published seasons (2026, and 2027 where announced); exact dates and availability are confirmed on request. Prices are on request.</p>
        </section>

        <div className="cta">
          <h2>Not sure which camp fits?</h2>
          <p>Tell us your child&apos;s age, interests and the month you prefer. We will recommend the best match and send a quote.</p>
          <button className="btn" type="button" onClick={() => camp("book")}>Book a camp</button>
          <button className="btn ghost" type="button" onClick={() => camp("customize")}>Customise a camp</button>
        </div>
      </div>

      <Footer variant="camps" tagline="Safaris · Beaches · Dubai · Europe · Asia · Summer Camps" />
      <WaFloat text="Hello Friends International, I am looking for a summer camp in Europe. Child's age: ___, preferred month: ___." />
    </>
  );
}
