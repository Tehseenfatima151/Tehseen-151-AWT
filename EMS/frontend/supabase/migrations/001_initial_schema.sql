-- ============================================================
-- VoteSphere — Initial Database Schema
-- Migration 001: Core Tables
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Helper: updated_at auto-trigger ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: profiles
-- Extended user data beyond Supabase Auth users table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'voter'
                CHECK (role IN ('super_admin', 'election_creator', 'voter')),
  organization  TEXT,
  avatar_url    TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT false,
  is_blocked    BOOLEAN NOT NULL DEFAULT false,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: elections
-- ============================================================
CREATE TABLE IF NOT EXISTS public.elections (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   TEXT NOT NULL,
  description             TEXT NOT NULL DEFAULT '',
  category                TEXT NOT NULL DEFAULT 'community'
                          CHECK (category IN ('government','corporate','educational','community','ngo')),
  organization            TEXT NOT NULL DEFAULT '',
  status                  TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','pending','approved','rejected','active','completed')),
  creator_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date              TIMESTAMPTZ NOT NULL,
  end_date                TIMESTAMPTZ NOT NULL,
  registration_deadline   TIMESTAMPTZ NOT NULL,
  timezone                TEXT NOT NULL DEFAULT 'UTC',
  max_voters              INTEGER NOT NULL DEFAULT 1000 CHECK (max_voters > 0),
  current_voters          INTEGER NOT NULL DEFAULT 0 CHECK (current_voters >= 0),
  is_waitlist_enabled     BOOLEAN NOT NULL DEFAULT false,
  waitlist_count          INTEGER NOT NULL DEFAULT 0,
  is_voter_list_locked    BOOLEAN NOT NULL DEFAULT false,
  require_secret_id       BOOLEAN NOT NULL DEFAULT true,
  require_2fa             BOOLEAN NOT NULL DEFAULT false,
  allow_anonymous         BOOLEAN NOT NULL DEFAULT true,
  total_votes             INTEGER NOT NULL DEFAULT 0,
  turnout_percentage      NUMERIC(5,2) NOT NULL DEFAULT 0,
  rejection_reason        TEXT,
  published_at            TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  cover_image             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_dates CHECK (end_date > start_date),
  CONSTRAINT chk_reg_deadline CHECK (registration_deadline <= start_date)
);

CREATE INDEX IF NOT EXISTS idx_elections_creator  ON public.elections(creator_id);
CREATE INDEX IF NOT EXISTS idx_elections_status   ON public.elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_dates    ON public.elections(start_date, end_date);

CREATE TRIGGER trg_elections_updated_at
  BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: candidates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id   UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  designation   TEXT NOT NULL DEFAULT '',
  photo_url     TEXT,
  manifesto     TEXT NOT NULL DEFAULT '',
  vote_count    INTEGER NOT NULL DEFAULT 0 CHECK (vote_count >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_election ON public.candidates(election_id);

CREATE TRIGGER trg_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: voter_registrations
-- One row per (user, election) pair
-- ============================================================
CREATE TABLE IF NOT EXISTS public.voter_registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id       UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'registered'
                    CHECK (status IN ('registered','waitlisted','voted','blocked')),
  secret_id_code    TEXT NOT NULL,
  secret_id_masked  TEXT NOT NULL,
  waitlist_position INTEGER,
  vote_hash         TEXT,
  voted_at          TIMESTAMPTZ,
  registered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One registration per user per election
  CONSTRAINT uq_voter_election UNIQUE (election_id, user_id),
  -- Secret IDs must be unique per election
  CONSTRAINT uq_secret_id_election UNIQUE (election_id, secret_id_code)
);

CREATE INDEX IF NOT EXISTS idx_voter_reg_election ON public.voter_registrations(election_id);
CREATE INDEX IF NOT EXISTS idx_voter_reg_user     ON public.voter_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_voter_reg_status   ON public.voter_registrations(status);

-- ============================================================
-- TABLE: votes
-- ANONYMOUS — voter_hash is a one-way hash of (user_id + election_id + salt)
-- This makes it impossible to trace which user voted for which candidate
-- while still preventing double-voting
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id     UUID NOT NULL REFERENCES public.elections(id) ON DELETE RESTRICT,
  candidate_id    UUID NOT NULL REFERENCES public.candidates(id) ON DELETE RESTRICT,
  voter_hash      TEXT NOT NULL,  -- SHA256(user_id || election_id || secret_salt)
  secret_id_code  TEXT NOT NULL,
  casted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent double-voting: one hash per election
  CONSTRAINT uq_vote_per_election UNIQUE (election_id, voter_hash),
  -- Prevent voting with same secret ID twice
  CONSTRAINT uq_secret_id_vote UNIQUE (election_id, secret_id_code)
);

CREATE INDEX IF NOT EXISTS idx_votes_election   ON public.votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate  ON public.votes(candidate_id);
-- Note: intentionally NO index on voter_hash to discourage reverse lookups

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'info'
              CHECK (type IN ('info','success','warning','error')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  action_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================
-- TABLE: audit_logs (IMMUTABLE — no updates/deletes allowed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action           TEXT NOT NULL,
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email       TEXT,
  user_role        TEXT,
  target_id        TEXT,
  target_type      TEXT,
  description      TEXT NOT NULL,
  ip_address       INET,
  user_agent       TEXT,
  is_admin_override BOOLEAN NOT NULL DEFAULT false,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user    ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action  ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- TABLE: election_requests
-- Creator approval requests reviewed by super_admin
-- ============================================================
CREATE TABLE IF NOT EXISTS public.election_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization     TEXT NOT NULL,
  purpose          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  reviewed_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_creator ON public.election_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_requests_status  ON public.election_requests(status);

-- ============================================================
-- TABLE: waitlist
-- ============================================================
CREATE TABLE IF NOT EXISTS public.waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'waiting'
              CHECK (status IN ('waiting','promoted','expired')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  promoted_at TIMESTAMPTZ,

  CONSTRAINT uq_waitlist_user_election UNIQUE (election_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_election ON public.waitlist(election_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user     ON public.waitlist(user_id);

-- ============================================================
-- VIEW: election_results (for public aggregate reading)
-- ============================================================
CREATE OR REPLACE VIEW public.election_results AS
SELECT
  v.election_id,
  c.id AS candidate_id,
  c.name AS candidate_name,
  COUNT(v.id)::INTEGER AS vote_count,
  ROUND(
    COUNT(v.id) * 100.0 / NULLIF(
      (SELECT COUNT(*) FROM public.votes WHERE election_id = v.election_id), 0
    ), 2
  ) AS percentage
FROM public.candidates c
LEFT JOIN public.votes v ON v.candidate_id = c.id
GROUP BY v.election_id, c.id, c.name;

-- ============================================================
-- Auto-create profile on auth.users insert (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'voter'),
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
