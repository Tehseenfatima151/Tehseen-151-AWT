// ============================================================
// VoteSphere — Election Store (Supabase-powered)
// Replaces mock data with real Supabase queries.
// Interface is IDENTICAL to mock version — no page breaks.
// ============================================================

import { create } from 'zustand';
import type { Election, Candidate, ElectionRequest } from '../types';
import { electionService } from '../services/electionService';
import { useAuthStore } from './authStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ElectionState {
  elections: Election[];
  requests: ElectionRequest[];
  currentDraft: Partial<Election> | null;
  isLoading: boolean;
  error: string | null;
  _channel: RealtimeChannel | null;
  // Actions
  fetchElections: (options?: { creatorId?: string; status?: string }) => Promise<void>;
  getElectionById: (id: string) => Election | undefined;
  createElection: (data: Partial<Election>) => Promise<string>;
  updateElection: (id: string, data: Partial<Election>) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
  submitForApproval: (id: string) => Promise<void>;
  approveElection: (id: string) => Promise<void>;
  rejectElection: (id: string, reason: string) => Promise<void>;
  publishElection: (id: string) => Promise<void>;
  startElection: (id: string) => Promise<void>;
  endElection: (id: string) => Promise<void>;
  addCandidate: (electionId: string, candidate: Omit<Candidate, 'id' | 'voteCount'>) => Promise<void>;
  updateCandidate: (electionId: string, candidateId: string, data: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (electionId: string, candidateId: string) => Promise<void>;
  saveDraft: (data: Partial<Election>) => void;
  clearDraft: () => void;
  fetchRequests: () => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, reason: string) => Promise<void>;
  subscribeToChanges: () => void;
  unsubscribe: () => void;
}

