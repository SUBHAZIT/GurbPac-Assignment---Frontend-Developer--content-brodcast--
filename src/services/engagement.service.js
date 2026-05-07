import { supabase } from '@/lib/supabase';

/**
 * Engagement Service
 * Handles comments and likes for the broadcast system.
 */
export const engagementService = {
  // ==================== COMMENTS ====================

  /**
   * Get comments for a content item
   */
  async getComments(contentId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(full_name, role, avatar_url)')
      .eq('content_id', contentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Post a comment
   */
  async addComment(contentId, userId, message) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ content_id: contentId, user_id: userId, message: message.trim() })
      .select('*, profiles(full_name, role, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  // ==================== LIKES ====================

  /**
   * Get like count and whether current user has liked
   */
  async getLikeStatus(contentId, userId) {
    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId);

    if (countError) throw countError;

    let hasLiked = false;
    if (userId) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .maybeSingle();
      hasLiked = !!data;
    }

    return { count: count || 0, hasLiked };
  },

  /**
   * Toggle like on a content item
   */
  async toggleLike(contentId, userId) {
    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return { liked: false };
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ content_id: contentId, user_id: userId });
      if (error) throw error;
      return { liked: true };
    }
  },

  // ==================== WATCH HISTORY ====================

  /**
   * Record or update a watch session
   */
  async recordWatch(contentId, userId, durationSeconds = 0) {
    // Check if already watched
    const { data: existing } = await supabase
      .from('watch_history')
      .select('id, watch_duration')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Update duration and last_watched
      const { error } = await supabase
        .from('watch_history')
        .update({ 
          watch_duration: existing.watch_duration + durationSeconds,
          last_watched: new Date().toISOString()
        })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insert new entry
      const { error } = await supabase
        .from('watch_history')
        .insert({ 
          content_id: contentId, 
          user_id: userId, 
          watch_duration: durationSeconds 
        });
      if (error) throw error;
    }
  },

  /**
   * Get user's watch history with content details
   */
  async getWatchHistory(userId) {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*, content(id, title, subject, file_url, file_type, status)')
      .eq('user_id', userId)
      .order('last_watched', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get user stats: total watch time, items watched, likes given
   */
  async getWatchStats(userId) {
    const [historyRes, likesRes] = await Promise.all([
      supabase
        .from('watch_history')
        .select('watch_duration')
        .eq('user_id', userId),
      supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    const totalSeconds = (historyRes.data || []).reduce((sum, h) => sum + (h.watch_duration || 0), 0);
    const itemsWatched = historyRes.data?.length || 0;
    const totalLikes = likesRes.count || 0;

    return { totalSeconds, itemsWatched, totalLikes };
  },

  /**
   * Get content the user has liked
   */
  async getLikedContent(userId) {
    const { data, error } = await supabase
      .from('likes')
      .select('*, content(id, title, subject, file_url, file_type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
