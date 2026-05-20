-- ================================================================
-- FIX: Allow creators to edit approved & active elections
-- Lock candidates editing for approved & active elections
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Allow creators to update elections when status is draft, rejected, approved, or active
DROP POLICY IF EXISTS "elections_creator_update" ON public.elections;
CREATE POLICY "elections_creator_update" ON public.elections
  FOR UPDATE USING (auth.uid() = creator_id AND status IN ('draft', 'rejected', 'approved', 'active'))
  WITH CHECK (auth.uid() = creator_id);

-- 2. Restrict candidates policy to only allow insert/update/delete by creators when parent election is in draft/rejected status
DROP POLICY IF EXISTS "candidates_creator_manage" ON public.candidates;

-- Creators can read candidates of their own elections regardless of status
DROP POLICY IF EXISTS "candidates_creator_select" ON public.candidates;
CREATE POLICY "candidates_creator_select" ON public.candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id AND e.creator_id = auth.uid()
    )
  );

-- Creators can insert candidates only when parent status is draft or rejected
DROP POLICY IF EXISTS "candidates_creator_insert" ON public.candidates;
CREATE POLICY "candidates_creator_insert" ON public.candidates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id 
        AND e.creator_id = auth.uid()
        AND e.status IN ('draft', 'rejected')
    )
  );

-- Creators can update candidates only when parent status is draft or rejected
DROP POLICY IF EXISTS "candidates_creator_update" ON public.candidates;
CREATE POLICY "candidates_creator_update" ON public.candidates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id 
        AND e.creator_id = auth.uid()
        AND e.status IN ('draft', 'rejected')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id 
        AND e.creator_id = auth.uid()
        AND e.status IN ('draft', 'rejected')
    )
  );

-- Creators can delete candidates only when parent status is draft or rejected
DROP POLICY IF EXISTS "candidates_creator_delete" ON public.candidates;
CREATE POLICY "candidates_creator_delete" ON public.candidates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id 
        AND e.creator_id = auth.uid()
        AND e.status IN ('draft', 'rejected')
    )
  );
