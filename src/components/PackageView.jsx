"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import SafeImg from "./SafeImg";
import Footer from "./Footer";
import WaFloat from "./WaFloat";
import { useBooking } from "./BookingProvider";
import { useScrollSpy } from "./useScrollSpy";
import { tierName } from "./Cards";

function Act({ a }) {
  return a.s === "inc" ? (
    <li className="a inc"><b><Icon name="check" size={12} /></b> {a.n}<em>included</em></li>
  ) : (
    <li className="a opt"><b><Icon name="plus" size={12} /></b> {a.n}<em>optional{a.c ? ` · ${a.c}` : " · extra cost"}</em></li>
  );
}

function Cell({ c }) {
  if (c && c.y) return <span className="y">✓ Included</span>;
  if (c && c.n) return <span className="n">✕ Not included</span>;
  return c;
}

export default function PackageView({ p, view, content = {} }) {
  const [pax, setPax] = useState(0);
  useEffect(() => { setPax(Math.max(1, parseInt(new URLSearchParams(window.location.search).get("pax"), 10) || 0)); }, []);
  const { open } = useBooking();
  useScrollSpy("#tabbar a", ".ps");
  const v = view;
  const tiers3 = ["budget", "mid", "luxury"];
  const book = (mode) => open({ mode, trip: p.title, tier: p.tier, pax });

  return (
    <>
      <section className="phero">
        <div className="phero-bg" style={{ backgroundImage: `linear-gradient(180deg,#0005,#000a),url('${p.img}'),linear-gradient(135deg,#8a5a1c,#1f4d3a)` }} />
        <div className="wrap phero-in">
          <Link className="back" href="/#packages">← All packages</Link>
          <div className="chips">
            <span className={`chip ${p.tier}`}>{v.tierLabel}</span>
            <span className={`chip sty-chip ${p.style}`}><Icon name={v.styleIcon} size={14} /> {v.styleLabel}</span>
            <span className="chip">{p.days} days</span>
            {p.multi && <span className="chip">Multi-destination</span>}
            {p.resident && <span className="chip res"><Icon name="house" size={14} /> Residents: pick-up from home or head office</span>}
            {v.luxFlights && <span className="chip fl"><Icon name="plane" size={14} /> Internal flights included</span>}
          </div>
          <h1>{p.title}</h1>
          <p className="proute">{v.routeText}</p>
        </div>
      </section>

      <div className="tabbar" id="tabbar">
        <div className="wrap tabs">
          <a href="#overview" className="on">Overview</a><a href="#destinations">Destinations &amp; activities</a><a href="#itinerary">Itinerary</a>
          <a href="#accommodation">Accommodation</a><a href="#journey">Journey details</a><a href="#inclusions">Included / not included</a>
        </div>
      </div>

      <div className="wrap pk-layout">
        <main>
          <section id="overview" className="ps">
            <h2>Overview</h2>
            <p className="lead2">{v.intro}</p>
            {p.resident && <div className="resbox"><b><Icon name="house" size={16} /> For residents.</b> {v.resText}</div>}
            <div className="glance">
              <div><small>Duration</small><b>{p.days} days / {v.nights} nights</b></div>
              <div><small>Style</small><b>{v.tierLabel}</b></div>
              <div><small>Best for</small><b>{v.styleLabel}</b></div>
              <div><small>Route</small><b>{v.routeText}</b></div>
              <div><small>Price</small><b>{content.priceLabel || "On request"}</b></div>
            </div>
            <div className="two sumbox">
              <div className="box good"><h4>Included</h4><ul>{v.summary.inc.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="box bad"><h4>Not included</h4><ul>{v.summary.exc.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <p className="muted"><a href="#inclusions">See the full included / not included list →</a></p>
            <h3>Highlights</h3>
            <ul className="ticks2">{v.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </section>

          <section id="destinations" className="ps">
            <h2>About the destinations &amp; activities</h2>
            <p className="muted">Activities marked <b className="ok">included</b> are covered by the package price. Activities marked <b className="plus">optional</b> are available in that destination for an extra cost.</p>
            {v.destSec.map((d) => (
              <article className="dblock" key={d.d}>
                <div className="dph"><SafeImg src={d.img} alt={d.d} /><span>{d.country}</span></div>
                <div className="dtxt">
                  <h3>{d.d} <small>{d.nts} night{d.nts > 1 ? "s" : ""}</small></h3>
                  <p>{d.about}</p>
                  <div className="two mini2">
                    <div className="box good"><h4>Included in {d.d}</h4><ul>{d.included.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
                    <div className="box bad"><h4>Not included in {d.d}</h4>
                      <ul>{d.notIncluded.map((x, i) => <li key={i}>{x.n}{x.c ? <> <small>({x.c})</small></> : null}</li>)}</ul>
                    </div>
                  </div>
                  <h4>Activities in {d.d}</h4>
                  <ul className="acts">{d.acts.map((a, i) => <Act key={i} a={a} />)}</ul>
                </div>
              </article>
            ))}
          </section>

          <section id="itinerary" className="ps">
            <h2>Day-by-day itinerary</h2>
            {content.itineraryNotes ? <p className="lead2 itin-note">{content.itineraryNotes}</p> : null}
            {v.itinerary.map((d) => (
              <div className="day" key={d.n}>
                <div className="dn"><span>Day</span><b>{d.n}</b></div>
                <div className="dbody">
                  <h4>{d.title}</h4>
                  <p>{d.travel}</p>
                  {d.items.length ? (
                    <ul className="acts">{d.items.map((a, i) => <Act key={i} a={a} />)}</ul>
                  ) : d.fallback ? <p className="muted">{d.fallback}</p> : null}
                  <div className="dmeta">
                    <span><Icon name="utensils" size={14} /> {d.meal}</span>
                    {d.stayLabel ? <span><Icon name="bed" size={14} /> {d.stayLabel}</span> : d.nightAt ? <span><Icon name="bed" size={14} /> {d.nightAt}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section id="accommodation" className="ps">
            <h2>Accommodation</h2>
            <p className="muted">{v.accomIntro}</p>
            {v.accom.kili ? (
              <>
                <div className="stayrow"><div><h4>Moshi hotel (2 nights, before and after)</h4><p className="muted">{v.accom.moshi}, with breakfast.</p></div><div className="sprice">Included</div></div>
                <div className="stayrow"><div><h4>Mountain camps (5 nights)</h4><p className="muted">Tents, sleeping mats and mess tent supplied. Sleeping bag can be hired.</p></div><div className="sprice">Included</div></div>
              </>
            ) : v.accom.rows.map((r) => (
              <div className="stayrow" key={r.d}>
                <div>
                  <h4>{r.d} <small>{r.n} night{r.n > 1 ? "s" : ""}</small></h4>
                  <p className="muted">Meals: {r.meals}. Your hotel will be one of:</p>
                  <ul className="hotels">
                    {r.hotels.length ? r.hotels.map((h) => <li key={h[0]}><b>{h[0]}</b><span>{h[2]}</span><em>{h[1]}</em></li>) : <li>Selected property</li>}
                  </ul>
                </div>
              </div>
            ))}
          </section>

          <section id="journey" className="ps">
            <h2>Journey details</h2>
            <table className="jt"><tbody>{v.journeyRows.map((r) => <tr key={r[0]}><th>{r[0]}</th><td>{r[1]}</td></tr>)}</tbody></table>
            <p className="muted">{v.journeyNote}</p>
          </section>

          <section id="inclusions" className="ps">
            <h2>What&apos;s included and not included</h2>
            <div className={`tierbanner ${p.tier}`}><b>{v.tierLabel}: {v.inclusions.tierStyle.name}</b><span>{v.inclusions.tierStyle.line}</span></div>
            <div className="two">
              <div className="box good"><h4>Included</h4><ul>{v.inclusions.inc.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="box bad"><h4>Not included</h4><ul>{v.inclusions.exc.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <h3>How the three travel levels compare</h3>
            <div className="cmpwrap">
              <table className="cmp">
                <thead>
                  <tr>
                    <th />
                    {tiers3.map((t) => (
                      <th key={t} className={`${t}${t === p.tier ? " cur" : ""}`}>
                        {tierName[t]}{t === p.tier && <small>This package</small>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {v.inclusions.cmpRows.map((r) => (
                    <tr key={r[0]}>
                      <th>{r[0]}</th>
                      {r[1].map((c, i) => <td key={i} className={tiers3[i] === p.tier ? "cur" : ""}><Cell c={c} /></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {v.inclusions.optionalList.length > 0 && (
              <>
                <h3>Optional activities (extra cost)</h3>
                <ul className="acts plain">
                  {v.inclusions.optionalList.map((x) => <li className="a opt" key={x}><b><Icon name="plus" size={12} /></b> {x}</li>)}
                </ul>
              </>
            )}
            <p className="muted">Optional activities can be added before or during your trip and are paid for separately. Ask us for a current quote.</p>
          </section>
        </main>

        <aside>
          <div className="bookcard">
            <small>Price</small><div className="bprice">{content.priceLabel || "On request"}</div>
            <p className="muted">{p.days} days · {v.tierLabel}{v.luxFlights ? " · internal flights included" : ""}</p>
            <button className="btn full" type="button" onClick={() => book("book")}>Book this trip</button>
            <button className="btn ghost dark full" type="button" onClick={() => book("customize")}>Customise this trip</button>
            <p className="muted sm">Prices depend on season, group size and hotel choice. Send us your dates and we will reply with a quote.</p>
          </div>
        </aside>
      </div>

      <Footer tagline="Safaris · Beaches · Dubai · Europe" />
      <WaFloat />
    </>
  );
}
