import { ic, ico } from '../lib/icons.js';

// ===== data.js =====
// Photos: Unsplash hotlinks (free licence). If one fails, a gradient shows instead.
// Replace with your own photos in /images for best results.
const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;
const IMG = {
  mara: U("1516426122078-c23e76319801"),
  lion: U("1489392191049-fc10c97e64b6"),
  zebra: U("1523805009345-7448845a9e53"),
  elephant: U("1547471080-7cc2caa01a7e"),
  dubai: U("1512453979798-5ea266f8880c"),
  beach: U("1507525428034-b723cf961d3e"),
  snorkel: U("1544551763-46a013bb70d5"),
  paris: U("1502602898657-3e91760cbb34"),
  santorini: U("1570077188670-e3a8d69ac5ff"),
  rome: U("1552832230-c0197dd311b5"),
  alps: U("1530122037265-a5f1f91d3b99"),
  barcelona: U("1583422409516-2895a77efded"),
  london: U("1513635269975-59663e0ac1ad")
};

// Indicative "from" prices in USD per person sharing. Confirm before publishing.
const DESTINATIONS = [
  { id: "mara", name: "Maasai Mara", country: "Kenya", region: "safari", img: IMG.mara,
    blurb: "Home of the Great Migration (July–October), big cats and Maasai culture. Kenya's most famous reserve." },
  { id: "amboseli", name: "Amboseli", country: "Kenya", region: "safari", img: IMG.elephant,
    blurb: "Large elephant herds against the backdrop of Mount Kilimanjaro." },
  { id: "tsavo", name: "Tsavo East & West", country: "Kenya", region: "safari", img: IMG.lion,
    blurb: "Kenya's largest park. Red elephants, Mzima Springs and the Yatta Plateau. Great value." },
  { id: "samburu", name: "Samburu", country: "Kenya", region: "safari", img: IMG.zebra,
    blurb: "Arid north. Home of the 'Special Five': Grevy's zebra, reticulated giraffe, Somali ostrich, gerenuk and Beisa oryx." },
  { id: "diani", name: "Diani Beach", country: "Kenya", region: "beach", img: IMG.beach,
    blurb: "Powder-white sand, palm-fringed coast and coral reef south of Mombasa." },
  { id: "watamu", name: "Watamu", country: "Kenya", region: "beach", img: IMG.snorkel,
    blurb: "Marine park, turtle conservation, snorkelling and Gede ruins on the north coast." },
  { id: "serengeti", name: "Serengeti", country: "Tanzania", region: "safari", img: IMG.lion,
    blurb: "Endless plains, year-round wildlife and the wildebeest river crossings." },
  { id: "ngorongoro", name: "Ngorongoro Crater", country: "Tanzania", region: "safari", img: IMG.zebra,
    blurb: "A UNESCO World Heritage caldera with one of the densest wildlife populations on earth." },
  { id: "manyara", name: "Lake Manyara", country: "Tanzania", region: "safari", img: IMG.elephant,
    blurb: "Tree-climbing lions, flamingos and a groundwater forest beneath the Rift Valley escarpment." },
  { id: "zanzibar", name: "Zanzibar", country: "Tanzania", region: "beach", img: IMG.snorkel,
    blurb: "Stone Town heritage, spice farms and turquoise beaches at Nungwi, Kendwa and Paje." },
  { id: "nakuru", name: "Lake Nakuru", country: "Kenya", region: "safari", img: IMG.zebra,
    blurb: "Flamingos, black and white rhinos and Rothschild giraffes, a short drive from Nairobi." },
  { id: "tarangire", name: "Tarangire", country: "Tanzania", region: "safari", img: IMG.elephant,
    blurb: "Giant baobabs and huge elephant herds, best in the dry season." },
  { id: "kili", name: "Mount Kilimanjaro", country: "Tanzania", region: "safari", img: IMG.elephant,
    blurb: "Africa's highest peak. Trek routes for beginners and experienced hikers." },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", region: "city", img: IMG.dubai,
    blurb: "Burj Khalifa, desert safaris, shopping, Palm Jumeirah and world-class dining." },
  { id: "abudhabi", name: "Abu Dhabi", country: "United Arab Emirates", region: "city", img: IMG.dubai,
    blurb: "Sheikh Zayed Grand Mosque, Louvre Abu Dhabi and Yas Island." },
  { id: "paris", name: "Paris", country: "France", region: "europe", img: IMG.paris,
    blurb: "Eiffel Tower, Louvre and Seine cruises." },
  { id: "santorini", name: "Santorini", country: "Greece", region: "europe", img: IMG.santorini,
    blurb: "Whitewashed cliffs, caldera sunsets and volcanic beaches." },
  { id: "rome", name: "Rome", country: "Italy", region: "europe", img: IMG.rome,
    blurb: "Colosseum, Vatican and the best pasta of your life." },
  { id: "barcelona", name: "Barcelona", country: "Spain", region: "europe", img: IMG.barcelona,
    blurb: "Gaudí architecture, tapas and city beaches." },
  { id: "london", name: "London", country: "United Kingdom", region: "europe", img: IMG.london,
    blurb: "Royal palaces, museums, theatre and markets." },
  { id: "alps", name: "Swiss Alps", country: "Switzerland", region: "europe", img: IMG.alps,
    blurb: "Scenic trains, Lucerne, Interlaken and Jungfraujoch." }
];

// Accommodation by destination and tier. Rates are indicative USD per person per night (safari lodges usually full board).
const STAYS = {
  "Maasai Mara": {
    budget: [["Mara camping (shared tents)", "$40–$90", "Basic camps near park gate"], ["Mara Simba Lodge", "$90–$160", "Budget-friendly, full board"]],
    mid: [["Mara Sopa Lodge", "$100–$300", "Sopa Lodges range $170–$580 per room"], ["Ashnil Mara Camp", "$250–$300", "Tented camp on the Mara River"]],
    luxury: [["JW Marriott Masai Mara Lodge", "$800–$2,000+", "Peak migration season rates higher"], ["Conservancy tented camps", "$600–$1,500", "Private conservancy game drives"]]
  },
  "Amboseli": {
    budget: [["Amboseli Sopa / Kibo-type budget camps", "$100–$180", "Outside park gate, Kili views"]],
    mid: [["Ol Tukai Lodge", "$220–$360", "In-park with Kilimanjaro views"], ["Amboseli Serena", "$300–$450", "Mid-range, in park"]],
    luxury: [["Tortilis Camp", "$400–$600", "Luxury tented camp"]]
  },
  "Tsavo": {
    budget: [["Voi Wildlife Lodge / Ngutuni-type lodges", "$90–$160", "Popular budget safari base"], ["Tsavo camping", "$25–$60", "Public campsites"]],
    mid: [["Kilaguni Serena Safari Lodge", "$200–$350", "Tsavo West, waterhole views"]],
    luxury: [["Private ranch & conservancy camps", "$450–$900", "Exclusive game drives"]]
  },
  "Samburu": {
    budget: [["Samburu budget camps", "$100–$200", "Basic riverside camps"]],
    mid: [["Samburu Sopa Lodge", "$250–$450", "Mid-range river camp"], ["Ashnil Samburu", "$250–$450", "Riverside tented camp"]],
    luxury: [["Luxury tented camps (e.g. Elephant Bedroom)", "$500–$900", "Ultra-luxury conservancy lodges $900–$1,500+"]]
  },
  "Diani": {
    budget: [["Diani hostels & guesthouses", "$10–$45", "Cheapest option, walk to beach"], ["2★ beach hotels", "$44 avg", "Average nightly rate"]],
    mid: [["3★ beach hotels", "$106 avg", "Pool and beach access"]],
    luxury: [["5★ beach resorts", "$360 avg", "Private beach, spa, fine dining"]]
  },
  "Watamu": {
    budget: [["Local guesthouses & eco-lodges", "$30–$70", "Close to Watamu Marine Park"]],
    mid: [["Beach resorts (half-board)", "$100–$220", "Turtle Bay-style resorts"]],
    luxury: [["Boutique beach villas", "$300–$700", "Private beach access"]]
  },
  "Serengeti": {
    budget: [["Serengeti public campsites", "$20–$50", "Bring sleeping bag; park fees separate"], ["Serengeti Wilderness Camp", "$100–$150", "Simple tents, shared facilities"]],
    mid: [["Serengeti Sopa Lodge", "$300–$550", "Full board lodge"], ["Serengeti Serena", "$350–$600", "Central Serengeti"]],
    luxury: [["Luxury camps & Four Seasons-type lodges", "$650–$1,500+", "Full-board luxury"]]
  },
  "Ngorongoro": {
    budget: [["Rhino Lodge / crater rim camps", "$100–$160", "Budget-friendly base near crater"]],
    mid: [["Ngorongoro Sopa", "$250–$450", "Crater rim views"], ["Ngorongoro Serena", "$300–$550", "Built into crater wall"]],
    luxury: [["Crater rim luxury lodges", "$700–$1,500+", "Panoramic crater views"]]
  },
  "Lake Manyara": {
    budget: [["Migunga Tented Camp", "$80–$140", "Near Mto wa Mbu"]],
    mid: [["Lake Manyara Serena", "$250–$450", "On the escarpment"], ["Kirurumu Manyara Lodge", "$180–$350", "Tented lodge with views"]],
    luxury: [["Escarpment luxury lodges", "$450–$900", "Infinity pools"]]
  },
  "Zanzibar": {
    budget: [["Nungwi guesthouses & bungalows", "$30–$70", "Budget beach base"], ["Stone Town guesthouses", "$30–$60", "Heritage area"]],
    mid: [["Nungwi / Kendwa beach hotels", "$90–$200", "Mid-range resorts"]],
    luxury: [["Villa resorts (Paje, Michamvi)", "$300–$900+", "Private beach"]]
  },
  "Dubai": {
    budget: [["Deira / Bur Dubai budget hotels", "$28–$60", "Metro access"]],
    mid: [["3–4★ Downtown/Marina hotels", "$80–$180", "Near attractions"]],
    luxury: [["5★ Palm Jumeirah / Burj area", "$250–$1,000+", "Beachfront and skyline"]]
  },
  "Paris": {
    budget: [["Hostels & 2★ hotels", "€45–€90", "Central arrondissements"]],
    mid: [["3★ boutique hotels", "€120–€220", "Latin Quarter, Marais"]],
    luxury: [["Luxury palace hotels", "€500+", "Champs-Élysées / Seine"]]
  },
  "Santorini": {
    budget: [["Kamari / Perissa guesthouses", "€50–€100", "Beach villages"]],
    mid: [["Fira / Imerovigli hotels", "€130–€250", "Caldera views"]],
    luxury: [["Oia cave suites", "€400–€1,000", "Private plunge pools"]]
  },
  "Rome": {
    budget: [["Hostels & B&Bs", "€40–€90", "Near Termini"]],
    mid: [["3★ hotels", "€110–€200", "Historic centre"]],
    luxury: [["5★ hotels", "€400+", "Spanish Steps area"]]
  },
  "Swiss Alps": {
    budget: [["Hostels & guesthouses", "CHF 70–120", "Interlaken"]],
    mid: [["3–4★ mountain hotels", "CHF 180–320", "Grindelwald, Lucerne"]],
    luxury: [["Alpine grand hotels", "CHF 500+", "Lake & mountain views"]]
  },
  "Lake Nakuru": {
    budget: [["Camping & budget lodges", "$30–$90", "Estimate"]],
    mid: [["Mid-range lodges", "$150–$300", "Estimate"]],
    luxury: [["Private lodges nearby", "$350–$700", "Estimate"]]
  },
  "Tarangire": {
    budget: [["Tarangire campsites", "$30–$80", "Estimate"]],
    mid: [["Tarangire Sopa Lodge", "$250–$450", "Estimate"]],
    luxury: [["Tented luxury camps", "$500–$1,000", "Estimate"]]
  },
  "Mount Kilimanjaro": {
    budget: [["Moshi guesthouses (pre/post trek)", "$30–$70", "Estimate"]],
    mid: [["Moshi / Arusha 3–4★ hotels", "$90–$180", "Estimate"]],
    luxury: [["Kilimanjaro-view luxury lodges", "$250–$500", "Estimate"]]
  },
  "Abu Dhabi": {
    budget: [["3★ hotels", "$50–$90", "Estimate"]],
    mid: [["4★ hotels", "$100–$200", "Estimate"]],
    luxury: [["5★ resorts (Yas, Saadiyat)", "$250–$800", "Estimate"]]
  },
  "Barcelona": {
    budget: [["Hostels & 2★ hotels", "€40–€90", "Estimate"]],
    mid: [["3–4★ hotels", "€120–€220", "Estimate"]],
    luxury: [["5★ hotels", "€350+", "Estimate"]]
  },
  "London": {
    budget: [["Hostels & budget chains", "£50–£110", "Estimate"]],
    mid: [["3–4★ hotels", "£130–£250", "Estimate"]],
    luxury: [["5★ hotels", "£400+", "Estimate"]]
  }
};


// ===== dest-info.js =====
// Destination facts and activities. Activity format: [name, status, extra-cost note, includedInLuxury]
// status: "inc" = included in every package that visits; "opt" = optional (extra cost) unless a luxury
// package (4th value = 1) or the package's own `extraInc` list includes it.
const A = (n, s, c, l) => ({ n, s, c: c || "", l: !!l });

