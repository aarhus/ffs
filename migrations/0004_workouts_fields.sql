-- Add missing fields to workouts table
ALTER TABLE workouts ADD COLUMN exercises TEXT; -- JSON array of exercises
ALTER TABLE workouts ADD COLUMN completed INTEGER DEFAULT 0; -- SQLite uses INTEGER for BOOLEAN (0=false, 1=true)
ALTER TABLE workouts ADD COLUMN perceived_exertion INTEGER; -- 1-10 scale
ALTER TABLE workouts ADD COLUMN notes TEXT;
