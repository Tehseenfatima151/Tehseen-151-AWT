-- Project cover image URL (uploaded by student to storage bucket project-images)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Freelance / offerings students list on portfolio
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  offering_tags TEXT,
  availability TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_user_id_idx ON public.services (user_id);
CREATE INDEX IF NOT EXISTS services_created_at_idx ON public.services (created_at DESC);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_owner_or_admin"
  ON public.services FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read project images" ON storage.objects;
CREATE POLICY "Public read project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Users upload own project images" ON storage.objects;
CREATE POLICY "Users upload own project images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
