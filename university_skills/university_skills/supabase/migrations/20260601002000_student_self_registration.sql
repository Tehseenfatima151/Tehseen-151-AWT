-- =========================================================================
-- STUDENT SELF REGISTRATION & ADMIN APPROVAL SCHEMA UPDATE
-- =========================================================================

-- 1. Add new columns to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- 2. Automatically approve existing accounts
UPDATE public.users SET is_approved = true WHERE is_approved IS NULL;

-- 3. Automatic Trigger to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, roll_number, section, semester, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'roll_number',
    NEW.raw_user_meta_data->>'section',
    COALESCE(NEW.raw_user_meta_data->>'semester', '1'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' OR (NEW.raw_user_meta_data->>'is_admin_created')::boolean = true THEN true
      ELSE false
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    roll_number = EXCLUDED.roll_number,
    section = EXCLUDED.section,
    semester = EXCLUDED.semester;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Retroactively sync any users that exist in auth.users but are missing in public.users
INSERT INTO public.users (id, name, email, role, roll_number, section, semester, is_approved)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'Student'),
  email,
  COALESCE(raw_user_meta_data->>'role', 'student'),
  raw_user_meta_data->>'roll_number',
  raw_user_meta_data->>'section',
  COALESCE(raw_user_meta_data->>'semester', '1'),
  false -- set to false so they show up as pending approval
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
