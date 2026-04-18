-- Migration: rename ambiguous columns for clarity
-- Run once against the skillswap database.

USE skillswap;

-- time_slots.user_id -> mentor_id (only mentors create availability)
ALTER TABLE time_slots
  DROP FOREIGN KEY time_slots_ibfk_1;

ALTER TABLE time_slots
  CHANGE COLUMN user_id mentor_id INT NOT NULL;

ALTER TABLE time_slots
  ADD CONSTRAINT time_slots_ibfk_1
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE;

-- Rebuild the index under the new name
DROP INDEX idx_time_slots_user ON time_slots;
CREATE INDEX idx_time_slots_mentor ON time_slots(mentor_id);

-- transactions.credits -> amount (a movement, not a balance)
ALTER TABLE transactions
  CHANGE COLUMN credits amount INT NOT NULL;
