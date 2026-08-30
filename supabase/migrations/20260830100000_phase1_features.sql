-- Phase 1: hive notes and yard harvest goal

ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE apiaries
  ADD COLUMN IF NOT EXISTS harvest_goal_lbs NUMERIC(8, 2) CHECK (harvest_goal_lbs IS NULL OR harvest_goal_lbs >= 0);
