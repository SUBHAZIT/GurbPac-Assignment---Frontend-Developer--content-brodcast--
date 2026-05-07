import { supabase } from '@/lib/supabase';

/**
 * Approval Service
 * Handles all content approval/rejection operations for the principal role.
 * Separated from content.service.js for clean separation of concerns.
 */
export const approvalService = {
  /**
   * Get all content pending approval
   */
  async getPendingContent() {
    const { data, error } = await supabase
      .from('content')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Approve a content item — sets status to 'approved'
   */
  async approveContent(contentId) {
    const { data, error } = await supabase
      .from('content')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Reject a content item — sets status to 'rejected' with mandatory reason
   */
  async rejectContent(contentId, reason) {
    if (!reason || !reason.trim()) {
      throw new Error('Rejection reason is mandatory');
    }

    const { data, error } = await supabase
      .from('content')
      .update({ status: 'rejected', rejection_reason: reason.trim() })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get approval statistics (pending, approved, rejected counts)
   */
  async getApprovalStats() {
    const { data, error } = await supabase
      .from('content')
      .select('status');

    if (error) throw error;

    return {
      total: data.length,
      pending: data.filter(i => i.status === 'pending').length,
      approved: data.filter(i => i.status === 'approved').length,
      rejected: data.filter(i => i.status === 'rejected').length,
    };
  },
};
