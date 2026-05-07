-- ============================================================
-- StreamPro: Viewer Role & Teacher Management
-- Adds 'viewer' role and principal-managed teacher creation
-- Run this in Supabase Dashboard > SQL Editor AFTER 001 & 002
-- ============================================================

-- 1. Update the role constraint to allow 'viewer'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('teacher', 'principal', 'viewer'));

-- 2. Update the default role to 'viewer' for public signups
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'viewer';

-- 3. Update the handle_new_user trigger to use 'viewer' as default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'viewer')
  );
  RETURN NEW;
END;
$$;
