-- Create admin_otps table to store OTP codes
CREATE TABLE IF NOT EXISTS public.admin_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (to request OTP)
CREATE POLICY "Anyone can request OTP" ON public.admin_otps
  FOR INSERT WITH CHECK (true);

-- Allow anyone to select their own OTP (by email)
CREATE POLICY "Anyone can read OTP by email" ON public.admin_otps
  FOR SELECT USING (true);

-- Allow anyone to update OTP (for verification)
CREATE POLICY "Anyone can update OTP" ON public.admin_otps
  FOR UPDATE USING (true);

-- Allow cleanup of expired OTPs
CREATE POLICY "Anyone can delete expired OTPs" ON public.admin_otps
  FOR DELETE USING (expires_at < NOW());

-- Create allowed admin emails table
CREATE TABLE IF NOT EXISTS public.admin_allowed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_allowed_emails ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read allowed emails (needed for validation)
CREATE POLICY "Anyone can read allowed admin emails" ON public.admin_allowed_emails
  FOR SELECT USING (true);

-- Insert the default admin email
INSERT INTO public.admin_allowed_emails (email, name)
VALUES ('beherebibekananda778@gmail.com', 'Bibekananda Behera')
ON CONFLICT (email) DO NOTHING;

-- Function to generate OTP and store it
CREATE OR REPLACE FUNCTION public.generate_admin_otp(admin_email TEXT)
RETURNS JSON AS $$
DECLARE
  otp TEXT;
  result JSON;
  is_allowed BOOLEAN;
BEGIN
  -- Check if email is in the allowed list
  SELECT EXISTS(
    SELECT 1 FROM public.admin_allowed_emails WHERE email = admin_email
  ) INTO is_allowed;
  
  IF NOT is_allowed THEN
    RETURN json_build_object('success', false, 'message', 'Email not authorized for admin access');
  END IF;
  
  -- Generate a 6-digit OTP
  otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Delete any existing OTPs for this email
  DELETE FROM public.admin_otps WHERE email = admin_email;
  
  -- Insert new OTP with 10-minute expiry
  INSERT INTO public.admin_otps (email, otp_code, expires_at)
  VALUES (admin_email, otp, NOW() + INTERVAL '10 minutes');
  
  RETURN json_build_object('success', true, 'otp', otp, 'message', 'OTP generated successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_admin_otp(admin_email TEXT, otp_input TEXT)
RETURNS JSON AS $$
DECLARE
  otp_record RECORD;
BEGIN
  -- Find matching OTP
  SELECT * INTO otp_record
  FROM public.admin_otps
  WHERE email = admin_email
    AND otp_code = otp_input
    AND expires_at > NOW()
    AND verified = FALSE
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF otp_record IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Invalid or expired OTP');
  END IF;
  
  -- Mark OTP as verified
  UPDATE public.admin_otps SET verified = TRUE WHERE id = otp_record.id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'OTP verified successfully',
    'admin_email', admin_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
