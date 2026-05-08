import { supabase } from '@/lib/supabase';

/**
 * Helper: check if the new broadcast-control columns exist.
 * Cached after the first successful probe so we only hit the DB once per session.
 */
let _hasNewColumns = null;

async function hasNewColumns() {
  if (_hasNewColumns !== null) return _hasNewColumns;
  try {
    const { error } = await supabase
      .from('content')
      .select('is_broadcasting')
      .limit(1);
    _hasNewColumns = !error;
  } catch {
    _hasNewColumns = false;
  }
  return _hasNewColumns;
}

let _hasHistoryTable = null;

async function hasHistoryTable() {
  if (_hasHistoryTable !== null) return _hasHistoryTable;
  try {
    const { error } = await supabase
      .from('broadcast_history')
      .select('id')
      .limit(1);
    _hasHistoryTable = !error;
  } catch {
    _hasHistoryTable = false;
  }
  return _hasHistoryTable;
}

export const contentService = {
  async uploadContent(contentData, file) {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${contentData.teacher_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content-files')
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-files')
      .getPublicUrl(filePath);

    // 3. Save metadata to database
    const insertData = {
      ...contentData,
      file_url: publicUrl,
      status: 'pending',
    };

    // Only include new columns if migration has been run
    if (await hasNewColumns()) {
      insertData.is_broadcasting = true;
      insertData.is_deleted = false;
    }

    const { data, error } = await supabase
      .from('content')
      .insert([insertData])
      .select();

    if (error) throw error;
    return data[0];
  },

  async getMyContent(teacherId) {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getPendingContent() {
    let query = supabase
      .from('content')
      .select('*, profiles!content_teacher_id_fkey(full_name, email)')
      .eq('status', 'pending');

    // Only filter by is_deleted if the column exists
    if (await hasNewColumns()) {
      query = query.eq('is_deleted', false);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getAllContent(filters = {}) {
    let query = supabase
      .from('content')
      .select('*, profiles!content_teacher_id_fkey(full_name, email)');

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateContentStatus(id, status, reason = null) {
    const updateData = { status, rejection_reason: reason };
    
    // If approving, also ensure it's marked as broadcasting and not deleted
    if (status === 'approved' && (await hasNewColumns())) {
      updateData.is_broadcasting = true;
      updateData.is_deleted = false;
      updateData.stopped_at = null;
      updateData.stop_reason = null;
    }

    const { data, error } = await supabase
      .from('content')
      .update(updateData)
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

    if (!(await hasNewColumns())) {
      throw new Error('Database migration required. Please run migration 009_broadcast_controls.sql first.');
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

    if (!(await hasNewColumns())) {
      throw new Error('Database migration required. Please run migration 009_broadcast_controls.sql first.');
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
    if (!(await hasNewColumns())) {
      throw new Error('Database migration required. Please run migration 009_broadcast_controls.sql first.');
    }

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
   * Add an entry to broadcast history (fails silently if table doesn't exist)
   */
  async addBroadcastHistory(contentId, action, performedBy, reason = null, metadata = {}) {
    if (!(await hasHistoryTable())) return;

    try {
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
    } catch (e) {
      console.error('Broadcast history error:', e);
    }
  },

  /**
   * Get broadcast history with content and user details
   */
  async getBroadcastHistory(filters = {}) {
    if (!(await hasHistoryTable())) return [];

    try {
      let query = supabase
        .from('broadcast_history')
        .select('*, content(id, title, subject, file_type, teacher_id, profiles!content_teacher_id_fkey(full_name)), profiles!broadcast_history_performed_by_fkey(full_name, role)');

      if (filters.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }

      if (filters.contentId) {
        query = query.eq('content_id', filters.contentId);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to fetch broadcast history:', e);
      return [];
    }
  },

  async getLiveContent(teacherId) {
    const newCols = await hasNewColumns();
    const now = new Date().toISOString();

    let query = supabase
      .from('content')
      .select('*')
      .eq('status', 'approved');

    // Apply new column filters only if migration has been run
    if (newCols) {
      // Use OR to allow NULLs for legacy compatibility
      query = query
        .or('is_broadcasting.eq.true,is_broadcasting.is.null')
        .or('is_deleted.eq.false,is_deleted.is.null');
    }

    // Filter by time window for auto-stop, but allow nulls for legacy content
    query = query
      .or(`start_time.lte.${now},start_time.is.null`)
      .or(`end_time.gte.${now},end_time.is.null`)
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
   * Called periodically to mark expired content.
   * Fails silently if new columns don't exist.
   */
  async autoExpireBroadcasts() {
    if (!(await hasNewColumns())) return [];

    try {
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
    } catch (e) {
      console.error('Auto-expire error:', e);
      return [];
    }
  },

  async getStats(role, userId = null) {
    const newCols = await hasNewColumns();

    // Select columns based on what exists
    const selectCols = newCols ? 'status, is_broadcasting, is_deleted' : 'status';
    let query = supabase.from('content').select(selectCols, { count: 'exact' });
    
    if (role === 'teacher') {
      query = query.eq('teacher_id', userId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    if (newCols) {
      const activeItems = data.filter(i => !i.is_deleted);
      return {
        total: count,
        pending: activeItems.filter(i => i.status === 'pending').length,
        approved: activeItems.filter(i => i.status === 'approved').length,
        rejected: activeItems.filter(i => i.status === 'rejected').length,
        broadcasting: activeItems.filter(i => i.status === 'approved' && i.is_broadcasting).length,
        deleted: data.filter(i => i.is_deleted).length,
      };
    }

    // Fallback: old schema without new columns
    return {
      total: count,
      pending: data.filter(i => i.status === 'pending').length,
      approved: data.filter(i => i.status === 'approved').length,
      rejected: data.filter(i => i.status === 'rejected').length,
      broadcasting: 0,
      deleted: 0,
    };
  }
};
