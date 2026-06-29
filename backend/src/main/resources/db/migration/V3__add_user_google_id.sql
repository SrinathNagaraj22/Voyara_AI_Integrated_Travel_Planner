-- Allow Google-only users to exist without a local password and let us look them
-- up by their Google subject id.
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_google_id ON users (google_id);
