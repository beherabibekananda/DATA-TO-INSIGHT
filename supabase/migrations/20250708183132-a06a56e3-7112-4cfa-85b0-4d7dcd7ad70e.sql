-- Fix the infinite recursion in RLS policies for profiles table

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create a security definer function to check admin role safely
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Fix similar issues in approval_requests table
DROP POLICY IF EXISTS "Admins can view all requests" ON public.approval_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.approval_requests;

CREATE POLICY "Admins can view all requests" 
ON public.approval_requests 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all requests" 
ON public.approval_requests 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Fix students table policies
DROP POLICY IF EXISTS "Only admins can modify students directly" ON public.students;

CREATE POLICY "Only admins can modify students directly" 
ON public.students 
FOR ALL 
USING (public.is_admin(auth.uid()));