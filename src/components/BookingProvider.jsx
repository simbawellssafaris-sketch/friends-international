"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CONFIG } from "@/data/config";
import Icon from "./Icon";
import { submitRequest } from "@/lib/requests";

// Booking / customise form shared by every page. Any component can call useBooking().open({ mode, trip, tier, pax, camp, children }).
const TIERS = { budget: "Budget", mid: "Mid-range", luxury: "Luxury" };
const CUSTOM_OPTS = ["Change the dates or length", "Different hotels", "Add or remove destinations", "Add activities", "Add a beach stay or extension", "Travelling with children or a group"];

const BookingContext = createContext({ open: () => {} });
export const useBooking = () => useContext(BookingContext);

export default function BookingProvider({ children }) {
  const [state, setState] = useState(null); // null = closed
  const open = useCallback((o) => setState({ ...o, mode: o.mode === "customize" ? "customize" : "book", key: Date.now() }), []);
  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    document.body.classList.toggle("bk-lock", !!state);
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.classList.remove("bk-lock"); };
  }, [state, close]);

  return (
    <BookingContext.Provider value={{ open }}>
      {children}
      {state && <BookingModal key={state.key} o={state} close={close} />}
    </BookingContext.Provider>
  );
}

function BookingModal({ o, close }) {
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const mode = o.mode;
  const camp = !!o.camp;

  useEffect(() => { const t = setTimeout(() => nameRef.current?.focus(), 50); return () => clearTimeout(t); }, []);

  const message = () => {
    const f = formRef.current.elements, v = (n) => (f[n]?.value || "").trim();
    const opts = [...formRef.current.querySelectorAll("input[name=opt]:checked")].map((x) => x.value);
    const lines = [
      mode === "book" ? "BOOKING REQUEST" : "CUSTOMISED TRIP REQUEST",
      `Trip: ${v("trip") || "(not specified)"}`,
      `Name: ${v("name")}`,
      `Phone: ${v("phone") || "-"}`,
      `Email: ${v("email") || "-"}`,
      `Preferred date: ${v("date") || "flexible"}`,
      `Travellers: ${v("adults") || 1} adult(s), ${v("children") || 0} child(ren)`,
      ...(camp ? [`Child age(s): ${v("childage") || "-"}`] : [`Travel level: ${v("tier") || "no preference"}`]),
    ];
    if (mode === "customize") {
      if (opts.length) lines.push("Changes wanted: " + opts.join(", "));
      if (v("custom")) lines.push("Details: " + v("custom"));
    }
    if (v("notes")) lines.push("Notes: " + v("notes"));
    return lines.join("\n");
  };

  const send = async (how) => {
    const f = formRef.current.elements;
    const fail = (t) => setErr(t);
    if (!f.name.value.trim()) return fail("Please enter your name.");
    if (!f.phone.value.trim() && !f.email.value.trim()) return fail("Please add a phone number or an email so we can reply.");
    if (f.email.value.trim() && !/^\S+@\S+\.\S+$/.test(f.email.value.trim())) return fail("That email address does not look right.");
    setErr("");
    const text = message();
    const subject = (mode === "book" ? "Booking request: " : "Customise trip: ") + (f.trip.value.trim() || "New trip");
    // Save the request to Supabase while the WhatsApp / email flow starts (opened first so browsers allow the pop-up).
    const saving = f.website && f.website.value
      ? Promise.resolve({ ok: false }) // hidden spam-trap field was filled in: a bot
      : submitRequest({
          kind: mode, channel: how === "wa" ? "whatsapp" : "email",
          trip: f.trip.value, name: f.name.value, phone: f.phone.value, email: f.email.value,
          date: f.date.value, adults: f.adults.value, children: f.children.value,
          level: camp ? "" : f.tier?.value, childAges: camp ? f.childage?.value : "",
          changes: [...formRef.current.querySelectorAll("input[name=opt]:checked")].map((x) => x.value),
          details: f.custom?.value, notes: f.notes.value,
        });
    let msg;
    if (how === "wa") {
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
      msg = "WhatsApp has opened with your request filled in. Just press send and we will reply with your quote.";
    } else if (CONFIG.formEndpoint) {
      try {
        const r = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ subject, message: text, name: f.name.value, email: f.email.value, phone: f.phone.value }) });
        if (!r.ok) throw new Error("bad response");
        msg = "Thank you! We have received your request and will reply with your quote shortly.";
      } catch (_) { return fail("Could not send. Please use WhatsApp or try again."); }
    } else {
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      msg = "Your email app has opened with your request filled in. Just press send and we will reply with your quote.";
    }
    const saved = await saving;
    setDone(msg + (saved.ok ? " Your request has also been saved with us." : ""));
  };

  return (
    <div className="bk-back" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="bk" role="dialog" aria-modal="true" aria-labelledby="bkTitle">
        <button className="bk-x" type="button" aria-label="Close" onClick={close}><Icon name="x" size={20} /></button>
        <div className="bk-head">
          <span className="bk-kicker">{mode === "book" ? "Book this trip" : "Customise this trip"}</span>
          <h3 id="bkTitle">{o.trip || (mode === "book" ? "Tell us about your trip" : "Design your own trip")}</h3>
          <p>
            {mode === "book"
              ? "Fill in your details and send the request by WhatsApp or email. We will confirm availability and send your quote."
              : "Start from this trip and tell us what to change. We will build a tailor-made version and send a quote."}
          </p>
        </div>

        {!done && (
          <form ref={formRef} noValidate onSubmit={(e) => e.preventDefault()}>
            <label className="full">Trip<input name="trip" defaultValue={o.trip || ""} placeholder="Which trip or destination?" /></label>
            <div className="bk-row">
              <label>Full name *<input ref={nameRef} name="name" required autoComplete="name" /></label>
              <label>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" /></label>
            </div>
            <label>Email<input name="email" type="email" autoComplete="email" /></label>
            <div className="bk-row3">
              <label>Preferred travel date<input name="date" type="date" min={new Date().toISOString().slice(0, 10)} /></label>
              <label>Adults<input name="adults" type="number" min="1" max="50" defaultValue={o.pax || 2} /></label>
              <label>Children<input name="children" type="number" min="0" max="30" defaultValue={o.children != null ? o.children : 0} /></label>
            </div>
            {camp ? (
              <label>Child&apos;s age(s)<input name="childage" placeholder="e.g. 11, 14" /></label>
            ) : (
              <label>Hotel / travel level
                <select name="tier" defaultValue={o.tier && TIERS[o.tier] ? TIERS[o.tier] : ""}>
                  <option value="">No preference</option><option>Budget</option><option>Mid-range</option><option>Luxury</option>
                </select>
              </label>
            )}
            {mode === "customize" && (
              <div>
                <fieldset>
                  <legend>What would you like to change?</legend>
                  {CUSTOM_OPTS.map((x) => (
                    <label className="chk" key={x}><input type="checkbox" name="opt" value={x} /> {x}</label>
                  ))}
                </fieldset>
                <label>Tell us how you would like to customise it
                  <textarea name="custom" rows="3" placeholder="e.g. add 3 nights in Zanzibar, stay in luxury lodges, travelling with two children aged 8 and 11" />
                </label>
              </div>
            )}
            <label>Anything else we should know?<textarea name="notes" rows="2" /></label>
            {/* spam trap: hidden from people, bots fill it in */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
            {err && <p className="bk-err">{err}</p>}
            <div className="bk-actions">
              <button type="button" className="btn wa" onClick={() => send("wa")}><Icon name="message-circle" size={18} /> Send via WhatsApp</button>
              <button type="button" className="btn" onClick={() => send("mail")}><Icon name="mail" size={18} /> Send via email</button>
            </div>
            <small className="bk-note">Choose how you would like to send this request. Prices are on request and we reply with a quote.</small>
          </form>
        )}

        {done && (
          <div className="bk-done">
            <div className="bk-tick"><Icon name="check" size={30} /></div>
            <h3>Your request is ready</h3>
            <p>{done}</p>
            <button className="btn" type="button" onClick={close}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
