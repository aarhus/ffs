-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('TRAINER', 'CLIENT', 'ADMIN')),
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create notification tokens table
CREATE TABLE IF NOT EXISTS notification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  fcm_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  trainer_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  duration_minutes INTEGER,
  intensity TEXT CHECK(intensity IN ('LOW', 'MEDIUM', 'HIGH')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  metric TEXT NOT NULL CHECK(metric IN ('kg', 'reps', 'cm', 'mins', '%')),
  target REAL NOT NULL,
  current REAL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create nutrition logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL,
  carbs REAL,
  fat REAL,
  date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user ON nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_user ON notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
