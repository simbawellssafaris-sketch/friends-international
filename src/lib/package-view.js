// Builds everything a package page shows (itinerary, accommodation, journey, inclusions...) from a package object.
// Ported from the original static site's package.js; text is unchanged.
import {
  PACKAGES, ACT, DINFO, AIRPORT, CITY, SAFARI, BEACH, CITYSET, ASIASET, STAYS, STYLE_INFO,
  destByKey, pkgIncSummary, tierInc, tierExc, TIER_STYLE, isDomesticRes, intlFlightsIncluded, flightsIncl,
} from "@/data/site";
import { CONFIG } from "@/data/config";

export const tierName = { budget: "Budget", mid: "Mid-range", luxury: "Luxury" };
const KENYA = new Set(["Maasai Mara", "Amboseli", "Tsavo", "Samburu", "Lake Nakuru", "Diani", "Watamu"]);

const KILI = [
  { n: 1, title: "Arrive in Moshi", stay: "Mount Kilimanjaro", travel: "Meet your guide at Kilimanjaro International Airport (JRO) and transfer to your hotel in Moshi for a trek briefing and gear check.", items: [], meal: "Dinner" },
  { n: 2, title: "Machame Gate to Machame Camp", stay: null, travel: "Drive to Machame Gate, then hike through rainforest to camp (about 5–7 hours).", items: [], meal: "Full board", nightAt: "Mountain camp (tents)" },
  { n: 3, title: "Machame Camp to Shira Camp", stay: null, travel: "Climb out of the forest into heather and moorland (about 5–6 hours).", items: [], meal: "Full board", nightAt: "Mountain camp (tents)" },
  { n: 4, title: "Shira Camp to Barranco Camp via Lava Tower", stay: null, travel: "Climb to Lava Tower (4,600 m) for acclimatisation, then descend to Barranco.", items: [], meal: "Full board", nightAt: "Mountain camp (tents)" },
  { n: 5, title: "Barranco to Karanga / Barafu Camp", stay: null, travel: "Scramble up the Barranco Wall and cross to base camp for a short rest before the summit push.", items: [], meal: "Full board", nightAt: "Mountain camp (tents)" },
  { n: 6, title: "Summit day: Uhuru Peak (5,895 m)", stay: null, travel: "Start around midnight. Reach the summit at sunrise, then descend to Mweka Camp. A very long day (about 12–15 hours). Summit success is not guaranteed.", items: [], meal: "Full board", nightAt: "Mountain camp (tents)" },
  { n: 7, title: "Mweka Camp to Mweka Gate, return to Moshi", stay: null, travel: "Descend through rainforest to the gate, receive your summit certificate, and transfer to your hotel in Moshi.", items: [], meal: "Breakfast & lunch", nightAt: "Hotel in Moshi (arrival/departure)" },
];

export function findPackage(id) {
  return PACKAGES.find((x) => x.id === id);
}

