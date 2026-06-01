-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('opportunity', 'application', 'status_change', 'feedback', 'badge', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at DESC);

-- 3. Row Level Security Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_all" ON public.notifications;
CREATE POLICY "notifications_insert_all"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Enable Supabase Realtime for Notifications table
-- (Executed safely checking if the publication exists first)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Try to add table, ignoring if already added
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;


-- =========================================================================
-- DATABASE TRIGGERS FOR AUTOMATIC NOTIFICATION GENERATION
-- =========================================================================

-- Trigger A: Admin posts a new opportunity (notifies all students)
CREATE OR REPLACE FUNCTION public.on_opportunity_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT id, 'New Opportunity', 'A new opportunity "' || NEW.title || '" has been posted.', 'opportunity'
  FROM public.users
  WHERE role = 'student';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_opportunity_created ON public.opportunities;
CREATE TRIGGER tr_opportunity_created
  AFTER INSERT ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.on_opportunity_created();


-- Trigger B: Student applies for an opportunity (notifies all admins)
CREATE OR REPLACE FUNCTION public.on_application_created()
RETURNS TRIGGER AS $$
DECLARE
  student_name TEXT;
  opportunity_title TEXT;
BEGIN
  SELECT name INTO student_name FROM public.users WHERE id = NEW.student_id;
  SELECT title INTO opportunity_title FROM public.opportunities WHERE id = NEW.opportunity_id;
  
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT id, 'New Application Received', student_name || ' has applied for "' || opportunity_title || '".', 'application'
  FROM public.users
  WHERE role = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_application_created ON public.applications;
CREATE TRIGGER tr_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.on_application_created();


-- Trigger C: Admin updates application status (notifies the applicant student)
CREATE OR REPLACE FUNCTION public.on_application_status_updated()
RETURNS TRIGGER AS $$
DECLARE
  opportunity_title TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT title INTO opportunity_title FROM public.opportunities WHERE id = NEW.opportunity_id;
    
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Application Status Updated',
      'Your application status for "' || opportunity_title || '" has been updated to "' || UPPER(NEW.status) || '".',
      'status_change'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_application_status_updated ON public.applications;
CREATE TRIGGER tr_application_status_updated
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.on_application_status_updated();


-- Trigger D: Admin submits feedback (notifies student)
CREATE OR REPLACE FUNCTION public.on_feedback_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'New Feedback Received',
    'An administrator has submitted new feedback on your profile.',
    'feedback'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_feedback_created ON public.feedback;
CREATE TRIGGER tr_feedback_created
  AFTER INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.on_feedback_created();


-- Trigger E: Admin updates rating (notifies student)
CREATE OR REPLACE FUNCTION public.on_rating_upserted()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'Profile Rating Updated',
    'Your profile aggregate rating has been updated to ' || NEW.rating || '/5.',
    'feedback'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_rating_upserted ON public.ratings;
CREATE TRIGGER tr_rating_upserted
  AFTER INSERT OR UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.on_rating_upserted();


-- Trigger F: Student badges updated (notifies student on developer/performer badges)
CREATE OR REPLACE FUNCTION public.on_user_badges_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_verified_developer IS DISTINCT FROM NEW.is_verified_developer AND NEW.is_verified_developer = true THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      'Verified Developer Badge',
      'Congratulations! You have been awarded the "Verified Developer" badge by the administration.',
      'badge'
    );
  END IF;
  
  IF OLD.is_top_performer IS DISTINCT FROM NEW.is_top_performer AND NEW.is_top_performer = true THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      'Top Performer Badge',
      'Congratulations! You have been awarded the "Top Performer" badge by the administration.',
      'badge'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_user_badges_updated ON public.users;
CREATE TRIGGER tr_user_badges_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_user_badges_updated();
