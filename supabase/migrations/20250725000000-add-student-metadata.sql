-- Add metadata column to students table to store additional dataset features
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Comment on the column for clarity
COMMENT ON COLUMN public.students.metadata IS 'Stores extra features from external datasets like social metrics, family status, etc.';