const ACT = {
  "Maasai Mara": [
    A("Morning and afternoon game drives (Big Five country)", "inc"),
    A("Mara River crossing viewing (Great Migration, roughly July–October)", "inc"),
    A("Full-day game drive with picnic lunch", "inc"),
    A("Maasai village cultural visit", "opt", "extra cost, paid locally", 1),
    A("Hot air balloon safari at sunrise with champagne breakfast", "opt", "extra cost, about $450–$500 per person", 1),
    A("Guided bush walk with a Maasai ranger (conservancies)", "opt", "extra cost", 1)
  ],
  "Amboseli": [
    A("Game drives among large elephant herds", "inc"),
    A("Sunrise views of Mount Kilimanjaro", "inc"),
    A("Visit to Observation Hill for swamp and plains views", "inc"),
    A("Bird watching (over 400 species recorded)", "inc"),
    A("Maasai village cultural visit", "opt", "extra cost, paid locally", 1)
  ],
  "Tsavo": [
    A("Game drives to see the famous 'red' elephants", "inc"),
    A("Mzima Springs hippo and crocodile viewing (Tsavo West)", "inc"),
    A("Shetani lava flows and Chaimu Crater (Tsavo West)", "inc"),
    A("Lugard Falls and the Galana River (Tsavo East)", "inc"),
    A("Ngulia Rhino Sanctuary visit", "opt", "extra cost"),
    A("Night game drive (where the lodge offers it)", "opt", "extra cost", 1)
  ],
  "Samburu": [
    A("Game drives to find the 'Special Five'", "inc"),
    A("Elephant and leopard watching along the Ewaso Ng'iro River", "inc"),
    A("Bird watching", "inc"),
    A("Samburu village cultural visit", "opt", "extra cost, paid locally", 1),
    A("Guided nature walk", "opt", "extra cost", 1),
    A("Riverside sundowners", "opt", "extra cost", 1)
  ],
  "Lake Nakuru": [
    A("Game drive around the lake and forest", "inc"),
    A("Flamingos and pelicans on the lake shore", "inc"),
    A("Rhino tracking (black and white rhino sanctuary)", "inc"),
    A("Baboon Cliff viewpoint", "inc"),
    A("Lake Naivasha boat ride to see hippos", "opt", "extra cost, about $25–$30 per person", 1),
    A("Hell's Gate National Park cycling", "opt", "extra cost", 1),
    A("Crescent Island walking safari", "opt", "extra cost")
  ],
  "Diani": [
    A("Beach relaxation on white sand", "inc"),
    A("Colobus Monkey Trust visit", "opt", "extra cost"),
    A("Dhow trip to Wasini Island and Kisite-Mpunguti marine park (snorkelling, dolphins)", "opt", "extra cost", 1),
    A("Shimba Hills National Park day trip (sable antelope)", "opt", "extra cost"),
    A("Kitesurfing, windsurfing or stand-up paddle", "opt", "extra cost"),
    A("Sunset dhow cruise", "opt", "extra cost", 1),
    A("Skydiving over the beach", "opt", "extra cost")
  ],
  "Watamu": [
    A("Beach relaxation on Watamu's bays", "inc"),
    A("Glass-bottom boat and snorkelling in Watamu Marine National Park", "opt", "extra cost", 1),
    A("Gede Ruins (12th-century Swahili town)", "opt", "extra cost", 1),
    A("Arabuko-Sokoke Forest walk", "opt", "extra cost"),
    A("Sea turtle conservation visit (Local Ocean Conservation)", "opt", "extra cost"),
    A("Mida Creek sunset boat ride", "opt", "extra cost"),
    A("Deep-sea fishing", "opt", "extra cost")
  ],
  "Serengeti": [
    A("Morning and afternoon game drives", "inc"),
    A("Big cats around Seronera (lion, leopard, cheetah)", "inc"),
    A("Great Migration viewing (location changes with the season)", "inc"),
    A("Retina Hippo Pool visit", "inc"),
    A("Hot air balloon safari over the plains", "opt", "extra cost, about $550–$600 per person", 1),
    A("Guided walking safari (where permitted)", "opt", "extra cost", 1),
    A("Bush breakfast or sundowners", "opt", "extra cost", 1)
  ],
  "Ngorongoro": [
    A("Crater floor game drive (Big Five except giraffe)", "inc"),
    A("Picnic lunch at the hippo pool", "inc"),
    A("Crater rim viewpoints", "inc"),
    A("Olduvai Gorge and museum visit (cradle of humankind)", "opt", "extra cost", 1),
    A("Maasai boma (village) visit", "opt", "extra cost, paid locally", 1),
    A("Guided nature walk on the crater rim", "opt", "extra cost")
  ],
  "Lake Manyara": [
    A("Game drive: tree-climbing lions, elephants, baboons", "inc"),
    A("Flamingos and birdlife on the lake (seasonal)", "inc"),
    A("Groundwater forest drive", "inc"),
    A("Mto wa Mbu village cultural tour", "opt", "extra cost", 1),
    A("Canoe safari on the lake (seasonal)", "opt", "extra cost"),
    A("Tree-top canopy walkway", "opt", "extra cost")
  ],
  "Tarangire": [
    A("Game drives among baobabs and elephant herds", "inc"),
    A("Tarangire River wildlife viewing (best in dry season)", "inc"),
    A("Bird watching (over 500 species)", "inc"),
    A("Guided walking safari", "opt", "extra cost", 1),
    A("Night game drive (outside the park, where available)", "opt", "extra cost", 1)
  ],
  "Mount Kilimanjaro": [
    A("Machame Route trek with guides and porters", "inc"),
    A("Summit attempt to Uhuru Peak (5,895 m)", "inc"),
    A("Materuni Waterfalls and coffee tour", "opt", "extra cost"),
    A("Marangu village and waterfalls day trip", "opt", "extra cost")
  ],
  "Zanzibar": [
    A("Beach relaxation (Nungwi, Kendwa or Paje)", "inc"),
    A("Stone Town walking tour (UNESCO World Heritage)", "inc"),
    A("Spice farm tour", "opt", "extra cost", 1),
    A("Prison Island giant tortoise visit", "opt", "extra cost"),
    A("Mnemba Atoll snorkelling", "opt", "extra cost", 1),
    A("Dolphin trip at Kizimkazi", "opt", "extra cost"),
    A("Jozani Forest (red colobus monkeys)", "opt", "extra cost"),
    A("Sunset dhow cruise", "opt", "extra cost", 1),
    A("Kitesurfing at Paje", "opt", "extra cost")
  ],
  "Dubai": [
    A("Dubai Mall and Dubai Fountain show", "inc"),
    A("Old Dubai: souks, abra ride across the Creek", "inc"),
    A("Evening desert safari with BBQ dinner and camel ride", "opt", "extra cost", 1),
    A("Burj Khalifa 'At The Top' observation deck", "opt", "extra cost", 1),
    A("Palm Jumeirah and Atlantis Aquaventure", "opt", "extra cost"),
    A("Dubai Marina yacht cruise", "opt", "extra cost", 1),
    A("Miracle Garden or Global Village (seasonal)", "opt", "extra cost")
  ],
  "Abu Dhabi": [
    A("Sheikh Zayed Grand Mosque", "inc"),
    A("Corniche waterfront", "inc"),
    A("Louvre Abu Dhabi", "opt", "extra cost", 1),
    A("Ferrari World or Yas Waterworld", "opt", "extra cost")
  ],
  "Paris": [
    A("Montmartre and Sacré-Cœur walk", "inc"),
    A("Seine river cruise", "opt", "extra cost", 1),
    A("Eiffel Tower summit", "opt", "extra cost", 1),
    A("Louvre Museum", "opt", "extra cost", 1),
    A("Versailles day trip", "opt", "extra cost"),
    A("Disneyland Paris", "opt", "extra cost")
  ],
  "Santorini": [
    A("Oia sunset viewpoint", "inc"),
    A("Fira to Oia caldera hike", "inc"),
    A("Red Beach and Perissa black-sand beach", "inc"),
    A("Caldera catamaran cruise with hot springs", "opt", "extra cost", 1),
    A("Volcanic-island wine tasting", "opt", "extra cost", 1),
    A("Akrotiri archaeological site", "opt", "extra cost")
  ],
  "Rome": [
    A("Trevi Fountain, Pantheon and Spanish Steps walk", "inc"),
    A("Colosseum and Roman Forum", "opt", "extra cost", 1),
    A("Vatican Museums and Sistine Chapel", "opt", "extra cost", 1),
    A("Pompeii day trip", "opt", "extra cost"),
    A("Pasta and pizza cooking class", "opt", "extra cost")
  ],
  "Swiss Alps": [
    A("Scenic train ride through the Alps", "inc"),
    A("Lucerne old town and Chapel Bridge", "inc"),
    A("Jungfraujoch, 'Top of Europe'", "opt", "extra cost", 1),
    A("Lake Lucerne or Lake Brienz cruise", "opt", "extra cost", 1),
    A("Grindelwald First Cliff Walk", "opt", "extra cost"),
    A("Interlaken paragliding", "opt", "extra cost")
  ],
  "Barcelona": [
    A("Las Ramblas and Gothic Quarter walk", "inc"),
    A("Barceloneta beach", "inc"),
    A("Sagrada Família", "opt", "extra cost", 1),
    A("Park Güell", "opt", "extra cost", 1),
    A("Montserrat mountain day trip", "opt", "extra cost"),
    A("Tapas and wine tasting tour", "opt", "extra cost")
  ],
  "London": [
    A("Changing of the Guard at Buckingham Palace (outside view)", "inc"),
    A("British Museum (free entry)", "inc"),
    A("Thames river cruise", "opt", "extra cost", 1),
    A("Tower of London", "opt", "extra cost", 1),
    A("London Eye", "opt", "extra cost"),
    A("West End show", "opt", "extra cost", 1),
    A("Warner Bros. Studio Tour (Harry Potter)", "opt", "extra cost")
  ]
};

const DINFO = {
  "Maasai Mara": { about: "Kenya's most famous reserve, in the south-west of the country and joined to the Serengeti across the Tanzanian border. Rolling grassland is home to lion, leopard, cheetah, elephant and buffalo, and the Great Migration crosses the Mara River between roughly July and October. The Maasai people live on the reserve's edges and in nearby conservancies.", best: "July–October for the migration; January–March and November–December are quieter." },
  "Amboseli": { about: "A flat, dusty park at the foot of Mount Kilimanjaro, known for large elephant herds and classic photographs of the snow-capped peak. Swamps fed by mountain water attract hippo, buffalo and thousands of birds.", best: "June–October and January–February (clearest mountain views)." },
  "Tsavo": { about: "Tsavo East and West together form Kenya's largest protected area. The elephants here dust themselves red-brown from the soil. Highlights include Mzima Springs, lava flows and the Galana River. It is also one of the best-value safari destinations in Kenya.", best: "June–October and January–February." },
  "Samburu": { about: "A dry, rugged reserve north of the equator on the Ewaso Ng'iro River. It has species rarely seen in southern parks: Grevy's zebra, reticulated giraffe, Somali ostrich, gerenuk and Beisa oryx, known as the 'Special Five'.", best: "June–October and December–March." },
  "Lake Nakuru": { about: "A small, easy park centred on an alkaline lake famous for flamingos. It is a rhino sanctuary and a good short trip from Nairobi. Nearby Lake Naivasha and Hell's Gate add boat rides and cycling.", best: "Year-round; dry months June–October and January–February." },
  "Diani": { about: "A long stretch of soft white sand with palm trees and a coral reef, south of Mombasa. It combines relaxed beach days with reef snorkelling, colobus monkeys and day trips to Wasini Island and Shimba Hills.", best: "December–March and July–October (April–May are the long rains)." },
  "Watamu": { about: "A quieter north-coast village with sheltered bays, a marine national park, turtle conservation and the ruins of Gede. It is popular with snorkellers and eco-minded travellers.", best: "October–March." },
  "Serengeti": { about: "Tanzania's oldest national park: endless plains, huge predator populations and the Great Migration. The herds move through the park in a yearly cycle, calving in the south around January–March and crossing rivers in the north around July–October.", best: "Year-round; July–October for river crossings, January–March for calving." },
  "Ngorongoro": { about: "A UNESCO World Heritage site. The crater is an ancient collapsed volcano about 260 km² in area, with a floor about 600 m below the rim. It holds a dense population of wildlife including black rhino, lion and hippo in a natural enclosure.", best: "Year-round; June–September is driest." },
  "Lake Manyara": { about: "A compact park beneath the Rift Valley escarpment with a groundwater forest, a soda lake and famous tree-climbing lions. It is a good first stop on the Tanzanian northern circuit.", best: "June–October for wildlife; November–June for birds and flamingos." },
  "Tarangire": { about: "Known for its ancient baobab trees and large elephant herds that gather at the Tarangire River in the dry season. Less crowded than the Serengeti.", best: "June–October." },
  "Mount Kilimanjaro": { about: "Africa's highest mountain at 5,895 m. The Machame Route ('Whiskey route') takes six to seven days and crosses rainforest, moorland, alpine desert and the summit glaciers. No technical climbing is needed, but good fitness and acclimatisation are.", best: "January–March and June–October." },
  "Zanzibar": { about: "A spice island off Tanzania's coast. Stone Town's alleys and carved doors are a UNESCO site, while the island's beaches at Nungwi, Kendwa and Paje have clear turquoise water. A natural finish to a safari.", best: "June–October and December–February." },
  "Dubai": { about: "A modern desert city of record-breaking towers, huge malls, beaches and old souks. Desert safaris, the Burj Khalifa and Palm Jumeirah are the standard highlights, and it is also a convenient hub for East Africa.", best: "November–March (summer is very hot)." },
  "Abu Dhabi": { about: "The UAE capital, known for the Sheikh Zayed Grand Mosque, the Louvre Abu Dhabi and the Yas Island attractions. It is about 1.5 hours from Dubai by road.", best: "November–March." },
  "Paris": { about: "The French capital, known for the Eiffel Tower, the Louvre, Seine cruises, cafés and Montmartre.", best: "April–June and September–October." },
  "Santorini": { about: "A crescent-shaped Greek island rimmed by the flooded caldera of an ancient volcano. White villages perch on the cliff edge, and Oia is famous for its sunsets.", best: "May–October." },
  "Rome": { about: "Italy's capital, with 2,000 years of history: the Colosseum, Roman Forum, Vatican and countless piazzas and trattorias.", best: "April–June and September–October." },
  "Swiss Alps": { about: "Snow-capped peaks, glacier trains and lakeside towns. Lucerne, Interlaken and Grindelwald make a classic base, with the Jungfrau region above.", best: "June–September for hiking; December–March for snow." },
  "Barcelona": { about: "A Catalan city of Gaudí's architecture, medieval lanes, tapas bars and city beaches.", best: "May–June and September–October." },
  "London": { about: "The UK capital: royal palaces, world-class museums, theatres, markets and the River Thames.", best: "May–September." }
};

const AIRPORT = {
  "Maasai Mara": "Jomo Kenyatta International Airport, Nairobi (NBO)", "Amboseli": "Jomo Kenyatta International Airport, Nairobi (NBO)",
  "Tsavo": "Jomo Kenyatta International Airport, Nairobi (NBO)", "Samburu": "Jomo Kenyatta International Airport, Nairobi (NBO)",
  "Lake Nakuru": "Jomo Kenyatta International Airport, Nairobi (NBO)",
  "Diani": "Moi International Airport, Mombasa (MBA) or Ukunda airstrip (UKA)", "Watamu": "Malindi Airport (MYD) or Moi International, Mombasa (MBA)",
  "Serengeti": "Kilimanjaro International Airport (JRO)", "Ngorongoro": "Kilimanjaro International Airport (JRO)",
  "Lake Manyara": "Kilimanjaro International Airport (JRO)", "Tarangire": "Kilimanjaro International Airport (JRO)",
  "Mount Kilimanjaro": "Kilimanjaro International Airport (JRO)", "Zanzibar": "Abeid Amani Karume International Airport (ZNZ)",
  "Dubai": "Dubai International Airport (DXB)", "Abu Dhabi": "Abu Dhabi International Airport (AUH)",
  "Paris": "Charles de Gaulle Airport (CDG)", "Santorini": "Santorini (Thira) Airport (JTR)", "Rome": "Rome Fiumicino Airport (FCO)",
  "Swiss Alps": "Zurich Airport (ZRH)", "Barcelona": "Barcelona–El Prat Airport (BCN)", "London": "London Heathrow Airport (LHR)"
};
const CITY = {
  "Maasai Mara": "Nairobi", "Amboseli": "Nairobi", "Tsavo": "Nairobi", "Samburu": "Nairobi", "Lake Nakuru": "Nairobi",
  "Diani": "Mombasa", "Watamu": "Mombasa", "Serengeti": "Arusha", "Ngorongoro": "Arusha", "Lake Manyara": "Arusha", "Tarangire": "Arusha",
  "Mount Kilimanjaro": "Moshi", "Zanzibar": "Zanzibar", "Dubai": "Dubai", "Abu Dhabi": "Abu Dhabi", "Paris": "Paris",
  "Santorini": "Santorini", "Rome": "Rome", "Swiss Alps": "Zurich", "Barcelona": "Barcelona", "London": "London"
};
const BEACH = new Set(["Diani", "Watamu", "Zanzibar"]);
const SAFARI = new Set(["Maasai Mara", "Amboseli", "Tsavo", "Samburu", "Lake Nakuru", "Serengeti", "Ngorongoro", "Lake Manyara", "Tarangire"]);
const CITYSET = new Set(["Dubai", "Abu Dhabi", "Paris", "Santorini", "Rome", "Swiss Alps", "Barcelona", "London"]);
const DEST_ALIAS = { "Tsavo": "Tsavo East & West", "Diani": "Diani Beach", "Ngorongoro": "Ngorongoro Crater" };
const destByKey = k => DESTINATIONS.find(d => d.name === (DEST_ALIAS[k] || k));


// ===== asia-data.js =====
// Asia destinations, stays, activities and facts. Loaded after data.js and dest-info.js; merges into their objects.
Object.assign(IMG, {
  bangkok: U("1508009603885-50cf7c579365"),
  thaibeach: U("1552465011-b4e21bf6e79a"),
  singapore: U("1525625293386-3f8f99389edd"),
  bali: U("1537996194471-e657df975ab4"),
  kl: U("1596422846543-75c6fc197f07"),
  china: U("1508804185872-d7badad00f7d"),
  shanghai: U("1474181487882-5abf3f0ba6c2")
});

DESTINATIONS.push(
  { id: "bangkok", name: "Bangkok", country: "Thailand", region: "asia", img: IMG.bangkok, blurb: "Golden temples, floating markets, street food and rooftop bars." },
  { id: "chiangmai", name: "Chiang Mai", country: "Thailand", region: "asia", img: IMG.bangkok, blurb: "Northern Thailand's old city, mountain temples and elephant sanctuaries." },
  { id: "phuket", name: "Phuket", country: "Thailand", region: "asia", img: IMG.thaibeach, blurb: "Thailand's biggest island: beaches, island hopping and Old Town." },
  { id: "bali", name: "Bali", country: "Indonesia", region: "asia", img: IMG.bali, blurb: "Rice terraces, temples, surf beaches and Ubud's arts scene." },
  { id: "singapore", name: "Singapore", country: "Singapore", region: "asia", img: IMG.singapore, blurb: "A spotless city-state of gardens, skyline views and hawker food." },
  { id: "kl", name: "Kuala Lumpur", country: "Malaysia", region: "asia", img: IMG.kl, blurb: "Petronas Towers, night markets and a mix of Malay, Chinese and Indian food." },
  { id: "langkawi", name: "Langkawi", country: "Malaysia", region: "asia", img: IMG.thaibeach, blurb: "Duty-free island of beaches, mangroves and a sky bridge." },
  { id: "beijing", name: "Beijing", country: "China", region: "asia", img: IMG.china, blurb: "The Forbidden City, Tiananmen Square and the Great Wall." },
  { id: "shanghai", name: "Shanghai", country: "China", region: "asia", img: IMG.shanghai, blurb: "The Bund, futuristic skyline and old-town gardens." }
);

