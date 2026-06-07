# Transport Fee Manager Documentation

## Project Overview

Transport Fee Manager is a mobile-first PWA for a local transport or van business. The app lets customers register, view their monthly fee, submit payment proof screenshots, and track payment history. Admins can manage customers, approve pending registrations, generate monthly fees, verify payment proofs, export reports, and update business settings.

The current branding and route logic are tailored for Daniyal Transport. Customer registration calculates the monthly fee from selected route, pickup point, destination, ride type, and van number.

## Tech Stack

- Next.js 16.2.6 with App Router
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- Supabase Auth
- Supabase Database with RLS policies
- Supabase private Storage for payment screenshots
- Supabase SSR helpers through `@supabase/ssr`
- Lucide React icons
- PWA manifest and service worker

## Main Project Structure

- `app/`: Next.js App Router routes, layouts, pages, loading screens, and server actions.
- `components/ui/`: Shared UI components such as buttons, inputs, status badges, empty states, logo, and setup notice.
- `components/admin/`: Admin-specific components such as navigation and screenshot preview.
- `components/customer/`: Customer navigation.
- `lib/`: Supabase clients, queries, route fee logic, CSV export, WhatsApp reminder helpers, and date utilities.
- `supabase/`: SQL setup files for schema, RLS, storage bucket, and admin seed.
- `public/`: Logo, icons, manifest assets, and service worker.
- `types/`: Shared database and domain types.

## User Roles

### Customer

Customers can:

- Register with phone number and password.
- Select service route, pickup location, ride type, and van.
- View current month fee summary.
- See amount paid, amount pending, due date, and route details.
- Submit payment proof with screenshot.
- View payment history.

### Admin

Admins can:

- View dashboard stats for active customers, expected amount, received amount, and pending amount.
- Review all customers.
- Approve or reject pending customer registrations.
- Manage routes.
- Generate monthly fee records.
- View paid/unpaid status for all registered customers in the selected month.
- Download unpaid customer CSV files that can be opened in Excel and shared in WhatsApp groups.
- Verify or reject submitted payment proofs.
- Export reports as CSV.
- Update app settings and payment instructions.

## Authentication Flow

The app uses Supabase email/password auth, but the user-facing login identifier is phone number. Internally, the app converts phone numbers into local emails:

```text
03001234567 -> 03001234567@transport.local
```

Important Supabase Auth settings:

- Email/password auth must be enabled.
- Email confirmation should be disabled for easiest local-business usage.
- The anon key is public; RLS policies protect data access.

After login, the app checks the `profiles` table role and redirects:

- Admin users go to `/admin`.
- Customer users go to `/customer`.

## Supabase Backend

The app expects these setup files to be run in Supabase SQL Editor:

```text
supabase/schema.sql
supabase/rls.sql
supabase/storage.sql
```

Backend responsibilities:

- `profiles`: Stores user role and basic profile identity.
- `customers`: Stores customer profile, route, fee, status, and registration details.
- `monthly_fee_records`: Tracks monthly fee status, paid amount, due date, and total fee.
- `payment_proofs`: Stores submitted payment proof records.
- `settings`: Stores business-level settings and payment instructions.
- Private `payment-proofs` storage bucket stores screenshots.

RLS policies ensure customers can only access their own customer data and related fees/proofs, while admin policies allow admin management.

## UI Design

The UI is mobile-first, simple, and operational. It is designed for repeated daily use by customers and admins rather than as a marketing page.

Core visual style:

- Light gray app background: `#f7f8fb`
- White panels with subtle borders and shadows
- Red brand accent: `#b91c1c`
- Neutral text colors from Slate
- Rounded panels, fields, badges, and buttons
- Lucide icons for dashboard cards and navigation
- Sticky top headers and mobile bottom navigation

Shared CSS classes are defined in `app/globals.css`:

