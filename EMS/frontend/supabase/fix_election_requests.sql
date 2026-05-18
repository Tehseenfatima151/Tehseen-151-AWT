-- ================================================================
-- FIX: election_requests RLS + handle_new_user trigger
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Update handle_new_user trigger to also create election_request
--    for election_creator users automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_org  TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'voter');
  v_org  := COALESCE(NEW.raw_user_meta_data->>'organization', '');

  INSERT INTO public.profiles (id, email, name, phone, role, organization, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_role,
    NULLIF(v_org, ''),
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-create pending access request for election creators
  IF v_role = 'election_creator' THEN
    INSERT INTO public.election_requests (creator_id, organization, purpose, status)
    VALUES (
      NEW.id,
      v_org,
      COALESCE(NEW.raw_user_meta_data->>'purpose', 'Platform access request for election creation'),
      'pending'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop + recreate the trigger (idempotent)
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Fix RLS: allow the trigger (SECURITY DEFINER) to insert election_requests
--    Also allow service_role bypass for initial creator inserts from client
DROP POLICY IF EXISTS "requests_creator_insert" ON public.election_requests;
CREATE POLICY "requests_creator_insert" ON public.election_requests
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id
    OR auth.role() = 'service_role'
  );

-- 4. Backfill: for any existing election_creator users who don't have a request yet
INSERT INTO public.election_requests (creator_id, organization, purpose, status)
SELECT 
  p.id,
  COALESCE(p.organization, 'Unknown Organization'),
  'Platform access request (backfilled)',
  'pending'
FROM public.profiles p
WHERE p.role = 'election_creator'
  AND NOT EXISTS (
    SELECT 1 FROM public.election_requests er WHERE er.creator_id = p.id
  );

-- 5. Allow anonymous users to also see 'approved' elections on the landing page
--    (not just 'active' ones)
DROP POLICY IF EXISTS "elections_public_active" ON public.elections;
CREATE POLICY "elections_public_visible" ON public.elections
  FOR SELECT USING (status IN ('active', 'approved'));
