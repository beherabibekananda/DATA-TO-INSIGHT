
-- Add mobile number to profiles table
ALTER TABLE public.profiles ADD COLUMN mobile TEXT;

-- Create approval requests table
CREATE TABLE public.approval_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('create_student', 'update_student', 'delete_student')),
  request_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_message TEXT,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on approval_requests
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Policies for approval_requests
CREATE POLICY "Users can view their own requests" ON public.approval_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON public.approval_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON public.approval_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all requests" ON public.approval_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Make students table publicly viewable but admin-only for modifications
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;

CREATE POLICY "Everyone can view students" ON public.students
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify students directly" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable realtime for approval_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_requests;
ALTER TABLE public.approval_requests REPLICA IDENTITY FULL;

-- Update the handle_new_user function to include mobile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, mobile, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    CASE 
      WHEN NEW.email = 'bibek@admin.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for Excel file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('excel-imports', 'excel-imports', false);

-- Storage policies for Excel imports
CREATE POLICY "Admins can upload Excel files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'excel-imports' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view Excel files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'excel-imports' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
