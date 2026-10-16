# Admin area: setup guide (Stage 2)

The private admin area lives at `/admin`. Nothing on the public website links to it, and search engines are told to ignore it.

## How access works
1. **Email + password** (Supabase Auth). Public sign-up must stay switched off.
2. **Authenticator app code** (two-factor). First sign-in walks you through setting it up.
3. **Administrator list.** Only people with a row in `public.admin_profiles` get in. Creating an account never makes someone an administrator.
4. Every admin page and server action re-checks all of this on the server. The database enforces it again with Row Level Security (`private.is_admin()` requires an active administrator **and** a two-factor session), so even a leaked page link would show nothing.
5. Sessions end after 30 minutes without activity. Every login, logout and password reset is written to `audit_logs`.

## One-time setup

### A. Switch off public sign-up (Supabase dashboard)
Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".

### B. Tell Supabase where your site lives
Authentication → URL Configuration:
- Site URL: `https://friendsinternationallimited.com`
- Redirect URLs, add both:
  - `https://friendsinternationallimited.com/admin/auth/callback`
  - `http://localhost:3000/admin/auth/callback`

### C. Create the first administrator
1. Authentication → Users → **Add user** → **Create new user**.
2. Email: the administrator's email. Password: at least 12 characters, unique to this site. Tick **Auto Confirm User**.
3. Grant admin access by running this once in the SQL editor (replace the email):

```sql
insert into public.admin_profiles (user_id, email, role, full_name)
select id, lower(email), 'owner', 'Your Name'
from auth.users
where email = 'your-admin-email@example.com';
```

Do not hardcode passwords anywhere in the code. To add staff later, create their user the same way and insert them with role `staff`.
To remove access, set `active = false` on their `admin_profiles` row.

### D. Environment variables (Hostinger -> your Node.js app -> Environment variables)
| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project address (must be present when the site is built) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (safe to be public) |
| `NEXT_PUBLIC_SITE_URL` | `https://friendsinternationallimited.com` (used in password-reset links) |
| `SUPABASE_SECRET_KEY` | Added in a later stage for saving public forms. Server only, never prefix with NEXT_PUBLIC |
| `SMTP_*`, `MAIL_FROM`, `MAIL_TO` | Email (already set up) |

After changing variables, redeploy.

## Database
Migrations are in `supabase/migrations/` and are already applied to the project:
- `..._create_booking_requests.sql`: original public form table (insert only)
- `..._admin_foundation.sql`: admin profiles, helper functions, audit log
- `..._business_tables.sql`: clients, enquiries, bookings, quotations, invoices, payments, receipts, activities, follow-ups, documents

Backups: Supabase takes daily backups on paid plans. On the free plan, export your data regularly (Database -> Backups, or run `pg_dump`). Consider upgrading before you hold real client data.

---

## Stage 4: the business workflow

### Public forms -> database
Every public form (booking pop-up, customise, homepage enquiry, WhatsApp button) posts to `/api/enquiry`. The server validates it,
checks the spam traps and rate limit, **saves it to `public.enquiries`**, then emails the business. If the email fails, the enquiry is
kept and shows "Email not sent" in the admin area with a **Retry email** button. The same person sending the same request twice in a day
is saved once.

This needs one extra server-only variable in Hostinger -> Environment variables:

| Name | Where to get it |
|---|---|
| `SUPABASE_SECRET_KEY` | Supabase -> Project Settings -> API Keys -> **Secret keys** -> copy the key that starts `sb_secret_` |

Never paste it into chat, into the code, or into any variable that starts with `NEXT_PUBLIC_`. Redeploy after adding it.
Until it is set, enquiries still reach your inbox by email but are **not** saved in the admin area.

### Admin sections
- **Enquiries**: search, filter, sort, status, notes, follow-up dates, communication history, assign, archive, CSV export, convert to booking.
- **Clients**: contact details, history, totals per currency, documents, CSV export. Converting an enquiry reuses an existing client with the same email or phone.
- **Bookings**: list, departure calendar, status (configurable in `booking_statuses`), prices, deposit, payments, printable summary, CSV export.
- **Quotations**: line items with live totals (the database recalculates them), PDF, email to the client, revisions, accept, convert to booking.
- **Invoices / Receipts / Payments**: invoices request money; receipts confirm money actually received. Only *confirmed* payments count as paid, and nothing is confirmed automatically.
- **Documents**: private storage (`client-documents` bucket), opened through links that expire after 1 minute, every open is logged.

### Money rules
- Amounts are stored with two decimals and are never added across currencies (USD, EUR, GBP, KES supported; add more rows to `public.currencies`).
- A payment must be in the same currency as its booking. A booking's balance = agreed (or quoted) price - confirmed payments.
- Dashboard "booking value" and "payments received" are not profit. Profit is not calculated because no cost data is recorded.

### Not included / for later
- No online payment gateway is connected. Payments are recorded manually. When you choose a provider that supports Kenya, its webhook must be
  verified server-side before a payment is marked confirmed (the `payments.provider` and `provider_txn_id` columns are ready for this).
- Website content management (packages, destinations, FAQs, testimonials) is Stage 5.
- Reports page with date-range CSV export is Stage 5/6.
