-- ============================================================
-- StreamPro: Fix content visibility for broadcast
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Allow viewers (authenticated users who are NOT teacher/principal) 
-- to see approved content
CREATE POLICY "content_select_viewer" ON public.content
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'viewer')
    )
  );

-- Also allow anon users to see ALL approved content 
-- (not just time-restricted for easier testing)
DROP POLICY IF EXISTS "content_select_public_live" ON public.content;
CREATE POLICY "content_select_public_live" ON public.content
  FOR SELECT TO anon
  USING (status = 'approved');
