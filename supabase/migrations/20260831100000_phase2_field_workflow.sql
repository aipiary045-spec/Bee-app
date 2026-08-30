-- Phase 2: split logging and mite method on inspections

DO $$ BEGIN
  CREATE TYPE split_type AS ENUM (
    'walk_away',
    'nuc',
    'combine',
    'swarm_caught',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS split_type split_type,
  ADD COLUMN IF NOT EXISTS split_destination TEXT,
  ADD COLUMN IF NOT EXISTS mite_method mite_method;
