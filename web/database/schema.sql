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

-- 3. Reports Table (Core product)
create table if not exists reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resume_hash varchar(64),
  score integer,
  score_label text,
  report_json jsonb not null default '{}'::jsonb,
  resume_preview varchar(200),
  name varchar(100),
  job_description_preview varchar(200),
  job_description_text text,
  target_role varchar(100),
  resume_variant varchar(50),
  evidence_json jsonb,
  evidence_version text,
  evidence_summary text,
  confidence_band text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists reports_user_created_idx on reports(user_id, created_at desc);
create index if not exists reports_user_variant_idx on reports(user_id, resume_variant);
create index if not exists reports_user_target_role_idx on reports(user_id, target_role);

-- 4. Passes Table (Entitlements)
create table if not exists passes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tier text not null,
  uses_remaining integer not null default 1,
  purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  price_id text,
  checkout_session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists passes_user_expires_idx on passes(user_id, expires_at desc);
create index if not exists passes_price_id_idx on passes(price_id);
create unique index if not exists passes_checkout_session_id_idx on passes(checkout_session_id) where checkout_session_id is not null;

-- 5. User Usage Table (Free-tier tracking)
create table if not exists user_usage (
  user_id uuid references auth.users(id) on delete cascade primary key,
  free_report_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Saved Jobs Table (Extension + matching)
create table if not exists saved_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  external_id text,
  title text not null,
  company text not null,
  location text,
  url text not null,
  jd_text text,
  job_description_text text,
  jd_preview text,
  source text not null default 'linkedin',
  status text not null default 'saved',
  match_score integer,
  matched_skills jsonb not null default '[]'::jsonb,
  missing_skills jsonb not null default '[]'::jsonb,
  top_gaps jsonb not null default '[]'::jsonb,
  captured_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists saved_jobs_user_url_idx on saved_jobs(user_id, url);
create index if not exists saved_jobs_user_captured_idx on saved_jobs(user_id, captured_at desc);
create index if not exists saved_jobs_user_external_idx on saved_jobs(user_id, external_id);

-- 7. Billing Receipts Table
create table if not exists billing_receipts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_invoice_id text not null,
  stripe_customer_id text,
  checkout_session_id text,
  invoice_number text,
  status text,
  currency text,
  amount_paid integer not null default 0,
  hosted_invoice_url text,
  invoice_pdf text,
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists billing_receipts_invoice_id_idx on billing_receipts(stripe_invoice_id);
create index if not exists billing_receipts_user_created_idx on billing_receipts(user_id, created_at desc);

-- 8. Account Export Jobs Table
create table if not exists account_export_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending',
  format text not null default 'json',
  result_json jsonb,
  file_path text,
  file_url text,
  error_message text,
  requested_at timestamp with time zone default timezone('utc'::text, now()) not null,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists account_export_jobs_user_requested_idx on account_export_jobs(user_id, requested_at desc);
create index if not exists account_export_jobs_status_idx on account_export_jobs(status);
