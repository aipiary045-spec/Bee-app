-- Phase 3: queen lifecycle, mite intervals, treatment follow-up, swarm signals

ALTER TABLE hives
  ADD COLUMN IF NOT EXISTS queen_introduced_date DATE;

ALTER TABLE queen_logs
  ADD COLUMN IF NOT EXISTS event_date DATE NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE apiaries
  ADD COLUMN IF NOT EXISTS mite_check_interval_days INTEGER
    DEFAULT 28 CHECK (mite_check_interval_days IS NULL OR mite_check_interval_days >= 7);

ALTER TABLE treatments
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mite_retest_due_date DATE;

ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS queen_cells_seen BOOLEAN NOT NULL DEFAULT false;
