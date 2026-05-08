-- ============================================================
-- StreamPro: Broadcasting Controls & History
-- Adds stop broadcasting, content deletion with reason, 
-- and broadcast history tracking.
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ==================== CONTENT TABLE CHANGES ====================

-- Add broadcasting control columns
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS is_broadcasting BOOLEAN DEFAULT true;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS stopped_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS stop_reason TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS stopped_at TIMESTAMPTZ;

-- Add soft-delete columns
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ==================== BROADCAST HISTORY TABLE ====================
-- Tracks all broadcasting events (start, stop, auto-expire, delete)

CREATE TABLE IF NOT EXISTS public.broadcast_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('started', 'stopped', 'expired', 'deleted', 'approved', 'rejected')),
  performed_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcast_history ENABLE ROW LEVEL SECURITY;

-- Allow principals and content owner teachers to read broadcast history
CREATE POLICY "broadcast_history_select" ON public.broadcast_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
    OR
    EXISTS (
      SELECT 1 FROM public.content c
      WHERE c.id = broadcast_history.content_id AND c.teacher_id = auth.uid()
    )
  );

-- Allow principals to insert broadcast history (for stop/delete actions)
CREATE POLICY "broadcast_history_insert" ON public.broadcast_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_broadcast_history_content ON public.broadcast_history(content_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_history_action ON public.broadcast_history(action);
CREATE INDEX IF NOT EXISTS idx_broadcast_history_created ON public.broadcast_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_is_broadcasting ON public.content(is_broadcasting);
CREATE INDEX IF NOT EXISTS idx_content_is_deleted ON public.content(is_deleted);

-- ==================== UPDATE LIVE CONTENT POLICY ====================
-- Only show content that is broadcasting AND not deleted AND within time window

DROP POLICY IF EXISTS "content_select_public_live" ON public.content;
CREATE POLICY "content_select_public_live" ON public.content
  FOR SELECT TO anon
  USING (
    status = 'approved'
    AND is_broadcasting = true
    AND is_deleted = false
    AND start_time <= now()
    AND end_time >= now()
  );

-- Update viewer policy to also respect is_broadcasting and is_deleted
DROP POLICY IF EXISTS "content_select_viewer" ON public.content;
CREATE POLICY "content_select_viewer" ON public.content
  FOR SELECT TO authenticated
  USING (
    (
      -- Viewers can see approved, active, non-deleted content
      status = 'approved'
      AND is_broadcasting = true
      AND is_deleted = false
      AND start_time <= now()
      AND end_time >= now()
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'viewer')
    )
    OR
    -- Teachers can see their own content (including deleted)
    auth.uid() = teacher_id
    OR
    -- Principals can see everything
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
  );
