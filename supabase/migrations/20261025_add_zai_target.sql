-- Existing Supabase projects only. Run once in SQL Editor; existing prompt rows are preserved.
-- Add Z.ai GLM-5.3-Flash as a valid saved prompt target.
BEGIN;
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_target_check;
ALTER TABLE public.prompts ADD CONSTRAINT prompts_target_check
  CHECK (target IN ('freebuff','chatgpt','kilo','codex','cursor','lovable','mimo','deepseek','zai'));
COMMIT;
