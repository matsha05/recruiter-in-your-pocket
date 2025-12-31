-- Add resume_filename column to user_profiles table
-- This allows users to see which resume file they uploaded

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS resume_filename TEXT;

COMMENT ON COLUMN user_profiles.resume_filename IS 'Original filename of uploaded resume for display';