- `.app-shell`: Full-page app background and text color.
- `.section`: Responsive page container with max width.
- `.panel`: White bordered content surface.
- `.field`: Consistent input/select/textarea styling.
- `.label`: Form label styling.
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`: Button system.
- `.badge`: Base status badge shape.

## Navigation

Admin navigation:

- Sticky top header with brand and logout button.
- Desktop nav appears as horizontal pill links.
- Mobile nav appears as fixed bottom tab bar.
- Main links: Home, Customers, Payments, Settings.

Customer navigation:

- Sticky top header with brand and logout button.
- Fixed bottom tab bar.
- Main links: Home, Pay, History.

Active nav items use red text and a soft red background.

## Forms

Forms use Next.js Server Actions from `app/actions.ts`.

Common form patterns:

- `SubmitButton` uses `useFormStatus()` to detect pending state.
- Buttons become disabled while the form is submitting.
- Pending text changes per form, such as `Logging in...` or `Submitting...`.
- Password fields use a shared `PasswordInput`.
- Phone fields use a shared `PhoneInput`.
- Server-side validation redirects back with query-string error codes.

## Loading States

Route-level loading skeletons are implemented with Next.js `loading.tsx` files. They keep the existing layout visible and show meaningful skeletons while server-rendered page data loads.

Reusable skeleton helpers live in:

- `components/ui/PageSkeletons.tsx`

Covered routes include:

- Admin dashboard
- Admin customers
- Admin monthly fees
- Admin pending payments
- Admin pending customers
- Admin routes
- Admin reports
- Admin settings
- Customer dashboard
- Customer fees
- Customer history
- Customer profile
- Customer submit payment
- Login
- Register

Skeletons are shaped like the final screen:

- Dashboard pages show summary-card skeletons.
- List pages show repeated customer/payment/fee card skeletons.
- Form pages show header, summary, fields, and submit button skeletons.
- Auth pages show compact panel skeletons matching login/register forms.

Form submission loading states are handled by `SubmitButton`:

- Button text changes while pending.
- Button is disabled while pending.
- This prevents duplicate submissions.

## Error States

Errors are shown through small alert panels with soft red or rose backgrounds.

Authentication and registration errors are mapped from URL query params:

- Duplicate phone number
- Password mismatch
- Invalid phone number
- Missing or outdated database schema
- Email confirmation still enabled
- Customer profile creation failure
- Email/password signup disabled
- Rate limit
- Generic signup/login failures

Setup errors use `SetupNotice` when Supabase environment variables are missing or the client cannot be created.

Most server actions redirect to a route with an `error` query param, and the page component renders the matching user-friendly message.

## Empty States

Reusable empty state component:

- `components/ui/EmptyState.tsx`

It renders:

- A white panel
- Centered title
- Short explanatory text

This is used where lists may have no data, such as customers, payments, or history views.

## Status States

Reusable status badge component:

- `components/ui/StatusBadge.tsx`

Supported statuses include:

- `paid`
- `unpaid`
- `pending_verification`
- `partial`
- `rejected`
- `active`
- `pending`
- `inactive`
- `approved`

Each status receives a different soft color treatment, and unknown statuses fall back to a neutral slate badge.

## Payment Flow

Customer payment flow:

1. Customer views current month fee.
2. Customer pays outside the app.
3. Customer uploads screenshot and payment details.
4. App stores screenshot in private Supabase Storage.
5. App inserts a `payment_proofs` row.
6. Fee moves into verification workflow.

Admin verification flow:

1. Admin opens pending payments.
2. Admin views proof screenshot through a signed URL.
3. Admin approves or rejects the proof.
4. Approved proof updates paid amount.
5. Fee status becomes `paid` or `partial`.
6. Rejected proof marks the fee as `rejected`.

Important rule: Customer upload never directly marks a fee as paid. Only admin approval can mark payment as paid or partial.

## Route Payment Instructions

Admin Settings supports route-wise payment instructions.

- Admin can edit separate payment fields for each route: payment method, account title, bank/wallet name, account number, screenshot WhatsApp, and route notes.
- Clifton route customers see the Clifton payment fields.
- Link Road route customers see the Link Road payment fields.
- The customer dashboard and submit-payment screen both generate payment instructions from these fields based on the customer's drop route.
- The old combined `payment_instructions` and route instruction text fields remain as compatibility fallbacks.

## Monthly Fee List And Sharing Flow

The Admin Customers screen is the main fee-status list for registered customers.

- Admin first generates monthly fee records from the Monthly Fees screen.
- Customers screen shows total registered, active, paid, unpaid, and unpaid amount for the current month.
- The list shows customer ID, name, phone, due date, monthly fee, pending amount, joining date, and payment status.
- Paid customers show `paid`; unpaid, partial, rejected, or pending-verification customers remain visible with pending amount.
- Admin can download `Unpaid CSV / Excel` from the Customers screen for customers who still have pending amount.
- Admin can share that CSV file in a WhatsApp group so everyone can see who has not paid yet.
- Admin can also download the full fee list for record keeping.
- The Monthly Fees screen is kept simple for mobile use: generate monthly fees, search/filter records, mark a customer paid, and send WhatsApp reminders.

## Due Date Rule

Each monthly fee record uses a fixed due day for that month. The default is the 10th day of the month.

- When a customer registers, the first current-month fee record is created with due date set to the configured due day, such as `2026-06-10`.
- Admin-generated monthly fees also use the selected due day.
- The due day is configurable from Admin Settings through `default_due_day`.
- The customer dashboard falls back to the current month's configured due date if a fee record is missing.

## First Month Billing Rule

Registration includes a customer type selector so billing stays fair for both old and new customers.

- `customers.monthly_fee` stores the normal full monthly fee.
- If customer type is `new`, the first `monthly_fee_records.fee_amount` stores only the prorated amount from joining date through month end.
- If customer type is `existing`, the first `monthly_fee_records.fee_amount` stores the full monthly fee.
- For new customers, the joining day is included because service can start on that day.
- New customer formula: `round(monthly_fee / days_in_month * remaining_days)`.
- Example: if full fee is `Rs. 12,500`, June has `30` days, and customer joins on June 15, remaining days are `16`, so first month fee is about `Rs. 6,667`.
- Next month onward, generated monthly fees use the full customer monthly fee.

## PWA Behavior

PWA support includes:

- `app/manifest.ts`
- `public/sw.js`
- `components/ui/PwaRegister.tsx`

The service worker registers on the client and caches basic app shell routes/assets such as:

- `/`
- `/auth/login`
- `/auth/register`
- `/logo.png`

The root layout includes PWA metadata and Apple web app settings.

## Environment Variables

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The current Supabase config is loaded from `lib/supabase/config.ts`.

## Development Commands

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build production app:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Notes For Future Development

- Keep UI mobile-first because customers likely use the app from phones.
- Reuse existing shared classes from `app/globals.css`.
- Use `SubmitButton` for server-action forms so pending state stays consistent.
- Use `StatusBadge` instead of manually styling statuses.
- Use `EmptyState` for empty lists.
- Keep payment screenshots private and serve them through signed URLs.
- Do not bypass admin verification for payment status changes.
- When changing auth behavior, also update Supabase Auth settings and README instructions.
