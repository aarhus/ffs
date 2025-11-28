-- Migration 0011: Add "Other/Custom" exercise to library
-- Allows users to log custom exercises that aren't in the predefined library

INSERT INTO exercise_library (id, name, category, muscle_groups, equipment, description, is_active) VALUES
  ('ex_other', 'Other/Custom Exercise', 'STRENGTH', '["various"]', 'VARIOUS', 'Custom exercise not in the standard library. Use notes field to specify details.', 1)
ON CONFLICT(id) DO NOTHING;
