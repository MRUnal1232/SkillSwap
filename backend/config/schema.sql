-- ============================================================================
-- SkillSwap — Peer-to-Peer Learning & Mentorship Platform
-- Database schema per the project requirements PDF.
--
-- This file is idempotent: it drops the existing skillswap DB and rebuilds it.
-- RUN THIS ONCE on a fresh install, or whenever you want a clean slate.
-- ============================================================================

DROP DATABASE IF EXISTS skillswap;
CREATE DATABASE skillswap;
USE skillswap;

-- ----------------------------------------------------------------------------
-- 1. users  — every registered account
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,        -- bcrypt hash
  credits    INT NOT NULL DEFAULT 100,     -- new users start with 100 credits
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. skills  — the master list of teachable skills
-- ----------------------------------------------------------------------------
CREATE TABLE skills (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL,
  category   VARCHAR(100) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. user_skills  — "who can teach what" AND "who wants to learn what"
--    type = 'offer'  → user teaches this skill
--    type = 'learn'  → user wants to learn this skill
-- ----------------------------------------------------------------------------
CREATE TABLE user_skills (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  skill_id INT NOT NULL,
  type     ENUM('offer', 'learn') NOT NULL,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_skill_type (user_id, skill_id, type)
);

-- ----------------------------------------------------------------------------
-- 4. time_slots  — availability windows created by mentors
-- ----------------------------------------------------------------------------
CREATE TABLE time_slots (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,                 -- the mentor who owns this slot
  skill_id   INT NOT NULL,                 -- the skill being offered during this slot
  start_time DATETIME NOT NULL,
  end_time   DATETIME NOT NULL,
  is_booked  BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- ----------------------------------------------------------------------------
-- 5. sessions  — bookings created when a learner reserves a slot
--    Times are copied in at booking time so the session is self-contained.
-- ----------------------------------------------------------------------------
CREATE TABLE sessions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  mentor_id  INT NOT NULL,
  learner_id INT NOT NULL,
  skill_id   INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time   DATETIME NOT NULL,
  status     ENUM('booked', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id)  REFERENCES users(id),
  FOREIGN KEY (learner_id) REFERENCES users(id),
  FOREIGN KEY (skill_id)   REFERENCES skills(id)
);

-- ----------------------------------------------------------------------------
-- 6. reviews  — one per session; reviewer is always the session's learner
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL UNIQUE,           -- one review per session
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 7. chat_messages  — persisted socket.io chat history
-- ----------------------------------------------------------------------------
CREATE TABLE chat_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  message     TEXT NOT NULL,
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- ----------------------------------------------------------------------------
-- 8. transactions  — credit ledger (earn/spend audit trail)
-- ----------------------------------------------------------------------------
CREATE TABLE transactions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  credits    INT NOT NULL,                  -- amount moved in this ledger row
  type       ENUM('earned', 'spent') NOT NULL,
  reason     VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------------------------
-- Indexes on commonly-queried columns
-- ----------------------------------------------------------------------------
CREATE INDEX idx_user_skills_user   ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill  ON user_skills(skill_id);
CREATE INDEX idx_time_slots_user    ON time_slots(user_id);
CREATE INDEX idx_time_slots_skill   ON time_slots(skill_id);
CREATE INDEX idx_sessions_mentor    ON sessions(mentor_id);
CREATE INDEX idx_sessions_learner   ON sessions(learner_id);
CREATE INDEX idx_chat_sender        ON chat_messages(sender_id);
CREATE INDEX idx_chat_receiver      ON chat_messages(receiver_id);

-- ----------------------------------------------------------------------------
-- Seed: 10 starter skills
-- ----------------------------------------------------------------------------
INSERT INTO skills (skill_name, category) VALUES
  ('JavaScript',       'Programming'),
  ('Python',           'Programming'),
  ('React',            'Frontend'),
  ('Node.js',          'Backend'),
  ('MySQL',            'Database'),
  ('CSS',              'Frontend'),
  ('Java',             'Programming'),
  ('Data Structures',  'Computer Science'),
  ('Machine Learning', 'AI/ML'),
  ('Git',              'DevOps');

-- ============================================================================
-- READABLE VIEWS  —  human-friendly SELECT shortcuts (read-only)
-- Use these when exploring data in the MySQL shell; the app uses real tables.
-- ============================================================================

CREATE OR REPLACE VIEW reviews_v AS
SELECT
  r.id,
  r.session_id,
  learner.id     AS reviewer_id,
  learner.name   AS reviewer_name,
  mentor.id      AS mentor_id,
  mentor.name    AS mentor_name,
  s.skill_name,
  s.category,
  r.rating,
  r.comment,
  r.created_at
FROM reviews r
JOIN sessions ses   ON ses.id = r.session_id
JOIN users    learner ON learner.id = ses.learner_id
JOIN users    mentor  ON mentor.id  = ses.mentor_id
JOIN skills   s       ON s.id       = ses.skill_id;

CREATE OR REPLACE VIEW sessions_v AS
SELECT
  ses.id,
  mentor.id    AS mentor_id,
  mentor.name  AS mentor_name,
  learner.id   AS learner_id,
  learner.name AS learner_name,
  sk.skill_name,
  sk.category,
  ses.start_time,
  ses.end_time,
  ses.status,
  ses.created_at
FROM sessions ses
JOIN users  mentor  ON mentor.id  = ses.mentor_id
JOIN users  learner ON learner.id = ses.learner_id
JOIN skills sk      ON sk.id      = ses.skill_id;

CREATE OR REPLACE VIEW time_slots_v AS
SELECT
  ts.id,
  u.id   AS user_id,
  u.name AS user_name,
  s.id   AS skill_id,
  s.skill_name,
  s.category,
  ts.start_time,
  ts.end_time,
  ts.is_booked
FROM time_slots ts
JOIN users  u ON u.id = ts.user_id
JOIN skills s ON s.id = ts.skill_id;

CREATE OR REPLACE VIEW user_skills_v AS
SELECT
  us.id,
  u.id   AS user_id,
  u.name AS user_name,
  s.skill_name,
  s.category,
  us.type AS relation
FROM user_skills us
JOIN users  u ON u.id = us.user_id
JOIN skills s ON s.id = us.skill_id;

CREATE OR REPLACE VIEW transactions_v AS
SELECT
  t.id,
  u.id   AS user_id,
  u.name AS user_name,
  t.credits,
  t.type,
  t.reason,
  t.created_at
FROM transactions t
JOIN users u ON u.id = t.user_id;

CREATE OR REPLACE VIEW chat_messages_v AS
SELECT
  c.id,
  sender.id     AS sender_id,
  sender.name   AS sender_name,
  receiver.id   AS receiver_id,
  receiver.name AS receiver_name,
  c.message,
  c.timestamp
FROM chat_messages c
JOIN users sender   ON sender.id   = c.sender_id
JOIN users receiver ON receiver.id = c.receiver_id;
