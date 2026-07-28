create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  collaboration_volume text not null check (collaboration_volume in ('1–5','6–10','11–25','26–40','40+')),
  current_workflow text not null check (current_workflow in ('Spreadsheet','WhatsApp','Instagram DMs','Email','Other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  handle text not null default '',
  platform text not null check (platform in ('Instagram','TikTok','YouTube','X','LinkedIn','Other')),
  profile_url text,
  email text,
  phone text,
  location text,
  niche text,
  follower_count bigint not null default 0 check (follower_count >= 0),
  engagement_rate numeric(7,3) check (engagement_rate is null or engagement_rate between 0 and 100),
  expected_rate numeric(14,2) check (expected_rate is null or expected_rate >= 0),
  notes text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique(workspace_id, name)
);

create table if not exists public.creator_tags (
  creator_id uuid not null references public.creators(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (creator_id, tag_id)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 140),
  brand_name text not null check (char_length(brand_name) between 2 and 120),
  description text,
  objective text,
  start_date date not null,
  end_date date not null,
  status text not null default 'draft' check (status in ('draft','active','completed','archived')),
  budget numeric(14,2) check (budget is null or budget >= 0),
  notes text,
  archived_at timestamptz,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.campaign_creators (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  stage text not null default 'contacted' check (stage in ('contacted','confirmed','content_due','posted','paid')),
  agreed_fee numeric(14,2) not null default 0 check (agreed_fee >= 0),
  currency char(3) not null default 'INR',
  deliverable_type text not null check (deliverable_type in ('Instagram post','Instagram reel','Instagram story','TikTok video','YouTube video','UGC asset','Other')),
  deliverable_count integer not null default 1 check (deliverable_count between 1 and 100),
  deliverable_description text not null default '',
  deliverable_due_date date not null,
  post_url text,
  posted_at timestamptz,
  notes text,
  last_activity_at timestamptz not null default now(),
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, creator_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  campaign_creator_id uuid not null unique references public.campaign_creators(id) on delete cascade,
  agreed_amount numeric(14,2) not null default 0 check (agreed_amount >= 0),
  amount_paid numeric(14,2) not null default 0 check (amount_paid >= 0 and amount_paid <= agreed_amount),
  currency char(3) not null default 'INR',
  status text not null default 'not_due' check (status in ('not_due','due','paid','overdue')),
  due_date date,
  paid_at timestamptz,
  payment_method text,
  reference_number text,
  notes text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists creators_workspace_id_idx on public.creators(workspace_id);
create index if not exists creator_tags_tag_id_idx on public.creator_tags(tag_id);
create index if not exists campaigns_workspace_id_idx on public.campaigns(workspace_id);
create index if not exists campaign_creators_workspace_id_idx on public.campaign_creators(workspace_id);
create index if not exists campaign_creators_campaign_id_idx on public.campaign_creators(campaign_id);
create index if not exists campaign_creators_creator_id_idx on public.campaign_creators(creator_id);
create index if not exists campaign_creators_stage_idx on public.campaign_creators(stage);
create index if not exists payments_workspace_id_idx on public.payments(workspace_id);
create index if not exists payments_status_due_date_idx on public.payments(status, due_date);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
drop trigger if exists set_creators_updated_at on public.creators;
create trigger set_creators_updated_at before update on public.creators for each row execute function public.set_updated_at();
drop trigger if exists set_campaigns_updated_at on public.campaigns;
create trigger set_campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
drop trigger if exists set_campaign_creators_updated_at on public.campaign_creators;
create trigger set_campaign_creators_updated_at before update on public.campaign_creators for each row execute function public.set_updated_at();
drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_user_workspace_id()
returns uuid language sql stable security definer set search_path = public
as $$
  select id from public.workspaces where owner_id = auth.uid() limit 1
$$;

create or replace function public.complete_onboarding(
  p_full_name text,
  p_workspace_name text,
  p_collaboration_volume text,
  p_current_workflow text
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace uuid;
  v_campaign uuid;
  v_creator_one uuid;
  v_creator_two uuid;
  v_collab_one uuid;
  v_collab_two uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_full_name)) < 2 or char_length(trim(p_workspace_name)) < 2 then raise exception 'Name is required'; end if;
  if p_collaboration_volume not in ('1–5','6–10','11–25','26–40','40+') then raise exception 'Invalid collaboration volume'; end if;
  if p_current_workflow not in ('Spreadsheet','WhatsApp','Instagram DMs','Email','Other') then raise exception 'Invalid workflow'; end if;

  insert into public.profiles (id, full_name, onboarding_completed)
  values (v_user, left(trim(p_full_name), 120), true)
  on conflict (id) do update set full_name = excluded.full_name, onboarding_completed = true;

  insert into public.workspaces (owner_id, name, collaboration_volume, current_workflow)
  values (v_user, left(trim(p_workspace_name), 120), p_collaboration_volume, p_current_workflow)
  on conflict (owner_id) do update set name = excluded.name, collaboration_volume = excluded.collaboration_volume, current_workflow = excluded.current_workflow
  returning id into v_workspace;

  if not exists (select 1 from public.campaigns where workspace_id = v_workspace) then
    insert into public.campaigns (workspace_id, name, brand_name, description, objective, start_date, end_date, status, budget, is_sample)
    values (v_workspace, 'Summer launch · Sample', p_workspace_name, 'A sample campaign to show how Fluebaze works.', 'Create launch content', current_date, current_date + 21, 'active', 45000, true)
    returning id into v_campaign;

    insert into public.creators (workspace_id, full_name, handle, platform, niche, follower_count, engagement_rate, expected_rate, is_sample)
    values (v_workspace, 'Maya Kapoor · Sample', '@mayamakes', 'Instagram', 'Beauty & skincare', 28400, 4.8, 12000, true)
    returning id into v_creator_one;
    insert into public.creators (workspace_id, full_name, handle, platform, niche, follower_count, engagement_rate, expected_rate, is_sample)
    values (v_workspace, 'Rohan Mehta · Sample', '@rohanreviews', 'YouTube', 'D2C reviews', 51600, 3.6, 18000, true)
    returning id into v_creator_two;

    insert into public.campaign_creators (workspace_id, campaign_id, creator_id, stage, agreed_fee, deliverable_type, deliverable_count, deliverable_description, deliverable_due_date, is_sample)
    values (v_workspace, v_campaign, v_creator_one, 'content_due', 12000, 'Instagram reel', 1, 'One 30–45 second launch reel', current_date + 3, true)
    returning id into v_collab_one;
    insert into public.campaign_creators (workspace_id, campaign_id, creator_id, stage, agreed_fee, deliverable_type, deliverable_count, deliverable_description, deliverable_due_date, is_sample)
    values (v_workspace, v_campaign, v_creator_two, 'posted', 18000, 'YouTube video', 1, 'Integrated product review', current_date - 2, true)
    returning id into v_collab_two;

    insert into public.payments (workspace_id, campaign_creator_id, agreed_amount, amount_paid, status, due_date, is_sample)
    values
      (v_workspace, v_collab_one, 12000, 0, 'not_due', current_date + 10, true),
      (v_workspace, v_collab_two, 18000, 0, 'due', current_date - 1, true);
  end if;
  return v_workspace;
end;
$$;

create or replace function public.remove_sample_data()
returns void language plpgsql security definer set search_path = public
as $$
declare v_workspace uuid := public.current_user_workspace_id();
begin
  if v_workspace is null then raise exception 'Workspace not found'; end if;
  delete from public.campaigns where workspace_id = v_workspace and is_sample;
  delete from public.creators where workspace_id = v_workspace and is_sample;
end;
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.creators enable row level security;
alter table public.tags enable row level security;
alter table public.creator_tags enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_creators enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "workspaces_own" on public.workspaces;
create policy "workspaces_own" on public.workspaces for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "creators_workspace" on public.creators;
create policy "creators_workspace" on public.creators for all to authenticated using (workspace_id = public.current_user_workspace_id()) with check (workspace_id = public.current_user_workspace_id());
drop policy if exists "tags_workspace" on public.tags;
create policy "tags_workspace" on public.tags for all to authenticated using (workspace_id = public.current_user_workspace_id()) with check (workspace_id = public.current_user_workspace_id());
drop policy if exists "campaigns_workspace" on public.campaigns;
create policy "campaigns_workspace" on public.campaigns for all to authenticated using (workspace_id = public.current_user_workspace_id()) with check (workspace_id = public.current_user_workspace_id());
drop policy if exists "campaign_creators_workspace" on public.campaign_creators;
create policy "campaign_creators_workspace" on public.campaign_creators for all to authenticated using (workspace_id = public.current_user_workspace_id()) with check (workspace_id = public.current_user_workspace_id());
drop policy if exists "payments_workspace" on public.payments;
create policy "payments_workspace" on public.payments for all to authenticated using (workspace_id = public.current_user_workspace_id()) with check (workspace_id = public.current_user_workspace_id());
drop policy if exists "creator_tags_workspace" on public.creator_tags;
create policy "creator_tags_workspace" on public.creator_tags for all to authenticated
using (
  exists (
    select 1 from public.creators c join public.tags t on t.id = creator_tags.tag_id
    where c.id = creator_tags.creator_id and c.workspace_id = public.current_user_workspace_id() and t.workspace_id = public.current_user_workspace_id()
  )
)
with check (
  exists (
    select 1 from public.creators c join public.tags t on t.id = creator_tags.tag_id
    where c.id = creator_tags.creator_id and c.workspace_id = public.current_user_workspace_id() and t.workspace_id = public.current_user_workspace_id()
  )
);

revoke all on function public.current_user_workspace_id() from public;
grant execute on function public.current_user_workspace_id() to authenticated;
revoke all on function public.complete_onboarding(text,text,text,text) from public;
grant execute on function public.complete_onboarding(text,text,text,text) to authenticated;
revoke all on function public.remove_sample_data() from public;
grant execute on function public.remove_sample_data() to authenticated;
