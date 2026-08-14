-- Track honey supers on each hive and record add/remove during inspections.

ALTER TABLE hives
  ADD COLUMN super_count INTEGER NOT NULL DEFAULT 0
    CHECK (super_count >= 0 AND super_count <= 12);

ALTER TABLE inspections
  ADD COLUMN supers_added INTEGER NOT NULL DEFAULT 0
    CHECK (supers_added >= 0 AND supers_added <= 12),
  ADD COLUMN supers_removed INTEGER NOT NULL DEFAULT 0
    CHECK (supers_removed >= 0 AND supers_removed <= 12),
  ADD COLUMN super_count_after INTEGER
    CHECK (super_count_after IS NULL OR (super_count_after >= 0 AND super_count_after <= 12));

-- Keep the existing action_super flag in sync with supers added this visit.
CREATE OR REPLACE FUNCTION sync_action_super()
RETURNS TRIGGER AS $$
BEGIN
  NEW.action_super := COALESCE(NEW.supers_added, 0) > 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inspections_action_super
  BEFORE INSERT OR UPDATE OF supers_added ON inspections
  FOR EACH ROW EXECUTE FUNCTION sync_action_super();
