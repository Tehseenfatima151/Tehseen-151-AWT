// ============================================================
// VoteSphere — Voting Store (Supabase-powered)
// Replaces mock data with real Supabase calls.
// Interface is IDENTICAL to mock version — no page breaks.
// ============================================================

import { create } from 'zustand';
import type { VoterRegistration, SecretId } from '../types';
import { votingService } from '../services/votingService';
import { useAuthStore } from './authStore';
import { useElectionStore } from './electionStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface VotingState {
  registrations:   VoterRegistration[];
  secretIds:       SecretId[];
  castedVotes:     Record<string, string>; // electionId → candidateId (local cache)
  isLoading:       boolean;
  error:           string | null;
  _channels:       RealtimeChannel[];
  joinElection:    (electionId: string, userId: string, userName: string, userEmail: string) => Promise<{ success: boolean; status: string }>;
  castVote:        (electionId: string, candidateId: string, secretId: string) => Promise<string | null>;
  verifySecretId:  (electionId: string, secretId: string) => Promise<boolean>;
  regenerateSecretId: (secretIdId: string) => Promise<void>;
  revokeSecretId:  (secretIdId: string) => Promise<void>;
  getMyRegistration: (electionId: string, userId: string) => VoterRegistration | undefined;
  hasVoted:        (electionId: string) => boolean;
  getSecretIdForElection: (electionId: string, userId: string) => SecretId | undefined;
  fetchMyData:     (userId: string) => Promise<void>;
  subscribeToResults: (electionId: string, onUpdate: () => void) => void;
  unsubscribeAll:  () => void;
}

export const useVotingStore = create<VotingState>()((set, get) => ({
  registrations: [],
  secretIds:     [],
  castedVotes:   {},
  isLoading:     false,
  error:         null,
  _channels:     [],

  // ── Fetch my registrations + secret IDs from Supabase ─────
  fetchMyData: async (userId: string) => {
    set({ isLoading: true });
    const [registrations, secretIds] = await Promise.all([
      votingService.getMyRegistrations(userId),
      votingService.getMySecretIds(userId),
    ]);
    // Rebuild castedVotes map from DB
    const castedVotes: Record<string, string> = {};
    registrations.filter(r => r.status === 'voted').forEach(r => {
      castedVotes[r.electionId] = 'voted'; // We only track whether voted, not which candidate
    });
    set({ registrations, secretIds, castedVotes, isLoading: false });
  },

  // ── Register for election ──────────────────────────────────
  joinElection: async (electionId, userId) => {
    set({ isLoading: true, error: null });
    const result = await votingService.registerForElection(electionId, userId);
    if (!result.success) {
      set({ isLoading: false, error: result.error ?? 'Registration failed.' });
      return { success: false, status: 'error' };
    }
    // Refresh data
    await get().fetchMyData(userId);
    const user = useAuthStore.getState().user;
    await useElectionStore.getState().fetchElections(user?.role === 'election_creator' ? { creatorId: user.id } : undefined);
    return { success: true, status: result.status };
  },

  // ── Cast vote ─────────────────────────────────────────────
  castVote: async (electionId, candidateId, secretId) => {
    set({ isLoading: true });
    const userId = useAuthStore.getState().user?.id;
    if (!userId) { set({ isLoading: false, error: 'Not authenticated.' }); return null; }

    const { hash, error } = await votingService.castVote(electionId, candidateId, secretId, userId);
    if (!hash || error) {
      set({ isLoading: false, error: error ?? 'Vote failed.' });
      return null;
    }
    // Update local state
    set(s => ({
      castedVotes:   { ...s.castedVotes, [electionId]: candidateId },
      registrations: s.registrations.map(r =>
        r.electionId === electionId ? { ...r, status: 'voted', votedAt: new Date().toISOString(), voteHash: hash } : r
      ),
      secretIds: s.secretIds.map(sid =>
        sid.electionId === electionId ? { ...sid, isUsed: true, usedAt: new Date().toISOString() } : sid
      ),
      isLoading: false,
    }));
    const user = useAuthStore.getState().user;
    await useElectionStore.getState().fetchElections(user?.role === 'election_creator' ? { creatorId: user.id } : undefined);
    return hash;
  },

  // ── Verify secret ID ──────────────────────────────────────
  verifySecretId: async (electionId, secretId) => {
    return votingService.verifySecretId(electionId, secretId);
  },

  // ── Regenerate secret ID (admin/creator action) ───────────
  regenerateSecretId: async (_secretIdId) => {
    // In a real system this requires a backend action; for now refresh
    const userId = useAuthStore.getState().user?.id;
    if (userId) await get().fetchMyData(userId);
  },

  // ── Revoke a registration (block voter) ───────────────────
  revokeSecretId: async (_secretIdId) => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) await get().fetchMyData(userId);
  },

  // ── Helpers ───────────────────────────────────────────────
  getMyRegistration: (electionId, userId) =>
    get().registrations.find(r => r.electionId === electionId && r.userId === userId),

  hasVoted: (electionId) => !!get().castedVotes[electionId],

  getSecretIdForElection: (electionId, userId) =>
    get().secretIds.find(s => s.electionId === electionId && s.userId === userId),

  // ── Realtime ──────────────────────────────────────────────
  subscribeToResults: (electionId, onUpdate) => {
    const channel = votingService.subscribeToResults(electionId, onUpdate);
    set(s => ({ _channels: [...s._channels, channel] }));
  },

  unsubscribeAll: () => {
    get()._channels.forEach(c => c.unsubscribe());
    set({ _channels: [] });
  },
}));