export const useElectionStore = create<ElectionState>()((set, get) => ({
  elections:    [],
  requests:     [],
  currentDraft: null,
  isLoading:    false,
  error:        null,
  _channel:     null,

  // ── Fetch elections from Supabase ──────────────────────────
  fetchElections: async (options) => {
    set({ isLoading: true, error: null });
    try {
      let elections = await electionService.fetchElections(options);
      
      // Auto-status progression (Simulated Cron Job)
      const now = new Date();
      elections = elections.map(e => {
        const start = new Date(e.startDate);
        const end = e.endDate ? new Date(e.endDate) : null;
        
        if (e.status === 'approved' && start <= now) {
          const userId = useAuthStore.getState().user?.id ?? 'system';
          electionService.publishElection(e.id, userId).catch(console.error);
          return { ...e, status: 'active' as const };
        }
        if (e.status === 'active' && end && end <= now) {
          const userId = useAuthStore.getState().user?.id ?? 'system';
          electionService.endElection(e.id, userId).catch(console.error);
          return { ...e, status: 'completed' as const };
        }
        return e;
      });

      set({ elections, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  getElectionById: (id) => get().elections.find(e => e.id === id),

  // ── Create election ────────────────────────────────────────
  createElection: async (data) => {
    set({ isLoading: true, error: null });
    const userId = useAuthStore.getState().user?.id ?? '';
    try {
      const newId = await electionService.createElection(data, userId);
      
      if (data.candidates && data.candidates.length > 0) {
        for (const candidate of data.candidates) {
          await electionService.addCandidate(newId, candidate);
        }
      }

      await get().fetchElections({ creatorId: userId });
      set({ isLoading: false });
      return newId;
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      throw e;
    }
  },

  // ── Update election ────────────────────────────────────────
  updateElection: async (id, data) => {
    set({ isLoading: true });
    try {
      await electionService.updateElection(id, data);
      
      if (data.candidates) {
        const currentCandidates = get().elections.find(e => e.id === id)?.candidates || [];
        const newCandidates = data.candidates;
        
        const toDelete = currentCandidates.filter(cc => !newCandidates.find(nc => nc.id === cc.id));
        for (const c of toDelete) await electionService.deleteCandidate(c.id);
        
        for (const c of newCandidates) {
          if (c.id.startsWith('cand-new-')) {
            await electionService.addCandidate(id, c);
          } else {
            await electionService.updateCandidate(id, c.id, c);
          }
        }
      }

      await get().fetchElections({ creatorId: useAuthStore.getState().user?.id });
      set({ isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  deleteElection: async (id) => {
    await electionService.deleteElection(id);
    set(s => ({ elections: s.elections.filter(e => e.id !== id) }));
  },

  submitForApproval: async (id) => {
    const userId = useAuthStore.getState().user?.id ?? '';
    await electionService.submitForApproval(id, userId);
    set(s => ({ elections: s.elections.map(e => e.id === id ? { ...e, status: 'pending' } : e) }));
  },

  approveElection: async (id) => {
    const userId = useAuthStore.getState().user?.id ?? '';
    await electionService.approveElection(id, userId);
    set(s => ({ elections: s.elections.map(e => e.id === id ? { ...e, status: 'approved', publishedAt: new Date().toISOString() } : e) }));
  },

  rejectElection: async (id, reason) => {
    const userId = useAuthStore.getState().user?.id ?? '';
    await electionService.rejectElection(id, reason, userId);
    set(s => ({ elections: s.elections.map(e => e.id === id ? { ...e, status: 'rejected', rejectionReason: reason } : e) }));
  },

  publishElection: async (id) => {
    const userId = useAuthStore.getState().user?.id ?? '';
    await electionService.publishElection(id, userId);
    set(s => ({ elections: s.elections.map(e => e.id === id ? { ...e, status: 'active' } : e) }));
  },

  startElection: async (id) => {
    await get().publishElection(id);
  },

  endElection: async (id) => {
    const userId = useAuthStore.getState().user?.id ?? '';
    await electionService.endElection(id, userId);
    set(s => ({ elections: s.elections.map(e => e.id === id ? { ...e, status: 'completed', completedAt: new Date().toISOString() } : e) }));
  },

  // ── Candidates ────────────────────────────────────────────
  addCandidate: async (electionId, candidate) => {
    const newCand = await electionService.addCandidate(electionId, candidate);
    set(s => ({
      elections: s.elections.map(e => e.id === electionId ? { ...e, candidates: [...e.candidates, newCand] } : e),
    }));
  },

  updateCandidate: async (electionId, candidateId, data) => {
    await electionService.updateCandidate(electionId, candidateId, data);
    set(s => ({
      elections: s.elections.map(e => e.id === electionId ? {
        ...e, candidates: e.candidates.map(c => c.id === candidateId ? { ...c, ...data } : c),
      } : e),
    }));
  },

  deleteCandidate: async (electionId, candidateId) => {
    await electionService.deleteCandidate(candidateId);
    set(s => ({
      elections: s.elections.map(e => e.id === electionId ? {
        ...e, candidates: e.candidates.filter(c => c.id !== candidateId),
      } : e),
    }));
  },

  saveDraft:  (data) => set(s => ({ currentDraft: { ...s.currentDraft, ...data } })),
  clearDraft: ()     => set({ currentDraft: null }),

  // ── Requests ─────────────────────────────────────────────
  fetchRequests: async () => {
    const requests = await electionService.fetchRequests();
    set({ requests });
  },

  approveRequest: async (requestId) => {
    const userId = useAuthStore.getState().user?.id ?? '';
    await electionService.approveRequest(requestId, userId);
    set(s => ({ requests: s.requests.map(r => r.id === requestId ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r) }));
  },

  rejectRequest: async (requestId, reason) => {
    const userId = useAuthStore.getState().user?.id ?? '';
    await electionService.rejectRequest(requestId, reason, userId);
    set(s => ({ requests: s.requests.map(r => r.id === requestId ? { ...r, status: 'rejected', rejectionReason: reason, reviewedAt: new Date().toISOString() } : r) }));
  },

  // ── Realtime ──────────────────────────────────────────────
  subscribeToChanges: () => {
    const channel = electionService.subscribeToAllElections(async () => {
      const userId = useAuthStore.getState().user?.id;
      const user   = useAuthStore.getState().user;
      await get().fetchElections(user?.role === 'election_creator' ? { creatorId: userId } : undefined);
    });
    set({ _channel: channel });
  },

  unsubscribe: () => {
    get()._channel?.unsubscribe();
    set({ _channel: null });
  },
}));
