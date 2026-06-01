-- =========================================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- Adds: TODAY deadline warning + 7-day warning to the
-- generate_deadline_warnings() database function
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_deadline_warnings()
RETURNS void AS $$
BEGIN
  -- Warning 0: Deadline is TODAY (HIGH priority)
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

  -- Warning 1: Deadline tomorrow (MEDIUM priority)
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
        AND n.message LIKE '%' || o.title || '%tomorrow%'
        AND n.created_at >= CURRENT_DATE
    );

  -- Warning 2: Deadline in 3 days (MEDIUM priority)
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
        AND n.message LIKE '%' || o.title || '%3 days%'
        AND n.created_at >= CURRENT_DATE
    );

  -- Warning 3: Deadline in 7 days (NORMAL priority)
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
        AND n.message LIKE '%' || o.title || '%7 days%'
        AND n.created_at >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
