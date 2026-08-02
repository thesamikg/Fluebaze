# Fluebaze MVP implementation plan

## Repository assessment

The starting repository was a clean Next.js App Router landing project using TypeScript, Tailwind CSS, Lucide, Framer Motion, Zod, and a server-side Supabase waitlist action. It had:

- A complete public landing page at `/` with reusable marketing components.
- A separate `waitlist_signups` migration and service-role-backed server action.
- No product routes, user authentication, app layout, or session refresh layer.
- No creator, campaign, collaboration, payment, profile, or workspace schema.
- No browser-safe Supabase configuration, RLS-backed product data layer, forms, or tests.

The landing page and its components are intentionally preserved.

## Architecture

- Public marketing routes remain in the root App Router surface.
- Public authentication routes use Supabase Auth and browser-safe anon credentials.
- `src/proxy.ts` refreshes sessions and provides the first protected-route redirect.
- The authenticated route group performs a second server-side user/workspace check.
- Server Components load initial data.
- Server Actions validate every mutation, resolve the authenticated workspace, allowlist fields, and revalidate affected views.
- Supabase RLS is the final authorization boundary, including direct API access.
- Client Components are limited to forms, filters, navigation, toasts, dialogs, and pipeline interaction.

## Database schema

The MVP uses:

- `profiles`: account-level name and onboarding state
- `workspaces`: one owner, brand name, volume, and current workflow
- `creators`, `tags`, `creator_tags`: creator CRM and many-to-many tags
- `campaigns`: campaign brief, dates, budget, and lifecycle
- `campaign_creators`: unique creator/campaign collaborations and five-stage pipeline
- `payments`: one manual payment record per collaboration

All monetary fields use `numeric(14,2)`. Foreign keys cascade where removal is part of the user workflow. Workspace, relationship, stage, status, and due-date indexes support operational queries.

## Implementation checklist

- [x] Preserve the public landing page
- [x] Supabase SSR clients, session proxy, and protected app layout
- [x] Email/password sign-up, login, logout, recovery, and update-password flow
- [x] Two-step onboarding and atomic sample workspace creation
- [x] RLS policies, ownership helper, indexes, constraints, and triggers
- [x] Responsive desktop sidebar and mobile drawer
- [x] Creator CRUD, tags, filters, details, history, and add-to-campaign action
- [x] Campaign CRUD, archive, spend/progress list, and campaign brief
- [x] Board/table collaboration pipeline with optimistic persistence and recovery
- [x] Explicit payment confirmation before entering the Paid stage
- [x] Central payment tracking, edit, mark-paid, overdue derivation, and summaries
- [x] Real-data operational dashboard and attention rules
- [x] Settings, password reset, and sample-data removal
- [x] Loading, error, empty, unauthorized, and not-found handling
- [x] Documentation, development seed, validation tests, and build scripts
