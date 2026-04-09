-- Bushcraft Planer - Supabase Schema
-- Stand: 2026-04-09 (exportiert aus laufender DB)
-- Supabase-Projekt: uhzyfmunlkxyfbuvydxm
--
-- Auth: Supabase Auth mit Shared Account (Email+Passwort)
-- RLS: Aktiviert auf allen Tabellen, Policy "authenticated_access" (ALL, PERMISSIVE)
--
-- Bei Neu-Setup: Zuerst Tabellen anlegen, dann RLS + Policies, dann Indexes.
-- Reihenfolge beachten wegen Foreign Keys!

-- ============================================================
-- 1. Basis-Tabellen (keine FK-Abhängigkeiten)
-- ============================================================

CREATE TABLE storage_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Haupt-Entitäten (FKs nur auf Basis-Tabellen)
-- ============================================================

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'construction',
  custom_category_name TEXT,
  storage_location_id TEXT REFERENCES storage_locations(id) ON DELETE SET NULL,
  participants TEXT[],
  responsible TEXT,
  status TEXT NOT NULL DEFAULT 'planning',  -- ACHTUNG: App nutzt 'planned', nicht 'planning' → B-027
  notes TEXT,
  image_url TEXT,
  sketch_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specifications TEXT,
  unit TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  owner TEXT,
  storage_location_id TEXT REFERENCES storage_locations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specifications TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  owner TEXT,
  storage_location_id TEXT REFERENCES storage_locations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. Abhängige Tabellen (FKs auf Haupt-Entitäten)
-- ============================================================

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  manpower INTEGER NOT NULL DEFAULT 1,
  assignees TEXT[],
  is_completed BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE material_requirements (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  required_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE equipment_requirements (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  required_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. Indexes
-- ============================================================

-- FK-Lookups (JOIN-Performance)
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_material_requirements_project_id ON material_requirements(project_id);
CREATE INDEX idx_material_requirements_material_id ON material_requirements(material_id);
CREATE INDEX idx_equipment_requirements_project_id ON equipment_requirements(project_id);
CREATE INDEX idx_equipment_requirements_equipment_id ON equipment_requirements(equipment_id);

-- Storage Location Lookups
CREATE INDEX idx_materials_storage_location_id ON materials(storage_location_id);
CREATE INDEX idx_equipment_storage_location_id ON equipment(storage_location_id);

-- ============================================================
-- 5. Row Level Security
-- ============================================================

ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_requirements ENABLE ROW LEVEL SECURITY;

-- Authenticated users get full access (shared group account)
CREATE POLICY authenticated_access ON storage_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_access ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_access ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_access ON materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_access ON material_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_access ON equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_access ON equipment_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);