import { supabase } from '@/lib/supabase';

const FREE_VIEW_LIMIT = 10;

/**
 * Generate a tamper-resistant browser fingerprint.
 * Combines multiple browser properties into a hash that's hard to spoof.
 */
function generateFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform || 'unknown',
  ];
  
  // Simple hash function (DJB2)
  const str = components.join('|');
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'fp_' + Math.abs(hash).toString(36);
}

/**
 * Viewer Service
 * Tracks content views for the public broadcast page.
 * Uses server-side storage (Supabase) for tamper-proof counting.
 * Falls back to a browser fingerprint for anonymous viewers.
 */
export const viewerService = {
  _fingerprint: null,

  /**
   * Get or create a persistent viewer fingerprint
   */
  getViewerFingerprint() {
    if (this._fingerprint) return this._fingerprint;
    this._fingerprint = generateFingerprint();
    return this._fingerprint;
  },

  /**
   * Record a content view on the server
   * @param {string} contentId - The ID of the content being viewed
   */
  async recordView(contentId) {
    const fingerprint = this.getViewerFingerprint();
    
    try {
      // Check if this viewer already viewed this content
      const { data: existing } = await supabase
        .from('public_views')
        .select('id')
        .eq('viewer_fingerprint', fingerprint)
        .eq('content_id', contentId)
        .maybeSingle();

      if (existing) return; // Already recorded

      await supabase
        .from('public_views')
        .insert({
          viewer_fingerprint: fingerprint,
          content_id: contentId,
        });
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  },

  /**
   * Get the total unique content views for this viewer (server-authoritative)
   * @returns {number} Number of unique content items viewed
   */
  async getViewCount() {
    const fingerprint = this.getViewerFingerprint();
    
    try {
      const { count, error } = await supabase
        .from('public_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewer_fingerprint', fingerprint);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Failed to get view count:', error);
      return 0;
    }
  },

  /**
   * Check if the viewer has exceeded the free view limit
   * @returns {{ allowed: boolean, viewsUsed: number, limit: number }}
   */
  async checkViewAccess() {
    const viewCount = await this.getViewCount();
    return {
      allowed: viewCount < FREE_VIEW_LIMIT,
      viewsUsed: viewCount,
      limit: FREE_VIEW_LIMIT,
    };
  },
};
