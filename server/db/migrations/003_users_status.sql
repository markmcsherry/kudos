ALTER TABLE users
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

UPDATE users
SET status = 'active'
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users((LOWER(email)));
CREATE INDEX IF NOT EXISTS idx_users_first_name_lower ON users((LOWER(first_name)));
CREATE INDEX IF NOT EXISTS idx_users_last_name_lower ON users((LOWER(last_name)));
