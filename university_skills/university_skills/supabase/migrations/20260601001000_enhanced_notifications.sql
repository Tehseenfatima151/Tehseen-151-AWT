-- =========================================================================
-- ENHANCED NOTIFICATIONS DATABASE SCHEMAS & TRIGGERS
-- =========================================================================

-- 1. Combined Trigger for Opportunity Create/Update (Deadline Extension)
CREATE OR REPLACE FUNCTION public.on_opportunity_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify all students about the new opportunity
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT id, 'New Opportunity Posted', 'A new opportunity "' || NEW.title || '" has been posted. Apply now!', 'opportunity'
    FROM public.users
    WHERE role = 'student';
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Notify all students if the deadline is extended
    IF OLD.deadline IS DISTINCT FROM NEW.deadline AND NEW.deadline > OLD.deadline THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      SELECT id, 'Opportunity Deadline Extended', 'The application deadline for "' || NEW.title || '" has been extended to ' || to_char(NEW.deadline, 'YYYY-MM-DD') || '.', 'opportunity'
      FROM public.users
      WHERE role = 'student';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on public.opportunities
DROP TRIGGER IF EXISTS tr_opportunity_created ON public.opportunities;
DROP TRIGGER IF EXISTS tr_opportunity_changed ON public.opportunities;

CREATE TRIGGER tr_opportunity_changed
  AFTER INSERT OR UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.on_opportunity_changed();


-- 2. Create Function (RPC) to generate upcoming deadline warnings
CREATE OR REPLACE FUNCTION public.generate_deadline_warnings()
RETURNS void AS $$
BEGIN
  -- Warning 0: Deadline is TODAY (highest priority)
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    u.id, 
    'Deadline TODAY — Apply Now!', 
    'The deadline for opportunity "' || o.title || '" is TODAY! Apply before it closes.', 
    'opportunity'
  FROM public.users u
  CROSS JOIN public.opportunities o
  LEFT JOIN public.applications a ON a.opportunity_id = o.id AND a.student_id = u.id
  WHERE u.role = 'student'
    AND o.deadline = CURRENT_DATE
    AND a.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = u.id 
        AND n.type = 'opportunity'
        AND n.message LIKE '%TODAY%'
        AND n.message LIKE '%' || o.title || '%'
        AND n.created_at >= CURRENT_DATE
    );

  -- Warning 1: Deadline tomorrow (1 day left)
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    u.id, 
    'Upcoming Application Deadline', 
    'The deadline for opportunity "' || o.title || '" is tomorrow! Apply soon before it closes.', 
    'opportunity'
  FROM public.users u
  CROSS JOIN public.opportunities o
  LEFT JOIN public.applications a ON a.opportunity_id = o.id AND a.student_id = u.id
  WHERE u.role = 'student'
    AND o.deadline = CURRENT_DATE + 1
    AND a.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = u.id 
        AND n.type = 'opportunity'
        AND n.title = 'Upcoming Application Deadline'
        AND n.message LIKE '%' || o.title || '%tomorrow%'
        AND n.created_at >= CURRENT_DATE
    );

  -- Warning 2: Deadline in 3 days
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    u.id, 
    'Upcoming Application Deadline', 
    'The deadline for opportunity "' || o.title || '" is in 3 days. Don''t miss out!', 
    'opportunity'
  FROM public.users u
  CROSS JOIN public.opportunities o
  LEFT JOIN public.applications a ON a.opportunity_id = o.id AND a.student_id = u.id
  WHERE u.role = 'student'
    AND o.deadline = CURRENT_DATE + 3
    AND a.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = u.id 
        AND n.type = 'opportunity'
        AND n.title = 'Upcoming Application Deadline'
        AND n.message LIKE '%' || o.title || '%3 days%'
        AND n.created_at >= CURRENT_DATE
    );

  -- Warning 3: Deadline in 7 days
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    u.id, 
    'Upcoming Application Deadline', 
    'The deadline for opportunity "' || o.title || '" is in 7 days. Apply soon!', 
    'opportunity'
  FROM public.users u
  CROSS JOIN public.opportunities o
  LEFT JOIN public.applications a ON a.opportunity_id = o.id AND a.student_id = u.id
  WHERE u.role = 'student'
    AND o.deadline = CURRENT_DATE + 7
    AND a.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = u.id 
        AND n.type = 'opportunity'
        AND n.title = 'Upcoming Application Deadline'
        AND n.message LIKE '%' || o.title || '%7 days%'
        AND n.created_at >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Ensure Application triggers are robust
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
