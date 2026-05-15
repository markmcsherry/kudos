CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kudos (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  created_by_user_id BIGINT NOT NULL REFERENCES users(id),
  for_user_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kudos_created_by_user_id ON kudos(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_kudos_for_user_id ON kudos(for_user_id);
