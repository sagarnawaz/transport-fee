# Transport Fee Manager

A mobile-first PWA for a local transport or van business. Customers register, view their monthly fee, upload payment proof, and admins manually verify payments before any fee becomes paid.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase Auth, Database, RLS, and private Storage
- PWA manifest and service worker

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. In Supabase SQL Editor, run these files in order:

```text
supabase/schema.sql
supabase/rls.sql
supabase/storage.sql
```

4. Enable email/password auth in Supabase. The app uses the customer phone number as a local login identifier by creating an internal email like `03001234567@transport.local`. For easiest local-business setup, disable email confirmation in Supabase Auth settings.

5. Start the app:

```bash
npm run dev
```

## First Admin

Register once from `/auth/register` using the admin phone number. Then edit `supabase/seed-admin.sql`, replace `03000000000` with that phone number, and run it in Supabase SQL Editor. After login, that user will land in `/admin`.

## Important Payment Rule

Customer proof upload never marks a fee as paid. The database trigger only moves the fee to `pending_verification`. A fee becomes `paid` or `partial` only when an admin approves the proof from **Pending Payments**.

## Main Screens

Admin:

- Dashboard
- Customers
- Pending Customers
- Routes
- Monthly Fees
- Pending Payments
- Reports
- Settings

Customer:

- Register/Login
- Dashboard
- My Profile
- My Fees
- Submit Payment Proof
- Payment History

## Storage

The SQL creates a private `payment-proofs` bucket. Screenshots are stored under each customer ID folder. Admin views use short-lived signed URLs.

## Reports and Reminders

Reports download as CSV from the Reports page. WhatsApp reminders use free `wa.me` links and the template from Settings.

## Production Notes

- Set the Supabase environment variables in your hosting provider.
- Keep the Supabase anon key public; RLS policies protect data access.
- Review Supabase Auth email confirmation settings before onboarding customers.
- Install the app on Android from the browser menu after deployment.
