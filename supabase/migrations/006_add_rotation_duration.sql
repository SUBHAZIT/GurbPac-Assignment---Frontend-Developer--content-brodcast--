-- ============================================================
-- StreamPro: Add missing rotation_duration column to content
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.content ADD COLUMN IF NOT EXISTS rotation_duration INTEGER DEFAULT 10;
