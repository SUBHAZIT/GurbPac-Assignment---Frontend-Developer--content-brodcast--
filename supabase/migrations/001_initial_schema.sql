-- ============================================================
-- StreamPro: Initial Database Schema Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ==================== PROFILES TABLE ====================
-- Stores user profile data linked to Supabase Auth users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'principal')) DEFAULT 'teacher',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone authenticated can read profiles
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Policies: Users can update only their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies: Allow insert for the trigger (service_role) and authenticated users (own row)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ==================== AUTO-CREATE PROFILE ON SIGNUP ====================
-- Trigger function: creates a profile row when a new user signs up

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
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'teacher')
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ==================== CONTENT TABLE ====================
-- Stores broadcast content uploaded by teachers

CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('image', 'video', 'document')) DEFAULT 'image',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Policies: Teachers can see their own content
CREATE POLICY "content_select_own_teacher" ON public.content
  FOR SELECT TO authenticated
  USING (
    auth.uid() = teacher_id
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
  );

-- Policies: Teachers can insert their own content
CREATE POLICY "content_insert_teacher" ON public.content
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Policies: Teachers can update their own pending content
CREATE POLICY "content_update_own_teacher" ON public.content
  FOR UPDATE TO authenticated
  USING (
    (auth.uid() = teacher_id AND status = 'pending')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
  )
  WITH CHECK (
    (auth.uid() = teacher_id AND status = 'pending')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
  );

-- Policies: Teachers can delete their own content
CREATE POLICY "content_delete_own_teacher" ON public.content
  FOR DELETE TO authenticated
  USING (
    auth.uid() = teacher_id
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal')
  );

-- Policies: Public read for approved + live content (for broadcast page)
CREATE POLICY "content_select_public_live" ON public.content
  FOR SELECT TO anon
  USING (
    status = 'approved'
    AND start_time <= now()
    AND end_time >= now()
  );


-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_content_teacher_id ON public.content(teacher_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_schedule ON public.content(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);


-- ==================== STORAGE BUCKET ====================
-- Create storage bucket for content files

INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-files', 'content-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Authenticated users can upload files
CREATE POLICY "storage_insert_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-files');

-- Storage Policies: Anyone can read files (public bucket)
CREATE POLICY "storage_select_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'content-files');

-- Storage Policies: Users can delete their own files
CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'content-files' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ==================== UPDATED_AT TRIGGER ====================
-- Auto-update the updated_at column on row changes

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS content_updated_at ON public.content;
CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
