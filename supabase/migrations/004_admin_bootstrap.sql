-- ============================================================
-- StreamPro: Admin Bootstrap Policies
-- Allows the admin setup page to read and update all profiles
-- Run this in Supabase Dashboard > SQL Editor AFTER 001, 002, 003
-- 
-- SECURITY NOTE: These are permissive policies for bootstrapping.
-- Remove or restrict them after the first principal is created.
-- ============================================================

-- Drop old policies if they exist (in case you already ran a previous version)
DROP POLICY IF EXISTS "profiles_select_anon" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_any_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_anon" ON public.profiles;

-- Allow anonymous users to read profiles
CREATE POLICY "profiles_select_anon" ON public.profiles
  FOR SELECT TO anon
  USING (true);

-- Allow authenticated users to update any profile
CREATE POLICY "profiles_update_any_authenticated" ON public.profiles
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to update any profile (for bootstrap when not logged in)
CREATE POLICY "profiles_update_anon" ON public.profiles
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