Object.assign(STAYS, {
  "Bangkok": {
    budget: [["Budget hotels near BTS / MRT", "$25–$60", "Estimate"]],
    mid: [["4★ hotels (Sukhumvit / Riverside)", "$70–$140", "Estimate"]],
    luxury: [["Mandarin Oriental Bangkok or similar", "$350–$700", "Estimate"]]
  },
  "Chiang Mai": {
    budget: [["Old City guesthouses", "$20–$50", "Estimate"]],
    mid: [["4★ boutique hotels", "$60–$120", "Estimate"]],
    luxury: [["Luxury resort hotels", "$250–$600", "Estimate"]]
  },
  "Phuket": {
    budget: [["Patong / Karon budget hotels", "$30–$70", "Estimate"]],
    mid: [["4★ beach resorts", "$80–$170", "Estimate"]],
    luxury: [["5★ private-beach resorts", "$300–$900", "Estimate"]]
  },
  "Bali": {
    budget: [["Kuta / Ubud guesthouses", "$25–$60", "Estimate"]],
    mid: [["Boutique villas (Seminyak, Ubud)", "$70–$160", "Estimate"]],
    luxury: [["Private pool villas & resorts", "$300–$1,000", "Estimate"]]
  },
  "Singapore": {
    budget: [["Budget hotels (Bugis, Chinatown)", "$60–$110", "Estimate"]],
    mid: [["4★ hotels (Marina / Orchard)", "$130–$250", "Estimate"]],
    luxury: [["Marina Bay Sands or Raffles Singapore", "$450–$1,000+", "Estimate"]]
  },
  "Kuala Lumpur": {
    budget: [["Budget hotels near KLCC", "$25–$55", "Estimate"]],
    mid: [["4★ hotels (Bukit Bintang, KLCC)", "$60–$120", "Estimate"]],
    luxury: [["Mandarin Oriental KL or similar", "$220–$500", "Estimate"]]
  },
  "Langkawi": {
    budget: [["Cenang Beach guesthouses", "$30–$60", "Estimate"]],
    mid: [["4★ beach resorts", "$80–$160", "Estimate"]],
    luxury: [["5★ private resorts", "$250–$700", "Estimate"]]
  },
  "Beijing": {
    budget: [["Budget hotels near Wangfujing", "$30–$65", "Estimate"]],
    mid: [["4★ hotels", "$70–$140", "Estimate"]],
    luxury: [["5★ hotels (e.g. The Peninsula)", "$300–$700", "Estimate"]]
  },
  "Shanghai": {
    budget: [["Budget hotels (People's Square)", "$30–$70", "Estimate"]],
    mid: [["4★ hotels", "$80–$150", "Estimate"]],
    luxury: [["5★ Bund hotels", "$300–$800", "Estimate"]]
  }
});

Object.assign(ACT, {
  "Bangkok": [
    A("Grand Palace and Wat Phra Kaew", "inc"), A("Wat Arun and Chao Phraya river boat", "inc"), A("Chinatown street food evening", "inc"),
    A("Floating market and Ayutthaya day trip", "opt", "extra cost", 1), A("Thai cooking class", "opt", "extra cost"), A("Rooftop bar sunset", "opt", "extra cost")
  ],
  "Chiang Mai": [
    A("Old City temples (Wat Phra Singh, Wat Chedi Luang)", "inc"), A("Doi Suthep mountain temple", "inc"), A("Night Bazaar", "inc"),
    A("Ethical elephant sanctuary visit", "opt", "extra cost", 1), A("Zipline and jungle trek", "opt", "extra cost"), A("Khantoke dinner and cultural show", "opt", "extra cost")
  ],
  "Phuket": [
    A("Old Phuket Town walking tour", "inc"), A("Big Buddha and Karon viewpoint", "inc"), A("Beach days at Kata and Karon", "inc"),
    A("Phi Phi Islands speedboat trip", "opt", "extra cost", 1), A("Phang Nga Bay (James Bond Island) tour", "opt", "extra cost", 1), A("Sunset dinner at Promthep Cape", "opt", "extra cost")
  ],
  "Bali": [
    A("Tanah Lot temple at sunset", "inc"), A("Tegallalang rice terraces", "inc"), A("Ubud Monkey Forest and art markets", "inc"),
    A("Mount Batur sunrise trek", "opt", "extra cost", 1), A("Nusa Penida day trip", "opt", "extra cost", 1), A("Surf lesson at Kuta or Canggu", "opt", "extra cost"), A("Balinese cooking class", "opt", "extra cost")
  ],
  "Singapore": [
    A("Gardens by the Bay and Supertree Grove", "inc"), A("Merlion Park and Marina Bay walk", "inc"), A("Chinatown, Little India and hawker centres", "inc"),
    A("Sentosa Island and Universal Studios", "opt", "extra cost", 1), A("Night Safari", "opt", "extra cost"), A("Singapore River cruise", "opt", "extra cost", 1)
  ],
  "Kuala Lumpur": [
    A("Petronas Twin Towers viewing area and KLCC Park", "inc"), A("Batu Caves", "inc"), A("Jalan Alor night food street", "inc"),
    A("Petronas skybridge ticket", "opt", "extra cost", 1), A("Genting Highlands day trip", "opt", "extra cost"), A("Malacca heritage day trip", "opt", "extra cost")
  ],
  "Langkawi": [
    A("Beach days at Pantai Cenang", "inc"), A("Mangrove river tour", "opt", "extra cost", 1), A("Langkawi Sky Bridge and cable car", "opt", "extra cost", 1),
    A("Island-hopping boat trip", "opt", "extra cost"), A("Duty-free shopping", "opt", "own cost")
  ],
  "Beijing": [
    A("Tiananmen Square and the Forbidden City", "inc"), A("Great Wall of China (Mutianyu section)", "inc"), A("Temple of Heaven", "inc"),
    A("Summer Palace", "opt", "extra cost", 1), A("Peking duck dinner", "opt", "extra cost", 1), A("Acrobatics or kung fu show", "opt", "extra cost")
  ],
  "Shanghai": [
    A("The Bund waterfront walk", "inc"), A("Yu Garden and old town", "inc"), A("Nanjing Road shopping street", "inc"),
    A("Shanghai Tower observation deck", "opt", "extra cost", 1), A("Huangpu River night cruise", "opt", "extra cost", 1), A("Zhujiajiao water town day trip", "opt", "extra cost"), A("Maglev train ride", "opt", "extra cost")
  ]
});

Object.assign(DINFO, {
  "Bangkok": { about: "Thailand's capital mixes gilded temples, river canals, huge malls and some of the world's best street food.", best: "November–February (cool and dry)." },
  "Chiang Mai": { about: "A relaxed northern city inside an old moat, with hundreds of temples, mountain scenery and craft markets.", best: "November–February." },
  "Phuket": { about: "Thailand's largest island, with sandy beaches on the west coast, island hopping in the Andaman Sea and a colourful Old Town.", best: "November–April (dry season)." },
  "Bali": { about: "An Indonesian island of terraced rice fields, Hindu temples, surf beaches and yoga retreats. Ubud is the cultural heart; Seminyak and Canggu have beach clubs.", best: "April–October (dry season)." },
  "Singapore": { about: "A clean, safe island city-state with Gardens by the Bay, Marina Bay Sands, Sentosa and Chinatown and Little India food.", best: "February–April, though it is warm year-round." },
  "Kuala Lumpur": { about: "Malaysia's capital, known for the Petronas Twin Towers, Batu Caves and a huge night food scene.", best: "May–July and December–February drier months." },
  "Langkawi": { about: "An island archipelago off Malaysia's north-west coast with beaches, mangroves and a mountain cable car.", best: "December–March." },
  "Beijing": { about: "China's capital has 3,000 years of history: the Forbidden City, the Temple of Heaven and the nearby Great Wall.", best: "April–May and September–October." },
  "Shanghai": { about: "China's biggest city: colonial Bund buildings facing the modern Pudong skyline, with old gardens and fast trains.", best: "March–May and September–November." }
});

Object.assign(AIRPORT, {
  "Bangkok": "Suvarnabhumi Airport (BKK)", "Chiang Mai": "Chiang Mai International Airport (CNX)", "Phuket": "Phuket International Airport (HKT)",
  "Bali": "Ngurah Rai International Airport, Bali (DPS)", "Singapore": "Changi Airport (SIN)", "Kuala Lumpur": "Kuala Lumpur International Airport (KUL)",
  "Langkawi": "Langkawi International Airport (LGK)", "Beijing": "Beijing Capital International Airport (PEK)", "Shanghai": "Shanghai Pudong International Airport (PVG)"
});
Object.assign(CITY, { "Bangkok": "Bangkok", "Chiang Mai": "Chiang Mai", "Phuket": "Phuket", "Bali": "Bali", "Singapore": "Singapore", "Kuala Lumpur": "Kuala Lumpur", "Langkawi": "Langkawi", "Beijing": "Beijing", "Shanghai": "Shanghai" });
["Bangkok", "Chiang Mai", "Phuket", "Bali", "Singapore", "Kuala Lumpur", "Langkawi", "Beijing", "Shanghai"].forEach(d => CITYSET.add(d));
const ASIASET = new Set(["Bangkok", "Chiang Mai", "Phuket", "Bali", "Singapore", "Kuala Lumpur", "Langkawi", "Beijing", "Shanghai"]);
Object.assign(DEST_ALIAS, { "Kuala Lumpur": "Kuala Lumpur" });


