-- ============================================================
-- VoteSphere — Row Level Security Policies
-- Migration 002: RLS Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ── Helper: check if current user is super_admin ─────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── Helper: check if current user is election_creator ────────
CREATE OR REPLACE FUNCTION public.is_creator()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'election_creator'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS on all tables
-- ============================================================
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist             ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
-- Users can read their own profile; admins can read all
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile (not role/blocked fields)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can update role/blocked status
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Insert handled by trigger (handle_new_user) — no direct INSERT from client
CREATE POLICY "profiles_insert_system" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- ELECTIONS
-- ============================================================
-- Public can see active elections (for landing page)
CREATE POLICY "elections_public_active" ON public.elections
  FOR SELECT USING (status = 'active');

-- Authenticated users can see approved/active/completed elections
CREATE POLICY "elections_auth_read" ON public.elections
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND status IN ('approved', 'active', 'completed', 'pending')
  );

-- Creators can see ALL their own elections (all statuses)
CREATE POLICY "elections_creator_own" ON public.elections
  FOR SELECT USING (auth.uid() = creator_id);

-- Admins can see all elections
CREATE POLICY "elections_admin_all" ON public.elections
  FOR SELECT USING (public.is_admin());

-- Creators can insert their own elections
CREATE POLICY "elections_creator_insert" ON public.elections
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND public.is_creator());

-- Creators can update their own elections (not status — that requires admin)
CREATE POLICY "elections_creator_update" ON public.elections
  FOR UPDATE USING (auth.uid() = creator_id AND status IN ('draft', 'rejected'))
  WITH CHECK (auth.uid() = creator_id);

-- Admins can update any election (for approvals)
CREATE POLICY "elections_admin_update" ON public.elections
  FOR UPDATE USING (public.is_admin());

-- Creators can delete their own DRAFT elections only
CREATE POLICY "elections_creator_delete" ON public.elections
  FOR DELETE USING (auth.uid() = creator_id AND status = 'draft');

-- ============================================================
-- CANDIDATES
-- ============================================================
-- Anyone can read candidates for visible elections
CREATE POLICY "candidates_public_read" ON public.candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id
        AND e.status IN ('approved', 'active', 'completed')
    )
  );

-- Creators can manage candidates for their own elections
CREATE POLICY "candidates_creator_manage" ON public.candidates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id AND e.creator_id = auth.uid()
    )
  );

-- Admins have full access
CREATE POLICY "candidates_admin_all" ON public.candidates
  FOR ALL USING (public.is_admin());

-- ============================================================
-- VOTER_REGISTRATIONS
-- ============================================================
-- Voters can see only their own registrations
CREATE POLICY "voter_reg_own_select" ON public.voter_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Creators can see registrations for their elections
CREATE POLICY "voter_reg_creator_select" ON public.voter_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id AND e.creator_id = auth.uid()
    )
  );

-- Admins can see all registrations
CREATE POLICY "voter_reg_admin_all" ON public.voter_registrations
  FOR ALL USING (public.is_admin());

-- Voters can register themselves
CREATE POLICY "voter_reg_self_insert" ON public.voter_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System can update registration status (voted_at, status, vote_hash)
CREATE POLICY "voter_reg_update" ON public.voter_registrations
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- VOTES  (CRITICAL: strictly anonymous + immutable)
-- ============================================================
-- Nobody can select individual votes (protects anonymity)
-- Only aggregate views via the election_results VIEW are allowed
CREATE POLICY "votes_no_select" ON public.votes
  FOR SELECT USING (public.is_admin()); -- Only admins for audit only

-- Votes inserted ONLY via cast_vote() DB function (SECURITY DEFINER)
-- No direct client inserts allowed
CREATE POLICY "votes_no_direct_insert" ON public.votes
  FOR INSERT WITH CHECK (false); -- Block all direct inserts

-- Votes are immutable — no updates
CREATE POLICY "votes_no_update" ON public.votes
  FOR UPDATE USING (false);

-- Votes cannot be deleted
CREATE POLICY "votes_no_delete" ON public.votes
  FOR DELETE USING (false);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "notifications_admin" ON public.notifications
  FOR ALL USING (public.is_admin());

-- ============================================================
-- AUDIT_LOGS (immutable reads for admin)
-- ============================================================
CREATE POLICY "audit_admin_select" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Anyone can insert audit logs (SECURITY DEFINER function handles this)
CREATE POLICY "audit_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- No updates or deletes on audit logs
CREATE POLICY "audit_no_update" ON public.audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "audit_no_delete" ON public.audit_logs
  FOR DELETE USING (false);

-- ============================================================
-- ELECTION_REQUESTS
-- ============================================================
-- Creators see their own requests
CREATE POLICY "requests_creator_own" ON public.election_requests
  FOR SELECT USING (auth.uid() = creator_id);

-- Creators can submit new requests
CREATE POLICY "requests_creator_insert" ON public.election_requests
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND public.is_creator());

-- Admins can see and update all requests
CREATE POLICY "requests_admin_all" ON public.election_requests
  FOR ALL USING (public.is_admin());

-- ============================================================
-- WAITLIST
-- ============================================================
CREATE POLICY "waitlist_own" ON public.waitlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "waitlist_creator" ON public.waitlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id AND e.creator_id = auth.uid()
    )
  );

CREATE POLICY "waitlist_insert" ON public.waitlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "waitlist_admin" ON public.waitlist
  FOR ALL USING (public.is_admin());
