-- Feedback from admins to students
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback (created_at DESC);

-- One aggregate rating per student (admin updates via upsert)
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ratings_user_id_unique UNIQUE (user_id)
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Feedback policies
CREATE POLICY "feedback_select_own_student"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "feedback_select_admin"
  ON public.feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "feedback_insert_admin"
  ON public.feedback FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    AND admin_id = auth.uid()
  );

-- Ratings policies
CREATE POLICY "ratings_select_own_student"
  ON public.ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ratings_select_admin"
  ON public.ratings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "ratings_insert_admin"
  ON public.ratings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "ratings_update_admin"
  ON public.ratings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "ratings_delete_admin"
  ON public.ratings FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));
