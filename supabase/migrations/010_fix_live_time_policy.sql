-- ============================================================
-- Fix: Make time window optional in policies for legacy content
-- ============================================================

-- Update live content policy
DROP POLICY IF EXISTS "content_select_public_live" ON public.content;
CREATE POLICY "content_select_public_live" ON public.content
  FOR SELECT TO anon
  USING (
    status = 'approved'
    AND is_broadcasting = true
    AND is_deleted = false
    AND (start_time IS NULL OR start_time <= now())
    AND (end_time IS NULL OR end_time >= now())
  );

-- Update viewer policy
DROP POLICY IF EXISTS "content_select_viewer" ON public.content;
CREATE POLICY "content_select_viewer" ON public.content
  FOR SELECT TO authenticated
  USING (
    (
      -- Viewers can see approved, active, non-deleted content
      status = 'approved'
      AND is_broadcasting = true
      AND is_deleted = false
      AND (start_time IS NULL OR start_time <= now())
      AND (end_time IS NULL OR end_time >= now())
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'viewer')
    )
    OR
    -- Teachers can see their own content (including deleted)
    auth.uid() = teacher_id
    OR
    -- Principals can see everything
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
  );
