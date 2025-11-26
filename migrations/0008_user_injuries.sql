-- Create user_injuries table
CREATE TABLE IF NOT EXISTS user_injuries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  injury_type TEXT NOT NULL,
  details TEXT,
  severity TEXT CHECK(severity IN ('MILD', 'MODERATE', 'SEVERE')),
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'RECOVERING', 'RESOLVED')) DEFAULT 'ACTIVE',
  date_reported TEXT NOT NULL,
  date_resolved TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create injury_definitions table for managing common injuries
CREATE TABLE IF NOT EXISTS injury_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  affected_areas TEXT, -- JSON array of affected body parts
  recommended_modifications TEXT, -- JSON array of exercise modifications
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_injuries_user ON user_injuries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_injuries_status ON user_injuries(status);
CREATE INDEX IF NOT EXISTS idx_injury_definitions_active ON injury_definitions(is_active);

-- Insert common injury definitions
INSERT INTO injury_definitions (name, category, description, affected_areas, recommended_modifications) VALUES
('Lower Back Pain', 'Back', 'Pain in the lumbar region', '["Lower Back", "Spine"]', '["Avoid heavy deadlifts", "Modify bent-over rows", "Use supported variations"]'),
('Shoulder Impingement', 'Shoulder', 'Shoulder pain during overhead movements', '["Shoulder", "Rotator Cuff"]', '["Avoid overhead press", "Modify pull-ups", "Focus on scapular stability"]'),
('Knee Pain', 'Knee', 'General knee discomfort or pain', '["Knee", "Patella"]', '["Reduce depth on squats", "Avoid jumping exercises", "Focus on quad strengthening"]'),
('Tennis Elbow', 'Elbow', 'Lateral epicondylitis', '["Elbow", "Forearm"]', '["Limit gripping exercises", "Reduce weight on curls", "Focus on eccentric movements"]'),
('Plantar Fasciitis', 'Foot', 'Heel and arch pain', '["Foot", "Heel", "Arch"]', '["Avoid high-impact activities", "Modify running", "Focus on stretching"]'),
('Wrist Strain', 'Wrist', 'Pain or weakness in the wrist', '["Wrist", "Forearm"]', '["Use wrist wraps", "Modify push-up position", "Avoid heavy pressing"]'),
('Hip Flexor Strain', 'Hip', 'Pain in the front of the hip', '["Hip Flexor", "Groin"]', '["Limit deep squats", "Modify lunges", "Focus on stretching"]'),
('Rotator Cuff Injury', 'Shoulder', 'Injury to shoulder stabilizing muscles', '["Shoulder", "Rotator Cuff"]', '["Avoid overhead movements", "Focus on internal/external rotation", "Use lighter weights"]'),
('IT Band Syndrome', 'Leg', 'Knee pain from iliotibial band', '["Knee", "IT Band", "Hip"]', '["Reduce running volume", "Focus on hip strengthening", "Increase stretching"]'),
('Achilles Tendonitis', 'Ankle', 'Inflammation of the Achilles tendon', '["Ankle", "Achilles", "Calf"]', '["Avoid jumping", "Reduce calf raises", "Focus on eccentric exercises"]'),
('Sciatica', 'Back', 'Nerve pain radiating down the leg', '["Lower Back", "Hip", "Leg"]', '["Avoid spinal compression", "Modify squats", "Focus on core stability"]'),
('Neck Strain', 'Neck', 'Pain or stiffness in the neck', '["Neck", "Cervical Spine"]', '["Avoid overhead pressing", "Modify posture", "Focus on neck strengthening"]'),
('Golfers Elbow', 'Elbow', 'Medial epicondylitis', '["Elbow", "Forearm"]', '["Limit pulling exercises", "Reduce weight on rows", "Focus on flexibility"]'),
('Hamstring Strain', 'Leg', 'Pulled or torn hamstring muscle', '["Hamstring", "Back of Thigh"]', '["Avoid deadlift variations", "Reduce sprinting", "Focus on eccentric work"]'),
('Carpal Tunnel Syndrome', 'Wrist', 'Nerve compression in the wrist', '["Wrist", "Hand", "Fingers"]', '["Limit gripping", "Use ergonomic equipment", "Focus on nerve glides"]');
