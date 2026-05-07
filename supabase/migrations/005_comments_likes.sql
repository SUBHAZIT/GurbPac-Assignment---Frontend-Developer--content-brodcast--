-- ============================================================
-- StreamPro: Comments & Engagement System
-- Adds comments and likes for educational broadcasting
-- Run this in Supabase Dashboard > SQL Editor AFTER 001-004
-- ============================================================

-- ==================== COMMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT TO authenticated
  USING (true);

-- Anon can also read comments (for public broadcast)
CREATE POLICY "comments_select_anon" ON public.comments
  FOR SELECT TO anon
  USING (true);

-- Authenticated users can insert comments
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ==================== LIKES TABLE ====================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "likes_select" ON public.likes
  FOR SELECT TO authenticated, anon
  USING (true);

-- Authenticated users can like
CREATE POLICY "likes_insert" ON public.likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike (delete own)
CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_comments_content ON public.comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_content ON public.likes(content_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);

-- ==================== UPDATE CONTENT FILE_TYPE ====================
-- Allow more file types
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_file_type_check;
ALTER TABLE public.content ADD CONSTRAINT content_file_type_check
  CHECK (file_type IN ('image', 'video', 'document', 'pdf', 'audio', 'other'));
