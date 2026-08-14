-- Track the physical box configuration of each hive so the app can render an
-- interactive "current state" diagram (brood boxes + honey supers + queen
-- excluder). Safe to re-run.

ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS deep_boxes INTEGER NOT NULL DEFAULT 1
    CHECK (deep_boxes >= 0 AND deep_boxes <= 6),
  ADD COLUMN IF NOT EXISTS honey_supers INTEGER NOT NULL DEFAULT 0
    CHECK (honey_supers >= 0 AND honey_supers <= 8),
  ADD COLUMN IF NOT EXISTS has_queen_excluder BOOLEAN NOT NULL DEFAULT false;

-- Let the inspection log record a super being removed (e.g. pulled for harvest),
-- mirroring the existing action_super ("added super") flag.
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS action_super_removed BOOLEAN NOT NULL DEFAULT false;
