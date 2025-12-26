-- Stripe Webhook Events Log Table
-- Used for idempotency, replay support, and audit trail

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  session_id TEXT,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups by event_id (idempotency checks)
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON stripe_webhook_events(event_id);

-- Index for querying by session_id (for debugging specific checkouts)
CREATE INDEX IF NOT EXISTS idx_webhook_events_session_id ON stripe_webhook_events(session_id);

-- Index for querying by event_type (for analytics/debugging)
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON stripe_webhook_events(event_type);

-- RLS: Only service role can access webhook events
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can access (admin client only)
