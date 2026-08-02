-- Development-only seed. Run after creating at least one Auth user and applying
-- both migrations. It seeds the first Auth user's workspace and never runs
-- automatically in production.
do $$
declare
  v_user uuid;
  v_workspace uuid;
  v_campaign_one uuid;
  v_campaign_two uuid;
  v_creator_ids uuid[];
  v_collaboration uuid;
begin
  select id into v_user from auth.users order by created_at limit 1;
  if v_user is null then raise exception 'Create an Auth user before running seed.sql'; end if;

  insert into public.profiles (id, full_name, onboarding_completed)
  values (v_user, 'Dev User', true)
  on conflict (id) do update set onboarding_completed = true
  returning id into v_user;

  insert into public.workspaces (owner_id, name, collaboration_volume, current_workflow)
  values (v_user, 'Aster & Bloom · Dev Store', '11–25', 'Spreadsheet')
  on conflict (owner_id) do update set name = excluded.name
  returning id into v_workspace;

  delete from public.campaigns where workspace_id = v_workspace and is_sample;
  delete from public.creators where workspace_id = v_workspace and is_sample;

  with inserted as (
    insert into public.creators (workspace_id, full_name, handle, platform, niche, follower_count, engagement_rate, expected_rate, is_sample)
    values
      (v_workspace, 'Maya Kapoor · Sample', '@mayamakes', 'Instagram', 'Skincare routines & ingredients', 28400, 4.8, 12000, true),
      (v_workspace, 'Rohan Mehta · Sample', '@rohanreviews', 'YouTube', 'DTC product reviews', 51600, 3.6, 18000, true),
      (v_workspace, 'Aisha Khan · Sample', '@aishastyles', 'Instagram', 'Beauty & lifestyle', 44700, 5.2, 15000, true),
      (v_workspace, 'Kabir Shah · Sample', '@kabircreates', 'TikTok', 'Product discovery', 73100, 6.1, 22000, true),
      (v_workspace, 'Naina Rao · Sample', '@nainaeats', 'Instagram', 'Wellness & routines', 19300, 4.4, 9000, true),
      (v_workspace, 'Dev Malhotra · Sample', '@devreviews', 'YouTube', 'Consumer product reviews', 12800, 3.9, 10000, true)
    returning id, created_at
  )
  select array_agg(id order by created_at) into v_creator_ids from inserted;

  insert into public.campaigns (workspace_id, name, brand_name, description, objective, start_date, end_date, status, budget, is_sample)
  values (v_workspace, 'Glow Reset launch · Sample', 'Aster & Bloom · Glow Reset Set', 'Seed the launch set, publish creator routines, and drive tracked first-time orders.', 'Product trial, reusable UGC, and attributed revenue', current_date - 7, current_date + 21, 'active', 90000, true)
  returning id into v_campaign_one;
  insert into public.campaigns (workspace_id, name, brand_name, description, objective, start_date, end_date, status, budget, is_sample)
  values (v_workspace, 'Everyday SPF · Sample', 'Aster & Bloom · Daily Veil SPF', 'Always-on gifting, affiliate content, and repeat-partner campaign.', 'Grow creator-attributed orders and content library', current_date - 30, current_date + 7, 'active', 50000, true)
  returning id into v_campaign_two;

  for i in 1..6 loop
    insert into public.campaign_creators (
      workspace_id, campaign_id, creator_id, stage, agreed_fee, currency,
      deliverable_type, deliverable_count, deliverable_description,
      deliverable_due_date, last_activity_at, is_sample
    )
    values (
      v_workspace,
      case when i <= 4 then v_campaign_one else v_campaign_two end,
      v_creator_ids[i],
      (array['contacted','confirmed','content_due','posted','paid','posted'])[i],
      (array[12000,18000,15000,22000,9000,10000])[i],
      'INR',
      (array['Instagram reel','YouTube video','Instagram story','TikTok video','Instagram post','Other'])[i],
      1,
      (array[
        'Morning routine reel with code MAYAGLOW20',
        'Integrated product review with tracked link',
        'Three-frame product story set with code AISHAGLOW',
        'TikTok unboxing and first-use reaction',
        'Ingredient-led Instagram post with 90-day usage rights',
        'YouTube integration with code DEVRESET'
      ])[i],
      current_date + (array[12,8,2,-2,-8,-4])[i],
      now() - make_interval(days => (array[1,2,3,8,4,10])[i]),
      true
    )
    returning id into v_collaboration;

    insert into public.payments (
      workspace_id, campaign_creator_id, agreed_amount, amount_paid, currency,
      status, due_date, paid_at, is_sample
    )
    values (
      v_workspace,
      v_collaboration,
      (array[12000,18000,15000,22000,9000,10000])[i],
      case when i = 5 then 9000 else 0 end,
      'INR',
      case when i = 5 then 'paid' when i in (4,6) then 'due' else 'not_due' end,
      current_date + (array[20,16,10,-1,-4,-2])[i],
      case when i = 5 then now() - interval '3 days' else null end,
      true
    );
  end loop;
end
$$;
