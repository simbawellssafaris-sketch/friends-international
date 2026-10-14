# Friends International Limited (Next.js)

Travel website for Friends International Limited: safaris, beaches, Dubai, Europe, Asia and summer camps.
Converted from the original static HTML site. Content is unchanged.

## Run it

```bash
npm install
npm run dev      # development, http://localhost:3000
npm run build    # production build
npm start        # run the production build, http://localhost:3000
```

## Structure

| Path | What it is |
|---|---|
| `src/app/page.js` | Home page |
| `src/app/packages/[id]` | One page per package (95, prerendered) |
| `src/app/destinations/[slug]` | Country pages (Kenya, Tanzania, UAE, Europe, Asia) |
| `src/app/residents` | Resident packages |
| `src/app/stay` | Where to stay (all hotels by country) |
| `src/app/summer-camps`, `summer-camps/[id]` | Summer camps |
| `src/data/site.js` | Destinations, activities, hotels (`STAYS`), packages, countries |
| `src/data/camps.js` | The three summer camps |
| `src/data/config.js` | **Phone, WhatsApp number, email, head office, optional Formspree link** |
| `src/lib/package-view.js` | Builds each package page (itinerary, journey, inclusions) |
| `src/components` | React components (menu, booking form, cards, page views) |
| `public/images` | All photos |

## Before you publish

Edit `src/data/config.js`: phone number, WhatsApp number (digits only, with country code), email and head office.
Paste a Formspree URL into `formEndpoint` to receive booking requests by email without opening the visitor's mail app.
