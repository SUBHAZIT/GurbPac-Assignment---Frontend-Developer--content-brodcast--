-- Fix RLS policy to be more robust with NULL values and legacy content
DROP POLICY IF EXISTS "content_select_public_live" ON public.content;

CREATE POLICY "content_select_public_live" ON public.content
  FOR SELECT TO anon
  USING (
    status = 'approved'
    AND (is_broadcasting IS TRUE OR is_broadcasting IS NULL)
    AND (is_deleted IS FALSE OR is_deleted IS NULL)
    AND (start_time IS NULL OR start_time <= now())
    AND (end_time IS NULL OR end_time >= now())
  );

-- Also ensure authenticated users can see approved content
DROP POLICY IF EXISTS "content_select_auth_approved" ON public.content;
CREATE POLICY "content_select_auth_approved" ON public.content
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    AND (is_broadcasting IS TRUE OR is_broadcasting IS NULL)
    AND (is_deleted IS FALSE OR is_deleted IS NULL)
  );
