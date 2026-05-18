-- ============================================================
-- VoteSphere — Database Functions & Storage Buckets
-- Migration 003: Core Functions
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- FUNCTION: generate_secret_id
-- Generates a unique POLL-X-XXXX code for an election
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_secret_id(
  p_election_id UUID,
  p_user_id     UUID
)
RETURNS TEXT AS $$
DECLARE
  v_count  INTEGER;
  v_letter CHAR;
  v_code   TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.voter_registrations
  WHERE election_id = p_election_id;

  v_letter := CHR(65 + (v_count % 26)); -- A-Z cycling
  v_code   := 'POLL-' || v_letter || '-' || LPAD((v_count + 1)::TEXT, 4, '0');

  -- Ensure uniqueness
  WHILE EXISTS (
    SELECT 1 FROM public.voter_registrations
    WHERE election_id = p_election_id AND secret_id_code = v_code
  ) LOOP
    v_count  := v_count + 1;
    v_letter := CHR(65 + (v_count % 26));
    v_code   := 'POLL-' || v_letter || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: cast_vote (ATOMIC — prevents all race conditions)
-- This is the ONLY way votes can be inserted.
-- Direct inserts to votes table are blocked by RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_election_id    UUID,
  p_candidate_id   UUID,
  p_secret_id_code TEXT,
  p_voter_hash     TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_election     RECORD;
  v_registration RECORD;
  v_vote_hash    TEXT;
BEGIN
  -- 1. Lock election row to prevent race conditions
  SELECT * INTO v_election
  FROM public.elections
  WHERE id = p_election_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Election not found.';
  END IF;

  -- 2. Check election is active
  IF v_election.status != 'active' THEN
    RAISE EXCEPTION 'This election is not currently active.';
  END IF;

  -- 3. Check election time window
  IF NOW() < v_election.start_date OR NOW() > v_election.end_date THEN
    RAISE EXCEPTION 'Voting is not open at this time.';
  END IF;

  -- 4. Verify secret ID belongs to this election
  SELECT * INTO v_registration
  FROM public.voter_registrations
  WHERE election_id = p_election_id
    AND secret_id_code = p_secret_id_code
    AND status = 'registered'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already-used secret ID.';
  END IF;

  -- 5. Check voter hasn't already voted (via hash)
  IF EXISTS (
    SELECT 1 FROM public.votes
    WHERE election_id = p_election_id AND voter_hash = p_voter_hash
  ) THEN
    RAISE EXCEPTION 'You have already cast your vote in this election.';
  END IF;

  -- 6. Verify candidate belongs to this election
  IF NOT EXISTS (
    SELECT 1 FROM public.candidates
    WHERE id = p_candidate_id AND election_id = p_election_id
  ) THEN
    RAISE EXCEPTION 'Invalid candidate for this election.';
  END IF;

  -- 7. Generate confirmation hash
  v_vote_hash := 'VS-' || UPPER(
    ENCODE(
      DIGEST(p_voter_hash || p_election_id::TEXT || NOW()::TEXT, 'sha256'),
      'hex'
    )
  );
  v_vote_hash := LEFT(v_vote_hash, 20); -- Trim to display size

  -- 8. Insert the anonymous vote
  INSERT INTO public.votes (election_id, candidate_id, voter_hash, secret_id_code)
  VALUES (p_election_id, p_candidate_id, p_voter_hash, p_secret_id_code);

  -- 9. Update candidate vote count
  UPDATE public.candidates
  SET vote_count = vote_count + 1
  WHERE id = p_candidate_id;

  -- 10. Update election total votes and turnout %
  UPDATE public.elections
  SET
    total_votes = total_votes + 1,
    turnout_percentage = ROUND(
      ((total_votes + 1) * 100.0 / NULLIF(current_voters, 0)), 2
    )
  WHERE id = p_election_id;

  -- 11. Mark registration as voted (update status, voted_at, vote_hash)
  UPDATE public.voter_registrations
  SET
    status   = 'voted',
    voted_at = NOW(),
    vote_hash = v_vote_hash
  WHERE election_id = p_election_id
    AND secret_id_code = p_secret_id_code;

  -- 12. Return confirmation hash to client
  RETURN v_vote_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_election_results
