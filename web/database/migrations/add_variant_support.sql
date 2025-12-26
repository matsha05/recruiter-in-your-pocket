-- Multi-Resume Variant Support Migration
-- Run this in Supabase SQL Editor

-- Add job description storage for JD context in comparisons
ALTER TABLE reports ADD COLUMN IF NOT EXISTS job_description_text TEXT;

-- Add target role extracted from LLM response
ALTER TABLE reports ADD COLUMN IF NOT EXISTS target_role VARCHAR(100);

-- Add resume variant tagging (e.g., "Leadership", "IC Engineering", "PM")
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resume_variant VARCHAR(50);

-- Update the existing job_description_preview to use a longer length if needed
-- (Already exists from previous migration)

-- Add index for efficient variant filtering
CREATE INDEX IF NOT EXISTS idx_reports_user_variant ON reports(user_id, resume_variant);

-- Add index for efficient role filtering  
CREATE INDEX IF NOT EXISTS idx_reports_user_role ON reports(user_id, target_role);
