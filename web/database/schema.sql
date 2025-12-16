-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Cases Table
create table cases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid, -- For now, nullable or linked to auth.users if we have auth
  status text not null default 'active', -- 'active', 'closed', 'won'
  curr_stage text not null default 'applying', -- 'applying', 'interviewing', 'negotiating'
  
  -- Contexts (JSONB for flexibility)
  user_context jsonb default '{}'::jsonb,
  role_context jsonb default '{}'::jsonb,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Artifacts Table (Linked to Cases)
create table artifacts (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references cases(id) on delete cascade,
  type text not null, -- 'resume', 'interview_plan', 'offer'
  
  -- content stores the core data (ResumeArtifact, OfferArtifact, etc.)
  content jsonb not null default '{}'::jsonb,
  
  version integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index cases_user_id_idx on cases(user_id);
create index artifacts_case_id_idx on artifacts(case_id);
