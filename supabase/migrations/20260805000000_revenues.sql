-- Revenues table for apiary income (honey sales, nucs, queens, etc.)
-- Safe to re-run.

-- =============================================================================
-- ENUM
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE revenue_category AS ENUM (
    'honey_sales',
    'nucs',
    'queens',
    'pollination',
    'wax',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS revenues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apiary_id   UUID NOT NULL REFERENCES apiaries(id) ON DELETE CASCADE,
  hive_id     UUID REFERENCES hives(id) ON DELETE SET NULL,
  category    revenue_category NOT NULL,
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_revenues_apiary_id ON revenues(apiary_id);
CREATE INDEX IF NOT EXISTS idx_revenues_hive_id ON revenues(hive_id);
CREATE INDEX IF NOT EXISTS idx_revenues_category ON revenues(category);
CREATE INDEX IF NOT EXISTS idx_revenues_date ON revenues(date DESC);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
DO $$ BEGIN
  CREATE TRIGGER trg_revenues_updated_at
    BEFORE UPDATE ON revenues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view revenues for own apiaries" ON revenues;
CREATE POLICY "Users can view revenues for own apiaries"
  ON revenues FOR SELECT
  USING (user_owns_apiary(apiary_id));

DROP POLICY IF EXISTS "Users can create revenues for own apiaries" ON revenues;
CREATE POLICY "Users can create revenues for own apiaries"
  ON revenues FOR INSERT
  WITH CHECK (user_owns_apiary(apiary_id));

DROP POLICY IF EXISTS "Users can update revenues for own apiaries" ON revenues;
CREATE POLICY "Users can update revenues for own apiaries"
  ON revenues FOR UPDATE
  USING (user_owns_apiary(apiary_id))
  WITH CHECK (user_owns_apiary(apiary_id));

DROP POLICY IF EXISTS "Users can delete revenues for own apiaries" ON revenues;
CREATE POLICY "Users can delete revenues for own apiaries"
  ON revenues FOR DELETE
  USING (user_owns_apiary(apiary_id));
