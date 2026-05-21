ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL,
  event_version INTEGER NOT NULL DEFAULT 1,
  result TEXT NOT NULL,
  actor_user_id BIGINT REFERENCES users(id),
  target_type TEXT,
  target_id TEXT,
  request_id TEXT,
  correlation_id TEXT,
  source_ip TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_events_occurred_at_desc ON audit_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_event_type_occurred_at_desc ON audit_events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_user_id_occurred_at_desc ON audit_events(actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_result_occurred_at_desc ON audit_events(result, occurred_at DESC);
