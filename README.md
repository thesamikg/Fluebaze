# [Fluebaze] waitlist

A production-ready waitlist landing page for **[Fluebaze]**, a micro-influencer CRM for small brands, D2C teams, marketing teams, and influencer agencies.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS v4 with configurable CSS variables
- Framer Motion for reduced-motion-aware entrance animations
- Lucide React icons
- Supabase for server-side waitlist storage
- Zod for server-side validation

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Create a Supabase project and run [`supabase/migrations/001_create_waitlist_signups.sql`](./supabase/migrations/001_create_waitlist_signups.sql) in the Supabase SQL Editor.

4. Add the project URL and service-role key to `.env.local`. The service-role key is read only by the server action and must never be exposed through a `NEXT_PUBLIC_` variable.

5. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL used by the server action |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only credential used to insert signups |
| `NEXT_PUBLIC_SITE_URL` | Canonical production URL used by page metadata |

The waitlist table has row-level security enabled and grants no browser role access. Submissions pass through the validated server action in `src/app/actions.ts`.

## Where to update content and branding

- **Product name, contact email, canonical URL, and footer/social links:** `src/lib/site-config.ts`
- **Problems, workflow, audiences, FAQs, and shared copy:** `src/lib/site-config.ts`
- **Page section and feature copy:** `src/components/landing-sections.tsx`
- **Colors, borders, shadows, and spacing:** CSS variables at the top of `src/app/globals.css`
- **SEO title and metadata:** `src/app/layout.tsx`
- **Social sharing image:** `src/app/opengraph-image.tsx`
- **Favicon:** `src/app/icon.svg`
- **Supabase credentials:** `.env.local`, using `.env.example` as the template

## Waitlist behavior

- Native client-side required/email/length validation
- Zod server-side allowlist and length validation
- Text normalization and basic sanitization
- Pending, success, duplicate, and error states
- Case-normalized unique emails
- Optional `?ref=` query parameter stored as `referral_source`

Example: `https://your-site.com/?ref=linkedin`

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The page uses server components for static content and small client islands only where interaction is needed.