// ===== stays.js =====
// Named hotels, resorts and lodges per destination and package style: [name, indicative rate per person/night, location].
// Rates are indicative (high/low season and room type vary). Confirm current rates and availability before booking.
const NEW_STAYS = {
  // ---------- KENYA ----------
  "Maasai Mara": {
    budget: [["Mara Simba Lodge", "$100–$180", "Sekenani Gate area, Maasai Mara"], ["Mara Explorers Camp", "$110–$200", "Near Talek Gate, Maasai Mara"], ["Basecamp Masai Mara", "$120–$220", "Near Talek Gate, Maasai Mara"]],
    mid: [["Mara Sopa Lodge", "$150–$300", "Near Sekenani Gate, Maasai Mara"], ["Ashnil Mara Camp", "$250–$300", "On the Mara River, Maasai Mara"], ["Sarova Mara Game Camp", "$220–$320", "Central Maasai Mara"]],
    luxury: [["Angama Mara", "$1,000+", "Oloololo Escarpment, Mara Triangle"], ["JW Marriott Masai Mara Lodge", "$800–$2,000", "Maasai Mara National Reserve"], ["Mara Serena Safari Lodge", "$350–$600", "Mara Triangle, Maasai Mara"]]
  },
  "Amboseli": {
    budget: [["Kibo Safari Camp", "$150–$230", "Near Amboseli National Park gate"], ["Kilima Safari Camp", "$140–$220", "Kimana, near Amboseli"]],
    mid: [["Ol Tukai Lodge", "$220–$360", "Inside Amboseli National Park"], ["Amboseli Sopa Lodge", "$200–$320", "Near Amboseli National Park, Kilimanjaro views"]],
    luxury: [["Tortilis Camp", "$400–$600", "Amboseli ecosystem, Kilimanjaro views"], ["Amboseli Serena Safari Lodge", "$300–$450", "Inside Amboseli National Park"], ["Tawi Lodge", "$400–$600", "Selenkay Conservancy near Amboseli"]]
  },
  "Tsavo": {
    budget: [["Voi Safari Lodge", "$90–$160", "Tsavo East, overlooking waterhole"], ["Ngutuni Safari Lodge", "$100–$170", "Tsavo East, near Voi"]],
    mid: [["Kilaguni Serena Safari Lodge", "$200–$350", "Tsavo West, waterhole views"], ["Satao Camp", "$180–$320", "Tsavo East tented camp"]],
    luxury: [["Finch Hattons Luxury Tented Camp", "$450–$700", "Near Tsavo West and Amboseli"], ["Galdessa Camp", "$450–$700", "Galana River, Tsavo East"], ["Severin Safari Camp", "$350–$550", "Tsavo West, near Mtito Andei"]]
  },
  "Samburu": {
    budget: [["Samburu Game Lodge", "$120–$220", "On the Ewaso Ng'iro River, Samburu"], ["Samburu Simba Lodge", "$110–$200", "Near Samburu National Reserve"]],
    mid: [["Samburu Sopa Lodge", "$250–$450", "Samburu National Reserve"], ["Ashnil Samburu Camp", "$250–$450", "On the Ewaso Ng'iro River, Samburu"]],
    luxury: [["Elephant Bedroom Camp", "$500–$900", "Ewaso Ng'iro River, Samburu"], ["Sasaab", "$700–$1,200", "Samburu, near Buffalo Springs"], ["Larsens Camp", "$450–$800", "Ewaso Ng'iro River, Samburu"]]
  },
  "Lake Nakuru": {
    budget: [["Lake Nakuru Lodge", "$100–$180", "Inside Lake Nakuru National Park"], ["Flamingo Hill Tented Camp", "$100–$170", "Near Lake Nakuru National Park"]],
    mid: [["Sarova Lion Hill Game Lodge", "$150–$300", "Lake Nakuru National Park"], ["Lake Nakuru Sopa Lodge", "$150–$280", "Near Lake Nakuru National Park"], ["Lake Naivasha Sopa Resort", "$130–$250", "Lake Naivasha"]],
    luxury: [["Lake Elmenteita Serena Camp", "$300–$500", "Lake Elmenteita, near Nakuru"], ["Great Rift Valley Lodge & Golf Resort", "$250–$450", "Naivasha escarpment"]]
  },
  "Diani": {
    budget: [["Mangro Hotel Diani Beach", "$27–$70", "Diani Beach"], ["Prideinn Express Diani", "$45–$90", "Close to Diani Beach"], ["Tradewinds Lodge", "$30–$70", "Diani Beach"]],
    mid: [["Southern Palms Beach Resort", "$110–$220", "Diani Beach"], ["Leopard Beach Resort & Spa", "$140–$260", "Diani Beach"], ["Baobab Beach Resort & Spa", "$130–$240", "Diani Beach"]],
    luxury: [["Swahili Beach Resort", "$180–$380", "Diani Beach"], ["The Sands at Nomad", "$250–$450", "Diani Beach"], ["Neptune Palm Beach Boutique Resort & Spa", "$220–$400", "Diani Beach"]]
  },
  "Watamu": {
    budget: [["Tembo Village Resort", "$40–$100", "Watamu"]],
    mid: [["Ocean Sports Resort", "$69–$180", "Watamu Bay"], ["AHG Lion Beach Resort", "$150–$250", "Watamu"], ["Turtle Bay Beach Club", "$120–$220", "Watamu Marine National Park"]],
    luxury: [["Hemingways Watamu", "$356–$600", "Watamu Bay"], ["Medina Palms", "$344–$550", "Watamu Beach"]]
  },
  // ---------- TANZANIA ----------
  "Serengeti": {
    budget: [["Serengeti Wilderness Camp", "$100–$150", "Serengeti National Park"], ["Tukaone Hembe Serengeti Camp", "$150–$250", "Central Serengeti"]],
    mid: [["Serengeti Sopa Lodge", "$300–$550", "Central Serengeti (Serengeti National Park)"], ["Serengeti Serena Safari Lodge", "$350–$600", "Central Serengeti"], ["Kubukubu Tented Lodge", "$300–$500", "Serengeti National Park"]],
    luxury: [["Four Seasons Safari Lodge Serengeti", "$1,000–$1,800", "Seronera, Serengeti"], ["Singita Sabora Tented Camp", "$1,200–$2,000", "Grumeti, Serengeti"], ["andBeyond Serengeti Under Canvas", "$700–$1,300", "Serengeti (seasonal migration camp)"]]
  },
  "Ngorongoro": {
    budget: [["Ngorongoro Rhino Lodge", "$100–$180", "Crater rim, Ngorongoro"], ["Foresight Eco Lodge", "$100–$180", "Karatu, near Ngorongoro"]],
    mid: [["Ngorongoro Sopa Lodge", "$250–$450", "Crater rim, Ngorongoro"], ["Ngorongoro Serena Safari Lodge", "$300–$550", "Crater rim, Ngorongoro"], ["Ngorongoro Oldeani Lodge", "$200–$350", "Karatu, near Ngorongoro"]],
    luxury: [["andBeyond Ngorongoro Crater Lodge", "$1,200–$2,000", "Crater rim, Ngorongoro"], ["Gibb's Farm", "$400–$700", "Karatu, near Ngorongoro"]]
  },
  "Lake Manyara": {
    budget: [["Migunga Tented Camp", "$80–$140", "Mto wa Mbu, near Lake Manyara"], ["Lake Manyara Kilimamoja Lodge", "$100–$180", "Mto wa Mbu, Lake Manyara"]],
    mid: [["Kirurumu Manyara Lodge", "$180–$350", "Manyara escarpment"], ["Lake Manyara Serena Safari Lodge", "$250–$450", "Manyara escarpment"], ["Mawe Mawe Manyara Lodge", "$200–$350", "Lake Manyara area"]],
    luxury: [["Escarpment Luxury Lodge", "$450–$800", "Manyara escarpment"], ["Lake Manyara Tree Lodge (andBeyond)", "$900–$1,400", "Lake Manyara National Park"]]
  },
  "Tarangire": {
    budget: [["Roika Tarangire Tented Lodge", "$120–$220", "Near Tarangire National Park"], ["Tarangire Safari Lodge", "$180–$320", "Inside Tarangire National Park"]],
    mid: [["Tarangire Sopa Lodge", "$250–$450", "Tarangire National Park"], ["Lake Burunge Tented Camp", "$200–$350", "Lake Burunge, near Tarangire"]],
    luxury: [["Tarangire Treetops", "$700–$1,200", "Tarangire ecosystem"], ["Oliver's Camp", "$700–$1,200", "Tarangire National Park"]]
  },
  "Mount Kilimanjaro": {
    budget: [["Keys Hotel", "$40–$90", "Moshi"], ["Springlands Hotel", "$50–$100", "Moshi"]],
    mid: [["Weru Weru River Lodge", "$90–$150", "Moshi"], ["Ameg Lodge Kilimanjaro", "$100–$200", "Moshi"]],
    luxury: [["Protea Hotel by Marriott Aishi Machame", "$120–$220", "Machame, base of Kilimanjaro"]]
  },
  "Zanzibar": {
    budget: [["Amaan Bungalows", "$60–$120", "Nungwi Beach"], ["Kendwa Rocks Hotel", "$60–$120", "Kendwa Beach"], ["Paje by the Sea Hotel", "$60–$120", "Paje Beach"]],
    mid: [["DoubleTree by Hilton Resort Zanzibar – Nungwi", "$150–$260", "Nungwi Beach"], ["Diamonds Star of the East", "$140–$250", "Nungwi Beach"], ["Meliá Zanzibar", "$180–$320", "Kiwengwa Beach"]],
    luxury: [["Zuri Zanzibar", "$400–$800", "Kendwa Beach"], ["Park Hyatt Zanzibar", "$300–$500", "Stone Town waterfront"], ["The Residence Zanzibar", "$500–$900", "Kizimkazi, south-west coast"]]
  },
  // ---------- UAE ----------
  "Dubai": {
    budget: [["Rove Downtown", "$60–$120", "Downtown Dubai, near Dubai Mall"], ["Citymax Hotel Bur Dubai", "$40–$80", "Bur Dubai"], ["Rove City Walk", "$60–$110", "City Walk, Dubai"]],
    mid: [["Two Seasons Hotel & Apartments", "$80–$150", "Dubai Internet City"], ["Novotel Dubai Al Barsha", "$90–$160", "Al Barsha, near Mall of the Emirates"], ["Pullman Dubai Creek City Centre", "$110–$200", "Deira, Dubai Creek"]],
    luxury: [["Atlantis The Palm", "$250–$600", "Palm Jumeirah"], ["Atlantis The Royal", "$700–$1,500", "Palm Jumeirah"], ["One&Only The Palm", "$700–$1,500", "Palm Jumeirah"]]
  },
  "Abu Dhabi": {
    budget: [["Centro Capital Centre by Rotana", "$60–$100", "Abu Dhabi city centre"], ["Corniche Hotel Abu Dhabi", "$50–$90", "Abu Dhabi Corniche"]],
    mid: [["Radisson Blu Hotel & Resort, Abu Dhabi Corniche", "$110–$200", "Abu Dhabi Corniche"], ["Millennium Corniche Abu Dhabi", "$100–$180", "Abu Dhabi Corniche"]],
    luxury: [["Emirates Palace Mandarin Oriental", "$350–$800", "Abu Dhabi Corniche"], ["Rosewood Abu Dhabi", "$350–$700", "Al Maryah Island"], ["The St. Regis Saadiyat Island Resort", "$350–$800", "Saadiyat Island"]]
  },
  // ---------- EUROPE ----------
  "Paris": {
    budget: [["CitizenM Paris Gare de Lyon", "€110–€190", "Gare de Lyon, 12th arrondissement"], ["Motel One Paris Porte Dorée", "€90–€150", "Porte Dorée, 12th arrondissement"]],
    mid: [["Mercure Paris Centre Tour Eiffel", "€160–€260", "Near the Eiffel Tower"], ["Novotel Paris Centre Tour Eiffel", "€180–€300", "Near the Eiffel Tower"], ["Hôtel Le Walt", "€200–€330", "7th arrondissement"]],
    luxury: [["Le Meurice", "€1,000+", "Rue de Rivoli, near the Louvre"], ["Hôtel Plaza Athénée", "€1,200+", "Avenue Montaigne"], ["Ritz Paris", "€1,300+", "Place Vendôme"]]
  },
  "Rome": {
    budget: [["CitizenM Rome Isola Tiberina", "€120–€200", "Trastevere / Tiber Island"], ["Hotel Artemide", "€120–€200", "Via Nazionale, central Rome"]],
    mid: [["NH Collection Roma Fontana di Trevi", "€200–€320", "Near the Trevi Fountain"], ["Hotel Quirinale", "€160–€260", "Near Rome Opera House"]],
    luxury: [["Hotel de Russie", "€900+", "Near Piazza del Popolo"], ["Hotel Hassler Roma", "€900+", "Top of the Spanish Steps"], ["Hotel Eden", "€900+", "Via Ludovisi"]]
  },
  "Santorini": {
    budget: [["Atlantis Hotel", "€100–€180", "Fira"], ["Sellada Beach Hotel", "€90–€170", "Kamari Beach"]],
    mid: [["Santorini Palace", "€180–€280", "Fira"], ["Cosmopolitan Suites", "€200–€320", "Firostefani"], ["Belvedere Santorini", "€250–€400", "Imerovigli"]],
    luxury: [["Katikies Kirini", "€700+", "Oia / caldera edge"], ["Grace Santorini", "€700+", "Imerovigli"], ["Carpe Diem Santorini", "€700+", "Oia"]]
  },
  "Swiss Alps": {
    budget: [["Hotel Bernerhof Interlaken", "CHF 120–220", "Next to Interlaken West Station"], ["Hotel Lötschberg Interlaken", "CHF 120–220", "Interlaken"]],
    mid: [["Hotel Kreuz & Post Grindelwald", "CHF 220–350", "Grindelwald village"], ["Hotel des Balances Lucerne", "CHF 250–400", "Reuss River, Lucerne old town"]],
    luxury: [["Mandarin Oriental Palace, Luzern", "CHF 700+", "Lake Lucerne waterfront"], ["Victoria-Jungfrau Grand Hotel & Spa", "CHF 700+", "Interlaken"]]
  },
  "Barcelona": {
    budget: [["CitizenM Barcelona", "€110–€190", "Ramblas area"], ["Motel One Barcelona-Ciutadella", "€90–€160", "Ciutadella Park"]],
    mid: [["Hotel Jazz Barcelona", "€150–€260", "Eixample"], ["NH Collection Barcelona Constanza", "€150–€260", "Eixample"]],
    luxury: [["Hotel Arts Barcelona", "€400+", "Beachfront, Port Olímpic"], ["Mandarin Oriental Barcelona", "€600+", "Passeig de Gràcia"], ["W Barcelona", "€400+", "Barceloneta beachfront"]]
  },
  "London": {
    budget: [["CitizenM Tower of London", "£120–£200", "Near Tower Hill"], ["Premier Inn London County Hall", "£140–£220", "South Bank, near the London Eye"], ["Motel One London Tower Hill", "£110–£190", "Tower Hill"]],
    mid: [["The Hoxton, Holborn", "£180–£280", "Holborn, central London"], ["Novotel London Waterloo", "£160–£260", "Near Waterloo Station"]],
    luxury: [["The Savoy", "£800+", "The Strand"], ["Claridge's", "£900+", "Mayfair"], ["The Langham, London", "£600+", "Regent Street"]]
  },
  // ---------- ASIA ----------
  "Bangkok": {
    budget: [["ibis Bangkok Riverside", "$40–$80", "Chao Phraya riverside"], ["Novotel Bangkok Sukhumvit 20", "$55–$100", "Sukhumvit"]],
    mid: [["Centara Grand at CentralWorld", "$110–$190", "Ratchaprasong, central Bangkok"], ["Anantara Riverside Bangkok Resort", "$120–$220", "Chao Phraya River"]],
    luxury: [["Mandarin Oriental, Bangkok", "$400–$800", "Chao Phraya River"], ["The Peninsula Bangkok", "$350–$700", "Chao Phraya River"], ["Siam Kempinski Hotel Bangkok", "$300–$600", "Siam Paragon"]]
  },
  "Chiang Mai": {
    budget: [["ibis Styles Chiang Mai", "$35–$70", "Near Old City"]],
    mid: [["Dusit D2 Chiang Mai", "$70–$130", "Night Bazaar area"], ["Le Méridien Chiang Mai", "$80–$150", "Night Bazaar area"]],
    luxury: [["Shangri-La Chiang Mai", "$200–$400", "Near the Old City"], ["Four Seasons Resort Chiang Mai", "$600–$1,200", "Mae Rim Valley"], ["Mandarin Oriental Dhara Dhevi Chiang Mai", "$300–$600", "Chiang Mai"]]
  },
  "Phuket": {
    budget: [["Oakwood Hotel Journeyhub Phuket", "$30–$60", "Phuket"], ["ibis Phuket Patong", "$40–$80", "Patong Beach"]],
    mid: [["Centara Karon Resort Phuket", "$100–$190", "Karon Beach"], ["Novotel Phuket Kata Avista Resort", "$90–$170", "Kata Beach"], ["Hilton Phuket Arcadia Resort & Spa", "$110–$200", "Karon Beach"]],
    luxury: [["Amanpuri", "$1,000+", "Pansea Beach"], ["Trisara Phuket", "$800+", "Layan Beach"], ["Rosewood Phuket", "$400–$800", "Emerald Bay"]]
  },
  "Bali": {
    budget: [["Kuta Paradiso Hotel", "$40–$80", "Kuta"], ["ibis Styles Bali Legian", "$40–$80", "Legian"]],
    mid: [["Alaya Resort Ubud", "$100–$180", "Ubud"], ["Pullman Bali Legian Nirwana", "$110–$200", "Legian"], ["Hotel Indigo Bali Seminyak Beach", "$100–$200", "Seminyak"]],
    luxury: [["Four Seasons Resort Bali at Sayan", "$800–$1,500", "Ubud / Sayan"], ["Mandapa, a Ritz-Carlton Reserve", "$700–$1,500", "Ubud"], ["The Legian Seminyak, Bali", "$500–$1,000", "Seminyak"]]
  },
  "Singapore": {
    budget: [["Value Hotel Balestier", "$70–$110", "Balestier"], ["Hotel 81 Dickson", "$70–$110", "Little India"], ["Hotel Supreme", "$80–$120", "Bugis"]],
    mid: [["PARKROYAL COLLECTION Marina Bay", "$200–$320", "Marina Bay"], ["Novotel Singapore Clarke Quay", "$180–$280", "Clarke Quay"]],
    luxury: [["Marina Bay Sands", "$500–$1,200", "Marina Bay"], ["The Ritz-Carlton, Millenia Singapore", "$450–$900", "Marina Bay"], ["Raffles Singapore", "$800+", "Beach Road, City Hall"]]
  },
  "Kuala Lumpur": {
    budget: [["Tune Hotel Downtown Kuala Lumpur", "$30–$60", "Downtown KL"], ["ibis Kuala Lumpur City Centre", "$40–$70", "KL city centre"]],
    mid: [["Sleeping Lion Suites", "$70–$130", "Bukit Bintang"], ["Traders Hotel Kuala Lumpur", "$110–$190", "KLCC / Petronas Towers"]],
    luxury: [["Mandarin Oriental, Kuala Lumpur", "$250–$500", "KLCC / Petronas Towers"], ["Grand Hyatt Kuala Lumpur", "$180–$350", "KLCC"], ["The Ritz-Carlton, Kuala Lumpur", "$220–$450", "Bukit Bintang"]]
  },
  "Langkawi": {
    budget: [["Frangipani Langkawi Resort & Spa", "$60–$110", "Pantai Tengah"], ["Meritus Pelangi Beach Resort & Spa", "$90–$160", "Pantai Cenang"]],
    mid: [["Berjaya Langkawi Resort", "$110–$200", "Burau Bay"], ["The Westin Langkawi Resort & Spa", "$150–$280", "Kuah waterfront"]],
    luxury: [["The Datai Langkawi", "$500–$1,000", "Datai Bay"], ["Four Seasons Resort Langkawi", "$600–$1,200", "Tanjung Rhu"], ["The Danna Langkawi", "$250–$450", "Teluk Datai"]]
  },
  "Beijing": {
    budget: [["Novotel Beijing Peace", "$60–$110", "Wangfujing"], ["Holiday Inn Express Beijing Temple of Heaven", "$45–$85", "Near the Temple of Heaven"]],
    mid: [["InterContinental Beijing Sanlitun", "$150–$280", "Sanlitun"], ["Crowne Plaza Beijing Wangfujing", "$100–$180", "Wangfujing"]],
    luxury: [["The Peninsula Beijing", "$400–$800", "Wangfujing"], ["Rosewood Beijing", "$350–$700", "Chaoyang"], ["Aman at Summer Palace", "$700–$1,500", "Next to the Summer Palace"]]
  },
  "Shanghai": {
    budget: [["Campanile Shanghai Bund Hotel", "$60–$110", "Near the Bund"], ["ibis Shanghai Nanjing Road", "$45–$85", "Nanjing Road"]],
    mid: [["Hotel Indigo Shanghai on the Bund", "$120–$220", "The Bund"], ["Novotel Shanghai Atlantis", "$90–$160", "Pudong"]],
    luxury: [["The Peninsula Shanghai", "$450–$900", "The Bund"], ["The Ritz-Carlton Shanghai, Pudong", "$400–$800", "Lujiazui"], ["Waldorf Astoria Shanghai on the Bund", "$450–$900", "The Bund"]]
  }
};
Object.keys(NEW_STAYS).forEach(k => { STAYS[k] = NEW_STAYS[k]; });


