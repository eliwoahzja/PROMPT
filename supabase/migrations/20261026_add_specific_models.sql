-- ATLAS v5: add model-specific destinations without deleting any saved prompt.
-- This migration supersedes the prior Z.ai target whitelist update.
-- Run once in Supabase SQL Editor for an existing deployment.
BEGIN;
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_target_check;
ALTER TABLE public.prompts ADD CONSTRAINT prompts_target_check
  CHECK (target in ('freebuff','chatgpt','kilo','codex','cursor','lovable','mimo','deepseek','zai','gpt6-chat','gpt6-astra','gpt6-1-sol','gpt6-sol','gpt6-luna','deepseek-v4-1-flash-1017'));
COMMIT;
