# Fluebaze

Fluebaze is an influencer CRM for e-commerce and DTC teams. It connects creator relationship history, product seeding, campaign stages, deliverables, usage context, and manual payout tracking in one workspace—so brands can run creator partnerships as a repeatable growth channel. It is intentionally not a creator discovery platform.

The existing public landing page remains at `/`. The working product lives behind email/password authentication.

## MVP scope

- Email/password sign-up, login, password recovery, persistent sessions, and protected routes
- Two-step onboarding that creates one workspace plus removable sample data
- Operational dashboard with real summaries, attention items, and recent campaigns
- Creator CRM with tags, search, platform/tag filters, edit/delete, history, and profile details
- Campaign CRUD with archive behavior, spend summaries, and creator assignment
- Five-stage Contacted → Confirmed → Content Due → Posted → Paid pipeline
- Drag-and-drop board plus an accessible table/stage-select alternative
- Manual payment tracking with due, paid, outstanding, and safely derived overdue states
- Settings for user/workspace names, password reset, and sample-data removal

See [Future scope](docs/FUTURE_SCOPE.md) for intentionally excluded features.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4 and owned shadcn/ui-style source components
- React Hook Form and Zod
- Supabase Auth and PostgreSQL with Row Level Security
- Lucide icons, date-fns, Sonner, and dnd-kit
- Vercel-compatible deployment

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Create a Supabase project.

4. In the Supabase SQL Editor, apply migrations in order:

   ```text
   supabase/migrations/001_create_waitlist_signups.sql
   supabase/migrations/002_fluebaze_mvp.sql
   ```

5. In Supabase Authentication settings:

   - Enable Email provider.
   - Add `http://localhost:3000/auth/callback` as a redirect URL.
   - Add the equivalent production callback URL before deployment.
   - For an immediate sign-up → onboarding flow, disable mandatory email confirmation during local development. If confirmation is enabled, the app sends users through email confirmation before onboarding.

6. Add environment variables and start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase project URL used by app sessions |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe | Supabase anonymous key; RLS remains the authorization boundary |
| `SUPABASE_URL` | Server only | Project URL used by the landing-page waitlist action |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Waitlist-only server credential; never expose to the browser |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Canonical site URL and password-reset callback origin |

Never commit `.env.local`, a service-role key, or production secrets.

## Database and security

The schema, indexes, triggers, constraints, sample RPCs, and RLS policies live in `supabase/migrations/002_fluebaze_mvp.sql`.

- Every user-owned table has RLS enabled.
- Child-table policies resolve workspace ownership from `auth.uid()` on the server.
- Server Actions resolve the workspace from the authenticated session and never trust a submitted `workspace_id`.
- Every mutation is allowlisted and validated with Zod.
- Monetary values use `numeric(14,2)`, not floating point.
- Overdue is a derived display state; reading a late payment does not permanently mutate it.

More detail: [Database design](docs/DATABASE.md) and [RLS security](docs/RLS_SECURITY.md).

## Development seed data

Onboarding creates one campaign and two creators marked `· Sample`. For a larger local dataset:

1. Create at least one Supabase Auth user.
2. Apply both migrations.
3. Run `supabase/seed.sql` in the SQL editor.

The seed is development-only, clearly marks its records, and is never executed automatically.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Or run the full sequence:

```bash
npm run check
```

Automated tests cover payment derivation, mutation validation, required RLS declarations, workspace ownership contracts, and duplicate campaign/creator prevention. Live Supabase integration checks should also be run against a non-production project using two test accounts before release.

## Vercel deployment

1. Import the repository in Vercel.
2. Add all environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
4. Add `https://your-domain.com/auth/callback` to Supabase Authentication redirect URLs.
5. Apply migrations to the production Supabase project.
6. Deploy with the default Next.js build command.
7. Test sign-up, onboarding, one creator, one campaign, a stage movement, and a payment update with a fresh production account.

## Known MVP limitations

- One user owns one workspace; there are no team invitations or roles.
- Creator data is manual; no social APIs are connected.
- Payments are tracked only; Fluebaze never transfers money.
- No notifications, content approval, contracts, invoices, reporting, or discovery.
- Currency entry is currently optimized for INR, while stored payment/collaboration records retain a three-letter currency field.
