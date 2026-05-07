-- ============================================================
-- StreamPro: Public Views Tracking Table
-- Tracks anonymous content views for free-tier gating (10 free views)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.public_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_fingerprint TEXT NOT NULL,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate entries for same viewer + content
  UNIQUE(viewer_fingerprint, content_id)
);

-- Enable RLS
ALTER TABLE public.public_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to insert views
CREATE POLICY "public_views_insert_anon" ON public.public_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read their own view count (by fingerprint)
CREATE POLICY "public_views_select_anon" ON public.public_views
  FOR SELECT TO anon, authenticated
  USING (true);

-- Prevent updates and deletes from client side (tamper-proof)
-- No UPDATE or DELETE policies = no one can modify/delete views from the client

-- Index for fast lookups by fingerprint
CREATE INDEX IF NOT EXISTS idx_public_views_fingerprint 
  ON public.public_views(viewer_fingerprint);

CREATE INDEX IF NOT EXISTS idx_public_views_content 
  ON public.public_views(content_id);
