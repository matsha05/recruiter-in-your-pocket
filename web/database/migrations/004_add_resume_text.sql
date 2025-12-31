-- Migration: Add resume_text column for improved skill matching
-- Purpose: Store full resume text to enable accurate pattern matching
-- The original migration only stored derived features (skills_index),
-- but accurate matching requires pattern matching against the full text

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_text TEXT;

COMMENT ON COLUMN user_profiles.resume_text IS 'Full resume text for skill pattern matching. Used by hybrid matching engine.';
