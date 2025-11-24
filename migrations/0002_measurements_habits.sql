-- Add measurements table for tracking body metrics
CREATE TABLE IF NOT EXISTS measurements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  weight REAL,
  body_fat_percentage REAL,
  muscle_mass REAL,
  chest REAL,
  waist REAL,
  hips REAL,
  bicep_left REAL,
  bicep_right REAL,
  thigh_left REAL,
  thigh_right REAL,
  notes TEXT,
  date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add habits table for tracking daily/weekly habits
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_measurements_user ON measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(date);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
