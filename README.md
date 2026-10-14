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

## Supabase (form submissions)

Every booking, customise and enquiry form saves its details to a Supabase table called `booking_requests`,
in addition to opening WhatsApp or email as before. There is no sign-in: any visitor can submit.

1. Copy `.env.example` to `.env` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   (Supabase dashboard > Project Settings > API). When you deploy, add the same two variables in your host's settings.
2. The table is created by `supabase/migrations/20261014120000_create_booking_requests.sql`
   (already applied to the project; run it in the SQL editor on a new project).
3. Visitors can only **insert** rows (Row Level Security). Nobody can read, change or delete them through the public key.
   Read the requests in the Supabase dashboard > Table Editor > `booking_requests`.

Code: `src/lib/supabase/client.js` (browser), `src/lib/supabase/server.js` (server, for later),
`src/lib/requests.js` (saves a request).

## Email (Hostinger SMTP)

Enquiries and booking requests are emailed by the server route `src/app/api/enquiry/route.js` (nodemailer).
The visitor's email is set as `Reply-To`. Credentials live only in server environment variables:

| Variable | Example |
|---|---|
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` / `SMTP_SECURE` | `465` / `true` (or `587` / `false`) |
| `SMTP_USER` / `SMTP_PASS` | the Hostinger mailbox address and its password |
| `MAIL_FROM` | `"Friends International Website" <the mailbox address>` |
| `MAIL_TO` | the address that receives enquiries (an alias is fine) |

Set them in the Hostinger Node.js app settings (and in `.env.local` for local testing), then redeploy. If sending fails, the visitor
is told and the form falls back to their email app / WhatsApp; a copy is still saved to Supabase.
