-- Create trainer-client relationship table
-- Trainers can invite clients and only access data for their assigned clients
CREATE TABLE IF NOT EXISTS trainer_clients (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('PENDING', 'ACTIVE', 'INACTIVE')),
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(trainer_id, client_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON trainer_clients(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client ON trainer_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_status ON trainer_clients(status);
