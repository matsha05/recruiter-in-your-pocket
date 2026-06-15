alter table if exists reports
  add column if not exists saved_job_id uuid references saved_jobs(id) on delete set null;

alter table if exists saved_jobs
  add column if not exists latest_report_id uuid references reports(id) on delete set null;

create index if not exists reports_saved_job_idx on reports(saved_job_id);
create index if not exists saved_jobs_latest_report_idx on saved_jobs(latest_report_id);
