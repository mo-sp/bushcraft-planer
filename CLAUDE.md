# Bushcraft Planer - CLAUDE.md

## Projekt
Mobile-first PWA zur Planung von Bushcraft-Projekten ("Nature Boyz").
Offline-first mit IndexedDB, optionale Supabase-Sync.

## Tech Stack
- Vue 3 (Composition API, `<script setup>`) + TypeScript
- Vite 7 (Build & Dev)
- Pinia 3 (State Management)
- Vue Router 5
- Tailwind CSS v4 (PostCSS-Plugin, kein tailwind.config - alles in `src/style.css`)
- Dexie.js 4 (IndexedDB-Wrapper)
- Lucide Vue Next (Icons)
- VueUse (Composables)
- Supabase (Backend & Sync - bidirektional, manuell via Settings)
- vite-plugin-pwa (Service Worker)
- Capacitor 8 (Native Android/iOS Wrapper)
- Vitest + happy-dom (Testing)

## Architektur: Feature-Sliced Design
```
src/
  app/              -> App.vue, AppNavigation.vue, router.ts, main.ts
  entities/         -> Business-Logik (project, task, material, equipment)
    [entity]/model/ -> types.ts (Interfaces), store.ts (Pinia Store)
  features/         -> User-Interaktionen (sync-data mit Supabase)
  pages/            -> Seiten-Komponenten (*.vue)
  shared/
    ui/             -> Base-Komponenten (BaseButton, BaseCard, BaseInput, etc.)
    api/            -> db.ts (Dexie), supabase.ts
    lib/            -> Composables, Helpers
    config/         -> env.ts
  style.css         -> Tailwind Imports + Custom Theme Farben
```

## Konventionen
- Sprache UI: Deutsch
- Sprache Code: Englisch (Variablen, Funktionen, Typen)
- Kommentare im Code: Englisch
- Dark Theme mit Wald-Farbpalette (deep-*, forest-*, earth-*, bark-*)
- Mobile-first Design, Touch-optimiert
- Alle Stores nutzen Dexie für Persistenz
- Path Aliases: @, @app, @entities, @features, @widgets, @pages, @shared

## Befehle
```bash
npm run dev          # Vite Dev-Server
npm run dev -- --host  # Mit Netzwerk-Zugriff (Handy-Test)
npm run build        # vue-tsc + vite build
npm run test         # Vitest (watch)
npm run test:run     # Vitest (einmalig)
npm run cap:sync     # Build + Capacitor sync (Web -> Android)
npm run cap:open     # Android Studio oeffnen
npm run cap:run      # Auf angeschlossenem Geraet/Emulator starten
```

## Capacitor
- App-ID: `com.natureboyz.bushcraftplaner`
- Android-Projekt: `android/`
- Config: `capacitor.config.ts`
- Workflow: Code aendern -> `npm run cap:sync` -> `npm run cap:run`
- Android Studio: `flatpak run com.google.AndroidStudio` (Flatpak auf Fedora 43)
- Emulator: Medium_Phone_API_36
- HINWEIS: `cap:open` funktioniert evtl. nicht wegen Flatpak-Sandbox - Android Studio manuell starten und android/ Ordner oeffnen

## Seiten / Routen
- `/` Dashboard (Projekte-Uebersicht)
- `/project/new` Neues Projekt
- `/project/:id` Projektdetail (Inline-Editing)
- `/inventory` Materiallager
- `/equipment` Ausruestungslager
- `/settings` Einstellungen

## Navigation
4 Tabs: Projekte | Material | Ausruestung | Settings

## Supabase
- Projekt: `uhzyfmunlkxyfbuvydxm`
- Free Tier, RLS deaktiviert (shared data, kein Auth)
- Env-Variablen in `.env` (nicht im Repo)
- Schema: `supabase-schema.sql` (6 Tabellen)
- Sync: bidirektional, manuell via Settings, last-write-wins (updated_at)
- Tabellen: projects, tasks, materials, material_requirements, equipment, equipment_requirements
