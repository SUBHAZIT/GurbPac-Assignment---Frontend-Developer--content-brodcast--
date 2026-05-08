-- Ensure profiles are readable by everyone for the live broadcast names
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (true);

-- Ensure content is readable by everyone for the live broadcast
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_select_public_live" ON public.content;
CREATE POLICY "content_select_public_live" ON public.content
  FOR SELECT TO anon, authenticated
  USING (
    status = 'approved'
    AND (is_broadcasting IS TRUE OR is_broadcasting IS NULL)
    AND (is_deleted IS FALSE OR is_deleted IS NULL)
  );
