-- Create exchange_messages table safely
CREATE TABLE IF NOT EXISTS exchange_messages (
  id SERIAL PRIMARY KEY,
  exchange_id INT NOT NULL,
  sender VARCHAR(50) NOT NULL,
  message TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_exchange
    FOREIGN KEY (exchange_id)
    REFERENCES exchange_skills(id)
    ON DELETE CASCADE
);

-- Index for fast chat history loading
CREATE INDEX IF NOT EXISTS idx_exchange_messages_exchange_id
ON exchange_messages(exchange_id);
