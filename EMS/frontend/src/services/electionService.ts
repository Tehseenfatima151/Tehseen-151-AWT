// ============================================================
// VoteSphere — Election Service
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Election, Candidate, ElectionRequest } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { auditService } from './auditService';

const sb = supabase as any;

function rowToElection(row: any, candidates: Candidate[] = []): Election {
  return {
    id:                    row.id,
    title:                 row.title,
    description:           row.description,
    category:              row.category,
    organization:          row.organization,
    status:                row.status,
    creatorId:             row.creator_id,
    creatorName:           row.creator_name ?? '',
    creatorEmail:          row.creator_email ?? '',
    startDate:             row.start_date,
    endDate:               row.end_date,
    registrationDeadline:  row.registration_deadline,
    timezone:              row.timezone ?? 'UTC',
    maxVoters:             row.max_voters ?? 1000,
    currentVoters:         row.current_voters ?? 0,
    isWaitlistEnabled:     row.is_waitlist_enabled ?? false,
    waitlistCount:         row.waitlist_count ?? 0,
    isVoterListLocked:     row.is_voter_list_locked ?? false,
    requireSecretId:       row.require_secret_id ?? true,
    require2FA:            row.require_2fa ?? false,
    allowAnonymous:        row.allow_anonymous ?? true,
    candidates,
    totalVotes:            row.total_votes ?? 0,
    turnoutPercentage:     row.turnout_percentage ?? 0,
    rejectionReason:       row.rejection_reason ?? undefined,
    publishedAt:           row.published_at ?? undefined,
    completedAt:           row.completed_at ?? undefined,
    createdAt:             row.created_at,
    updatedAt:             row.updated_at,
    coverImage:            row.cover_image ?? undefined,
  };
}

function rowToCandidate(row: any): Candidate {
  return {
    id:          row.id,
    electionId:  row.election_id,
    name:        row.name,
    designation: row.designation,
    photo:       row.photo_url ?? '',
    manifesto:   row.manifesto,
    voteCount:   row.vote_count ?? 0,
    order:       row.display_order ?? 0,
  };
}

function rowToRequest(row: any): ElectionRequest {
  return {
    id:              row.id,
    creatorId:       row.creator_id,
    creatorName:     row.creator_name ?? '',
    creatorEmail:    row.creator_email ?? '',
    creatorPhone:    row.creator_phone ?? '',
    organization:    row.organization,
    purpose:         row.purpose,
    status:          row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    submittedAt:     row.submitted_at,
    reviewedAt:      row.reviewed_at ?? undefined,
    reviewedBy:      row.reviewed_by ?? undefined,
  };
}

