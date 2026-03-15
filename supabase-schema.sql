-- Bushcraft Planer - Supabase Schema
-- Run this in the Supabase SQL Editor

-- Storage Locations
CREATE TABLE storage_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'construction',
  custom_category_name TEXT,
  storage_location_id TEXT REFERENCES storage_locations(id) ON DELETE SET NULL,
  participants TEXT[],
  responsible TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  notes TEXT,
  image_url TEXT,
  sketch_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
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

-- Materials
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

-- Material Requirements
CREATE TABLE material_requirements (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  required_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment
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

-- Equipment Requirements
CREATE TABLE equipment_requirements (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  required_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_material_requirements_project_id ON material_requirements(project_id);
CREATE INDEX idx_material_requirements_material_id ON material_requirements(material_id);
CREATE INDEX idx_equipment_requirements_project_id ON equipment_requirements(project_id);
CREATE INDEX idx_equipment_requirements_equipment_id ON equipment_requirements(equipment_id);

-- Indexes for storage location lookups
CREATE INDEX idx_materials_storage_location_id ON materials(storage_location_id);
CREATE INDEX idx_equipment_storage_location_id ON equipment(storage_location_id);

-- Migration: Add assignees to tasks (Session 10)
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignees TEXT[];

-- Disable RLS on all tables (shared data, no auth)
ALTER TABLE storage_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_requirements DISABLE ROW LEVEL SECURITY;