export function buildPackageView(p) {
  const office = CONFIG.headOffice;
  const nights = p.days - 1;
  const tierLabel = tierName[p.tier];
  const isSafari = p.safari;
  const luxFlights = p.flights;
  const fi = flightsIncl(p); // return international flights included
  const intlIn = intlFlightsIncluded(p);
  const dests = p.route.map((r) => r.d);
  const routeText = dests.join(" · ");

  const status = (a) =>
    a.s === "inc" || (p.extraInc || []).includes(a.n) || (p.tier === "luxury" && a.l) ? "inc" : "opt";
  const act = (a) => ({ n: a.n, s: status(a), c: a.c || "" });

  const meals = (d) => {
    if (p.custom === "kili") return "Full board";
    if (SAFARI.has(d)) return "Full board (breakfast, lunch, dinner)";
    if (BEACH.has(d)) return p.tier === "luxury" ? "Full board" : d === "Watamu" ? "Half board (breakfast & dinner)" : "Breakfast";
    return "Breakfast";
  };
  const stayFor = (d) => (STAYS[d] || {})[p.tier] || [];
  const visaText = () => {
    const ke = p.route.some((r) => KENYA.has(r.d));
    const tz = p.route.some((r) => ["Serengeti", "Ngorongoro", "Lake Manyara", "Tarangire", "Zanzibar", "Mount Kilimanjaro"].includes(r.d));
    return ke && tz ? "Kenya eTA and Tanzania e-visa" : tz ? "Tanzania e-visa" : "Kenya eTA (electronic travel authorisation)";
  };
  const isFlightLeg = (from, to) => {
    if (!p.flights) return false;
    if (p.flightsNote && from === "Rome" && to === "Santorini") return true;
    if (p.flightsNote) return false;
    return true;
  };
  const legMode = (from, to) => {
    if (isFlightLeg(from, to)) return "scheduled/charter flight";
    const coast = BEACH.has(to) && !BEACH.has(from);
    if (p.tier === "mid" && coast && !CITYSET.has(from)) return "domestic flight";
    if ((from === "Dubai" && to === "Abu Dhabi") || (from === "Abu Dhabi" && to === "Dubai")) return "road transfer";
    if (p.outbound && ASIASET.has(from) && ASIASET.has(to))
      return destByKey(from).country === destByKey(to).country && from !== "Bali" ? "domestic flight (included)" : "regional flight (included)";
    if (p.outbound && CITYSET.has(from) && (BEACH.has(to) || CITYSET.has(to))) return "regional flight (included)";
    if (CITYSET.has(from) && (SAFARI.has(to) || BEACH.has(to))) return "take your onward international flight (not included)";
    if (CITYSET.has(from)) return "rail or short flight transfer";
    return "road transfer";
  };
  const nightLabel = (dest) => {
    const s = stayFor(dest)[0];
    return s ? `${s[0]} or similar` : dest;
  };

  // ---------- itinerary ----------
  const buildItinerary = () => {
    if (p.custom === "kili") {
      return KILI.map((d) => ({ ...d, items: [], stayLabel: d.stay ? nightLabel(d.stay) : "" }));
    }
    const days = [];
    let n = 1, prev = null;
    const startCity = CITY[p.route[0].d];
    p.route.forEach((r) => {
      const acts = ACT[r.d] || [];
      const per = Math.min(3, Math.max(1, Math.ceil(acts.length / r.n)));
      for (let j = 0; j < r.n; j++) {
        const items = acts.filter((_, i) => i % r.n === j).slice(0, per);
        let title, travel = "";
        if (n === 1 && p.resident) {
          if (p.outbound) {
            title = `Pick-up from Nairobi and fly to ${r.d}`;
            travel = `We collect you from your home or ${office} and take you to Jomo Kenyatta International Airport (NBO) for your flight to ${r.d} ${fi ? "(flight included)" : "(flight not included)"}. On arrival at ${AIRPORT[r.d]}, meet your representative and transfer to your hotel.`;
          } else {
            title = `Pick-up and travel to ${r.d}`;
            travel = p.flights
              ? `We collect you from your home or ${office} and transfer you to Wilson Airport for your flight to ${r.d}. On arrival, meet your driver-guide for a first game drive.`
              : `We collect you from your home or ${office} early in the morning and travel to ${r.d} in your safari vehicle, with comfort stops on the way. Check in and enjoy your first activities.`;
          }
        } else if (n === 1) {
          if (CITYSET.has(r.d)) {
            title = `Arrive in ${r.d}`;
            travel = `Meet your representative at ${AIRPORT[r.d]} and transfer to your hotel.`;
          } else {
            title = startCity === r.d ? `Arrive in ${r.d}` : `Arrive in ${startCity} and transfer to ${r.d}`;
            travel = startCity === r.d
              ? `Meet your driver at ${AIRPORT[r.d]} and transfer to your hotel.`
              : `Meet your driver-guide at ${AIRPORT[r.d]}. Transfer to ${r.d}${p.flights && SAFARI.has(r.d) ? " by scheduled or charter flight to the nearest airstrip" : ""}.`;
          }
        } else if (j === 0) {
          title = `Travel to ${r.d}`;
          travel = `After breakfast, ${legMode(prev, r.d)} from ${prev} to ${r.d}.`;
        } else title = r.d;
        days.push({
          n, title, travel, items: items.map(act), meal: meals(r.d), stayLabel: nightLabel(r.d),
          fallback: "Free day to relax, or add any of the optional activities below.",
        });
        n++; prev = r.d;
      }
    });
    const last = p.route[p.route.length - 1].d;
    if (p.resident) {
      days.push(
        p.outbound
          ? { n, title: "Fly home to Nairobi", meal: "Breakfast", items: [], stayLabel: "", travel: `Breakfast, check-out and transfer to ${AIRPORT[last]} for your flight back to Nairobi ${fi ? "(flight included)" : "(flight not included)"}. On arrival we can drop you at your home or ${office}.` }
          : { n, title: "Return to Nairobi and drop-off", meal: "Breakfast", items: [], stayLabel: "", travel: p.flights ? `After breakfast, fly back to Wilson Airport. We drop you at your home or ${office}.` : `After breakfast, check out and drive back to Nairobi with comfort stops. We drop you at your home or ${office}.` },
      );
      return days;
    }
    days.push({
      n, title: "Departure", meal: "Breakfast", items: [], stayLabel: "",
      travel: `Breakfast, check-out and transfer to ${AIRPORT[last]}${p.flights && SAFARI.has(last) ? " (by flight from the nearest airstrip)" : ""} for your onward flight.`,
    });
    return days;
  };
  const itinerary = buildItinerary();

  // ---------- overview ----------
  const highlights = [];
  p.route.forEach((r) => (ACT[r.d] || []).filter((a) => status(a) === "inc").slice(0, 2).forEach((a) => highlights.push(a.n)));
  if (luxFlights) highlights.push(`${p.flightsNote ? p.flightsNote : "Internal flights between destinations"}: more time on safari, less on the road`);
  const intro = p.custom === "kili"
    ? "Climb Africa's highest mountain on the scenic Machame Route with experienced guides, porters and full meals on the mountain. Seven days from Moshi to Uhuru Peak and back."
    : `A ${p.days}-day ${tierLabel.toLowerCase()} journey ${p.multi ? "combining " + dests.slice(0, -1).join(", ") + " and " + dests[dests.length - 1] : "to " + dests[0]}. ` +
      (isSafari
        ? p.tier === "budget" ? "Good wildlife, camps and lodges at a value price." : p.tier === "mid" ? "Comfortable lodges, private vehicle and full board." : "Exclusive camps and lodges, with flights between destinations so you spend more time in the wild."
        : p.route.some((r) => BEACH.has(r.d)) ? "Sun, sea and relaxed days with optional excursions." : "City sights, local food and easy transfers.");
  const resText = p.resident
    ? `${p.outbound ? "We collect you from your home or our head office in Nairobi and take you to the airport, and can drop you back on your return." : "Your trip starts with pick-up from your home or our head office, and ends with drop-off. There is no need to go to the airport."} Resident park rates apply on safaris.`
    : "";
  const summary = pkgIncSummary(p);

  // ---------- destinations & activities ----------
  const destSec = dests.map((d) => {
    const info = DINFO[d] || {}, dd = destByKey(d) || {}, acts = ACT[d] || [];
    const nts = p.route.find((r) => r.d === d).n;
    return {
      d, nts, img: dd.img || "", country: dd.country || "", about: info.about || dd.blurb || "",
      included: [
        `${nts} night${nts > 1 ? "s" : ""}: ${((stayFor(d)[0] || [])[0]) || tierLabel + " accommodation"} or similar`,
        `Meals: ${meals(d)}`,
        ...(SAFARI.has(d) ? ["Park / reserve entry fees"] : []),
        ...acts.filter((a) => status(a) === "inc").map((a) => a.n),
      ],
      notIncluded: [
        ...acts.filter((a) => status(a) === "opt").map((a) => ({ n: a.n, c: a.c || "" })),
        ...(acts.some((a) => status(a) === "opt") ? [] : [{ n: "No extra activities listed", c: "" }]),
        ...(SAFARI.has(d) && p.tier !== "luxury" ? [{ n: "Drinks, unless stated", c: "" }] : []),
        { n: "Tips and personal items", c: "" },
      ],
      acts: acts.map(act),
    };
  });

  // ---------- accommodation ----------
  const accomIntro = `${p.tier === "luxury" ? "Luxury camps and lodges" : p.tier === "mid" ? "Mid-range lodges and hotels" : "Budget-friendly camps, lodges and hotels"} such as those below, or similar based on availability.`;
  const accom = p.custom === "kili"
    ? { kili: true, moshi: stayFor("Mount Kilimanjaro").map((x) => x[0]).join(" · ") || "Hotel in Moshi" }
    : { kili: false, rows: p.route.map((r) => ({ d: r.d, n: r.n, meals: meals(r.d), hotels: stayFor(r.d) })) };

  // ---------- journey ----------
  const start = p.resident ? `Pick-up from your home or ${office}` : AIRPORT[p.route[0].d];
  const end = p.resident ? `Drop-off at your home or ${office}` : AIRPORT[p.route[p.route.length - 1].d];
  const legs = [];
  if (luxFlights) {
    if (!p.flightsNote) {
      legs.push(`${CITY[p.route[0].d]} → ${p.route[0].d}`);
      for (let i = 1; i < p.route.length; i++) legs.push(`${p.route[i - 1].d} → ${p.route[i].d}`);
      legs.push(`${p.route[p.route.length - 1].d} → ${CITY[p.route[p.route.length - 1].d]}`);
    } else legs.push("Rome → Santorini");
  }
  const transport = p.outbound ? "Pick-up and drop-off in Nairobi; airport and hotel transfers, tours and regional flights or rail between cities as listed at your destination."
    : p.custom === "kili" ? "Private transfers to and from the mountain gates; trek on foot with porters."
    : isSafari ? (p.tier === "budget" ? "Shared safari van or 4x4 with a pop-up roof (max. 7 guests). Every guest has a window seat."
      : "Private 4x4 Land Cruiser with pop-up roof, binoculars and a driver-guide" + (luxFlights ? ", plus flights between destinations." : "."))
    : p.tier === "luxury" ? "Private chauffeur transfers and private tours."
    : p.type === "Europe" ? "Airport transfers, city tours and high-speed trains or flights between cities."
    : "Airport transfers and shared/private tours.";
  const intlIdx = p.route.findIndex((r, i) => i > 0 && CITYSET.has(p.route[i - 1].d) && !CITYSET.has(r.d));
  const intl = intlIdx > 0 ? [p.route[intlIdx - 1].d, p.route[intlIdx].d] : null;
  const flightsLine = fi ? "Return international flights from Nairobi are included." : "Return flights from Nairobi are not included.";
  const journeyRows = [
    ["Start point", start], ["End point", end],
    ["Duration", `${p.days} days / ${nights} nights`],
    ["Transport", transport],
    ["Internal flights", p.outbound
      ? (p.multi ? "Flights or rail between the cities in this package are included. " + flightsLine : "Single-destination trip. " + flightsLine)
      : (p.resident && !luxFlights) ? "Not included. All travel is by road in your safari vehicle from pick-up to drop-off."
      : (p.type === "Europe" && p.multi && !luxFlights) ? "Rail or short-flight transfers between cities are included."
      : luxFlights ? `Included. ${legs.join("; ")}${p.flightsNote ? "" : " (scheduled or charter, depending on the route)"}`
      : p.tier === "mid" && p.route.some((r, i) => i > 0 && BEACH.has(r.d) && !BEACH.has(p.route[i - 1].d) && !CITYSET.has(p.route[i - 1].d))
        ? "The domestic flight to the coast is included. All other transfers are by road."
        : (!p.multi ? "Not applicable: single-destination trip." : "Not included. Travel between destinations is by road.") + (intl ? " The flight from " + intl[0] + " to " + intl[1] + " is international and not included." : "")],
    ["Who it is for", p.resident ? "Residents (pick-up from your home or our head office)" : "Visitors and tourists (start at the airport)"],
    ["Group size", p.tier === "luxury" ? "Private, your own party only" : p.tier === "mid" ? "Private (2–7 guests)" : "Small group (max. 7 per vehicle) or private on request"],
    ["Meals", [...new Set(p.route.map((r) => meals(r.d)))].join("; ")],
    ["Fitness", p.custom === "kili" ? "Good fitness needed; trekking 5–15 hours on some days." : "Suitable for most ages; some long drives."],
  ];
  const journeyNote = fi
    ? (p.tier === "luxury" ? "Return international flights are included in this luxury package, with pick-up from home arranged." : "Return international flights are included in this package.")
    : p.outbound ? "Return international flights from Nairobi are not included. We can book them for you."
    : p.resident ? "Your trip starts and ends with pick-up and drop-off, so you don't need to go to the airport."
    : "International flights to and from the start and end points are not included. We can help with flight quotes.";

  // ---------- inclusions (driven by travel level) ----------
  const inc = [], ctxExc = [];
  const dom = isDomesticRes(p);
  const optionalList = [];
  p.route.forEach((r) => (ACT[r.d] || []).forEach((a) => { if (status(a) === "opt") optionalList.push(`${a.n} (${r.d}${a.c ? ", " + a.c : ""})`); }));
  if (p.custom === "kili") {
    inc.push("Airport transfers", "2 nights hotel in Moshi (B&B) and 5 nights mountain camping", "All meals on the mountain", "Licensed guides, assistant guides, cooks and porters", "Kilimanjaro National Park entry, camping and rescue fees", "Tents, mats and mess tent", "Summit certificate");
    ctxExc.push("Sleeping bag, poles and personal gear (hire available)", "Summit success is not guaranteed");
  } else if (p.outbound) {
    inc.push("Pick-up and drop-off in Nairobi (home or head office) with transfer to and from the airport", `${nights} nights hotel accommodation (${meals(p.route[0].d).toLowerCase()})`, "Airport and hotel transfers at your destination", "City sightseeing as listed");
    if (p.multi) inc.push("Flights or rail between cities within the package");
    if (p.type === "Europe") ctxExc.push("Local city tax paid at hotels");
    if (p.type === "Dubai") ctxExc.push("Tourism Dirham fee paid at hotels");
    if (p.tier !== "luxury") ctxExc.push("Lunches and dinners");
  } else if (isSafari) {
    inc.push(`${nights} nights accommodation (${p.tier === "budget" ? "budget camps and lodges" : p.tier === "mid" ? "mid-range lodges and tented camps" : "luxury camps and lodges"})`,
      meals(p.route.find((r) => SAFARI.has(r.d)).d) + " during the safari", p.resident ? "" : "Airport transfers",
      p.tier === "budget" ? "Shared safari vehicle with window seats" : "Private safari vehicle with driver-guide",
      "National park and reserve entry fees", "Game drives as listed in the itinerary");
    if (luxFlights) inc.push("Internal flights between destinations and airstrip transfers");
    if (BEACH.has(p.route[p.route.length - 1].d)) inc.push("Beach hotel with " + meals(p.route[p.route.length - 1].d).toLowerCase());
    if (p.resident) inc.push("Pick-up and drop-off from your home or head office (no airport transfer needed)", "Park and reserve fees at resident rates (bring your valid resident ID or work permit)");
  } else if (p.route.every((r) => BEACH.has(r.d))) {
    inc.push(`${nights} nights beach accommodation (${meals(p.route[0].d).toLowerCase()})`, p.resident ? "Pick-up and drop-off from your home or head office" : "Airport transfers", "Beach and hotel facilities");
  } else {
    inc.push(`${nights} nights hotel accommodation with breakfast`, "Airport transfers", "City sightseeing as listed");
    if (p.type === "Europe") inc.push("Rail or flight transfers between cities where listed");
    ctxExc.push(p.type === "Europe" ? "Local city tax paid at hotels" : "Tourism Dirham fee paid at hotels");
  }
  if (!p.resident && (isSafari || p.route.every((r) => BEACH.has(r.d))) && p.tier !== "luxury") ctxExc.push(visaText());
  (p.extraInc || []).forEach((x) => inc.push(x));
  tierInc(p).forEach((x) => inc.push(x));
  const exc = [...new Set([...ctxExc, ...tierExc(p)])];
  const cleanInc = [...new Set(inc.filter(Boolean))].filter((x) => !(p.resident && x === "Airport transfers"));

  const Y = { y: true }, N = { n: true };
  const cmpRows = [
    ["Return international airfare", dom ? ["Not needed (road trip)", "Not needed (road trip)", p.flights ? "Internal flights included" : "Not needed (road trip)"] : intlIn ? [Y, Y, Y] : [N, N, Y]],
    ["Travel & medical insurance", [N, N, Y]],
    ["Visa assistance", dom ? ["Not needed", "Not needed", "Not needed"] : ["Your own arrangement", "Guidance from us", "Handled for you"]],
    ["Tips & gratuities", [N, N, Y]],
    ["Drinks", ["Pay as you go", "Daily bottled water", "Premium drinks with meals"]],
    ["Pick-up", p.resident ? ["Home or head office", "Home or head office", "Private chauffeur from home"] : ["Airport meet & transfer", "Private airport transfers", "Door-to-door chauffeur + VIP meet-and-greet"]],
    ["Support", ["WhatsApp + trip briefing", "Planning call + WhatsApp", "24/7 personal concierge"]],
  ];

  return {
    tierLabel, routeText, nights, luxFlights, intro, resText, highlights, summary, destSec, itinerary, accomIntro, accom,
    journeyRows, journeyNote, inclusions: { tierStyle: TIER_STYLE[p.tier], inc: cleanInc, exc, cmpRows, optionalList },
    styleLabel: STYLE_INFO[p.style].label, styleIcon: STYLE_INFO[p.style].icon,
  };
}
