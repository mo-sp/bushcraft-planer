# Bushcraft Planer

Eine mobile-first PWA zur Planung und Verwaltung von Bushcraft-Projekten.

## Features

- **Projekt-Management**: Erstelle und verwalte Bushcraft-Projekte mit Kategorien (Shelter, Feuer, Werkzeuge)
- **Aufgaben-Tracking**: Abhakbare Aufgabenlisten mit Fortschrittsanzeige
- **Material-Inventar**: Verwalte deinen Materialbestand mit +/- Buttons
- **Offline-First**: Funktioniert vollständig offline mit lokaler IndexedDB-Speicherung
- **PWA**: Installierbar auf Mobilgeräten und Desktop
- **Multi-User Sync**: Optionale Synchronisation via Supabase (in Entwicklung)

## Tech Stack

- **Vue 3** (Composition API) + **TypeScript**
- **Vite** (Build Tool)
- **Pinia** (State Management)
- **Vue Router** (Navigation)
- **Tailwind CSS v4** (Styling)
- **Dexie.js** (IndexedDB)
- **Supabase** (Optional: Backend & Sync)
- **Vitest** (Testing)

## Installation

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktion Build
npm run build

# Tests ausführen
npm run test
```

## Projekt-Struktur (Feature-Sliced Design)

```
src/
├── app/                    # App-Initialisierung, Router, Hauptkomponenten
├── entities/               # Business-Entitäten (Project, Task, Material)
│   ├── project/
│   ├── task/
│   └── material/
├── features/               # User-Interaktionen (Sync, etc.)
├── widgets/                # Zusammengesetzte UI-Blöcke
├── pages/                  # Seiten-Komponenten
└── shared/                 # Wiederverwendbare Utilities
    ├── ui/                 # Basis-Komponenten
    ├── lib/                # Helpers, Composables
    ├── api/                # Datenbank, Supabase
    └── config/             # Konfiguration
```

## Supabase Setup (Optional)

1. Erstelle ein Supabase-Projekt
2. Kopiere `.env.example` zu `.env`
3. Füge deine Supabase-URL und Anon-Key ein

```sql
-- SQL für Supabase-Tabellen
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  image_url text,
  image_placeholder text not null,
  status text not null default 'planned',
  created_by text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean default false,
  "order" integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  current_stock integer default 0,
  icon text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table material_requirements (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references materials(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  required_amount integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## PWA Installation

Die App kann auf mobilen Geräten und Desktop installiert werden:

1. Öffne die App im Browser
2. Klicke auf "Zur Startseite hinzufügen" oder das Install-Symbol
3. Die App ist nun offline verfügbar

## Lizenz

MIT
