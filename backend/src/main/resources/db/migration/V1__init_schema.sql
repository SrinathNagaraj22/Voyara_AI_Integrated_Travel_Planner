-- Voyara initial schema.
-- Matches the JPA entities in com.voyara.entity.*

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(255) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    bio             TEXT,
    location        VARCHAR(255),
    avatar_url      VARCHAR(1024)
);

CREATE INDEX idx_users_email ON users (email);

CREATE TABLE posts (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    image           TEXT NOT NULL,
    caption         TEXT,
    location        VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_posts_user_id ON posts (user_id);

CREATE TABLE post_likes (
    post_id         BIGINT NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE trips (
    id              BIGSERIAL PRIMARY KEY,
    creator_id      BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    destination     VARCHAR(255) NOT NULL,
    start_date      VARCHAR(64),
    end_date        VARCHAR(64),
    budget          VARCHAR(64),
    total_seats     INTEGER,
    occupied_seats  INTEGER NOT NULL DEFAULT 1,
    description     TEXT
);

CREATE INDEX idx_trips_destination_lower ON trips (LOWER(destination));
CREATE INDEX idx_trips_creator_id ON trips (creator_id);

CREATE TABLE trip_members (
    trip_id         BIGINT NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    PRIMARY KEY (trip_id, user_id)
);

CREATE TABLE join_requests (
    id              BIGSERIAL PRIMARY KEY,
    trip_id         BIGINT NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    sender_id       BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    host_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    message         TEXT,
    status          VARCHAR(32) NOT NULL DEFAULT 'pending'
);

CREATE INDEX idx_join_requests_sender ON join_requests (sender_id);
CREATE INDEX idx_join_requests_host ON join_requests (host_id);
CREATE INDEX idx_join_requests_status ON join_requests (status);