// ===== packages.js =====
// Each package: route = [{d: destination key (matches STAYS/ACT), n: nights}]. Days = nights + 1.
// aud: "visitor" (starts at the airport) or "resident" (starts with pick-up from home or head office).
// cat (residents only): safari | beach | beach-safari | dubai | europe | asia
// extraInc: optional activities that this package includes in the price.
// Prices are indicative "from" USD per person sharing. International flights are not included. Confirm before publishing.
const R = (d, n) => ({ d, n });
const V = "visitor", RES = "resident";
const PACKAGES = [
  // ================= VISITORS: KENYA =================
  { id: "mara-great-migration", aud: V, title: "Great Migration Maasai Mara Safari", tier: "mid", type: "Kenya", from: 1600, img: IMG.mara,
    route: [R("Maasai Mara", 4)], extraInc: ["Maasai village cultural visit"] },
  { id: "mara-migration-fly-in", aud: V, title: "Great Migration Fly-in Luxury Safari", tier: "luxury", type: "Kenya", from: 2900, img: IMG.lion,
    route: [R("Maasai Mara", 3)], extraInc: [] },
  { id: "mara-amboseli-budget", aud: V, title: "Maasai Mara & Amboseli Budget Safari", tier: "budget", type: "Kenya", from: 650, img: IMG.elephant,
    route: [R("Amboseli", 2), R("Maasai Mara", 2)], extraInc: [] },
  { id: "mara-amboseli-mid", aud: V, title: "Maasai Mara & Amboseli Safari", tier: "mid", type: "Kenya", from: 1100, img: IMG.elephant,
    route: [R("Maasai Mara", 2), R("Amboseli", 2)], extraInc: ["Maasai village cultural visit"] },
  { id: "kenya-classic", aud: V, title: "Kenya Classic: Amboseli, Nakuru & Mara", tier: "mid", type: "Kenya", from: 1150, img: IMG.elephant,
    route: [R("Amboseli", 2), R("Lake Nakuru", 1), R("Maasai Mara", 2)], extraInc: [] },
  { id: "samburu-mara-mid", aud: V, title: "Samburu & Maasai Mara Safari", tier: "mid", type: "Kenya", from: 1450, img: IMG.zebra,
    route: [R("Samburu", 2), R("Maasai Mara", 3)], extraInc: [] },
  { id: "kenya-luxury-samburu-mara", aud: V, title: "Samburu, Mara & Migration Luxury Safari", tier: "luxury", type: "Kenya", from: 3800, img: IMG.lion,
    route: [R("Samburu", 3), R("Maasai Mara", 3)], extraInc: [] },
  { id: "tsavo-amboseli-budget", aud: V, title: "Tsavo & Amboseli Budget Safari", tier: "budget", type: "Kenya", from: 520, img: IMG.elephant,
    route: [R("Tsavo", 2), R("Amboseli", 1)], extraInc: [] },
  { id: "kenya-safari-diani-visitors", aud: V, title: "Mara, Amboseli & Diani Beach", tier: "mid", type: "Kenya", from: 1500, img: IMG.beach,
    route: [R("Maasai Mara", 2), R("Amboseli", 2), R("Diani", 3)], extraInc: [] },
  { id: "kenya-luxury-beach", aud: V, title: "Kenya Luxury: Mara, Amboseli & Watamu", tier: "luxury", type: "Kenya", from: 4600, img: IMG.snorkel,
    route: [R("Maasai Mara", 3), R("Amboseli", 2), R("Watamu", 2)], extraInc: [] },
  { id: "diani-escape-visitors", aud: V, title: "Diani Beach Escape", tier: "mid", type: "Beach", from: 520, img: IMG.beach,
    route: [R("Diani", 4)], extraInc: [] },
  // ================= VISITORS: TANZANIA =================
  { id: "serengeti-camping", aud: V, title: "Serengeti & Ngorongoro Camping Safari", tier: "budget", type: "Tanzania", from: 900, img: IMG.zebra,
    route: [R("Lake Manyara", 1), R("Serengeti", 2), R("Ngorongoro", 1)], extraInc: [] },
  { id: "tarangire-manyara-ngorongoro", aud: V, title: "Tarangire, Manyara & Ngorongoro", tier: "mid", type: "Tanzania", from: 1700, img: IMG.elephant,
    route: [R("Tarangire", 2), R("Lake Manyara", 1), R("Ngorongoro", 1)], extraInc: [] },
  { id: "northern-circuit-lodge", aud: V, title: "Tanzania Northern Circuit Lodge Safari", tier: "mid", type: "Tanzania", from: 2400, img: IMG.lion,
    route: [R("Tarangire", 1), R("Lake Manyara", 1), R("Serengeti", 3), R("Ngorongoro", 1)], extraInc: [] },
  { id: "tanzania-luxury-fly-in", aud: V, title: "Tanzania Luxury Fly-in Safari", tier: "luxury", type: "Tanzania", from: 6200, img: IMG.lion,
    route: [R("Tarangire", 1), R("Serengeti", 4), R("Ngorongoro", 2)], extraInc: [] },
  { id: "serengeti-luxury-zanzibar", aud: V, title: "Serengeti Luxury & Zanzibar Beach", tier: "luxury", type: "Tanzania", from: 5900, img: IMG.snorkel,
    route: [R("Serengeti", 3), R("Ngorongoro", 1), R("Zanzibar", 4)], extraInc: [] },
  { id: "tanzania-safari-zanzibar-mid", aud: V, title: "Northern Circuit Safari & Zanzibar", tier: "mid", type: "Tanzania", from: 3600, img: IMG.snorkel,
    route: [R("Tarangire", 1), R("Lake Manyara", 1), R("Serengeti", 2), R("Ngorongoro", 1), R("Zanzibar", 4)], extraInc: ["Stone Town spice tour"] },
  { id: "kilimanjaro-machame", aud: V, title: "Kilimanjaro Machame Route Trek", tier: "mid", type: "Tanzania", from: 1900, img: IMG.elephant,
    route: [R("Mount Kilimanjaro", 6)], extraInc: [], custom: "kili" },
  { id: "zanzibar-escape", aud: V, title: "Zanzibar Beach & Stone Town Escape", tier: "mid", type: "Beach", from: 650, img: IMG.beach,
    route: [R("Zanzibar", 4)], extraInc: ["Spice farm tour"] },
  // ================= VISITORS: COMBOS =================
  { id: "kenya-tanzania-combo-mid", aud: V, title: "Kenya & Tanzania Safari with Zanzibar", tier: "mid", type: "Combo", from: 3300, img: IMG.elephant,
    route: [R("Maasai Mara", 2), R("Amboseli", 2), R("Serengeti", 2), R("Ngorongoro", 1), R("Zanzibar", 2)], extraInc: [] },
  { id: "kenya-tanzania-budget-combo", aud: V, title: "Kenya & Tanzania Budget Overland", tier: "budget", type: "Combo", from: 1450, img: IMG.zebra,
    route: [R("Maasai Mara", 2), R("Serengeti", 3), R("Ngorongoro", 1), R("Lake Manyara", 1)], extraInc: [] },

  // ================= RESIDENTS: SAFARI (Kenya, 3-day and short trips) =================
  { id: "mara-budget-camping", aud: RES, cat: "safari", title: "Maasai Mara Budget Camping Safari", tier: "budget", type: "Kenya", from: 300, img: IMG.mara,
    route: [R("Maasai Mara", 2)], extraInc: [] },
  { id: "tsavo-budget", aud: RES, cat: "safari", title: "Tsavo East & West Budget Safari", tier: "budget", type: "Kenya", from: 280, img: IMG.zebra,
    route: [R("Tsavo", 2)], extraInc: [] },
  { id: "nakuru-naivasha", aud: RES, cat: "safari", title: "Lake Nakuru & Naivasha Weekend", tier: "budget", type: "Kenya", from: 240, img: IMG.zebra,
    route: [R("Lake Nakuru", 2)], extraInc: ["Lake Naivasha boat ride to see hippos"] },
  { id: "amboseli-3day-mid", aud: RES, cat: "safari", title: "Amboseli 3-Day Safari", tier: "mid", type: "Kenya", from: 520, img: IMG.elephant,
    route: [R("Amboseli", 2)], extraInc: [] },
  { id: "mara-3day-mid", aud: RES, cat: "safari", title: "Maasai Mara 3-Day Lodge Safari", tier: "mid", type: "Kenya", from: 620, img: IMG.mara,
    route: [R("Maasai Mara", 2)], extraInc: [] },
  { id: "samburu-3day-mid", aud: RES, cat: "safari", title: "Samburu 3-Day Safari", tier: "mid", type: "Kenya", from: 640, img: IMG.zebra,
    route: [R("Samburu", 2)], extraInc: [] },
  { id: "mara-3day-luxury-fly", aud: RES, cat: "safari", title: "Maasai Mara 3-Day Fly-in Luxury", tier: "luxury", type: "Kenya", from: 1900, img: IMG.lion,
    route: [R("Maasai Mara", 2)], extraInc: [] },
  { id: "nakuru-mara-budget-4day", aud: RES, cat: "safari", title: "Nakuru & Maasai Mara 4-Day Budget Safari", tier: "budget", type: "Kenya", from: 430, img: IMG.mara,
    route: [R("Lake Nakuru", 1), R("Maasai Mara", 2)], extraInc: [] },
  { id: "mara-amboseli-resident", aud: RES, cat: "safari", title: "Maasai Mara & Amboseli Safari", tier: "mid", type: "Kenya", from: 760, img: IMG.elephant,
    route: [R("Maasai Mara", 2), R("Amboseli", 2)], extraInc: [] },
  // ================= RESIDENTS: BEACH =================
  { id: "diani-holiday", aud: RES, cat: "beach", title: "Diani Beach Holiday", tier: "budget", type: "Beach", from: 250, img: IMG.beach,
    route: [R("Diani", 3)], extraInc: [] },
  { id: "diani-5day-mid", aud: RES, cat: "beach", title: "Diani Beach 5-Day Getaway", tier: "mid", type: "Beach", from: 520, img: IMG.beach,
    route: [R("Diani", 4)], extraInc: ["Sunset dhow cruise"] },
  { id: "watamu-weekend", aud: RES, cat: "beach", title: "Watamu Weekend Escape", tier: "budget", type: "Beach", from: 260, img: IMG.snorkel,
    route: [R("Watamu", 2)], extraInc: [] },
  { id: "watamu-getaway", aud: RES, cat: "beach", title: "Watamu & Malindi Coast Getaway", tier: "mid", type: "Beach", from: 430, img: IMG.snorkel,
    route: [R("Watamu", 3)], extraInc: ["Glass-bottom boat and snorkelling in Watamu Marine National Park", "Gede Ruins (12th-century Swahili town)"] },
  { id: "diani-luxury-fly", aud: RES, cat: "beach", title: "Diani Luxury Beach Stay", tier: "luxury", type: "Beach", from: 1400, img: IMG.beach,
    route: [R("Diani", 4)], extraInc: [] },
  // ================= RESIDENTS: BEACH & SAFARI =================
  { id: "tsavo-diani-budget", aud: RES, cat: "beach-safari", title: "Tsavo Safari & Diani Beach", tier: "budget", type: "Kenya", from: 520, img: IMG.beach,
    route: [R("Tsavo", 2), R("Diani", 3)], extraInc: [] },
  { id: "amboseli-diani-mid", aud: RES, cat: "beach-safari", title: "Amboseli Safari & Diani Beach", tier: "mid", type: "Kenya", from: 720, img: IMG.elephant,
    route: [R("Amboseli", 1), R("Diani", 3)], extraInc: [] },
  { id: "safari-and-diani-mid", aud: RES, cat: "beach-safari", title: "Mara, Amboseli & Diani Beach", tier: "mid", type: "Kenya", from: 1250, img: IMG.beach,
    route: [R("Maasai Mara", 2), R("Amboseli", 2), R("Diani", 3)], extraInc: [] },
  { id: "samburu-watamu-mid", aud: RES, cat: "beach-safari", title: "Samburu Safari & Watamu Beach", tier: "mid", type: "Kenya", from: 1350, img: IMG.snorkel,
    route: [R("Samburu", 2), R("Watamu", 3)], extraInc: [] },
  { id: "mara-watamu-luxury", aud: RES, cat: "beach-safari", title: "Mara Fly-in Safari & Watamu Luxury", tier: "luxury", type: "Kenya", from: 3200, img: IMG.snorkel,
    route: [R("Maasai Mara", 2), R("Watamu", 3)], extraInc: [] },

  // ================= RESIDENTS: DUBAI (min. 8 days) =================
  { id: "dubai-budget", aud: RES, cat: "dubai", title: "Dubai Budget Explorer", tier: "budget", type: "Dubai", from: 950, img: IMG.dubai,
    route: [R("Dubai", 7)], extraInc: ["Evening desert safari with BBQ dinner and camel ride"] },
  { id: "dubai-city-break", aud: RES, cat: "dubai", title: "Dubai City & Desert Holiday", tier: "mid", type: "Dubai", from: 1150, img: IMG.dubai,
    route: [R("Dubai", 7)], extraInc: ["Evening desert safari with BBQ dinner and camel ride", "Burj Khalifa 'At The Top' observation deck"] },
  { id: "dubai-abu-dhabi", aud: RES, cat: "dubai", title: "Dubai & Abu Dhabi Combo", tier: "mid", type: "Dubai", from: 1450, img: IMG.dubai,
    route: [R("Dubai", 5), R("Abu Dhabi", 3)], extraInc: ["Evening desert safari with BBQ dinner and camel ride"] },
  { id: "dubai-zanzibar", aud: RES, cat: "dubai", title: "Dubai & Zanzibar Combo", tier: "mid", type: "Dubai", from: 1900, img: IMG.dubai,
    route: [R("Dubai", 4), R("Zanzibar", 4)], extraInc: ["Evening desert safari with BBQ dinner and camel ride"] },
  { id: "dubai-luxury", aud: RES, cat: "dubai", title: "Dubai Luxury Stay (Palm Jumeirah)", tier: "luxury", type: "Dubai", from: 3400, img: IMG.dubai,
    route: [R("Dubai", 7)], extraInc: [] },
  // ================= RESIDENTS: EUROPE (min. 8 days) =================
  { id: "europe-budget-tour", aud: RES, cat: "europe", title: "Budget Europe: Paris, Rome & Barcelona", tier: "budget", type: "Europe", from: 1900, img: IMG.rome,
    route: [R("Paris", 3), R("Rome", 3), R("Barcelona", 2)], extraInc: [] },
  { id: "paris-swiss-alps", aud: RES, cat: "europe", title: "Paris & Swiss Alps", tier: "mid", type: "Europe", from: 2650, img: IMG.paris,
    route: [R("Paris", 4), R("Swiss Alps", 3)], extraInc: ["Seine river cruise"] },
  { id: "paris-rome", aud: RES, cat: "europe", title: "Paris & Rome Classic", tier: "mid", type: "Europe", from: 2500, img: IMG.rome,
    route: [R("Paris", 4), R("Rome", 3)], extraInc: ["Seine river cruise"] },
  { id: "london-paris", aud: RES, cat: "europe", title: "London & Paris", tier: "mid", type: "Europe", from: 2900, img: IMG.london,
    route: [R("London", 4), R("Paris", 3)], extraInc: ["Seine river cruise"] },
  { id: "italy-switzerland", aud: RES, cat: "europe", title: "Italy & Switzerland", tier: "mid", type: "Europe", from: 2800, img: IMG.alps,
    route: [R("Rome", 4), R("Swiss Alps", 3)], extraInc: [] },
  { id: "barcelona-santorini", aud: RES, cat: "europe", title: "Barcelona & Santorini Summer", tier: "mid", type: "Europe", from: 2900, img: IMG.santorini,
    route: [R("Barcelona", 4), R("Santorini", 4)], extraInc: [] },
  { id: "capitals-london-paris-barcelona", aud: RES, cat: "europe", title: "London, Paris & Barcelona", tier: "mid", type: "Europe", from: 3100, img: IMG.paris,
    route: [R("London", 3), R("Paris", 3), R("Barcelona", 3)], extraInc: [] },
  { id: "rome-santorini-luxury", aud: RES, cat: "europe", title: "Rome & Santorini Luxury Romance", tier: "luxury", type: "Europe", from: 3300, img: IMG.santorini,
    route: [R("Rome", 4), R("Santorini", 4)], extraInc: [], flightsNote: "Rome to Santorini flight included" },
  // ================= RESIDENTS: ASIA (min. 8 days) =================
  { id: "thailand-budget", aud: RES, cat: "asia", title: "Thailand Budget: Bangkok, Chiang Mai & Phuket", tier: "budget", type: "Asia", from: 880, img: IMG.bangkok,
    route: [R("Bangkok", 3), R("Chiang Mai", 2), R("Phuket", 2)], extraInc: [] },
  { id: "thailand-bangkok-phuket", aud: RES, cat: "asia", title: "Bangkok & Phuket", tier: "mid", type: "Asia", from: 1250, img: IMG.thaibeach,
    route: [R("Bangkok", 3), R("Phuket", 4)], extraInc: [] },
  { id: "thailand-luxury", aud: RES, cat: "asia", title: "Thailand Luxury: Bangkok, Chiang Mai & Phuket", tier: "luxury", type: "Asia", from: 3400, img: IMG.thaibeach,
    route: [R("Bangkok", 3), R("Chiang Mai", 2), R("Phuket", 4)], extraInc: [] },
  { id: "bali-budget", aud: RES, cat: "asia", title: "Bali Budget Escape", tier: "budget", type: "Asia", from: 950, img: IMG.bali,
    route: [R("Bali", 7)], extraInc: [] },
  { id: "bali-mid", aud: RES, cat: "asia", title: "Bali Temples, Beaches & Rice Terraces", tier: "mid", type: "Asia", from: 1400, img: IMG.bali,
    route: [R("Bali", 7)], extraInc: ["Mount Batur sunrise trek"] },
  { id: "bali-luxury", aud: RES, cat: "asia", title: "Bali Luxury Villa Retreat", tier: "luxury", type: "Asia", from: 3000, img: IMG.bali,
    route: [R("Bali", 7)], extraInc: [] },
  { id: "singapore-kl-budget", aud: RES, cat: "asia", title: "Singapore & Kuala Lumpur Budget", tier: "budget", type: "Asia", from: 1250, img: IMG.singapore,
    route: [R("Singapore", 3), R("Kuala Lumpur", 4)], extraInc: [] },
  { id: "malaysia-mid", aud: RES, cat: "asia", title: "Malaysia: Kuala Lumpur & Langkawi", tier: "mid", type: "Asia", from: 1300, img: IMG.kl,
    route: [R("Kuala Lumpur", 3), R("Langkawi", 4)], extraInc: [] },
  { id: "singapore-malaysia-mid", aud: RES, cat: "asia", title: "Singapore, Kuala Lumpur & Langkawi", tier: "mid", type: "Asia", from: 1900, img: IMG.singapore,
    route: [R("Singapore", 3), R("Kuala Lumpur", 3), R("Langkawi", 2)], extraInc: [] },
  { id: "singapore-bali-mid", aud: RES, cat: "asia", title: "Singapore & Bali", tier: "mid", type: "Asia", from: 1900, img: IMG.bali,
    route: [R("Singapore", 3), R("Bali", 4)], extraInc: [] },
  { id: "southeast-asia-grand", aud: RES, cat: "asia", title: "Grand South-East Asia: Bangkok, Singapore & Bali", tier: "mid", type: "Asia", from: 2600, img: IMG.bangkok,
    route: [R("Bangkok", 3), R("Singapore", 3), R("Bali", 3)], extraInc: [] },
  { id: "singapore-bali-luxury", aud: RES, cat: "asia", title: "Singapore & Bali Luxury", tier: "luxury", type: "Asia", from: 4300, img: IMG.singapore,
    route: [R("Singapore", 3), R("Bali", 5)], extraInc: [] },
  { id: "china-budget", aud: RES, cat: "asia", title: "China Budget: Beijing & Shanghai", tier: "budget", type: "Asia", from: 1500, img: IMG.china,
    route: [R("Beijing", 4), R("Shanghai", 3)], extraInc: [] },
  { id: "china-classic-mid", aud: RES, cat: "asia", title: "China Classic: Beijing & Shanghai", tier: "mid", type: "Asia", from: 2100, img: IMG.china,
    route: [R("Beijing", 4), R("Shanghai", 3)], extraInc: [] },
  { id: "china-luxury", aud: RES, cat: "asia", title: "China Luxury: Beijing & Shanghai", tier: "luxury", type: "Asia", from: 4200, img: IMG.shanghai,
    route: [R("Beijing", 4), R("Shanghai", 4)], extraInc: [] },
  // ================= NEW: family, group and couples trips =================
  { id: "family-mara-nakuru-diani", aud: V, title: "Family Safari & Beach: Nakuru, Mara & Diani", tier: "mid", type: "Kenya", from: 1650, img: IMG.beach,
    route: [R("Lake Nakuru", 1), R("Maasai Mara", 2), R("Diani", 3)], extraInc: [] },
  { id: "family-zanzibar-beach", aud: V, title: "Zanzibar Family Beach Holiday", tier: "mid", type: "Beach", from: 780, img: IMG.snorkel,
    route: [R("Zanzibar", 5)], extraInc: ["Spice farm tour", "Prison Island giant tortoise visit"] },
  { id: "family-diani-week", aud: RES, cat: "beach", title: "Diani Family Beach Week", tier: "mid", type: "Beach", from: 700, img: IMG.beach,
    route: [R("Diani", 6)], extraInc: ["Colobus Monkey Trust visit"] },
  { id: "dubai-family-fun", aud: RES, cat: "dubai", title: "Dubai Family Fun", tier: "mid", type: "Dubai", from: 1300, img: IMG.dubai,
    route: [R("Dubai", 7)], extraInc: ["Palm Jumeirah and Atlantis Aquaventure", "Burj Khalifa 'At The Top' observation deck", "Evening desert safari with BBQ dinner and camel ride"] },
  { id: "singapore-family-adventure", aud: RES, cat: "asia", title: "Singapore Family Adventure", tier: "mid", type: "Asia", from: 1900, img: IMG.singapore,
    route: [R("Singapore", 7)], extraInc: ["Sentosa Island and Universal Studios", "Night Safari"] },
  { id: "group-safari-tsavo-amboseli-mara", aud: RES, cat: "safari", title: "Group Safari: Tsavo, Amboseli & Mara", tier: "budget", type: "Kenya", from: 560, img: IMG.zebra,
    route: [R("Tsavo", 1), R("Amboseli", 1), R("Maasai Mara", 2)], extraInc: [] },
  { id: "group-tanzania-safari", aud: V, title: "Tanzania Group Safari: Tarangire, Serengeti & Ngorongoro", tier: "budget", type: "Tanzania", from: 1300, img: IMG.zebra,
    route: [R("Tarangire", 1), R("Serengeti", 3), R("Ngorongoro", 1)], extraInc: [] },
  { id: "group-diani-friends", aud: RES, cat: "beach", title: "Friends' Beach Getaway in Diani", tier: "budget", type: "Beach", from: 330, img: IMG.beach,
    route: [R("Diani", 4)], extraInc: [] },
  { id: "group-thailand-bangkok-phuket", aud: RES, cat: "asia", title: "Group Thailand: Bangkok & Phuket", tier: "budget", type: "Asia", from: 980, img: IMG.thaibeach,
    route: [R("Bangkok", 3), R("Phuket", 4)], extraInc: [] },
  { id: "group-europe-tour", aud: RES, cat: "europe", title: "Group Europe Tour: Paris, Rome & Alps", tier: "budget", type: "Europe", from: 2100, img: IMG.alps,
    route: [R("Paris", 3), R("Rome", 3), R("Swiss Alps", 2)], extraInc: [] },
  { id: "honeymoon-serengeti-zanzibar", aud: V, title: "Honeymoon: Serengeti Safari & Zanzibar", tier: "mid", type: "Tanzania", from: 2700, img: IMG.snorkel,
    route: [R("Serengeti", 2), R("Zanzibar", 4)], extraInc: ["Sunset dhow cruise"] },
  { id: "santorini-honeymoon-luxury", aud: RES, cat: "europe", title: "Santorini Honeymoon", tier: "luxury", type: "Europe", from: 3600, img: IMG.santorini,
    route: [R("Santorini", 7)], extraInc: [] },
  { id: "paris-romance", aud: RES, cat: "europe", title: "Paris Romance", tier: "mid", type: "Europe", from: 2400, img: IMG.paris,
    route: [R("Paris", 7)], extraInc: ["Seine river cruise"] },
  { id: "langkawi-bali-romance", aud: RES, cat: "asia", title: "Romantic Langkawi & Bali", tier: "luxury", type: "Asia", from: 4000, img: IMG.bali,
    route: [R("Langkawi", 4), R("Bali", 4)], extraInc: [] },
  { id: "watamu-romantic-luxury", aud: RES, cat: "beach", title: "Romantic Watamu Luxury Escape", tier: "luxury", type: "Beach", from: 1350, img: IMG.snorkel,
    route: [R("Watamu", 3)], extraInc: [] },
  // ================= NEW: more Zanzibar =================
  { id: "zanzibar-weekend-resident", aud: RES, cat: "beach", title: "Zanzibar Weekend Escape", tier: "mid", type: "Beach", from: 430, img: IMG.beach,
    route: [R("Zanzibar", 2)], extraInc: ["Stone Town walking tour (UNESCO World Heritage)"] },
  { id: "zanzibar-budget-resident", aud: RES, cat: "beach", title: "Zanzibar Budget Beach Break", tier: "budget", type: "Beach", from: 480, img: IMG.beach,
    route: [R("Zanzibar", 4)], extraInc: [] },
  { id: "zanzibar-stonetown-family-resident", aud: RES, cat: "beach", title: "Zanzibar Beach & Stone Town Family Holiday", tier: "mid", type: "Beach", from: 780, img: IMG.snorkel,
    route: [R("Zanzibar", 5)], extraInc: ["Spice farm tour", "Prison Island giant tortoise visit"] },
  { id: "zanzibar-adventure-week-resident", aud: RES, cat: "beach", title: "Zanzibar Adventure Week: Snorkel & Kitesurf", tier: "mid", type: "Beach", from: 900, img: IMG.snorkel,
    route: [R("Zanzibar", 6)], extraInc: ["Mnemba Atoll snorkelling", "Kitesurfing at Paje"] },
  { id: "zanzibar-luxury-villa-resident", aud: RES, cat: "beach", title: "Zanzibar Luxury Beach Retreat", tier: "luxury", type: "Beach", from: 2200, img: IMG.beach,
    route: [R("Zanzibar", 5)], extraInc: [] },
  { id: "zanzibar-honeymoon-resident", aud: RES, cat: "beach", title: "Zanzibar Honeymoon", tier: "luxury", type: "Beach", from: 2900, img: IMG.snorkel,
    route: [R("Zanzibar", 6)], extraInc: [] },
  { id: "zanzibar-budget-visitor", aud: V, title: "Zanzibar Budget Beach Week", tier: "budget", type: "Beach", from: 520, img: IMG.beach,
    route: [R("Zanzibar", 5)], extraInc: ["Stone Town walking tour (UNESCO World Heritage)"] },
  { id: "zanzibar-snorkel-week-visitor", aud: V, title: "Zanzibar Snorkel & Dhow Week", tier: "mid", type: "Beach", from: 1100, img: IMG.snorkel,
    route: [R("Zanzibar", 6)], extraInc: ["Mnemba Atoll snorkelling", "Sunset dhow cruise"] },
  { id: "zanzibar-luxury-villa-visitor", aud: V, title: "Zanzibar Luxury Villa Escape", tier: "luxury", type: "Beach", from: 2400, img: IMG.beach,
    route: [R("Zanzibar", 6)], extraInc: [] },
  { id: "manyara-ngorongoro-zanzibar", aud: V, title: "Short Safari & Zanzibar: Manyara, Ngorongoro & Beach", tier: "mid", type: "Tanzania", from: 2400, img: IMG.zebra,
    route: [R("Lake Manyara", 1), R("Ngorongoro", 1), R("Zanzibar", 4)], extraInc: ["Spice farm tour"] },
  { id: "ngorongoro-zanzibar-luxury", aud: V, title: "Ngorongoro Luxury & Zanzibar Beach", tier: "luxury", type: "Tanzania", from: 4200, img: IMG.snorkel,
    route: [R("Ngorongoro", 2), R("Zanzibar", 4)], extraInc: [] },
  { id: "mara-zanzibar-mid", aud: V, title: "Maasai Mara Safari & Zanzibar Beach", tier: "mid", type: "Combo", from: 2100, img: IMG.mara,
    route: [R("Maasai Mara", 3), R("Zanzibar", 4)], extraInc: [] }
];
PACKAGES.forEach(p => {
  p.days = p.route.reduce((a, r) => a + r.n, 0) + 1;
  p.dest = p.route[0].d;
  p.multi = p.route.length > 1;
  p.safari = p.route.some(r => SAFARI.has(r.d) || r.d === "Mount Kilimanjaro");
  p.resident = p.aud === RES;
  p.outbound = p.resident && (["dubai", "europe", "asia"].includes(p.cat) || p.route[0].d === "Zanzibar");
  p.flights = p.tier === "luxury" && !p.outbound && !p.route.every(r => r.d === "Zanzibar") && (p.safari || p.route.some(r => BEACH.has(r.d)))
    || !!p.flightsNote;
});

