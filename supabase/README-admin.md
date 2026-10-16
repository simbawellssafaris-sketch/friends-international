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
