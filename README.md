<p align="center">
  <img src="screenshots/NatureBoyz_1.jpg" alt="Nature Boyz Logo" width="200" />
</p>

<h1 align="center">Nature Boyz - Bushcraft Planer</h1>

<p align="center">
  Mobile-first App zur gemeinsamen Planung von Bushcraft-Projekten.<br/>
  Offline-first mit Cloud-Sync fuer die ganze Gruppe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.9.0-green" alt="Version" />
  <img src="https://img.shields.io/badge/platform-Android%20%7C%20PWA-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/status-beta-orange" alt="Status" />
</p>

---

## Was ist das?

Der **Bushcraft Planer** ist eine App fuer eine Gruppe von Freunden ("Nature Boyz"), die gemeinsam Bushcraft-Projekte planen und durchfuehren. Die App hilft bei der Verwaltung von:

- **Projekten** - Bauprojekte, Erkundungen, Werkzeuge & eigene Kategorien
- **Materialien** - Stoecke, Seile, Steine, Lehm und alles was die Natur hergibt
- **Ausruestung** - Messer, Aexte, Tarps, Fernglas und mehr
- **Lagerorten** - Wo liegt was im Wald?
- **Personen** - Wer ist wofuer zustaendig?

Alles wird lokal auf dem Geraet gespeichert und optional ueber die Cloud synchronisiert, damit alle auf dem gleichen Stand sind.

## Features

### Projektverwaltung
- Projekte mit Kategorien, Bildern, Skizzen und Notizen
- Aufgaben mit Dauer und Mannstaerke
- Material- und Ausruestungsbedarf pro Projekt
- Beteiligte und Verantwortliche zuweisen
- Status-Tracking: Geplant > In Bearbeitung > Abgeschlossen

### Material- & Ausruestungslager
- Bestandsverwaltung mit Einheiten (Stueck, Meter, kg, Liter...)
- Spezifikationen (z.B. "Stock, 2m, gerade")
- Besitzer und Lagerort zuweisen
- Automatische Bedarfsberechnung aus Projekten

### Lagerorte
- Orte im Wald verwalten (z.B. "Hippie-Wald", "Geheimplatz")
- Material und Ausruestung Lagern zuweisen
- Uebersicht: was liegt wo?

### Sync & Zusammenarbeit
- Offline-first: funktioniert komplett ohne Internet
- Automatischer Sync beim App-Start
- Manueller Sync per Klick
- Alle koennen gleichzeitig arbeiten
- Last-write-wins Konfliktloesung

### Weitere Features
- Dark Theme mit Wald-Farbpalette
- Bildkompression fuer Projektfotos
- Filter auf allen Seiten (Lager, Besitzer, Status, Kategorie)
- Personen verwalten (anlegen, umbenennen, entfernen)
- Intro-Screen mit AI-generiertem Song
- Android Hardware-Back-Button Support

## Tech Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | Vue 3 (Composition API, `<script setup>`) + TypeScript |
| Build | Vite 7 |
| State | Pinia 3 |
| Routing | Vue Router 5 |
| Styling | Tailwind CSS v4 |
| Lokale DB | Dexie.js 4 (IndexedDB) |
| Backend | Supabase (PostgreSQL) |
| Native | Capacitor 8 (Android) |
| Icons | Lucide Vue Next |
| Utilities | VueUse |
| Testing | Vitest + happy-dom |

## Architektur

Feature-Sliced Design:

```
src/
  app/              App Shell, Navigation, Router, Splash Screen
  entities/         Business-Logik
    project/          Projekte (types, store)
    task/             Aufgaben
    material/         Materialien
    equipment/        Ausruestung
    storage-location/ Lagerorte
  features/         Sync mit Supabase
  pages/            Seiten-Komponenten
  shared/
    ui/             Wiederverwendbare Base-Komponenten
    api/            Dexie DB, Supabase Client
    lib/            Composables, Helpers
    config/         Umgebungsvariablen
```

## Installation

### Voraussetzungen

- Node.js 18+
- npm 9+

### Development

```bash
git clone https://github.com/mo-sp/bushcraft-planer.git
cd bushcraft-planer
npm install
npm run dev
```

### Mit Netzwerkzugriff (Handy-Test im gleichen WLAN)

```bash
npm run dev -- --host
```

### Production Build

```bash
npm run build
```

### Android APK

```bash
npm run cap:sync    # Web-Build + Capacitor Sync
npm run cap:run     # Auf Emulator/Geraet starten
```

## Supabase (optional)

Fuer Cloud-Sync eine `.env` Datei im Projektroot anlegen:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Datenbank-Schema einrichten: siehe `supabase-schema.sql`

## Navigation

| Tab | Beschreibung |
|-----|-------------|
| Projekte | Dashboard mit allen Projekten, Filter nach Status/Kategorie/Beteiligte |
| Material | Materiallager mit Bestandsverwaltung |
| Ausruestung | Ausruestungslager |
| Lagerorte | Lagerverwaltung |
| Settings | Sync, Personen, Einstellungen |

## PWA Installation

Die App kann auch im Browser als PWA installiert werden:

1. App im Browser oeffnen
2. "Zur Startseite hinzufuegen" oder Install-Symbol klicken
3. Die App ist nun offline verfuegbar

## Credits

Entwickelt von **Claude & Moritz**

## Lizenz

MIT
