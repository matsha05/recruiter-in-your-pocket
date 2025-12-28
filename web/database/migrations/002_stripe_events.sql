-- Stripe Events Audit Log Table
-- For idempotency and audit trail (RT-013, RT-014)

CREATE TABLE IF NOT EXISTS stripe_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payload JSONB,
    request_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for idempotency lookups
CREATE INDEX IF NOT EXISTS stripe_events_event_id_idx ON stripe_events(event_id);

-- Index for event type queries
CREATE INDEX IF NOT EXISTS stripe_events_event_type_idx ON stripe_events(event_type);

-- Retention: Keep events for 90 days for audit purposes
-- (Manual cleanup or automated job)
COMMENT ON TABLE stripe_events IS 'Audit log for Stripe webhook events. Retained 90 days for debugging.';
