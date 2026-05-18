-- Update the handle_new_user trigger to also insert into election_requests if the user is an election_creator
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_org TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'voter');
  v_org := COALESCE(NEW.raw_user_meta_data->>'organization', '');

  INSERT INTO public.profiles (id, email, name, phone, role, organization, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_role,
    v_org,
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- If the new user is an election creator, automatically create a pending request
  IF v_role = 'election_creator' THEN
    INSERT INTO public.election_requests (creator_id, organization, purpose, status)
    VALUES (
      NEW.id,
      v_org,
      'Initial platform access request for election creation',
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
