-- Migration 0009: Refactor workouts to use normalized exercise library
-- Creates exercise_library and workout_components tables
drop table if exists workouts;

CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  trainer_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  duration_minutes INTEGER,
  intensity TEXT CHECK(intensity IN ('LOW', 'MEDIUM', 'HIGH')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, exercises TEXT, completed INTEGER DEFAULT 0, perceived_exertion INTEGER, notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
);



-- Create exercise library table (admin-managed)
CREATE TABLE IF NOT EXISTS exercise_library (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- e.g., 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORT'
  muscle_groups TEXT, -- JSON array of muscle groups
  equipment TEXT, -- e.g., 'BARBELL', 'DUMBBELL', 'BODYWEIGHT', 'MACHINE', 'CARDIO_EQUIPMENT'
  video_url TEXT,
  instructions TEXT,
  is_active INTEGER DEFAULT 1, -- SQLite boolean
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create workout components table (normalized exercise data)
CREATE TABLE IF NOT EXISTS workout_components (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER NOT NULL, -- Order within the workout
  sets INTEGER NOT NULL DEFAULT 3,
  min_reps INTEGER, -- For rep ranges (e.g., 8-12)
  max_reps INTEGER,
  target_reps INTEGER, -- For fixed reps (e.g., 10)
  measurement_type TEXT CHECK(measurement_type IN ('REPS', 'TIME', 'DISTANCE', 'WEIGHT')),
  measurement_value REAL, -- For time/distance/weight goals
  measurement_unit TEXT, -- e.g., 'kg', 'lbs', 'seconds', 'minutes', 'meters', 'km'
  rest_seconds INTEGER, -- Rest between sets
  notes TEXT, -- Exercise-specific notes
  actual_sets INTEGER, -- Actual sets completed
  actual_reps TEXT, -- JSON array of actual reps per set, e.g., [10, 8, 8]
  actual_weight TEXT, -- JSON array of actual weights per set, e.g., [50, 50, 45]
  completed INTEGER DEFAULT 0,
  is_pr INTEGER DEFAULT 0, -- Personal record flag (calculated by backend)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE RESTRICT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exercise_library_name ON exercise_library(name);
CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_active ON exercise_library(is_active);
CREATE INDEX IF NOT EXISTS idx_workout_components_workout ON workout_components(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_components_exercise ON workout_components(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_components_order ON workout_components(workout_id, order_index);

-- Seed exercise library with common exercises
INSERT INTO exercise_library (id, name, category, muscle_groups, equipment, description) VALUES
  ('ex_bench_press', 'Bench Press', 'STRENGTH', '["chest", "triceps", "shoulders"]', 'BARBELL', 'Horizontal pressing movement for chest development'),
  ('ex_squat', 'Barbell Squat', 'STRENGTH', '["quadriceps", "glutes", "hamstrings", "core"]', 'BARBELL', 'Compound lower body movement'),
  ('ex_deadlift', 'Deadlift', 'STRENGTH', '["back", "glutes", "hamstrings", "core"]', 'BARBELL', 'Full body pulling movement'),
  ('ex_pullup', 'Pull-ups', 'STRENGTH', '["back", "biceps", "forearms"]', 'BODYWEIGHT', 'Vertical pulling movement'),
  ('ex_db_row', 'Dumbbell Row', 'STRENGTH', '["back", "biceps"]', 'DUMBBELL', 'Unilateral back exercise'),
  ('ex_leg_press', 'Leg Press', 'STRENGTH', '["quadriceps", "glutes"]', 'MACHINE', 'Compound lower body pressing'),
  ('ex_chest_fly', 'Chest Fly', 'STRENGTH', '["chest"]', 'DUMBBELL', 'Isolation chest exercise'),
  ('ex_lat_pulldown', 'Lat Pulldown', 'STRENGTH', '["back", "biceps"]', 'MACHINE', 'Vertical pulling movement'),
  ('ex_leg_curl', 'Leg Curl', 'STRENGTH', '["hamstrings"]', 'MACHINE', 'Hamstring isolation'),
  ('ex_leg_extension', 'Leg Extension', 'STRENGTH', '["quadriceps"]', 'MACHINE', 'Quad isolation'),
  ('ex_shoulder_press', 'Shoulder Press', 'STRENGTH', '["shoulders", "triceps"]', 'DUMBBELL', 'Overhead pressing movement'),
  ('ex_lateral_raise', 'Lateral Raise', 'STRENGTH', '["shoulders"]', 'DUMBBELL', 'Shoulder isolation'),
  ('ex_bicep_curl', 'Bicep Curl', 'STRENGTH', '["biceps"]', 'DUMBBELL', 'Bicep isolation'),
  ('ex_tricep_dip', 'Tricep Dip', 'STRENGTH', '["triceps", "chest", "shoulders"]', 'BODYWEIGHT', 'Compound tricep exercise'),
  ('ex_pushup', 'Push-ups', 'STRENGTH', '["chest", "triceps", "shoulders", "core"]', 'BODYWEIGHT', 'Bodyweight pressing movement'),
  ('ex_plank', 'Plank', 'STRENGTH', '["core", "shoulders"]', 'BODYWEIGHT', 'Isometric core exercise'),
  ('ex_running', 'Running', 'CARDIO', '["legs", "cardiovascular"]', 'CARDIO_EQUIPMENT', 'Cardiovascular endurance'),
  ('ex_cycling', 'Cycling', 'CARDIO', '["legs", "cardiovascular"]', 'CARDIO_EQUIPMENT', 'Low-impact cardio'),
  ('ex_swimming', 'Swimming', 'CARDIO', '["full_body", "cardiovascular"]', 'CARDIO_EQUIPMENT', 'Full body cardio'),
  ('ex_rowing', 'Rowing', 'CARDIO', '["back", "legs", "cardiovascular"]', 'CARDIO_EQUIPMENT', 'Compound cardio exercise');

-- Note: The old 'exercises' column in workouts table will be deprecated
-- Data migration from old format to new format should be handled separately if needed
-- For now, we'll keep the old column for backward compatibility but new workouts should use workout_components
