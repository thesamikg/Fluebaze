create extension if not exists "pgcrypto";

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null,
  company_name text not null check (char_length(company_name) between 2 and 120),
  business_type text not null check (business_type in (
    'D2C brand', 'Marketing team', 'Influencer agency', 'Freelancer', 'Other'
  )),
  monthly_collaborations text not null check (monthly_collaborations in (
    '1–10', '11–25', '26–50', '51–100', 'More than 100'
  )),
  biggest_challenge text check (biggest_challenge is null or char_length(biggest_challenge) <= 1000),
  referral_source text check (referral_source is null or char_length(referral_source) <= 100),
  created_at timestamptz not null default now(),
  status text not null default 'waiting' check (status in ('waiting', 'invited', 'joined', 'declined')),
  constraint waitlist_signups_email_unique unique (email),
  constraint waitlist_signups_email_normalized check (email = lower(trim(email)))
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

create index if not exists waitlist_signups_status_idx
  on public.waitlist_signups (status);

alter table public.waitlist_signups enable row level security;

-- No public policies are intentionally created. Anonymous and authenticated browser
-- clients cannot read or write signups; the server-only service role bypasses RLS.
revoke all on table public.waitlist_signups from anon, authenticated;