// ---------- Tier-based inclusions: Budget, Mid-range, Luxury ----------
const isDomesticRes = p => p.resident && !p.outbound;
// Any package that is not purely Kenyan includes the return international flights, at every level.
const KENYA_DESTS = new Set(["Maasai Mara", "Amboseli", "Tsavo", "Samburu", "Lake Nakuru", "Diani", "Watamu"]);
const intlFlightsIncluded = p => !isDomesticRes(p) && p.route.some(r => !KENYA_DESTS.has(r.d));
const flightsIncl = p => !isDomesticRes(p) && (p.tier === "luxury" || intlFlightsIncluded(p));
const flightLine = p => p.resident ? "Return international flights from Nairobi (economy; business-class upgrade on request)" : "Return international flights from your home airport (economy; business-class upgrade on request)";
const TIER_STYLE = {
  budget: { name: "Smart Essentials", line: "We cover the core of your trip (stay, transport, listed meals and fees) so you keep control of the extras." },
  mid: { name: "Comfort Plus", line: "The essentials plus comfort upgrades: private service, daily water, Wi-Fi and a planning call." },
  luxury: { name: "White-Glove Service", line: "Flights, door-to-door pick-up, insurance, visa help, tips and a personal concierge are all taken care of." }
};
// What each level adds to the base trip.
function tierInc(p) {
  const dom = isDomesticRes(p), t = p.tier;
  const wild = p.safari || p.route.some(r => BEACH.has(r.d));
  if (t === "budget") return [...(intlFlightsIncluded(p) ? [flightLine(p)] : []), "Pre-trip WhatsApp support and a trip briefing"];
  if (t === "mid") return [...(intlFlightsIncluded(p) ? [flightLine(p)] : []), "Bottled water every day", "Free Wi-Fi where the hotel or lodge offers it", "Welcome drink on arrival", "Pre-trip planning call with a travel specialist"];
  const L = [];
  if (!dom) L.push(p.resident ? "Return international airfare from Nairobi (economy; business-class upgrade on request)" : "Return international airfare from your home airport (economy; business-class upgrade on request)");
  L.push(p.resident ? "Private chauffeur pick-up from your home and drop-off at the end of the trip" : "Door-to-door service: we arrange your pick-up from home to your departure airport (selected cities), VIP meet-and-greet on arrival");
  if (!dom) L.push("Airport lounge access and priority baggage handling");
  L.push("Travel and medical insurance included");
  if (!dom) L.push("Visa assistance and application handling");
  L.push("All tips and gratuities included");
  L.push(wild ? "Premium drinks with meals at your camp or resort" : "Welcome gift and daily turndown at your hotel");
  L.push("24/7 personal trip concierge on WhatsApp");
  return L;
}
// What each level leaves for the traveller to arrange or pay.
function tierExc(p) {
  const dom = isDomesticRes(p), t = p.tier;
  if (t === "luxury") return [...(dom ? [] : ["Government visa and entry fees (we handle the paperwork)"]), "Personal shopping and souvenirs", "Activities not marked as included", "Special-occasion extras (private dinners, photographers) unless requested", "Rare vintage wines and top-shelf spirits"];
  const x = [];
  if (!dom && !intlFlightsIncluded(p)) x.push("International flights (airfare)");
  x.push("Travel and medical insurance");
  if (!dom) x.push("Visas and entry permits");
  if (t === "budget") x.push("Drinks (water, soft drinks, alcohol) unless stated", "Tips for guides, drivers and staff", "Meals not listed in the itinerary", "Laundry, phone and Wi-Fi", "Single-room supplement", "Baggage and airport fees", "Optional activities");
  else x.push("Premium drinks and minibar", "Tips for guides, drivers and staff", "Laundry and personal items", "Optional activities");
  return x;
}
// Short included / not-included summary shown on package cards.
function pkgIncSummary(p) {
  const n = p.days - 1, first = p.route[0].d, dom = isDomesticRes(p), t = p.tier;
  const mealTxt = p.custom === "kili" ? "Full board"
    : SAFARI.has(first) ? "Full board"
    : BEACH.has(first) ? (t === "luxury" ? "Full board" : first === "Watamu" ? "Half board" : "Breakfast")
    : "Breakfast";
  const inc = [`${n} night${n > 1 ? "s" : ""} accommodation`, mealTxt];
  if (t !== "luxury" && intlFlightsIncluded(p)) inc.push("Return international flights");
  if (t === "budget") inc.push(p.safari ? "Park fees and transfers" : "Transfers and sightseeing", "Trip briefing and WhatsApp support");
  else if (t === "mid") inc.push(p.safari ? "Park fees, private vehicle" : "Private transfers", "Daily water and Wi-Fi");
  else {
    if (!dom) inc.push("Return airfare");
    inc.push(p.resident ? "Chauffeur pick-up from home" : "Door-to-door chauffeur", "Insurance, visa help and tips");
    if (p.flights) inc.push(p.flightsNote || "Internal flights");
  }
  let exc;
  if (t === "luxury") exc = ["Personal shopping", "Unlisted activities", "Special-occasion extras"];
  else if (t === "mid") exc = [...(dom ? [] : [...(intlFlightsIncluded(p) ? [] : ["International flights"]), "Visa"]), "Travel insurance", "Premium drinks", "Tips"];
  else exc = [...(dom ? [] : [...(intlFlightsIncluded(p) ? [] : ["International flights"]), "Visa"]), "Travel insurance", "Drinks and tips", "Optional activities"];
  return { inc: inc.slice(0, 5), exc: exc.slice(0, 5) };
}
const incBlock = p => {
  const s = pkgIncSummary(p);
  return `<div class="incmini"><div><b>✓ Included</b>${s.inc.map(x => `<span>${x}</span>`).join("")}</div><div class="no"><b>✕ Not included</b>${s.exc.map(x => `<span>${x}</span>`).join("")}</div></div>`;
};

// ---------- travel style: family / group / couples ----------
const STYLE_INFO = {
  family: { label: "Family travel", icon: "smile", blurb: "Kid-friendly pace, pools and relaxed days." },
  group: { label: "Group travel", icon: "users", blurb: "Great for friends, teams and larger parties sharing costs." },
  couples: { label: "Couples getaway", icon: "heart", blurb: "Romantic settings and quieter, private moments." }
};
const STYLE = {
  "mara-great-migration": "group", "mara-migration-fly-in": "couples", "mara-amboseli-budget": "group", "mara-amboseli-mid": "family",
  "kenya-classic": "family", "samburu-mara-mid": "couples", "kenya-luxury-samburu-mara": "couples", "tsavo-amboseli-budget": "group",
  "kenya-safari-diani-visitors": "family", "kenya-luxury-beach": "couples", "diani-escape-visitors": "couples",
  "serengeti-camping": "group", "tarangire-manyara-ngorongoro": "family", "northern-circuit-lodge": "family", "tanzania-luxury-fly-in": "couples",
  "serengeti-luxury-zanzibar": "couples", "tanzania-safari-zanzibar-mid": "couples", "kilimanjaro-machame": "group", "zanzibar-escape": "couples",
  "kenya-tanzania-combo-mid": "family", "kenya-tanzania-budget-combo": "group",
  "mara-budget-camping": "group", "tsavo-budget": "group", "nakuru-naivasha": "family", "amboseli-3day-mid": "family", "mara-3day-mid": "couples",
  "samburu-3day-mid": "couples", "mara-3day-luxury-fly": "couples", "nakuru-mara-budget-4day": "group", "mara-amboseli-resident": "family",
  "diani-holiday": "family", "diani-5day-mid": "family", "watamu-weekend": "couples", "watamu-getaway": "couples", "diani-luxury-fly": "couples",
  "tsavo-diani-budget": "group", "amboseli-diani-mid": "family", "safari-and-diani-mid": "family", "samburu-watamu-mid": "couples", "mara-watamu-luxury": "couples",
  "dubai-budget": "group", "dubai-city-break": "family", "dubai-abu-dhabi": "family", "dubai-zanzibar": "couples", "dubai-luxury": "couples",
  "europe-budget-tour": "group", "paris-swiss-alps": "family", "paris-rome": "couples", "london-paris": "family", "italy-switzerland": "family",
  "barcelona-santorini": "couples", "capitals-london-paris-barcelona": "group", "rome-santorini-luxury": "couples",
  "thailand-budget": "group", "thailand-bangkok-phuket": "family", "thailand-luxury": "couples", "bali-budget": "group", "bali-mid": "couples", "bali-luxury": "couples",
  "singapore-kl-budget": "group", "malaysia-mid": "couples", "singapore-malaysia-mid": "family", "singapore-bali-mid": "couples", "southeast-asia-grand": "group",
  "singapore-bali-luxury": "couples", "china-budget": "group", "china-classic-mid": "group", "china-luxury": "couples",
  "family-mara-nakuru-diani": "family", "family-zanzibar-beach": "family", "family-diani-week": "family", "dubai-family-fun": "family", "singapore-family-adventure": "family",
  "group-safari-tsavo-amboseli-mara": "group", "group-tanzania-safari": "group", "group-diani-friends": "group", "group-thailand-bangkok-phuket": "group", "group-europe-tour": "group",
  "honeymoon-serengeti-zanzibar": "couples", "zanzibar-weekend-resident": "couples", "zanzibar-budget-resident": "group", "zanzibar-stonetown-family-resident": "family", "zanzibar-adventure-week-resident": "group", "zanzibar-luxury-villa-resident": "couples", "zanzibar-honeymoon-resident": "couples", "zanzibar-budget-visitor": "group", "zanzibar-snorkel-week-visitor": "family", "zanzibar-luxury-villa-visitor": "couples", "manyara-ngorongoro-zanzibar": "family", "ngorongoro-zanzibar-luxury": "couples", "mara-zanzibar-mid": "couples", "santorini-honeymoon-luxury": "couples", "paris-romance": "couples", "langkawi-bali-romance": "couples", "watamu-romantic-luxury": "couples"
};
PACKAGES.forEach(p => { p.style = STYLE[p.id] || (p.tier === "budget" ? "group" : "couples"); });
const styleBadge = p => `<span class="sty ${p.style}">${ic(STYLE_INFO[p.style].icon, 13)} ${STYLE_INFO[p.style].label}</span>`;

