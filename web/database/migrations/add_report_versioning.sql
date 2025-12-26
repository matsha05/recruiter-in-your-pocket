-- Add name column to reports table for version naming
-- This enables users to give meaningful names to their resume versions

ALTER TABLE reports ADD COLUMN IF NOT EXISTS name VARCHAR(100);

-- Add job_description column to track which JD this version was tailored to
ALTER TABLE reports ADD COLUMN IF NOT EXISTS job_description_preview VARCHAR(200);

-- Add index for faster lookups by name
CREATE INDEX IF NOT EXISTS reports_name_idx ON reports(user_id, name);

COMMENT ON COLUMN reports.name IS 'User-assigned name for this resume version (e.g., "Product Manager v2")';
COMMENT ON COLUMN reports.job_description_preview IS 'First 200 chars of the job description this version was tailored to';
