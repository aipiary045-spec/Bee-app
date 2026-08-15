-- Distinguish shallow vs medium supers, and record add/remove independently
-- so a visit can harvest one box and replace it with another.

ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS medium_count INTEGER NOT NULL DEFAULT 0
    CHECK (medium_count >= 0 AND medium_count <= 12),
  ADD COLUMN IF NOT EXISTS shallow_count INTEGER NOT NULL DEFAULT 0
    CHECK (shallow_count >= 0 AND shallow_count <= 12);

UPDATE hives
SET medium_count = super_count
WHERE medium_count = 0
  AND shallow_count = 0
  AND super_count > 0;

ALTER TABLE hives
  DROP CONSTRAINT IF EXISTS hives_super_type_total;

ALTER TABLE hives
  ADD CONSTRAINT hives_super_type_total
  CHECK (medium_count + shallow_count <= 12);

CREATE OR REPLACE FUNCTION sync_hive_super_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.super_count := COALESCE(NEW.medium_count, 0) + COALESCE(NEW.shallow_count, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hives_super_count ON hives;
CREATE TRIGGER trg_hives_super_count
  BEFORE INSERT OR UPDATE OF medium_count, shallow_count ON hives
  FOR EACH ROW EXECUTE FUNCTION sync_hive_super_count();

ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS medium_added INTEGER NOT NULL DEFAULT 0
    CHECK (medium_added >= 0 AND medium_added <= 12),
  ADD COLUMN IF NOT EXISTS medium_removed INTEGER NOT NULL DEFAULT 0
    CHECK (medium_removed >= 0 AND medium_removed <= 12),
  ADD COLUMN IF NOT EXISTS shallow_added INTEGER NOT NULL DEFAULT 0
    CHECK (shallow_added >= 0 AND shallow_added <= 12),
  ADD COLUMN IF NOT EXISTS shallow_removed INTEGER NOT NULL DEFAULT 0
    CHECK (shallow_removed >= 0 AND shallow_removed <= 12);

UPDATE inspections
SET
  medium_added = supers_added,
  medium_removed = supers_removed
WHERE medium_added = 0
  AND medium_removed = 0
  AND shallow_added = 0
  AND shallow_removed = 0
  AND (supers_added > 0 OR supers_removed > 0);

CREATE OR REPLACE FUNCTION sync_inspection_super_totals()
RETURNS TRIGGER AS $$
BEGIN
  NEW.supers_added := COALESCE(NEW.medium_added, 0) + COALESCE(NEW.shallow_added, 0);
  NEW.supers_removed := COALESCE(NEW.medium_removed, 0) + COALESCE(NEW.shallow_removed, 0);
  NEW.action_super := NEW.supers_added > 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inspections_action_super ON inspections;
DROP TRIGGER IF EXISTS trg_inspections_super_totals ON inspections;
CREATE TRIGGER trg_inspections_super_totals
  BEFORE INSERT OR UPDATE OF medium_added, medium_removed, shallow_added, shallow_removed, supers_added
  ON inspections
  FOR EACH ROW EXECUTE FUNCTION sync_inspection_super_totals();