-- Returns aggregate vote counts — never individual voter data
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_election_results(p_election_id UUID)
RETURNS TABLE (
  candidate_id   UUID,
  candidate_name TEXT,
  vote_count     INTEGER,
  percentage     NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS candidate_id,
    c.name AS candidate_name,
    c.vote_count,
    ROUND(
      c.vote_count * 100.0 / NULLIF(e.total_votes, 0), 2
    ) AS percentage
  FROM public.candidates c
  JOIN public.elections e ON e.id = c.election_id
  WHERE c.election_id = p_election_id
  ORDER BY c.vote_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- FUNCTION: register_voter (handles capacity + waitlist atomically)
-- ============================================================
CREATE OR REPLACE FUNCTION public.register_voter(
  p_election_id UUID,
  p_user_id     UUID
)
RETURNS JSONB AS $$
DECLARE
  v_election     RECORD;
  v_secret_code  TEXT;
  v_masked       TEXT;
  v_status       TEXT;
  v_wl_pos       INTEGER;
BEGIN
  -- Lock election row
  SELECT * INTO v_election
  FROM public.elections
  WHERE id = p_election_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Election not found.';
  END IF;

  IF v_election.status NOT IN ('approved', 'active') THEN
    RAISE EXCEPTION 'Election is not accepting registrations.';
  END IF;

  IF NOW() > v_election.registration_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed.';
  END IF;

  -- Check not already registered
  IF EXISTS (
    SELECT 1 FROM public.voter_registrations
    WHERE election_id = p_election_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'You are already registered for this election.';
  END IF;

  -- Generate secret ID
  v_secret_code := public.generate_secret_id(p_election_id, p_user_id);
  v_masked      := SPLIT_PART(v_secret_code, '-', 1) || '-' ||
                   SPLIT_PART(v_secret_code, '-', 2) || '-****';

  -- Determine: registered or waitlisted
  IF v_election.current_voters < v_election.max_voters THEN
    v_status := 'registered';
    v_wl_pos := NULL;

    UPDATE public.elections
    SET current_voters = current_voters + 1
    WHERE id = p_election_id;
  ELSIF v_election.is_waitlist_enabled THEN
    v_status := 'waitlisted';

    SELECT COALESCE(MAX(position), 0) + 1 INTO v_wl_pos
    FROM public.waitlist
    WHERE election_id = p_election_id AND status = 'waiting';

    UPDATE public.elections
    SET waitlist_count = waitlist_count + 1
    WHERE id = p_election_id;

    INSERT INTO public.waitlist (election_id, user_id, position)
    VALUES (p_election_id, p_user_id, v_wl_pos);
  ELSE
    RAISE EXCEPTION 'This election has reached its maximum voter capacity.';
  END IF;

  INSERT INTO public.voter_registrations
    (election_id, user_id, status, secret_id_code, secret_id_masked, waitlist_position)
  VALUES
    (p_election_id, p_user_id, v_status, v_secret_code, v_masked, v_wl_pos);

  RETURN jsonb_build_object(
    'status', v_status,
    'secret_code', v_secret_code,
    'secret_masked', v_masked,
    'waitlist_position', v_wl_pos
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: log_audit_event (bypasses RLS for system logging)
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action      TEXT,
  p_user_id     UUID DEFAULT NULL,
  p_user_email  TEXT DEFAULT NULL,
  p_user_role   TEXT DEFAULT NULL,
  p_target_id   TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT '',
  p_metadata    JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs
    (action, user_id, user_email, user_role, target_id, target_type, description, metadata)
  VALUES
    (p_action, p_user_id, p_user_email, p_user_role, p_target_id, p_target_type, p_description, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKETS
-- Create in Supabase Dashboard > Storage OR via API
-- These SQL commands configure the bucket policies
-- ============================================================

-- Run these via Supabase dashboard Storage section:
-- Bucket: 'candidate-photos'  (public: true)
-- Bucket: 'avatars'           (public: true)
-- Bucket: 'reports'           (public: false)
-- Bucket: 'certificates'      (public: false)

-- Storage RLS policies (apply after creating buckets):
-- Allow anyone to read public buckets, authenticated to upload

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('candidate-photos', 'candidate-photos', true),
  ('avatars', 'avatars', true),
  ('reports', 'reports', false),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "candidate_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'candidate-photos');

CREATE POLICY "candidate_photos_creator_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'candidate-photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_own_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

CREATE POLICY "reports_creator_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'reports' AND auth.role() = 'authenticated'
  );

CREATE POLICY "certificates_voter_access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND auth.role() = 'authenticated'
  );
