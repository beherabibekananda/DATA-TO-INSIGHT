-- Create a hardcoded admin user that bypasses email verification
-- This will be used for direct admin access without email verification

-- First, let's check if we can insert a user directly (this might not work, but let's try a different approach)
-- Instead, we'll create a special admin verification function

-- Create a function to verify admin credentials directly
CREATE OR REPLACE FUNCTION public.verify_admin_login(email_input TEXT, password_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow the specific admin email
  IF email_input = 'bibek@admin.com' AND password_input = 'Bibek@1920' THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update admin profile without requiring auth.users entry
INSERT INTO public.profiles (id, email, full_name, mobile, role)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'bibek@admin.com',
  'Bibekananda Behera',
  '0000000000',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  mobile = EXCLUDED.mobile,
  role = 'admin';