// ---------- Real photos (images/kt) for Kenya and Tanzania packages ----------
// The hero on a package page and its card both read p.img, so they always show the same photo.
const KT = f => "/images/kt/" + f;
const PKG_IMG = {
  // visitors: Kenya
  "mara-great-migration": "2.jpg", "mara-migration-fly-in": "29.jpg", "mara-amboseli-budget": "14.webp", "mara-amboseli-mid": "21.jpeg",
  "kenya-classic": "22.webp", "samburu-mara-mid": "13.jpg", "kenya-luxury-samburu-mara": "11.jpg", "tsavo-amboseli-budget": "10.jpg",
  "kenya-safari-diani-visitors": "23.webp", "kenya-luxury-beach": "32.jfif", "diani-escape-visitors": "34.jpeg",
  // visitors: Tanzania
  "serengeti-camping": "12.webp", "tarangire-manyara-ngorongoro": "tarangire-national-park-tanzania-national-parks-nasikia-camps-game-drives-tours-tanzania-safaris-africa-elephants.jpg",
  "northern-circuit-lodge": "52.jpg", "tanzania-luxury-fly-in": "61.webp", "serengeti-luxury-zanzibar": "safari-serengeti-national-park.jpg",
  "tanzania-safari-zanzibar-mid": "30.jpg", "kilimanjaro-machame": "4.jpg", "zanzibar-escape": "48.webp",
  // combos
  "kenya-tanzania-combo-mid": "15.jpg", "kenya-tanzania-budget-combo": "5.jpg",
  // residents: safari
  "mara-budget-camping": "3.webp", "tsavo-budget": "1.jpg", "nakuru-naivasha": "38.jpg", "amboseli-3day-mid": "4.jpg", "mara-3day-mid": "20.jpg",
  "samburu-3day-mid": "56.jpg", "mara-3day-luxury-fly": "49.webp", "nakuru-mara-budget-4day": "26.jpg", "mara-amboseli-resident": "7.jpg",
  // residents: beach
  "diani-holiday": "37.avif", "diani-5day-mid": "33.jpg", "watamu-weekend": "36.webp", "watamu-getaway": "35.jpg", "diani-luxury-fly": "33.jpg",
  // residents: beach & safari
  "tsavo-diani-budget": "27.jpg", "amboseli-diani-mid": "18.jpg", "safari-and-diani-mid": "19.jpg", "samburu-watamu-mid": "54.jpg", "mara-watamu-luxury": "51.jpg",
  // new family / group / couples
  "family-mara-nakuru-diani": "41.jpg", "family-zanzibar-beach": "47.jpg", "family-diani-week": "37.avif", "group-safari-tsavo-amboseli-mara": "45.jpg",
  "group-tanzania-safari": "6.webp", "group-diani-friends": "34.jpeg", "honeymoon-serengeti-zanzibar": "31.jpg", "watamu-romantic-luxury": "36.webp",
  // Zanzibar
  "zanzibar-weekend-resident": "48.webp", "zanzibar-budget-resident": "47.jpg", "zanzibar-stonetown-family-resident": "47.jpg",
  "zanzibar-adventure-week-resident": "35.jpg", "zanzibar-luxury-villa-resident": "48.webp", "zanzibar-honeymoon-resident": "47.jpg",
  "zanzibar-budget-visitor": "48.webp", "zanzibar-snorkel-week-visitor": "35.jpg", "zanzibar-luxury-villa-visitor": "47.jpg",
  "manyara-ngorongoro-zanzibar": "25.jpg", "ngorongoro-zanzibar-luxury": "39.webp", "mara-zanzibar-mid": "28.jpg"
};
PACKAGES.forEach(p => { if (PKG_IMG[p.id]) p.img = KT(PKG_IMG[p.id]); });
// destination cards in Kenya / Tanzania use the same real photos
const DEST_IMG = { "Maasai Mara": "29.jpg", "Amboseli": "4.jpg", "Tsavo East & West": "1.jpg", "Samburu": "56.jpg", "Lake Nakuru": "38.jpg", "Diani Beach": "33.jpg", "Watamu": "36.webp",
  "Serengeti": "52.jpg", "Ngorongoro Crater": "39.webp", "Lake Manyara": "25.jpg", "Tarangire": "tarangire-national-park-tanzania-national-parks-nasikia-camps-game-drives-tours-tanzania-safaris-africa-elephants.jpg", "Mount Kilimanjaro": "30.jpg", "Zanzibar": "47.jpg" };
DESTINATIONS.forEach(d => { if (DEST_IMG[d.name]) d.img = KT(DEST_IMG[d.name]); });

// ---------- Real photos (images/asia) for Thailand, Indonesia, Singapore, Malaysia and China packages ----------
const AS = f => "/images/asia/" + f;
const ASIA_PKG_IMG = {
  "thailand-budget": "thailand-5.jpg", "thailand-bangkok-phuket": "thailand-6.webp", "thailand-luxury": "thailand-4.webp",
  "group-thailand-bangkok-phuket": "thailand.jpg", "southeast-asia-grand": "thailand-3.jpg",
  "bali-budget": "indonesia-5.jpg", "bali-mid": "indonesia-7.webp", "bali-luxury": "indonesia-6.jpg", "langkawi-bali-romance": "indonesia.webp",
  "singapore-kl-budget": "singapore-2.jpg", "singapore-malaysia-mid": "singapore.webp", "singapore-bali-mid": "singapore-5.webp",
  "singapore-bali-luxury": "singapore-4.avif", "singapore-family-adventure": "singapore-7.jfif",
  "malaysia-mid": "malaysia.webp",
  "china-budget": "china.jpg", "china-classic-mid": "china-3.jpg", "china-luxury": "china-2.webp"
};
PACKAGES.forEach(p => { if (ASIA_PKG_IMG[p.id]) p.img = AS(ASIA_PKG_IMG[p.id]); });
const ASIA_DEST_IMG = { "Bangkok": "thailand.jpg", "Chiang Mai": "thailand-4.webp", "Phuket": "thailand-6.webp", "Bali": "indonesia-7.webp", "Singapore": "singapore.webp",
  "Kuala Lumpur": "malaysia.webp", "Beijing": "china.jpg", "Shanghai": "china-2.webp" };
DESTINATIONS.forEach(d => { if (ASIA_DEST_IMG[d.name]) d.img = AS(ASIA_DEST_IMG[d.name]); });

// ---------- Real photos (images/europe) for the Europe packages ----------
const EU = f => "/images/europe/" + f;
const EUROPE_PKG_IMG = {
  "europe-budget-tour": "france-5.avif", "paris-swiss-alps": "france.webp", "paris-rome": "france-7.webp", "london-paris": "uk.jpg",
  "italy-switzerland": "italy-2.avif", "barcelona-santorini": "spain.jpg", "capitals-london-paris-barcelona": "uk-2.jpg",
  "rome-santorini-luxury": "italy-4.webp", "group-europe-tour": "france-3.webp", "santorini-honeymoon-luxury": "greece-3.webp", "paris-romance": "france-5.jpg"
};
PACKAGES.forEach(p => { if (EUROPE_PKG_IMG[p.id]) p.img = EU(EUROPE_PKG_IMG[p.id]); });
const EU_DEST_IMG = { "Paris": "france.webp", "Santorini": "greece-3.webp", "Swiss Alps": "switzerland.jpg", "Barcelona": "spain.jpg", "London": "uk.jpg" };
DESTINATIONS.forEach(d => { if (EU_DEST_IMG[d.name]) d.img = EU(EU_DEST_IMG[d.name]); });

// ---------- Real photos (images/uae) for the Dubai and Abu Dhabi packages ----------
const UAE = f => "/images/uae/" + f;
const UAE_PKG_IMG = {
  "dubai-budget": "dubai-2.jpg", "dubai-city-break": "dubai-4.webp", "dubai-abu-dhabi": "abu-dhabi.webp",
  "dubai-zanzibar": "dubai.webp", "dubai-luxury": "dubai-4.avif", "dubai-family-fun": "dubai-6.jpg"
};
PACKAGES.forEach(p => { if (UAE_PKG_IMG[p.id]) p.img = UAE(UAE_PKG_IMG[p.id]); });
DESTINATIONS.forEach(d => { if (d.name === "Dubai") d.img = UAE("dubai.jpg"); if (d.name === "Abu Dhabi") d.img = UAE("abu-dhabi.webp"); });


// ===== countries.js =====
// Countries we offer. `dests` are destination keys used in STAYS / ACT / PACKAGES routes.
const COUNTRIES = [
  { slug: "kenya", name: "Kenya", group: "East Africa", img: IMG.mara,
    tagline: "The home of the safari, and the Indian Ocean coast",
    dests: ["Maasai Mara", "Amboseli", "Tsavo", "Samburu", "Lake Nakuru", "Diani", "Watamu"],
    overview: [
      "Kenya is where the modern safari began. Its savannahs, lakes and mountains are home to lion, leopard, cheetah, elephant and rhino, and every year the Great Migration of wildebeest and zebra crosses the Mara River into the Maasai Mara between roughly July and October.",
      "Beyond the parks, Kenya has a long Indian Ocean coastline of white beaches and coral reefs at Diani and Watamu, and a lively capital in Nairobi. It is easy to combine a few days on safari with a few days on the beach."
    ],
    facts: [["Capital", "Nairobi"], ["Currency", "Kenyan shilling (KES)"], ["Languages", "Swahili and English"], ["Best time", "July–October and January–February"], ["Entry", "Most visitors need an eTA before travelling. Check for your passport."]],
    known: [["🦁", "The Big Five", "Lion, leopard, elephant, buffalo and rhino, all found in Kenya's parks."], ["🦓", "Great Migration", "Over a million wildebeest and zebra cross the Mara River each year."], ["🏔", "Kilimanjaro views", "Amboseli's elephants walk under Africa's highest peak."], ["🏖", "Coastal beaches", "Diani and Watamu offer white sand, reefs and dhow trips."], ["🧑🏾‍🤝‍🧑🏽", "Maasai and Samburu culture", "Visit communities and learn about traditions."], ["☕", "Tea and coffee", "Some of the world's best, grown in the highlands."]],
    tips: ["Pack neutral-coloured clothing, a hat, sun cream and a warm layer for early game drives.", "Malaria tablets are recommended for most areas. Ask your doctor.", "Tipping is customary for driver-guides and lodge staff.", "Roads to some parks are long. Fly-in options save time."] },
  { slug: "tanzania", name: "Tanzania", group: "East Africa", img: IMG.lion,
    tagline: "Serengeti plains, Ngorongoro Crater, Kilimanjaro and Zanzibar",
    dests: ["Serengeti", "Ngorongoro", "Lake Manyara", "Tarangire", "Mount Kilimanjaro", "Zanzibar"],
    overview: [
      "Tanzania holds some of Africa's most famous wildlife areas. The Serengeti's endless plains follow the migration all year, the Ngorongoro Crater is a natural wildlife enclosure, and Tarangire and Lake Manyara add elephants, baobabs and tree-climbing lions.",
      "It is also home to Mount Kilimanjaro, the highest mountain in Africa, and the spice island of Zanzibar, where Stone Town's heritage and turquoise beaches make a natural end to a safari."
    ],
    facts: [["Capital", "Dodoma (largest city: Dar es Salaam)"], ["Currency", "Tanzanian shilling (TZS)"], ["Languages", "Swahili and English"], ["Best time", "June–October, and January–March for calving"], ["Entry", "Most visitors need an e-visa. Check for your passport."]],
    known: [["🌾", "The Serengeti", "Vast plains and the largest overland animal migration on earth."], ["🌋", "Ngorongoro Crater", "A UNESCO World Heritage caldera packed with wildlife."], ["⛰", "Mount Kilimanjaro", "Africa's highest peak at 5,895 m, open to non-technical trekkers."], ["🏝", "Zanzibar", "Spice farms, Stone Town and beaches with clear water."], ["🐘", "Tarangire's elephants", "Huge herds among ancient baobab trees in the dry season."], ["🦩", "Lake Manyara", "Flamingos, tree-climbing lions and a lush groundwater forest."]],
    tips: ["Most northern-circuit safaris start in Arusha or at Kilimanjaro Airport.", "Bring a warm jacket for the Ngorongoro rim, which can be cold.", "Carry small US dollar notes for tips and small purchases.", "Zanzibar is a mostly Muslim island: dress modestly in Stone Town."] },
  { slug: "uae", name: "United Arab Emirates", short: "UAE (Dubai)", group: "Middle East", img: IMG.dubai,
    tagline: "Dubai skyline, desert dunes and Abu Dhabi culture",
    dests: ["Dubai", "Abu Dhabi"],
    overview: [
      "Dubai is a modern city of record-breaking towers, huge shopping malls, city beaches and old-town souks. Its desert safaris, sunset dune drives and Burj Khalifa views are the classic first-time highlights.",
      "Abu Dhabi, about 1.5 hours away by road, adds the Sheikh Zayed Grand Mosque, the Louvre Abu Dhabi and Yas Island. Dubai is also a convenient stopover between East Africa and the rest of the world."
    ],
    facts: [["Capital", "Abu Dhabi"], ["Currency", "UAE dirham (AED)"], ["Languages", "Arabic; English is widely spoken"], ["Best time", "November–March (summer is very hot)"], ["Entry", "Visa rules depend on your passport. Check before travelling."]],
    known: [["🏙", "Burj Khalifa", "The world's tallest building, with observation decks."], ["🐪", "Desert safaris", "Dune driving, camel rides and BBQ dinners under the stars."], ["🛍", "Shopping", "Dubai Mall, gold and spice souks, and big seasonal sales."], ["🕌", "Sheikh Zayed Grand Mosque", "One of the world's largest mosques, in Abu Dhabi."], ["🏝", "Palm Jumeirah", "An artificial island with beach resorts and Atlantis."], ["🍽", "Food", "From street shawarma to top international restaurants."]],
    tips: ["Dress modestly in malls, mosques and old town areas.", "Summer (June–September) is very hot: plan for indoor attractions.", "Hotels charge a per-night Tourism Dirham fee, paid at check-in.", "Alcohol is served only in licensed venues such as hotels."] },
  { slug: "france", name: "France", group: "Europe", img: IMG.paris,
    tagline: "Paris, cafés and the Eiffel Tower",
    dests: ["Paris"],
    overview: ["France's capital is a city of wide boulevards, museums and cafés. Take a Seine cruise, climb the Eiffel Tower, see the Mona Lisa at the Louvre and walk the artists' streets of Montmartre.", "Paris pairs easily with Switzerland or Italy by rail, and we combine it with them in our European packages."],
    facts: [["Capital", "Paris"], ["Currency", "Euro (EUR)"], ["Language", "French"], ["Best time", "April–June and September–October"], ["Entry", "Schengen area. Check visa rules for your passport."]],
    known: [["🗼", "Eiffel Tower", "The symbol of Paris, best at sunset."], ["🎨", "The Louvre", "Home of the Mona Lisa."], ["🥐", "Food and cafés", "Croissants, cheese and pastries."], ["⛪", "Montmartre", "Hilltop village with Sacré-Cœur."], ["🚢", "Seine", "River cruises past Notre-Dame."], ["🏰", "Versailles", "The royal palace, an easy day trip."]],
    tips: ["Pre-book the Louvre and Eiffel Tower tickets in high season.", "Trains and metro are the quickest way around Paris.", "Many cafés add a small service charge already; extra tipping is optional.", "Watch for pickpockets in busy tourist areas."] },
  { slug: "italy", name: "Italy", group: "Europe", img: IMG.rome,
    tagline: "Rome's ancient wonders and world-famous food",
    dests: ["Rome"],
    overview: ["Rome has almost 3,000 years of history in one city: the Colosseum, the Roman Forum, the Pantheon and the Vatican with St Peter's and the Sistine Chapel.", "Beyond the monuments, Rome is a city for slow walks, gelato and long lunches. Day trips reach Pompeii and Tuscany."],
    facts: [["Capital", "Rome"], ["Currency", "Euro (EUR)"], ["Language", "Italian"], ["Best time", "April–June and September–October"], ["Entry", "Schengen area. Check visa rules for your passport."]],
    known: [["🏛", "Colosseum and Forum", "The heart of ancient Rome."], ["⛪", "Vatican City", "St Peter's Basilica and the Vatican Museums."], ["🍝", "Food", "Pasta, pizza, gelato and espresso."], ["⛲", "Trevi Fountain", "Throw in a coin to return."], ["🌋", "Pompeii", "A town frozen by Vesuvius in AD 79."], ["🎭", "Art and opera", "Centuries of art in every corner."]],
    tips: ["Dress covered for churches: shoulders and knees.", "Book Colosseum and Vatican entry in advance.", "Rome is walkable, but summer afternoons are hot.", "Coperto (cover charge) is normal in restaurants."] },
  { slug: "greece", name: "Greece", group: "Europe", img: IMG.santorini,
    tagline: "Santorini's caldera sunsets and Aegean blue",
    dests: ["Santorini"],
    overview: ["Santorini is a crescent-shaped island formed by a giant volcanic eruption. White villages sit on cliffs above the flooded caldera, and Oia is famous worldwide for its sunsets.", "Days here mix beaches, boat trips to the volcano, wine tasting and long dinners by the sea. It pairs well with Rome or Athens."],
    facts: [["Capital", "Athens"], ["Currency", "Euro (EUR)"], ["Language", "Greek"], ["Best time", "May–October"], ["Entry", "Schengen area. Check visa rules for your passport."]],
    known: [["🌅", "Oia sunsets", "Crowds gather each evening on the caldera edge."], ["⛵", "Caldera cruises", "Swim in hot springs beside the volcano."], ["🍷", "Wine", "Volcanic soils make distinctive Assyrtiko wine."], ["🏖", "Black and red beaches", "Perissa, Kamari and Red Beach."], ["🏺", "Akrotiri", "A Bronze Age town buried by ash."], ["🐙", "Greek food", "Fresh seafood, feta and olive oil."]],
    tips: ["Summer is busy: book hotels and sunset tables early.", "Fira to Oia is a scenic walk of about 10 km.", "Wear comfortable shoes: paths are steep and cobbled.", "Ferries can be affected by strong summer winds."] },
  { slug: "switzerland", name: "Switzerland", group: "Europe", img: IMG.alps,
    tagline: "Alpine trains, lakes and mountain views",
    dests: ["Swiss Alps"],
    overview: ["Switzerland is famous for snow-capped peaks, clear lakes and punctual trains. Our Swiss Alps stops include Lucerne, Interlaken and Grindelwald, with the Jungfrau region above them.", "Scenic rail rides are the easiest way to see the country, from lakeside towns to high mountain stations."],
    facts: [["Capital", "Bern"], ["Currency", "Swiss franc (CHF)"], ["Languages", "German, French, Italian and Romansh"], ["Best time", "June–September for hiking; December–March for snow"], ["Entry", "Schengen area. Check visa rules for your passport."]],
    known: [["🚂", "Scenic trains", "Glacier and Golden Pass-style routes."], ["🏔", "Jungfraujoch", "The 'Top of Europe' at 3,454 m."], ["🧀", "Cheese and chocolate", "Fondue and Swiss chocolate."], ["🌉", "Lucerne", "Chapel Bridge and lake views."], ["🪂", "Adventure sports", "Paragliding, hiking and skiing."], ["⌚", "Watches", "Swiss craftsmanship."]],
    tips: ["Switzerland is expensive: budget more than for other European stops.", "A Swiss Travel Pass covers trains, boats and many mountain lifts.", "Weather changes fast at altitude: bring layers.", "Book high-mountain excursions on clear-weather days."] },
  { slug: "spain", name: "Spain", group: "Europe", img: IMG.barcelona,
    tagline: "Barcelona's architecture, tapas and beaches",
    dests: ["Barcelona"],
    overview: ["Barcelona mixes Gothic streets, Gaudí's fantastical buildings and a city beach. Sagrada Família, Park Güell and Casa Batlló are the signature sights.", "Evenings are for tapas, vermouth and late dinners. Montserrat mountain is an easy day trip."],
    facts: [["Capital", "Madrid"], ["Currency", "Euro (EUR)"], ["Languages", "Spanish and Catalan"], ["Best time", "May–June and September–October"], ["Entry", "Schengen area. Check visa rules for your passport."]],
    known: [["⛪", "Gaudí", "Sagrada Família, Park Güell and Casa Batlló."], ["🍤", "Tapas", "Small plates and local wines."], ["🏖", "City beach", "Barceloneta is minutes from the centre."], ["⚽", "Football", "FC Barcelona's Camp Nou."], ["🏘", "Gothic Quarter", "Medieval lanes and squares."], ["⛰", "Montserrat", "Serrated mountain with a monastery."]],
    tips: ["Book Sagrada Família tickets in advance.", "Watch for pickpockets on Las Ramblas and the metro.", "Dinner starts late, often after 9 pm.", "The metro is the easiest way around."] },
  { slug: "uk", name: "United Kingdom", short: "United Kingdom (London)", group: "Europe", img: IMG.london,
    tagline: "London's palaces, museums and theatre",
    dests: ["London"],
    overview: ["London is a city of royal palaces, world-class free museums, theatres and markets. See Buckingham Palace, the Tower of London and Big Ben, then cruise the Thames.", "London is easy to pair with Paris on the Eurostar, as in our London, Paris and Barcelona package."],
    facts: [["Capital", "London"], ["Currency", "Pound sterling (GBP)"], ["Language", "English"], ["Best time", "May–September"], ["Entry", "The UK has separate entry rules from the EU. Check for your passport."]],
    known: [["👑", "Royal London", "Buckingham Palace and Windsor."], ["🏛", "Museums", "The British Museum and others are free to enter."], ["🎭", "West End", "World-famous theatre."], ["🚇", "The Tube", "The world's oldest underground railway."], ["🛍", "Markets", "Borough, Camden and Portobello."], ["🎡", "London Eye", "Views over the Thames."]],
    tips: ["Use a contactless bank card or Oyster on the Tube and buses.", "Weather is changeable: carry a light rain jacket.", "Book West End shows and the Tower of London ahead.", "Hotels are expensive: book early."] }
];

