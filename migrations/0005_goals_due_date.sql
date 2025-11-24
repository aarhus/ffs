-- Add missing due_date field to goals table
ALTER TABLE goals ADD COLUMN due_date DATETIME;
