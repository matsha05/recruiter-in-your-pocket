-- Migration: Add resume match profile columns to users table
-- Purpose: Store resume-derived features for instant job matching (Tier 1)
-- Privacy note: We store embeddings and derived features, NOT raw resume text

-- Enable pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Add resume profile columns to auth.users metadata
-- Note: Since we use Supabase Auth, we'll create a separate profiles table
-- that links to auth.users rather than modifying the auth schema directly

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Resume-derived features (NOT raw text)
  skills_index JSONB DEFAULT '[]'::jsonb,  -- Normalized skills with weights
  seniority_signals JSONB DEFAULT '{}'::jsonb,  -- Years, level, role patterns
  resume_embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
  
  -- Metadata
  resume_preview VARCHAR(200),  -- First 200 chars for identification
  resume_hash VARCHAR(64),  -- SHA-256 for version comparison
  resume_updated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for embedding similarity search
CREATE INDEX IF NOT EXISTS user_profiles_embedding_idx 
  ON user_profiles USING ivfflat (resume_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx 
  ON user_profiles(user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);
