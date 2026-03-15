<p align="center">
  <img src="screenshots/NatureBoyz_1.jpg" alt="Nature Boyz Logo" width="200" />
</p>

<h1 align="center">Nature Boyz - Bushcraft Planer</h1>

<p align="center">
  A mobile-first app for collaboratively planning bushcraft projects with friends.<br/>
  Offline-first with cloud sync to keep everyone on the same page.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.9.0-green" alt="Version" />
  <img src="https://img.shields.io/badge/platform-Android%20%7C%20PWA-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/status-beta-orange" alt="Status" />
</p>

---

## About

The **Bushcraft Planer** is built for a group of friends ("Nature Boyz") who plan and execute bushcraft projects together in the woods. The app manages:

- **Projects** - Construction, exploration, tools & custom categories
- **Materials** - Sticks, rope, stones, clay and everything nature provides
- **Equipment** - Knives, axes, tarps, binoculars and more
- **Storage locations** - Track where everything is stored in the forest
- **People** - Who owns what and who is responsible for which project

Everything is stored locally on-device and optionally synced via the cloud so the whole group stays up to date.

## Features

### Project Management
- Create projects with categories, photos, sketches and notes
- Plan tasks with estimated duration and required manpower
- Assign material and equipment requirements per project
- Add participants and a responsible person
- Track status: Planned > In Progress > Completed
- Custom categories that sync across all devices

### Material & Equipment Inventory
- Stock management with categorized units (pieces, meters, kg, liters...)
- Specifications for variants (e.g. "stick, 2m, straight")
- Assign an owner and storage location to each item
- Automatic demand calculation from project requirements
- Detail view showing all projects an item is assigned to

### Storage Locations
- Manage locations in the forest (e.g. "Hippie Woods", "Secret Spot")
- Assign materials and equipment to locations
- Overview of what's stored where
- Link projects to a location

### Sync & Collaboration
- **Offline-first**: Works completely without internet
- **Auto-sync** on app startup
- **Manual sync** with one tap on the status bar
- Everyone can work simultaneously on different items
- Last-write-wins conflict resolution
- Sync status indicator in the header (color-coded freshness)
- Data overview: see how many projects, materials and equipment are synced

### Filtering & Search
- Filter badges on every page (location, owner, status, category, participant)
- Horizontally scrollable, toggleable filter rows
- Search bars on project dashboard and inventory pages

### Person Management
- Create, rename and delete persons across the entire app
- Autocomplete suggestions from all known names (owners, participants, assignees)
- Selecting a suggestion immediately adds the person (no extra confirmation needed)

### More
- Dark theme with a forest-inspired color palette extracted from the logo
- Image compression for project photos (max 1600px, 85% quality)
- Splash screen with AI-generated intro song
- Android hardware back button support
- PWA installable on any device

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Composition API, `<script setup>`) + TypeScript |
| Build | Vite 7 |
| State | Pinia 3 |
| Routing | Vue Router 5 |
| Styling | Tailwind CSS v4 |
| Local DB | Dexie.js 4 (IndexedDB wrapper) |
| Backend | Supabase (PostgreSQL, no auth, shared data) |
| Native | Capacitor 8 (Android) |
| Icons | Lucide Vue Next |
| Utilities | VueUse |
| Testing | Vitest + happy-dom |

## Architecture

The project follows [Feature-Sliced Design](https://feature-sliced.design/):

```
src/
  app/                  App shell, navigation, router, splash screen
  entities/             Business logic (types + Pinia stores with Dexie persistence)
    project/              Projects
    task/                 Tasks
    material/             Materials
    equipment/            Equipment
    storage-location/     Storage locations
  features/             Supabase sync service (bidirectional, auto + manual)
  pages/                Page components (one per route)
  shared/
    ui/                 Reusable base components (Button, Card, Input, Modal, ...)
    api/                Dexie DB setup, Supabase client
    lib/                Composables & helpers (image utils, known persons, ...)
    config/             Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Development

```bash
git clone https://github.com/mo-sp/bushcraft-planer.git
cd bushcraft-planer
npm install
npm run dev
```

### Mobile testing (same WiFi)

```bash
npm run dev -- --host
```

### Production build

```bash
npm run build
```

### Android APK

```bash
npm run cap:sync    # Build + sync web assets to Android
npm run cap:run     # Run on emulator or connected device
```

The debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Supabase Setup (optional)

The app works fully offline without Supabase. For cloud sync:

1. Create a free [Supabase](https://supabase.com) project
2. Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the database schema from `supabase-schema.sql`

The sync is bidirectional with last-write-wins conflict resolution. No authentication is used - all data is shared among the group.

## App Navigation

| Tab | Description |
|-----|------------|
| Projects | Dashboard with all projects, filterable by status, category & participants |
| Materials | Material inventory with stock management |
| Equipment | Equipment inventory |
| Locations | Storage location management |
| Settings | Sync status & info, person management, preferences |

## PWA Installation

The app can also be installed as a Progressive Web App:

1. Open the app in your browser
2. Click "Add to Home Screen" or the install icon
3. The app now works offline

<!-- ## Screenshots

_Coming with v1.0_ -->

## Credits

Built by **Claude & Moritz**

## License

MIT