export const electionService = {
  async fetchElections(options?: { creatorId?: string; status?: string }): Promise<Election[]> {
    let query = sb.from('elections')
      .select('*, profiles:creator_id (name, email, phone), candidates (*)')
      .order('created_at', { ascending: false });

    if (options?.creatorId) query = query.eq('creator_id', options.creatorId);
    if (options?.status)    query = query.eq('status', options.status);

    const { data, error } = await query;
    if (error) handleSupabaseError(error, 'fetchElections');
    return (data ?? []).map((row: any) => {
      const candidates = (row.candidates ?? []).map(rowToCandidate);
      return rowToElection({ ...row, creator_name: row.profiles?.name ?? '', creator_email: row.profiles?.email ?? '' }, candidates);
    });
  },

  async fetchById(id: string): Promise<Election | null> {
    const { data, error } = await sb.from('elections')
      .select('*, profiles:creator_id (name, email, phone), candidates (*)')
      .eq('id', id)
      .single();
    if (error) return null;
    const candidates = (data.candidates ?? []).map(rowToCandidate);
    return rowToElection({ ...data, creator_name: data.profiles?.name ?? '', creator_email: data.profiles?.email ?? '' }, candidates);
  },

  async createElection(data: Partial<Election>, creatorId: string): Promise<string> {
    const { data: row, error } = await sb.from('elections').insert({
      title:                 data.title ?? 'Untitled Election',
      description:           data.description ?? '',
      category:              data.category ?? 'community',
      organization:          data.organization ?? '',
      status:                'draft',
      creator_id:            creatorId,
      start_date:            data.startDate ?? new Date().toISOString(),
      end_date:              data.endDate ?? new Date().toISOString(),
      registration_deadline: data.registrationDeadline ?? new Date().toISOString(),
      timezone:              data.timezone ?? 'UTC',
      max_voters:            data.maxVoters ?? 1000,
      is_waitlist_enabled:   data.isWaitlistEnabled ?? false,
      require_secret_id:     data.requireSecretId ?? true,
      require_2fa:           data.require2FA ?? false,
      allow_anonymous:       data.allowAnonymous ?? true,
      cover_image:           data.coverImage ?? null,
    }).select('id').single();

    if (error) handleSupabaseError(error, 'createElection');
    await auditService.log({ action: 'create', userId: creatorId, targetId: row.id, targetType: 'election', description: `Election created: ${data.title}` });
    return row.id;
  },

  async updateElection(id: string, data: Partial<Election>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.title !== undefined)                updates.title = data.title;
    if (data.description !== undefined)          updates.description = data.description;
    if (data.category !== undefined)             updates.category = data.category;
    if (data.organization !== undefined)         updates.organization = data.organization;
    if (data.startDate !== undefined)            updates.start_date = data.startDate;
    if (data.endDate !== undefined)              updates.end_date = data.endDate;
    if (data.registrationDeadline !== undefined) updates.registration_deadline = data.registrationDeadline;
    if (data.timezone !== undefined)             updates.timezone = data.timezone;
    if (data.maxVoters !== undefined)            updates.max_voters = data.maxVoters;
    if (data.isWaitlistEnabled !== undefined)    updates.is_waitlist_enabled = data.isWaitlistEnabled;
    if (data.requireSecretId !== undefined)      updates.require_secret_id = data.requireSecretId;
    if (data.require2FA !== undefined)           updates.require_2fa = data.require2FA;
    if (data.allowAnonymous !== undefined)       updates.allow_anonymous = data.allowAnonymous;
    if (data.coverImage !== undefined)           updates.cover_image = data.coverImage;
    if (data.status !== undefined)               updates.status = data.status;
    if (data.rejectionReason !== undefined)      updates.rejection_reason = data.rejectionReason;
    if (data.isVoterListLocked !== undefined)    updates.is_voter_list_locked = data.isVoterListLocked;
    if (data.publishedAt !== undefined)          updates.published_at = data.publishedAt;
    if (data.completedAt !== undefined)          updates.completed_at = data.completedAt;

    const { error } = await sb.from('elections').update(updates).eq('id', id);
    if (error) handleSupabaseError(error, 'updateElection');
  },

  async deleteElection(id: string): Promise<void> {
    const { error } = await sb.from('elections').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteElection');
  },

  async submitForApproval(id: string, creatorId: string): Promise<void> {
    await electionService.updateElection(id, { status: 'pending' });
    await auditService.log({ action: 'submit_approval', userId: creatorId, targetId: id, targetType: 'election', description: 'Election submitted for approval' });
  },

  async approveElection(id: string, adminId: string): Promise<void> {
    await electionService.updateElection(id, { status: 'approved', publishedAt: new Date().toISOString() });
    await auditService.log({ action: 'approve', userId: adminId, targetId: id, targetType: 'election', description: 'Election approved', isAdminOverride: true });
  },

  async rejectElection(id: string, reason: string, adminId: string): Promise<void> {
    await electionService.updateElection(id, { status: 'rejected', rejectionReason: reason });
    await auditService.log({ action: 'reject', userId: adminId, targetId: id, targetType: 'election', description: `Rejected: ${reason}`, isAdminOverride: true });
  },

  async publishElection(id: string, creatorId: string): Promise<void> {
    await electionService.updateElection(id, { status: 'active', isVoterListLocked: true });
    await auditService.log({ action: 'publish', userId: creatorId, targetId: id, targetType: 'election', description: 'Election published' });
  },

  async endElection(id: string, creatorId: string): Promise<void> {
    await electionService.updateElection(id, { status: 'completed', completedAt: new Date().toISOString() });
    await auditService.log({ action: 'end_election', userId: creatorId, targetId: id, targetType: 'election', description: 'Election ended' });
  },

  // ── Candidates ────────────────────────────────────────────
  async addCandidate(electionId: string, candidate: Omit<Candidate, 'id' | 'voteCount'>): Promise<Candidate> {
    const { data, error } = await sb.from('candidates').insert({
      election_id:   electionId,
      name:          candidate.name,
      designation:   candidate.designation,
      photo_url:     candidate.photo ?? null,
      manifesto:     candidate.manifesto ?? '',
      display_order: candidate.order ?? 0,
    }).select().single();
    if (error) handleSupabaseError(error, 'addCandidate');
    return rowToCandidate(data);
  },

  async updateCandidate(electionId: string, candidateId: string, data: Partial<Candidate>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined)        updates.name = data.name;
    if (data.designation !== undefined) updates.designation = data.designation;
    if (data.photo !== undefined)       updates.photo_url = data.photo;
    if (data.manifesto !== undefined)   updates.manifesto = data.manifesto;
    if (data.order !== undefined)       updates.display_order = data.order;
    const { error } = await sb.from('candidates').update(updates).eq('id', candidateId).eq('election_id', electionId);
    if (error) handleSupabaseError(error, 'updateCandidate');
  },

  async deleteCandidate(candidateId: string): Promise<void> {
    const { error } = await sb.from('candidates').delete().eq('id', candidateId);
    if (error) handleSupabaseError(error, 'deleteCandidate');
  },

  // ── Election Requests ─────────────────────────────────────
  async fetchRequests(): Promise<ElectionRequest[]> {
    const { data, error } = await sb.from('election_requests')
      .select('*, profiles:creator_id (name, email, phone)')
      .order('submitted_at', { ascending: false });
    if (error) handleSupabaseError(error, 'fetchRequests');
    return (data ?? []).map((row: any) => rowToRequest({ ...row, creator_name: row.profiles?.name ?? '', creator_email: row.profiles?.email ?? '', creator_phone: row.profiles?.phone ?? '' }));
  },

  async submitRequest(creatorId: string, organization: string, purpose: string): Promise<void> {
    const { error } = await sb.from('election_requests').insert({ creator_id: creatorId, organization, purpose });
    if (error) handleSupabaseError(error, 'submitRequest');
  },

  async approveRequest(requestId: string, adminId: string): Promise<void> {
    const { error } = await sb.from('election_requests').update({ status: 'approved', reviewed_by: adminId, reviewed_at: new Date().toISOString() }).eq('id', requestId);
    if (error) handleSupabaseError(error, 'approveRequest');
  },

  async rejectRequest(requestId: string, reason: string, adminId: string): Promise<void> {
    const { error } = await sb.from('election_requests').update({ status: 'rejected', rejection_reason: reason, reviewed_by: adminId, reviewed_at: new Date().toISOString() }).eq('id', requestId);
    if (error) handleSupabaseError(error, 'rejectRequest');
  },

  // ── Realtime ──────────────────────────────────────────────
  subscribeToElection(electionId: string, onUpdate: (election: Partial<Election>) => void): RealtimeChannel {
    return supabase.channel(`election:${electionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'elections', filter: `id=eq.${electionId}` }, (payload: any) => onUpdate(rowToElection(payload.new)))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates', filter: `election_id=eq.${electionId}` }, () => onUpdate({}))
      .subscribe();
  },

  subscribeToAllElections(onUpdate: () => void): RealtimeChannel {
    return supabase.channel('elections:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections' }, () => onUpdate())
      .subscribe();
  },
};
