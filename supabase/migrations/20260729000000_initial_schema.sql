-- Apiary App — Initial Schema Migration
-- Default location context: Agra, Oklahoma

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================
CREATE TYPE hive_status AS ENUM ('active', 'inactive', 'deadout');

CREATE TYPE brood_pattern AS ENUM (
  'excellent',
  'good',
  'fair',
  'spotty',
  'poor',
  'none'
);

CREATE TYPE temperament AS ENUM (
  'calm',
  'moderate',
  'defensive',
  'aggressive'
);

CREATE TYPE queen_status AS ENUM (
  'marked',
  'virgin',
  'laying',
  'cell_check',
  'replaced'
);

CREATE TYPE queen_mark_color AS ENUM (
  'white',
  'yellow',
  'red',
  'green',
  'blue',
  'unmarked'
);

CREATE TYPE mite_method AS ENUM (
  'alcohol_wash',
  'sugar_roll',
  'sticky_board'
);

CREATE TYPE treatment_status AS ENUM (
  'planned',
  'in_progress',
  'completed'
);

CREATE TYPE expense_category AS ENUM (
  'equipment',
  'treatments',
  'feed',
  'administrative',
  'other'
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- Apiaries (top-level organizational unit)
CREATE TABLE apiaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  location    TEXT NOT NULL DEFAULT 'Agra, OK',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hives within an apiary
CREATE TABLE hives (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apiary_id    UUID NOT NULL REFERENCES apiaries(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  status       hive_status NOT NULL DEFAULT 'active',
  frame_count  INTEGER NOT NULL DEFAULT 10 CHECK (frame_count >= 1 AND frame_count <= 20),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (apiary_id, name)
);

-- Field inspections
CREATE TABLE inspections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id        UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  queen_spotted  BOOLEAN NOT NULL DEFAULT false,
  brood_pattern  brood_pattern,
  temperament    temperament DEFAULT 'moderate',
  notes          TEXT,
  created_by     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Queen status logs (linked to inspections)
CREATE TABLE queen_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id        UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  inspection_id  UUID REFERENCES inspections(id) ON DELETE SET NULL,
  status         queen_status NOT NULL,
  mark_color     queen_mark_color DEFAULT 'unmarked',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Varroa mite counts
CREATE TABLE mite_counts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id             UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  inspection_id       UUID REFERENCES inspections(id) ON DELETE SET NULL,
  method              mite_method NOT NULL,
  count               NUMERIC(6, 2) NOT NULL CHECK (count >= 0),
  threshold_exceeded  BOOLEAN NOT NULL DEFAULT false,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Treatment records
CREATE TABLE treatments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id      UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE,
  dosage       TEXT,
  status       treatment_status NOT NULL DEFAULT 'planned',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Honey harvest yields
CREATE TABLE honey_yields (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id            UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  harvest_date       DATE NOT NULL,
  year               INTEGER NOT NULL GENERATED ALWAYS AS (EXTRACT(YEAR FROM harvest_date)::INTEGER) STORED,
  weight_lbs         NUMERIC(8, 2) NOT NULL CHECK (weight_lbs >= 0),
  frames_harvested   INTEGER CHECK (frames_harvested >= 0),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses (apiary-wide or hive-specific)
CREATE TABLE expenses (
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
CREATE INDEX idx_apiaries_user_id ON apiaries(user_id);
CREATE INDEX idx_hives_apiary_id ON hives(apiary_id);
CREATE INDEX idx_hives_status ON hives(status);
CREATE INDEX idx_inspections_hive_id ON inspections(hive_id);
CREATE INDEX idx_inspections_date ON inspections(date DESC);
CREATE INDEX idx_inspections_created_by ON inspections(created_by);
CREATE INDEX idx_queen_logs_hive_id ON queen_logs(hive_id);
CREATE INDEX idx_queen_logs_inspection_id ON queen_logs(inspection_id);
CREATE INDEX idx_mite_counts_hive_id ON mite_counts(hive_id);
CREATE INDEX idx_mite_counts_date ON mite_counts(date DESC);
CREATE INDEX idx_mite_counts_threshold ON mite_counts(threshold_exceeded) WHERE threshold_exceeded = true;
CREATE INDEX idx_treatments_hive_id ON treatments(hive_id);
CREATE INDEX idx_treatments_status ON treatments(status);
CREATE INDEX idx_honey_yields_hive_id ON honey_yields(hive_id);
CREATE INDEX idx_honey_yields_year ON honey_yields(year);
CREATE INDEX idx_expenses_apiary_id ON expenses(apiary_id);
CREATE INDEX idx_expenses_hive_id ON expenses(hive_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date DESC);

-- =============================================================================
-- TRIGGERS — updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apiaries_updated_at
  BEFORE UPDATE ON apiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_hives_updated_at
  BEFORE UPDATE ON hives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-set threshold_exceeded on mite counts (3% threshold for alcohol/sugar wash)
CREATE OR REPLACE FUNCTION set_mite_threshold_exceeded()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.method IN ('alcohol_wash', 'sugar_roll') THEN
    NEW.threshold_exceeded := NEW.count >= 3;
  ELSIF NEW.method = 'sticky_board' THEN
    NEW.threshold_exceeded := NEW.count >= 50;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mite_counts_threshold
  BEFORE INSERT OR UPDATE ON mite_counts
  FOR EACH ROW EXECUTE FUNCTION set_mite_threshold_exceeded();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE apiaries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE queen_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mite_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE honey_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses    ENABLE ROW LEVEL SECURITY;

-- Helper: check apiary ownership via hive
CREATE OR REPLACE FUNCTION user_owns_hive(hive_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM hives h
    JOIN apiaries a ON a.id = h.apiary_id
    WHERE h.id = hive_uuid AND a.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_owns_apiary(apiary_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM apiaries
    WHERE id = apiary_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- APIARIES policies
CREATE POLICY "Users can view own apiaries"
  ON apiaries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own apiaries"
  ON apiaries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own apiaries"
  ON apiaries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own apiaries"
  ON apiaries FOR DELETE
  USING (user_id = auth.uid());

-- HIVES policies
CREATE POLICY "Users can view hives in own apiaries"
  ON hives FOR SELECT
  USING (user_owns_apiary(apiary_id));

CREATE POLICY "Users can create hives in own apiaries"
  ON hives FOR INSERT
  WITH CHECK (user_owns_apiary(apiary_id));

CREATE POLICY "Users can update hives in own apiaries"
  ON hives FOR UPDATE
  USING (user_owns_apiary(apiary_id))
  WITH CHECK (user_owns_apiary(apiary_id));

CREATE POLICY "Users can delete hives in own apiaries"
  ON hives FOR DELETE
  USING (user_owns_apiary(apiary_id));

-- INSPECTIONS policies
CREATE POLICY "Users can view inspections for own hives"
  ON inspections FOR SELECT
  USING (user_owns_hive(hive_id));

CREATE POLICY "Users can create inspections for own hives"
  ON inspections FOR INSERT
  WITH CHECK (user_owns_hive(hive_id) AND created_by = auth.uid());

CREATE POLICY "Users can update inspections for own hives"
  ON inspections FOR UPDATE
  USING (user_owns_hive(hive_id))
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can delete inspections for own hives"
  ON inspections FOR DELETE
  USING (user_owns_hive(hive_id));

-- QUEEN LOGS policies
CREATE POLICY "Users can view queen logs for own hives"
  ON queen_logs FOR SELECT
  USING (user_owns_hive(hive_id));

CREATE POLICY "Users can create queen logs for own hives"
  ON queen_logs FOR INSERT
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can update queen logs for own hives"
  ON queen_logs FOR UPDATE
  USING (user_owns_hive(hive_id))
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can delete queen logs for own hives"
  ON queen_logs FOR DELETE
  USING (user_owns_hive(hive_id));

-- MITE COUNTS policies
CREATE POLICY "Users can view mite counts for own hives"
  ON mite_counts FOR SELECT
  USING (user_owns_hive(hive_id));

CREATE POLICY "Users can create mite counts for own hives"
  ON mite_counts FOR INSERT
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can update mite counts for own hives"
  ON mite_counts FOR UPDATE
  USING (user_owns_hive(hive_id))
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can delete mite counts for own hives"
  ON mite_counts FOR DELETE
  USING (user_owns_hive(hive_id));

-- TREATMENTS policies
CREATE POLICY "Users can view treatments for own hives"
  ON treatments FOR SELECT
  USING (user_owns_hive(hive_id));

CREATE POLICY "Users can create treatments for own hives"
  ON treatments FOR INSERT
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can update treatments for own hives"
  ON treatments FOR UPDATE
  USING (user_owns_hive(hive_id))
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can delete treatments for own hives"
  ON treatments FOR DELETE
  USING (user_owns_hive(hive_id));

-- HONEY YIELDS policies
CREATE POLICY "Users can view honey yields for own hives"
  ON honey_yields FOR SELECT
  USING (user_owns_hive(hive_id));

CREATE POLICY "Users can create honey yields for own hives"
  ON honey_yields FOR INSERT
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can update honey yields for own hives"
  ON honey_yields FOR UPDATE
  USING (user_owns_hive(hive_id))
  WITH CHECK (user_owns_hive(hive_id));

CREATE POLICY "Users can delete honey yields for own hives"
  ON honey_yields FOR DELETE
  USING (user_owns_hive(hive_id));

-- EXPENSES policies
CREATE POLICY "Users can view expenses for own apiaries"
  ON expenses FOR SELECT
  USING (user_owns_apiary(apiary_id));

CREATE POLICY "Users can create expenses for own apiaries"
  ON expenses FOR INSERT
  WITH CHECK (user_owns_apiary(apiary_id));

CREATE POLICY "Users can update expenses for own apiaries"
  ON expenses FOR UPDATE
  USING (user_owns_apiary(apiary_id))
  WITH CHECK (user_owns_apiary(apiary_id));

CREATE POLICY "Users can delete expenses for own apiaries"
  ON expenses FOR DELETE
  USING (user_owns_apiary(apiary_id));

-- =============================================================================
-- SEED: Default apiary for Agra, OK (optional — run after first user signup)
-- =============================================================================
-- INSERT INTO apiaries (user_id, name, location, description)
-- VALUES (auth.uid(), 'Agra Apiary', 'Agra, OK', 'Primary apiary near Agra, Oklahoma');
