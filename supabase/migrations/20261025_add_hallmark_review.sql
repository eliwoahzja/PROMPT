-- Safe additive migration for existing ATLAS databases.
-- Run after previous Z.ai target migration if that migration is needed.
alter table public.prompts
  add column if not exists hallmark boolean not null default false;
alter table public.user_settings
  add column if not exists preferred_hallmark boolean not null default false;
