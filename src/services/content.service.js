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
        },
      ])
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
    const { data, error } = await supabase
      .from('content')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
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

  async getLiveContent(teacherId) {
    const now = new Date().toISOString();
    let query = supabase
      .from('content')
      .select('*')
      .eq('status', 'approved')
      .lte('start_time', now)
      .gte('end_time', now);

    if (teacherId !== 'all') {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getStats(role, userId = null) {
    let query = supabase.from('content').select('status', { count: 'exact' });
    
    if (role === 'teacher') {
      query = query.eq('teacher_id', userId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const stats = {
      total: count,
      pending: data.filter(i => i.status === 'pending').length,
      approved: data.filter(i => i.status === 'approved').length,
      rejected: data.filter(i => i.status === 'rejected').length,
    };

    return stats;
  }
};
