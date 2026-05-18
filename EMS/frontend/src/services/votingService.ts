// ============================================================
// VoteSphere — Voting Service
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase, handleSupabaseError } from '../lib/supabase';
import type { VoterRegistration, SecretId } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { auditService } from './auditService';

const sb = supabase as any;

async function hashVoterIdentity(userId: string, electionId: string): Promise<string> {
  const salt = 'VS_VOTE_SALT_2026';
  const data = new TextEncoder().encode(`${userId}:${electionId}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function rowToRegistration(row: any): VoterRegistration {
  return {
    id:               row.id,
    electionId:       row.election_id,
    userId:           row.user_id,
    userName:         row.user_name ?? '',
    userEmail:        row.user_email ?? '',
    status:           row.status,
    secretId:         row.secret_id_code,
    secretIdMasked:   row.secret_id_masked,
    registeredAt:     row.registered_at,
    votedAt:          row.voted_at ?? undefined,
    waitlistPosition: row.waitlist_position ?? undefined,
    voteHash:         row.vote_hash ?? undefined,
  };
}

function rowToSecretId(row: any): SecretId {
  return {
    id:            row.id,
    electionId:    row.election_id,
    electionTitle: row.election_title ?? '',
    userId:        row.user_id,
    code:          row.secret_id_code,
    masked:        row.secret_id_masked,
    isUsed:        row.status === 'voted',
    isRevoked:     row.status === 'blocked',
    generatedAt:   row.registered_at,
    usedAt:        row.voted_at ?? undefined,
    expiresAt:     row.expires_at ?? new Date(Date.now() + 365 * 86400000).toISOString(),
  };
}

export const votingService = {
  async registerForElection(electionId: string, userId: string): Promise<{ success: boolean; status: string; secretCode?: string; secretMasked?: string; error?: string }> {
    const { data, error } = await sb.rpc('register_voter', { p_election_id: electionId, p_user_id: userId });
    if (error) return { success: false, status: 'error', error: error.message };
    await auditService.log({ action: 'voter_registration', userId, targetId: electionId, targetType: 'election', description: `Voter registered: ${data?.status}` });
    return { success: true, status: data?.status ?? 'registered', secretCode: data?.secret_code, secretMasked: data?.secret_masked };
  },

  async castVote(electionId: string, candidateId: string, secretIdCode: string, userId: string): Promise<{ hash: string | null; error?: string }> {
    const voterHash = await hashVoterIdentity(userId, electionId);
    const { data, error } = await sb.rpc('cast_vote', { p_election_id: electionId, p_candidate_id: candidateId, p_secret_id_code: secretIdCode, p_voter_hash: voterHash });
    if (error) return { hash: null, error: error.message };
    await auditService.log({ action: 'vote', userId, targetId: electionId, targetType: 'election', description: 'Anonymous vote cast', metadata: { confirmation_hash: data } });
    return { hash: data as string };
  },

  async verifySecretId(electionId: string, secretIdCode: string): Promise<boolean> {
    const { data } = await sb.from('voter_registrations').select('id, status').eq('election_id', electionId).eq('secret_id_code', secretIdCode).single();
    return !!data && data.status === 'registered';
  },

  async hasVoted(electionId: string, userId: string): Promise<boolean> {
    const voterHash = await hashVoterIdentity(userId, electionId);
    const { data } = await sb.from('votes').select('id').eq('election_id', electionId).eq('voter_hash', voterHash).single();
    return !!data;
  },

  async getMyRegistrations(userId: string): Promise<VoterRegistration[]> {
    const { data, error } = await sb.from('voter_registrations').select('*, elections:election_id (title)').eq('user_id', userId).order('registered_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getMyRegistrations');
    return (data ?? []).map((row: any) => ({ ...rowToRegistration(row), electionTitle: row.elections?.title ?? '' }));
  },

  async getRegistration(electionId: string, userId: string): Promise<VoterRegistration | null> {
    const { data } = await sb.from('voter_registrations').select('*').eq('election_id', electionId).eq('user_id', userId).single();
    return data ? rowToRegistration(data) : null;
  },

  async getMySecretIds(userId: string): Promise<SecretId[]> {
    const { data, error } = await sb.from('voter_registrations').select('*, elections:election_id (title)').eq('user_id', userId).order('registered_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getMySecretIds');
    return (data ?? []).map((row: any) => ({ ...rowToSecretId(row), electionTitle: row.elections?.title ?? '' }));
  },

  async getElectionRegistrations(electionId: string): Promise<VoterRegistration[]> {
    const { data, error } = await sb.from('voter_registrations').select('*, profiles:user_id (name, email)').eq('election_id', electionId).order('registered_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getElectionRegistrations');
    return (data ?? []).map((row: any) => ({ ...rowToRegistration(row), userName: row.profiles?.name ?? '', userEmail: row.profiles?.email ?? '' }));
  },

  async getElectionResults(electionId: string): Promise<Array<{ candidateId: string; candidateName: string; voteCount: number; percentage: number }>> {
    const { data, error } = await sb.rpc('get_election_results', { p_election_id: electionId });
    if (error) handleSupabaseError(error, 'getElectionResults');
    return (data ?? []).map((row: any) => ({ candidateId: row.candidate_id, candidateName: row.candidate_name, voteCount: row.vote_count ?? 0, percentage: row.percentage ?? 0 }));
  },

  subscribeToResults(electionId: string, onUpdate: () => void): RealtimeChannel {
    return supabase.channel(`votes:${electionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes', filter: `election_id=eq.${electionId}` }, () => onUpdate())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `election_id=eq.${electionId}` }, () => onUpdate())
      .subscribe();
  },
};
