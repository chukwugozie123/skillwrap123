-- Add mode and note columns to exchange_skills if they don't exist
ALTER TABLE exchange_skills
ADD COLUMN IF NOT EXISTS mode TEXT,
ADD COLUMN IF NOT EXISTS note TEXT;
