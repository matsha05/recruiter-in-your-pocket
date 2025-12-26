-- Migration: Add credit counting to passes table
-- Run this in Supabase SQL Editor

-- Add uses_remaining column (nullable for backwards compatibility)
ALTER TABLE passes ADD COLUMN IF NOT EXISTS uses_remaining INTEGER;

-- Set default values for existing passes based on tier
-- 30d passes get 5 credits, single_use already expires after 1 use
UPDATE passes 
SET uses_remaining = CASE 
    WHEN tier = '30d' THEN 5 
    WHEN tier = 'single_use' THEN 1 
    ELSE 1 
END
WHERE uses_remaining IS NULL;

-- Make uses_remaining NOT NULL with default going forward
ALTER TABLE passes ALTER COLUMN uses_remaining SET DEFAULT 1;
