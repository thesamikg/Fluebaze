alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_business_type_check;

update public.waitlist_signups
set business_type = 'Other ecommerce brand'
where business_type not in (
  'Beauty & wellness brand',
  'Fashion & lifestyle brand',
  'Food & beverage brand',
  'Consumer goods brand',
  'Other ecommerce brand'
);

alter table public.waitlist_signups
  add constraint waitlist_signups_business_type_check
  check (business_type in (
    'Beauty & wellness brand',
    'Fashion & lifestyle brand',
    'Food & beverage brand',
    'Consumer goods brand',
    'Other ecommerce brand'
  ));
