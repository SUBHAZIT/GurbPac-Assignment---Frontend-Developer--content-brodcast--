import { supabase } from '@/lib/supabase';

export const contentService = {
  async uploadContent(contentData, file) {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${contentData.teacher_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-files')
      .getPublicUrl(filePath);

    // 3. Save metadata to database
    const { data, error } = await supabase
      .from('content')
      .insert([
        {
          ...contentData,
          file_url: publicUrl,
          status: 'pending',
          is_broadcasting: true,
          is_deleted: false,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  async getMyContent(teacherId) {
    const { data, error } = await supabase
      .from('content')
      .select('*, profiles!content_deleted_by_fkey(full_name)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback if the FK join fails (column may not exist yet)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('content')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }
    return data;
  },

  async getPendingContent() {
    const { data, error } = await supabase
      .from('content')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getAllContent(filters = {}) {
    let query = supabase
      .from('content')
      .select('*, profiles(full_name, email)');

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters.showDeleted === false) {
      query = query.eq('is_deleted', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateContentStatus(id, status, reason = null) {
    const { data, error } = await supabase
      .from('content')
      .update({ status, rejection_reason: reason })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async deleteContent(id) {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Soft-delete content (Principal action)
   * Marks content as deleted with a reason instead of hard-deleting
   */
  async softDeleteContent(contentId, principalId, reason) {
    if (!reason || !reason.trim()) {
      throw new Error('Deletion reason is mandatory');
    }

    const { data, error } = await supabase
      .from('content')
      .update({
        is_deleted: true,
        deleted_by: principalId,
        deletion_reason: reason.trim(),
        deleted_at: new Date().toISOString(),
        is_broadcasting: false,
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;

    // Record in broadcast history
    await this.addBroadcastHistory(contentId, 'deleted', principalId, reason.trim());

    return data;
  },

  /**
   * Stop broadcasting content (Principal manual action)
   */
  async stopBroadcasting(contentId, principalId, reason) {
    if (!reason || !reason.trim()) {
      throw new Error('Stop reason is mandatory');
    }

    const { data, error } = await supabase
      .from('content')
      .update({
        is_broadcasting: false,
        stopped_by: principalId,
        stop_reason: reason.trim(),
        stopped_at: new Date().toISOString(),
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;

    // Record in broadcast history
    await this.addBroadcastHistory(contentId, 'stopped', principalId, reason.trim());

    return data;
  },

  /**
   * Resume broadcasting content (Principal action)
   */
  async resumeBroadcasting(contentId, principalId) {
    const { data, error } = await supabase
      .from('content')
      .update({
        is_broadcasting: true,
        stopped_by: null,
        stop_reason: null,
        stopped_at: null,
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;

    // Record in broadcast history
    await this.addBroadcastHistory(contentId, 'started', principalId, 'Manually resumed by principal');

    return data;
  },

  /**
   * Add an entry to broadcast history
   */
  async addBroadcastHistory(contentId, action, performedBy, reason = null, metadata = {}) {
    const { error } = await supabase
      .from('broadcast_history')
      .insert({
        content_id: contentId,
        action,
        performed_by: performedBy,
        reason,
        metadata,
      });

    if (error) console.error('Failed to record broadcast history:', error);
  },

  /**
   * Get broadcast history with content and user details
   */
  async getBroadcastHistory(filters = {}) {
    let query = supabase
      .from('broadcast_history')
      .select('*, content(id, title, subject, file_type, teacher_id, profiles(full_name)), profiles(full_name, role)');

    if (filters.action && filters.action !== 'all') {
      query = query.eq('action', filters.action);
    }

    if (filters.contentId) {
      query = query.eq('content_id', filters.contentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data || [];
  },

  async getLiveContent(teacherId) {
    const now = new Date().toISOString();
    let query = supabase
      .from('content')
      .select('*')
      .eq('status', 'approved')
      .eq('is_broadcasting', true)
      .eq('is_deleted', false)
      .lte('start_time', now)
      .gte('end_time', now)
      .order('created_at', { ascending: false });

    if (teacherId !== 'all') {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Auto-expire broadcasts that have passed their end_time
   * Called periodically to mark expired content
   */
  async autoExpireBroadcasts() {
    const now = new Date().toISOString();
    
    // Find broadcasts that are still marked as broadcasting but past end_time
    const { data: expired, error: fetchError } = await supabase
      .from('content')
      .select('id, title')
      .eq('status', 'approved')
      .eq('is_broadcasting', true)
      .eq('is_deleted', false)
      .lt('end_time', now);

    if (fetchError) {
      console.error('Failed to find expired broadcasts:', fetchError);
      return [];
    }

    if (!expired || expired.length === 0) return [];

    // Update each expired broadcast
    for (const item of expired) {
      const { error: updateError } = await supabase
        .from('content')
        .update({
          is_broadcasting: false,
          stopped_at: now,
          stop_reason: 'Auto-expired: broadcast end time reached',
        })
        .eq('id', item.id);

      if (!updateError) {
        await this.addBroadcastHistory(
          item.id,
          'expired',
          null,
          'Broadcast automatically stopped — scheduled end time reached',
          { expired_at: now }
        );
      }
    }

    return expired;
  },

  async getStats(role, userId = null) {
    let query = supabase.from('content').select('status, is_broadcasting, is_deleted', { count: 'exact' });
    
    if (role === 'teacher') {
      query = query.eq('teacher_id', userId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const activeItems = data.filter(i => !i.is_deleted);
    const stats = {
      total: count,
      pending: activeItems.filter(i => i.status === 'pending').length,
      approved: activeItems.filter(i => i.status === 'approved').length,
      rejected: activeItems.filter(i => i.status === 'rejected').length,
      broadcasting: activeItems.filter(i => i.status === 'approved' && i.is_broadcasting).length,
      deleted: data.filter(i => i.is_deleted).length,
    };

    return stats;
  }
};
