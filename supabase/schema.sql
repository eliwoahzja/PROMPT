-- Run in Supabase SQL Editor. Supabase Auth handles email magic links.
create extension if not exists pgcrypto;

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  raw_prompt text not null check (char_length(raw_prompt) between 1 and 12000),
  enhanced_prompt text not null check (char_length(enhanced_prompt) between 1 and 40000),
  target text not null check (target in ('freebuff','chatgpt','kilo','codex','cursor','lovable','mimo','deepseek','zai','gpt6-chat','gpt6-astra','gpt6-1-sol','gpt6-sol','gpt6-luna','deepseek-v4-1-flash-1017')),
  style text not null,
  depth text not null check (depth in ('compact','standard','thorough')),
  method text not null check (method in ('AI','DRAFT')),
  hallmark boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists prompts_user_created_idx on public.prompts(user_id,created_at desc);
alter table public.prompts enable row level security;
drop policy if exists prompts_own_select on public.prompts;
create policy prompts_own_select on public.prompts for select to authenticated using (auth.uid() = user_id);
drop policy if exists prompts_own_insert on public.prompts;
create policy prompts_own_insert on public.prompts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists prompts_own_delete on public.prompts;
create policy prompts_own_delete on public.prompts for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_target text not null default 'chatgpt',
  preferred_style text not null default 'none',
  preferred_depth text not null default 'standard',
  preferred_hallmark boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
drop policy if exists settings_own_select on public.user_settings;
create policy settings_own_select on public.user_settings for select to authenticated using (auth.uid() = user_id);
drop policy if exists settings_own_insert on public.user_settings;
create policy settings_own_insert on public.user_settings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists settings_own_update on public.user_settings;
create policy settings_own_update on public.user_settings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quota rows have no direct public policies. Only the security-definer function can modify them.
create table if not exists public.enhancement_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  used integer not null default 0 check (used >= 0),
  primary key (user_id, usage_date)
);
alter table public.enhancement_usage enable row level security;
revoke all on public.enhancement_usage from anon, authenticated;
create or replace function public.consume_enhancement_quota()
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  n integer;
  uid uuid := (select auth.uid());
begin
  if uid is null then return false; end if;
  insert into public.enhancement_usage as u (user_id, usage_date, used)
  values (uid, (now() at time zone 'utc')::date, 1)
  on conflict (user_id,usage_date)
  do update set used=u.used + 1 where u.used < 20
  returning used into n;
  return n is not null;
end;
$$;
revoke all on function public.consume_enhancement_quota() from public, anon;
grant execute on function public.consume_enhancement_quota() to authenticated;

-- For a pre-existing ATLAS database, use the latest cumulative model-target migration: supabase/migrations/20261026_add_specific_models.sql.
-- Earlier migration example (reference only): Run this once:
-- alter table public.prompts drop constraint if exists prompts_target_check;
-- alter table public.prompts add constraint prompts_target_check
--   check (target in ('freebuff','chatgpt','kilo','codex','cursor','lovable','mimo','deepseek','zai','gpt6-chat','gpt6-astra','gpt6-1-sol','gpt6-sol','gpt6-luna','deepseek-v4-1-flash-1017'));
