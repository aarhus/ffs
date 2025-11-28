-- Migration 0009: Refactor workouts to use normalized exercise library
-- Creates exercise_library and workout_components tables
drop table if exists workout_components;

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
  actual_measurement TEXT, -- JSON array of actual weights per set, e.g., [50, 50, 45]
  completed INTEGER DEFAULT 0,
  is_pr INTEGER DEFAULT 0, -- Personal record flag (calculated by backend)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE RESTRICT
);

-- Create indexes

CREATE INDEX IF NOT EXISTS idx_workout_components_workout ON workout_components(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_components_exercise ON workout_components(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_components_order ON workout_components(workout_id, order_index);
