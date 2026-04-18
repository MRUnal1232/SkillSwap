-- SkillSwap Database Schema
-- Run this file in MySQL to create all tables

CREATE DATABASE IF NOT EXISTS skillswap;
USE skillswap;

-- 1. Users table - stores all registered users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  credits INT DEFAULT 100,              -- new users start with 100 credits
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skills table - master list of all skills
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL
);

-- 3. UserSkills - links users to skills (many-to-many relationship)
--    type = 'offer' means the user can teach this skill
--    type = 'learn' means the user wants to learn this skill
CREATE TABLE user_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  type ENUM('offer', 'learn') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_skill_type (user_id, skill_id, type)
);

-- 4. TimeSlots - mentors create available time slots
CREATE TABLE time_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentor_id INT NOT NULL,               -- the mentor offering this window
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Sessions - records of booked mentorship sessions
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentor_id INT NOT NULL,
  learner_id INT NOT NULL,
  skill_id INT NOT NULL,
  slot_id INT NOT NULL,
  status ENUM('booked', 'completed', 'cancelled') DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES users(id),
  FOREIGN KEY (learner_id) REFERENCES users(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  FOREIGN KEY (slot_id) REFERENCES time_slots(id)
);

-- 6. Reviews - learners rate mentors after session completion
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL UNIQUE,       -- only one review per session
  reviewer_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- 7. ChatMessages - stores all chat messages for persistence
CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- 8. Transactions - tracks credit earn/spend history
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT NOT NULL,                  -- delta moved (not the balance)
  type ENUM('earned', 'spent') NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance (frequently queried columns)
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_time_slots_mentor ON time_slots(mentor_id);
CREATE INDEX idx_sessions_mentor ON sessions(mentor_id);
CREATE INDEX idx_sessions_learner ON sessions(learner_id);
CREATE INDEX idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_receiver ON chat_messages(receiver_id);

-- Insert some default skills
INSERT INTO skills (skill_name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('MySQL', 'Database'),
('CSS', 'Frontend'),
('Java', 'Programming'),
('Data Structures', 'Computer Science'),
('Machine Learning', 'AI/ML'),
('Git', 'DevOps');
