-- Migration 0012: Add measurement types table for exercise tracking
-- Defines standard measurement types with normalized storage units

-- Drop existing table if it exists to ensure clean migration
DROP TABLE IF EXISTS measurement_types;

CREATE TABLE measurement_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK(category IN ('TIME', 'DISTANCE', 'WEIGHT', 'POWER', 'POINTS')),
  base_unit TEXT NOT NULL, -- The unit we normalize to for storage (e.g., 'seconds', 'meters', 'kg')
  display_unit TEXT NOT NULL, -- Default display unit (e.g., 'minutes', 'km', 'kg')
  conversion_factor REAL NOT NULL DEFAULT 1.0, -- Multiply display value by this to get base value
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert standard measurement types
INSERT INTO measurement_types (id, name, category, base_unit, display_unit, conversion_factor, description) VALUES
  -- TIME measurements (normalized to seconds)
  ('measure_time_seconds', 'Seconds', 'TIME', 'seconds', 'seconds', 1.0, 'Duration in seconds'),
  ('measure_time_minutes', 'Minutes', 'TIME', 'seconds', 'minutes', 60.0, 'Duration in minutes (stored as seconds)'),
  ('measure_time_hours', 'Hours', 'TIME', 'seconds', 'hours', 3600.0, 'Duration in hours (stored as seconds)'),

  -- DISTANCE measurements (normalized to meters)
  ('measure_distance_meters', 'Meters', 'DISTANCE', 'meters', 'meters', 1.0, 'Distance in meters'),
  ('measure_distance_kilometers', 'Kilometers', 'DISTANCE', 'meters', 'kilometers', 1000.0, 'Distance in kilometers (stored as meters)'),
  ('measure_distance_miles', 'Miles', 'DISTANCE', 'meters', 'miles', 1609.34, 'Distance in miles (stored as meters)'),

  -- WEIGHT measurements (normalized to kg)
  ('measure_weight_kg', 'Kilograms', 'WEIGHT', 'kg', 'kg', 1.0, 'Weight in kilograms'),
  ('measure_weight_lbs', 'Pounds', 'WEIGHT', 'kg', 'lbs', 0.453592, 'Weight in pounds (stored as kg)'),

  -- POWER measurements (normalized to watts)
  ('measure_power_watts', 'Watts', 'POWER', 'watts', 'watts', 1.0, 'Power output in watts'),
  ('measure_power_calories', 'Calories/hour', 'POWER', 'watts', 'cal/hr', 1.163, 'Calories per hour (stored as watts)'),

  -- POINTS (no conversion needed)
  ('measure_points', 'Points', 'POINTS', 'points', 'points', 1.0, 'Score or point system');

-- Update exercise_library to include default measurement type
-- This helps the UI know what units to show for each exercise
ALTER TABLE exercise_library ADD COLUMN default_measurement_type TEXT DEFAULT 'measure_weight_kg';
ALTER TABLE exercise_library ADD COLUMN measurement_categories TEXT; -- JSON array of applicable categories

-- Update existing exercises with appropriate measurement types
UPDATE exercise_library SET default_measurement_type = 'measure_weight_kg', measurement_categories = '["WEIGHT"]'
  WHERE category = 'STRENGTH';

UPDATE exercise_library SET default_measurement_type = 'measure_distance_meters', measurement_categories = '["DISTANCE", "TIME"]'
  WHERE id IN ('ex_running', 'ex_swimming');

UPDATE exercise_library SET default_measurement_type = 'measure_distance_meters', measurement_categories = '["DISTANCE", "TIME", "POWER"]'
  WHERE id = 'ex_rowing';

UPDATE exercise_library SET default_measurement_type = 'measure_time_minutes', measurement_categories = '["TIME", "DISTANCE"]'
  WHERE id = 'ex_cycling';

-- Create index on measurement types
CREATE INDEX IF NOT EXISTS idx_measurement_types_category ON measurement_types(category);
