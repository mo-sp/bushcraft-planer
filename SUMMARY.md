# Nature Boyz - Bushcraft Project Planer - Session Summary

## Was wurde gemacht

### 1. Grundgerüst (Phase 1) ✅
- Vue 3 + TypeScript + Vite Setup
- Tailwind CSS v4 mit Custom Theme
- Pinia Stores für Project, Task, Material
- Vue Router mit 5 Routen
- PWA-Konfiguration mit Service Worker
- IndexedDB via Dexie.js

### 2. Dark Theme mit Logo ✅
- Logo von User: `screenshots/NatureBoyz_1.jpg` → `public/logo.jpg`
- Farbpalette aus Logo extrahiert:
  - `deep-*`: Dunkle Hintergrundtöne (#1e281c, #263223)
  - `forest-*`: Grüntöne für Akzente
  - `earth-*`: Warme Texttöne
  - `bark-*`: Brauntöne

### 3. Kategorien aktualisiert ✅
- `shelter` → `construction` (Bauprojekte)
- `fire` → `exploration` (Erkundung)
- `custom` → Modal für "Neue Kategorie"
- Custom Categories werden in localStorage gespeichert

### 4. UI-Komponenten auf Dark Theme angepasst ✅
- BaseButton, BaseCard, BaseInput, BaseTextarea, BaseSelect
- BaseCheckbox, BaseModal, BaseBadge, BaseProgress, BaseEmptyState

### 5. Seiten aktualisiert ✅
- **DashboardPage**: "Unsere Projekte", neue Icons, Dark Theme
- **ProjectNewPage**: Neue Kategorien, Custom Category Modal
- **ProjectDetailPage**: Editierbare Felder, Status-Buttons, Notizen-Feld, Material-Zuweisung, Aufgaben mit Dauer/Mannstärke
- **InventoryPage**: "Materiallager", Dark Theme, Einheit optional
- **SettingsPage**: Dark Theme

### 6. Neue Features implementiert ✅
- **Notizen-Feld** in Projekten für Brainstorming
- **Aufgaben** mit Dauer (Minuten) und Mannstärke
- **Material-Zuweisung** direkt in Projekten
- **Custom Categories** mit Modal
- **Edit-Modus** für Projektdetails
- **Status-Buttons** direkt klickbar

---

## Session 2 (2026-03-05)

### 7. UI-Verbesserungen für Mobile ✅
- **Header vergrößert**: Logo 16x16, Titel text-3xl
- **Navigation vergrößert**: Icons 8x8, Text text-sm, mehr Padding
- 4 Tabs statt 3: Projekte | Material | Ausrüstung | Settings

### 8. Ausrüstungslager (Equipment) ✅
- Neuer Tab "Ausrüstung" mit Backpack-Icon
- Eigener Store (`useEquipmentStore`)
- Eigene DB-Tabellen (`equipment`, `equipmentRequirements`)
- Gleiche Funktionalität wie Materiallager

### 9. Material-Spezifikationen ✅
- Neues Feld `specifications` für Maße/Details
- z.B. "Stock (2 Meter, gerade)" oder "Stein (rund 10x10cm)"
- Jede Variante ist ein separates Material mit eigenem Bestand

### 10. Projekt-Erstellung erweitert ✅
- Label: "Benötigte Materialien / Ausrüstung"
- Kombinierte Suche aus beiden Lagern
- Farbcodierung: Materialien grün, Ausrüstung orange
- Edit-Button (Stift) zum Anpassen der Menge
- Bei "Neu anlegen" wählbar: Material oder Ausrüstung

### Commit
```
7e75538 feat: UI-Verbesserungen, Ausrüstungslager & Material-Spezifikationen
```

---

## Session 3 (2026-03-05)

### 11. Inline-Editing in ProjectDetailPage ✅
- **Kein zentraler Edit-Button** mehr oben rechts
- Klick auf Name, Beschreibung oder Notizen → direkt editierbar
- Save/Cancel Buttons erscheinen unter dem Feld
- Buttons 20px nach rechts verschoben, 10% größer

### 12. Bild-Upload für Projekte ✅
- Kamera-Icon oben rechts im Header
- Bilder werden als Base64 in IndexedDB gespeichert
- "Bild entfernen" Button wenn Bild vorhanden
- Header-Hintergrund dunkelgrün statt hellbraun

### 13. UI-Polish ✅
- **Status-Buttons deutlicher**: Aktive Phase mit scale-110, Schatten und grünem Rand
- **Zurück-Button**: ChevronLeft mit dickerem Strich (stroke-width 3)
- **Löschen-Button**: Klein oben rechts (roter Kreis) statt riesig unten
- **Edit/Trash-Buttons**: 30% größer (w-5 h-5, p-2.5)
- **"In Bearbeitung"**: Gelb statt orange
- **Fortschrittsbalken**: Sichtbarer Rand bei 0%

### 14. Material- & Ausrüstungs-Editor ✅
- **InventoryPage**: Edit-Button neben jedem Material
- Modal zum Ändern von Name, Spezifikation, Einheit, Bestand
- **EquipmentPage**: Edit-Button neben jeder Ausrüstung
- Modal zum Ändern von Name, Details, Bestand
- **Low-Stock-Warnungen entfernt** (keine Produktionsfirma)

### Commit
```
c54b0fc feat: UI-Verbesserungen ProjectDetail, Inline-Editing & Material/Equipment-Editor
```

---

## Session 4 (2026-03-06)

### 15. CLAUDE.md erstellt
- Projekt-Referenzdatei mit Tech Stack, Architektur, Konventionen, Befehlen
- Konventionen festgelegt: UI Deutsch, Code Englisch, Kommentare Englisch
- Supabase: wird angebunden, Sync fuer User optional

### 16. Capacitor eingerichtet
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` installiert
- App-ID: `com.natureboyz.bushcraftplaner`
- `capacitor.config.ts` mit Dark Background (#1e281c), https-Schema
- `android/` Projekt generiert und gesynct
- npm-Scripts: `cap:sync`, `cap:open`, `cap:run`
- `.gitignore` um Android-Build-Artefakte erweitert

### 17. Android Studio installiert
- Via Flatpak: `com.google.AndroidStudio`
- SDK und Emulator eingerichtet (Medium_Phone_API_36)

---

## Session 5 (2026-03-07)

### 18. BaseNumberStepper Component
- New +/- stepper component for quantity fields in modals
- Replaces native browser number input (tiny arrows)
- Used in Inventory, Equipment, ProjectNew, ProjectDetail modals

### 19. Image Compression & Upload
- `src/shared/lib/imageUtils.ts`: Auto resize (max 1600px) + JPEG quality 85%
- Image upload on project creation page with preview
- Existing project detail image upload now also compressed
- Project image shown as thumbnail in dashboard project list

### 20. Sketch Upload
- New `sketchUrl` field on Project type
- Dedicated "Skizze" section in project detail
- Upload button when empty, compact row with actions when present
- Modal viewer: click to open, dark backdrop, X to close, click outside to dismiss

### 21. Project Image as Page Background
- Subtle 4% opacity fixed background on project detail page
- Banner area transparent (no separate image), background shows through uniformly
- Click banner area opens full image in modal viewer
- Top-right buttons: Upload, Remove (X, only when image), Delete

### 22. Material & Equipment in Project Detail
- Combined "Material & Ausruestung" section (was materials-only)
- Full item selection modal with search, list, stock info
- Create new materials/equipment directly from project detail
- Color-coded icons: green (material), amber (equipment)
- Duplicate items auto-merged (amounts added)
- Edit amounts with +/- stepper, remove items

### 23. Categorized Units
- COMMON_UNITS restructured into UNIT_GROUPS with categories
- Categories: Menge, Laenge, Gewicht, Volumen
- BaseSelect updated with optgroup support (`groups` + `emptyLabel` props)

### 24. UI Polish
- Minus button: dark green (`forest-700`) with white symbol, distinct disabled state
- Search bar on dashboard project overview page
- "Bild entfernen" moved to top-right button row (X icon)

### Commit
```
50575b2 feat: UI improvements session 5
```

---

## Session 6 (2026-03-07)

### 25. Seed Data & Settings
- 25 default materials (Stoecke, Paracord, Steine, Lehm, Moos, etc.)
- 31 default equipment items (Messer, Axt, Spaltaxt, Fernglas, Tarp, etc.)
- "Standarddaten laden" button in Settings (skips duplicates)
- Fix: Equipment tables now cleared on "Alle Daten loeschen"

### 26. Task Planning on Project Creation
- New "Geplante Aufgaben" section in ProjectNewPage
- Add tasks with title, duration (15-min steps), manpower
- Edit/delete tasks before project creation
- Tasks saved to DB when project is created

### 27. Mobile Compatibility Fix
- `crypto.randomUUID()` fails on mobile via HTTP (non-secure context)
- Fallback UUID v4 generator using `crypto.getRandomValues()`

### 28. Supabase Integration
- Supabase project created (free tier, RLS disabled, shared data)
- DB schema: 6 tables (projects, tasks, materials, equipment + requirements)
- `supabase-schema.sql` in project root
- `.env` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Bidirectional sync service (`useSync` composable)
  - Push local changes to Supabase, pull remote changes
  - Last-write-wins conflict resolution (updated_at)
  - Delete tracking via syncMeta
  - Batch upserts (50 per batch)
- "Jetzt synchronisieren" button in Settings with result display
- supabase.ts cleaned up (removed old unused Database types)

### Commits
```
399ec5e feat: seed data, task planning on project creation & mobile UUID fix
```

---

## Was noch zu tun ist (naechste Session)

### Capacitor / Android (Prio 1)
1. **APK bauen** fuer Beta-Verteilung an Freunde
2. **App auf Emulator testen** (Play-Button in Android Studio)

### Fehlende Features
1. **Drag & Drop** fuer Aufgaben-Reihenfolge
2. **Auto-Sync** beim App-Start (aktuell nur manuell)

### Polish
1. Animationen verbessern
2. Touch-Feedback (Haptic via Capacitor)
3. Loading-States
4. Error-Handling

## Dateien mit wichtigen Aenderungen

```
src/style.css                          # Dark Theme Farben
src/app/App.vue                        # Header mit Logo
src/app/AppNavigation.vue              # Dark Nav
src/entities/project/model/types.ts    # Neue Kategorien, notes Feld
src/entities/task/model/types.ts       # duration, manpower
src/entities/material/model/types.ts   # unit optional, UNIT_GROUPS
src/pages/ProjectDetailPage.vue        # Komplett ueberarbeitet
src/pages/ProjectNewPage.vue           # Custom Category Modal, Image Upload, Task Planning
src/pages/SettingsPage.vue             # Seed Data, Sync UI
src/pages/DashboardPage.vue            # Search, Image Thumbnails
src/features/sync-data/               # Supabase Sync Service
src/shared/ui/BaseNumberStepper.vue    # +/- Stepper Component
src/shared/ui/BaseSelect.vue           # Optgroup Support
src/shared/lib/imageUtils.ts           # Image Compression Utility
src/shared/lib/seedData.ts            # Default Materials & Equipment
src/shared/api/db.ts                   # Dexie DB + UUID Fallback
src/shared/api/supabase.ts            # Supabase Client
supabase-schema.sql                    # DB Schema fuer Supabase
capacitor.config.ts                    # Capacitor Konfiguration
android/                               # Android-Projekt (Capacitor)
.env                                   # Supabase Credentials (nicht im Repo)
```

## Befehle
```bash
cd /home/mooo/Bushcraft-Planer
npm run dev -- --host    # Dev-Server mit Netzwerk-Zugriff
npm run build            # Produktions-Build
npm run test             # Unit Tests
npm run cap:sync         # Build + Sync zu Android
npm run cap:open         # Android Studio oeffnen
npm run cap:run          # Auf Emulator/Geraet starten
flatpak run com.google.AndroidStudio  # Android Studio starten
```
