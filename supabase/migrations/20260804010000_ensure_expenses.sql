-- Ensure expenses table, enum, indexes, and RLS are present.
-- Safe to re-run if the initial schema was only partially applied.

-- =============================================================================
-- ENUM
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'equipment',
    'treatments',
    'feed',
    'administrative',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apiary_id   UUID NOT NULL REFERENCES apiaries(id) ON DELETE CASCADE,
  hive_id     UUID REFERENCES hives(id) ON DELETE SET NULL,
  category    expense_category NOT NULL,
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_expenses_apiary_id ON expenses(apiary_id);
CREATE INDEX IF NOT EXISTS idx_expenses_hive_id ON expenses(hive_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
DO $$ BEGIN
  CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view expenses for own apiaries" ON expenses;
CREATE POLICY "Users can view expenses for own apiaries"
  ON expenses FOR SELECT
  USING (user_owns_apiary(apiary_id));

DROP POLICY IF EXISTS "Users can create expenses for own apiaries" ON expenses;
CREATE POLICY "Users can create expenses for own apiaries"
  ON expenses FOR INSERT
  WITH CHECK (user_owns_apiary(apiary_id));

DROP POLICY IF EXISTS "Users can update expenses for own apiaries" ON expenses;
CREATE POLICY "Users can update expenses for own apiaries"
  ON expenses FOR UPDATE
  USING (user_owns_apiary(apiary_id))
  WITH CHECK (user_owns_apiary(apiary_id));

DROP POLICY IF EXISTS "Users can delete expenses for own apiaries" ON expenses;
CREATE POLICY "Users can delete expenses for own apiaries"
  ON expenses FOR DELETE
  USING (user_owns_apiary(apiary_id));
