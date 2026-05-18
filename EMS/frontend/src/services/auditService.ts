// ============================================================
// VoteSphere — Audit Service
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from '../lib/supabase';

const sb = supabase as any;

interface AuditEventParams {
  action: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  targetId?: string;
  targetType?: string;
  description?: string;
  isAdminOverride?: boolean;
  metadata?: Record<string, unknown>;
}

export const auditService = {
  async log(params: AuditEventParams): Promise<void> {
    try {
      const { error } = await sb.rpc('log_audit_event', {
        p_action:      params.action,
        p_user_id:     params.userId ?? null,
        p_user_email:  params.userEmail ?? null,
        p_user_role:   params.userRole ?? null,
        p_target_id:   params.targetId ?? null,
        p_target_type: params.targetType ?? null,
        p_description: params.description ?? params.action,
        p_metadata:    params.metadata ? JSON.stringify(params.metadata) : null,
      });
      if (error) console.warn('[AuditService]', error.message);
    } catch { console.warn('[AuditService] Unexpected failure'); }
  },

  async fetchLogs(options?: { limit?: number; offset?: number; action?: string; userId?: string }) {
    let query = sb.from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(options?.limit ?? 50);

    if (options?.offset) query = query.range(options.offset, options.offset + (options?.limit ?? 50) - 1);
    if (options?.action) query = query.eq('action', options.action);
    if (options?.userId) query = query.eq('user_id', options.userId);

    const { data, error, count } = await query;
    if (error) console.error('[AuditService] fetchLogs:', error.message);
    return { logs: data ?? [], total: count ?? 0 };
  },
};
