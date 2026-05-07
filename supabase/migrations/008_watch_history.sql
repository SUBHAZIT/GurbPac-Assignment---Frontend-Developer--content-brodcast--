-- ============================================================
-- StreamPro: Watch History for Viewer Dashboard
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  watch_duration INTEGER DEFAULT 0,  -- seconds watched
  watched_at TIMESTAMPTZ DEFAULT now(),
  last_watched TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history
CREATE POLICY "watch_history_select_own" ON public.watch_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "watch_history_insert_own" ON public.watch_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own history (for duration tracking)
CREATE POLICY "watch_history_update_own" ON public.watch_history
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watch_history_user ON public.watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_content ON public.watch_history(content_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched ON public.watch_history(watched_at DESC);
