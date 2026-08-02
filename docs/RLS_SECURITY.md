# Row Level Security

## Security boundary

Fluebaze uses defense in depth:

1. The session proxy redirects anonymous users away from product routes.
2. Authenticated layouts and Server Actions call Supabase Auth to validate the current user.
3. Server Actions resolve the workspace from the session and ignore client workspace identifiers.
4. Zod schemas validate and allowlist mutation fields.
5. PostgreSQL RLS applies the final authorization check to direct and application-originated queries.

Frontend route protection is not treated as authorization.

## Policies

- `profiles`: `id = auth.uid()`
- `workspaces`: `owner_id = auth.uid()`
- `creators`, `tags`, `campaigns`, `campaign_creators`, `payments`: `workspace_id = current_user_workspace_id()`
- `creator_tags`: both linked creator and tag must belong to the authenticated workspace

`current_user_workspace_id()` is a stable, security-definer helper with a fixed `search_path`. Execution is granted only to `authenticated`.

## Privileged functions

`complete_onboarding()` and `remove_sample_data()` are security-definer functions because they coordinate related writes. Both:

- Require an authenticated `auth.uid()`
- Derive workspace ownership internally
- Validate controlled values
- Are executable only by `authenticated`

The service-role key is used only by the pre-existing public waitlist Server Action. It is never imported by product Client Components or exposed through a `NEXT_PUBLIC_` variable.

## Release verification

Against a non-production Supabase project:

1. Create user A and user B.
2. Complete onboarding for both.
3. Capture a creator, campaign, collaboration, and payment ID from user A.
4. Sign in as user B and attempt select/update/delete requests for each A-owned ID.
5. Verify every request returns no rows or an authorization error.
6. Attempt to create a B-owned row with A’s `workspace_id`; verify RLS rejects it.
7. Verify a duplicate `(campaign_id, creator_id)` insert fails.

The static test suite also checks that every user-owned table declares RLS and that the workspace ownership contract remains present in the migration.