const countryOf = d => { const x = destByKey(d); return x ? x.country : null; };
const cName = c => c.name === "United Arab Emirates" ? "UAE" : c.name;
const countryPkgs = (c, safariOnly) => PACKAGES.filter(p =>
  (!safariOnly || p.safari) && p.route.some(r => c.dests.includes(r.d)));
const safariCountPkgs = { kenya: () => countryPkgs(COUNTRIES[0], true), tanzania: () => countryPkgs(COUNTRIES[1], true) };


// ===== asia-countries.js =====
COUNTRIES.push(
  { slug: "thailand", name: "Thailand", group: "Asia", img: IMG.thaibeach,
    tagline: "Temples, tropical islands and street food",
    dests: ["Bangkok", "Chiang Mai", "Phuket"],
    overview: ["Thailand is one of Asia's most welcoming destinations: gilded temples in Bangkok, hill-country culture in Chiang Mai, and warm Andaman Sea beaches around Phuket.", "It is famous for food, friendly people and good value, and it combines easily with Singapore, Malaysia or Bali."],
    facts: [["Capital", "Bangkok"], ["Currency", "Thai baht (THB)"], ["Language", "Thai; English in tourist areas"], ["Best time", "November–February"], ["Entry", "Visa rules depend on your passport. Check before travelling."]],
    known: [["🛕", "Temples", "Wat Arun, the Grand Palace and Doi Suthep."], ["🍜", "Street food", "Pad thai, tom yum and mango sticky rice."], ["🏝", "Islands", "Phi Phi, Phang Nga Bay and Phuket beaches."], ["🐘", "Elephants", "Ethical sanctuary visits near Chiang Mai."], ["💆", "Thai massage", "Traditional massage at very good prices."], ["🛺", "Tuk-tuks", "A fun way to get around Bangkok."]],
    tips: ["Dress modestly in temples: cover shoulders and knees.", "Pick ethical elephant sanctuaries, not riding camps.", "Carry cash for street food and markets.", "The rainy season (June–October) brings short heavy showers."] },
  { slug: "indonesia", name: "Indonesia", group: "Asia", img: IMG.bali,
    tagline: "Bali's temples, rice terraces and beaches",
    dests: ["Bali"],
    overview: ["Bali is Indonesia's most visited island, a mix of Hindu temples, terraced rice fields, surf beaches and lively cafés. Ubud is the arts and yoga centre, while Seminyak, Canggu and Uluwatu have the beach clubs and sunsets.", "Day trips reach Nusa Penida's cliffs and Mount Batur's sunrise trek."],
    facts: [["Capital", "Jakarta"], ["Currency", "Indonesian rupiah (IDR)"], ["Language", "Indonesian; English in tourist areas"], ["Best time", "April–October"], ["Entry", "Visa rules depend on your passport. Check before travelling."]],
    known: [["🛕", "Temples", "Tanah Lot, Uluwatu and Besakih."], ["🌾", "Rice terraces", "Tegallalang and Jatiluwih."], ["🏄", "Surfing", "Beginner and expert waves."], ["🧘", "Wellness", "Yoga, spas and healthy cafés."], ["🌋", "Volcano sunrise", "Mount Batur trek."], ["🎭", "Balinese culture", "Dance and offerings everywhere."]],
    tips: ["Traffic can be heavy. Allow extra time for transfers.", "Cover shoulders and knees in temples.", "Drink bottled or filtered water.", "Book Mount Batur and Nusa Penida trips in advance."] },
  { slug: "singapore", name: "Singapore", group: "Asia", img: IMG.singapore,
    tagline: "A clean, modern city of gardens and food",
    dests: ["Singapore"],
    overview: ["Singapore is a compact city-state where Chinese, Malay and Indian cultures meet. Gardens by the Bay, Marina Bay Sands, Sentosa and the Night Safari make it easy to fill several days.", "It is safe, well organised and a good first Asian stop or a stopover before Malaysia, Thailand or Indonesia."],
    facts: [["Capital", "Singapore"], ["Currency", "Singapore dollar (SGD)"], ["Languages", "English, Mandarin, Malay and Tamil"], ["Best time", "February–April (warm all year)"], ["Entry", "Visa rules depend on your passport. Check before travelling."]],
    known: [["🌳", "Gardens by the Bay", "Supertrees and cloud forest domes."], ["🏙", "Marina Bay", "Iconic skyline and light shows."], ["🍚", "Hawker food", "Chicken rice and laksa at low prices."], ["🎢", "Sentosa", "Beaches and Universal Studios."], ["🦁", "Zoo and Night Safari", "World-class wildlife parks."], ["🛍", "Orchard Road", "Malls and shopping."]],
    tips: ["Chewing gum and littering fines are strict.", "The MRT is clean and easy to use.", "Carry a light layer for heavy air conditioning.", "Book Sentosa and Night Safari tickets ahead."] },
  { slug: "malaysia", name: "Malaysia", group: "Asia", img: IMG.kl,
    tagline: "Kuala Lumpur's towers and Langkawi's beaches",
    dests: ["Kuala Lumpur", "Langkawi"],
    overview: ["Malaysia mixes Malay, Chinese and Indian culture in food, festivals and architecture. Kuala Lumpur's Petronas Towers and street-food markets are the highlight of the capital, and Langkawi adds beach days.", "It is good value and easy to combine with Singapore by air or road."],
    facts: [["Capital", "Kuala Lumpur"], ["Currency", "Malaysian ringgit (MYR)"], ["Languages", "Malay and English"], ["Best time", "December–February on the west coast"], ["Entry", "Visa rules depend on your passport. Check before travelling."]],
    known: [["🏙", "Petronas Towers", "Twin towers and the skybridge."], ["🍛", "Food", "Nasi lemak, satay and roti canai."], ["🛕", "Batu Caves", "Hindu temple in limestone caves."], ["🏝", "Langkawi", "Beaches, mangroves and sky bridge."], ["🌴", "Rainforests", "Some of the world's oldest jungle."], ["🕌", "Culture", "Mosques, Chinese temples and colonial buildings."]],
    tips: ["Dress modestly at mosques and temples.", "Use ride-hailing apps for city transport.", "Try hawker stalls for the best local food.", "Langkawi is best from December to March."] },
  { slug: "china", name: "China", group: "Asia", img: IMG.china,
    tagline: "Great Wall, Forbidden City and Shanghai's skyline",
    dests: ["Beijing", "Shanghai"],
    overview: ["China combines ancient history and futuristic cities. Beijing has the Forbidden City, the Temple of Heaven and the Great Wall nearby; Shanghai has the Bund, Yu Garden and a striking skyline.", "High-speed trains link the two cities in about five hours."],
    facts: [["Capital", "Beijing"], ["Currency", "Chinese yuan (CNY)"], ["Language", "Mandarin"], ["Best time", "April–May and September–October"], ["Entry", "A visa is usually required. Check the current rules for your passport."]],
    known: [["🧱", "Great Wall", "Walk a restored section at Mutianyu."], ["🏯", "Forbidden City", "The former imperial palace."], ["🚄", "High-speed trains", "Fast and comfortable between cities."], ["🦆", "Peking duck", "A Beijing classic."], ["🌃", "Shanghai skyline", "The Bund and Pudong at night."], ["🍵", "Tea culture", "Teahouses and tastings."]],
    tips: ["Mobile payments (Alipay/WeChat Pay) are widely used. Cash and foreign cards are less accepted.", "Download an offline translation app.", "Many Western websites and apps are blocked: arrange a VPN or eSIM.", "Apply for your visa well in advance."] }
);

// Categories on the Residents page / menu
const RES_CATS = [
  { id: "safari", label: "Safaris", icon: "🦁", blurb: "3-day and longer Kenya safaris with pick-up from home or head office." },
  { id: "beach", label: "Beach", icon: "🏖", blurb: "Diani, Watamu and Zanzibar beach holidays, from weekends to full weeks." },
  { id: "beach-safari", label: "Beach & Safari", icon: "🌅", blurb: "Bush first, beach after: the best of both in one trip." },
  { id: "dubai", label: "Dubai", icon: "🏙", blurb: "8+ day Dubai holidays, with Abu Dhabi and Zanzibar combinations." },
  { id: "europe", label: "Europe", icon: "🗼", blurb: "8+ day tours of Paris, Rome, Santorini, London, Barcelona and the Alps." },
  { id: "asia", label: "Asia", icon: "🏯", blurb: "8+ day trips to Thailand, Bali, Singapore, Malaysia and China." }
];
const resPkgs = cat => PACKAGES.filter(p => p.resident && (!cat || p.cat === cat));

// Kenya and Tanzania country heroes use the real photos too
COUNTRIES.find(c => c.slug === "kenya").img = "/images/kt/2.jpg";
COUNTRIES.find(c => c.slug === "tanzania").img = "/images/kt/safari-serengeti-national-park.jpg";

// Asian country heroes use the real photos too
{
  const hero = { thailand: "thailand-2.jpg", indonesia: "indonesia-3.jpg", singapore: "singapore-3.webp", malaysia: "malaysia-4.jpg", china: "china.jpg" };
  Object.keys(hero).forEach(s => { COUNTRIES.find(c => c.slug === s).img = "/images/asia/" + hero[s]; });
}

// European country heroes use the real photos too
{
  const hero = { france: "paris-2.webp", italy: "italy-4.webp", greece: "greece.jpg", switzerland: "switzerland.jpg", spain: "spain-2.jpg", uk: "uk-2.jpg" };
  Object.keys(hero).forEach(s => { COUNTRIES.find(c => c.slug === s).img = "/images/europe/" + hero[s]; });
}

COUNTRIES.find(c => c.slug === "uae").img = "/images/uae/dubai.webp";

// Destination (country) page heroes: one picked at random from the hero images of that country's packages
{
  const hero = {
    kenya: "/images/kt/19.jpg", tanzania: "/images/kt/61.webp", uae: "/images/uae/abu-dhabi.webp",
    france: "/images/europe/france-7.webp", italy: "/images/europe/italy-4.webp", greece: "/images/europe/greece-3.webp",
    switzerland: "/images/europe/switzerland.jpg", spain: "/images/europe/spain.jpg", uk: "/images/europe/uk-2.jpg",
    thailand: "/images/asia/thailand-6.webp", indonesia: "/images/asia/indonesia-7.webp", singapore: "/images/asia/singapore-2.jpg",
    malaysia: "/images/asia/malaysia.webp", china: "/images/asia/china.jpg"
  };
  Object.keys(hero).forEach(s => { COUNTRIES.find(c => c.slug === s).img = hero[s]; });
}

export { IMG, DESTINATIONS, STAYS, ACT, DINFO, AIRPORT, CITY, BEACH, SAFARI, CITYSET, ASIASET, DEST_ALIAS, destByKey, PACKAGES, STYLE_INFO, STYLE, pkgIncSummary, tierInc, tierExc, TIER_STYLE, isDomesticRes, intlFlightsIncluded, flightsIncl, KENYA_DESTS, COUNTRIES, countryPkgs, countryOf, RES_CATS, resPkgs };
