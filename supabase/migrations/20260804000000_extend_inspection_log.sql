-- Extend inspections for Quick Inspection Log fields

CREATE TYPE queen_sighted AS ENUM ('yes', 'no', 'uncertain');

CREATE TYPE eggs_larvae_status AS ENUM (
  'eggs_and_larvae',
  'eggs_only',
  'larvae_only',
  'none_observed'
);

CREATE TYPE store_level AS ENUM (
  'empty',
  'low',
  'moderate',
  'good',
  'full'
);

CREATE TYPE pest_disease AS ENUM (
  'none',
  'varroa',
  'chalkbrood',
  'foulbrood_suspect',
  'wax_moth',
  'ants',
  'other'
);

ALTER TABLE inspections
  ADD COLUMN inspection_time TIME,
  ADD COLUMN weather TEXT,
  ADD COLUMN temperature_f NUMERIC(5, 1),
  ADD COLUMN queen_sighted queen_sighted DEFAULT 'uncertain',
  ADD COLUMN queen_mark_color queen_mark_color DEFAULT 'unmarked',
  ADD COLUMN eggs_larvae eggs_larvae_status,
  ADD COLUMN honey_stores store_level,
  ADD COLUMN pollen_stores store_level,
  ADD COLUMN mite_count_per_100 NUMERIC(6, 2) CHECK (mite_count_per_100 IS NULL OR mite_count_per_100 >= 0),
  ADD COLUMN pests_diseases pest_disease DEFAULT 'none',
  ADD COLUMN action_fed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN action_super BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN action_split BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN action_treatment BOOLEAN NOT NULL DEFAULT false;

-- Keep queen_spotted in sync with queen_sighted for existing consumers
CREATE OR REPLACE FUNCTION sync_queen_spotted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.queen_sighted IS NOT NULL THEN
    NEW.queen_spotted := (NEW.queen_sighted = 'yes');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inspections_queen_sighted
  BEFORE INSERT OR UPDATE OF queen_sighted ON inspections
  FOR EACH ROW EXECUTE FUNCTION sync_queen_spotted();
