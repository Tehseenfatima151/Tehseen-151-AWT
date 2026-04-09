-- Education entries for student portfolios
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  university TEXT NOT NULL,
  year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS education_user_id_idx ON public.education (user_id);
CREATE INDEX IF NOT EXISTS education_created_at_idx ON public.education (created_at DESC);

-- Experience entries for student portfolios
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  duration TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS experience_user_id_idx ON public.experience (user_id);
CREATE INDEX IF NOT EXISTS experience_created_at_idx ON public.experience (created_at DESC);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

-- Students can manage (CRUD) their own education/experience.
CREATE POLICY "education_select_own"
  ON public.education FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "education_insert_own"
  ON public.education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "education_update_own"
  ON public.education FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "education_delete_own"
  ON public.education FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "experience_select_own"
  ON public.experience FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "experience_insert_own"
  ON public.experience FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "experience_update_own"
  ON public.experience FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "experience_delete_own"
  ON public.experience FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view everything (for portfolio review).
CREATE POLICY "education_select_admin"
  ON public.education FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "experience_select_admin"
  ON public.experience FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

