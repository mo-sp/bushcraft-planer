# Nature Boyz – WebClaude Code-Review Sessions

---

## Session 1 (2026-04-01)

### Projekt-Setup & Überblick
- Repo-Struktur über GitHub analysiert (package.json, SUMMARY.md, README.md)
- Architektur-Diagramm erstellt (Feature-Sliced Design Übersicht)
- Lernplan erstellt (8 Phasen, von Config bis Native/PWA)
- CODE_REVIEW_BACKLOG.md angelegt

### Dateien durchgegangen

**1. tsconfig.json + tsconfig.app.json + tsconfig.node.json**
- TypeScript-Grundlagen erklärt: Was ist TS? Warum Typen?
- Project References: Trennung Browser-Code vs. Build-Tools
- Strict Mode, Path Aliases (@entities, @shared, etc.)
- Kurzdoku: `docs/tsconfig-dateien.md`

**2. vite.config.ts**
- Vite als Dev-Server + Build-Tool erklärt
- Vue-Plugin, PWA-Plugin (Service Worker, Manifest, Workbox)
- Runtime-Caching für Supabase (NetworkFirst-Strategie)
- Dev-Server allowedHosts für VM-Setup
- Resolve-Aliases (müssen in tsconfig UND vite.config stehen)
- Kurzdoku: `docs/vite-config.md`

**3. src/entities/project/model/types.ts**
- TypeScript-Kernkonzepte: type, interface, export, ? (optional), string[], Record, Union Types, as
- Drei-Interface-Pattern erklärt (Project, CreateProjectInput, UpdateProjectInput)
- Konstanten für UI-Labels (Record<K,V>)
- Kurzdoku: `docs/project-types.md`

### TypeScript-Konzepte gelernt
| Konzept | Beispiel |
|---------|----------|
| `type` (Alias) | `type ProjectStatus = 'planned' \| 'completed'` |
| `interface` | `interface Project { id: string; name: string }` |
| Union Type `\|` | `'construction' \| 'exploration' \| 'tools'` |
| Optionale Felder `?` | `imageUrl?: string` |
| Array-Typ `[]` | `participants?: string[]` |
| `Record<K, V>` | `Record<ProjectStatus, string>` |
| `as` (Type Assertion) | `COLORS[i] as string` |
| Named Import | `import { defineConfig } from 'vite'` |
| Default Import | `import vue from '@vitejs/plugin-vue'` |
| `export default` | `export default defineConfig({...})` |

### Backlog-Einträge (B-001 bis B-010)
- B-001: Kein Auth / RLS deaktiviert
- B-002: Last-Write-Wins Konflikte
- B-003: Bilder als Base64 in IndexedDB
- B-004: Custom Categories in localStorage
- B-005: Keine Tests für Stores/Sync
- B-006: Keine Error Boundaries
- B-007: Toter @widgets Alias (tsconfig + vite.config)
- B-008: SVG-Icons statt PNG für PWA
- B-009: ProjectCategory `| string` entwertet Type-Safety
- B-010: PROJECT_CATEGORY_LABELS nutzt Record<string, string>

### Erstellte Dateien
- `LERNPLAN.md` — 8-Phasen-Plan für Code-Review
- `CODE_REVIEW_BACKLOG.md` — Optimierungs-Backlog (10 Einträge)
- `docs/tsconfig-dateien.md` — Kurzdoku tsconfig
- `docs/vite-config.md` — Kurzdoku vite.config
- `docs/project-types.md` — Kurzdoku Project types

### Nächste Session
- Restliche types.ts (Task, Material, Equipment, Storage-Location)
- Dann: store.ts (Project) — wie die Typen in der Praxis benutzt werden

## Session 2 (2026-04-01)

### Dateien durchgegangen

**1. src/entities/task/model/types.ts**
- Drei-Interface-Pattern (wie Project): Task, CreateTaskInput, UpdateTaskInput
- manpower/assignees Dualität: Business-Regel nur als Kommentar, nicht im Typ
- isCompleted als Boolean statt Union Type (einfacher als ProjectStatus)
- order: number required in Task, fehlt in CreateInput → Store vergibt automatisch
- Kurzdoku: `docs/task-types.md`

**2. src/entities/material/model/types.ts**
- Zwei Entitäten in einer Datei: Material + MaterialRequirement
- MaterialRequirement = Many-to-Many Verknüpfungstabelle (Material ↔ Project)
- storageLocationId als erster FK im Projekt
- owner als Freitext (kein FK, passt zum useKnownPersons-Pattern)
- UNIT_GROUPS / COMMON_UNITS als Vorschlagsliste, unit bleibt string (Freitext gewollt)
- Kurzdoku: `docs/material-types.md`

**3. src/entities/equipment/model/types.ts**
- Fast identisch zu Material, ohne unit und icon Felder
- currentStock + requiredAmount widerspricht Feedback #4 (Equipment = wiederverwendbar)
- Kein neuer Backlog-Eintrag (Feedback #4 deckt das ab)
- Kurzdoku: `docs/equipment-types.md`

**4. src/entities/storage-location/model/types.ts**
- Schlankste Entity: nur name, description, icon
- Keine FKs, keine Requirements — Verbindung läuft über storageLocationId in Material/Equipment
- DEFAULT_STORAGE_LOCATIONS = Seed Data im Type-File → B-012
- Kurzdoku: `docs/storage-location-types.md`

**5. src/entities/project/model/store.ts**
- Pinia Setup Store mit ref/computed/async Actions
- CRUD-Pattern: Dexie-Operation → trackChange → lokalen State updaten
- Kaskadierende Löschung (Tasks, MaterialReqs, EquipmentReqs) mit einzelnem Sync-Tracking
- Custom Categories: localStorage + Ableitung aus Projekten (B-004 bestätigt)
- getCategoryName dreifacher Fallback → B-013
- Object.assign für Mutations, splice für Array-Entfernung
- Kurzdoku: `docs/project-store.md`

**6. src/entities/task/model/store.ts**
- Gleiche Basis wie Project Store, aber sauberer (kein Category-Chaos)
- Alle Getter parametrisiert nach projectId
- Smart Merge in loadTasks: nur angefragte Projekt-Tasks werden ersetzt
- createTask: automatische order (max+1), manpower/assignees Business-Regel
- reorderTasks: bulkUpdate ohne trackChange → B-014 (nicht akut, kein Drag&Drop aktiv)
- Kurzdoku: `docs/task-store.md`

### TypeScript/JS-Konzepte gelernt
| Konzept | Beispiel |
|---------|----------|
| `export interface` | Export = sichtbar für andere Dateien, Interface = Bauplan für Objekte |
| `async/await` | Warten auf asynchrone Operationen (Dexie, Netzwerk) |
| `Promise<T>` | "Versprechen" — Ergebnis kommt später (pending → fulfilled/rejected) |
| `ref<T>()` | Vue "reference" — reaktiver beobachtbarer Wert (.value im Script, ohne im Template) |
| `computed()` | Abgeleiteter reaktiver Wert, wird gecached |
| `Object.assign()` | Felder von einem Objekt auf ein anderes kopieren (Mutation) |
| `.splice(index, 1)` | Element an Position aus Array entfernen |
| `.findIndex()` | Position eines Elements im Array finden (-1 wenn nicht gefunden) |
| `.filter()` | Array filtern, nur passende Elemente behalten |
| `.sort((a,b) => ...)` | Array sortieren mit Vergleichsfunktion |
| `.reduce()` | Array auf einen einzelnen Wert reduzieren |
| `.map()` mit Index | Jedes Element + seine Position transformieren |
| `??` (Nullish Coalescing) | `x ?? default` — nimm x, außer es ist null/undefined |
| `? :` (Ternary) | `bedingung ? wennJa : wennNein` |
| `_parameter` | Konvention für bewusst unbenutzten Parameter |
| Synchron vs. Asynchron | sync = sofort fertig, async = muss auf etwas warten |
| Primitive vs. Objekte | string/number/boolean = primitiv, alles andere = Objekt |
| Mutation vs. Kopie | Object.assign mutiert, Spread `{...obj}` kopiert |

### Backlog-Einträge (B-011 bis B-014)
- B-011: UNIT_GROUPS ohne `as const` — informational, kein Problem (Freitext gewollt)
- B-012: Seed Data (DEFAULT_STORAGE_LOCATIONS) in types.ts statt eigener Datei
- B-013: getCategoryName dreifacher Fallback — fragile Logik, Symptom von B-004
- B-014: reorderTasks ohne trackChange — nicht akut, kein Drag&Drop aktiv, Task-Rework geplant

### Erstellte Kurzdokus
- `docs/task-types.md`
- `docs/material-types.md`
- `docs/equipment-types.md`
- `docs/storage-location-types.md`
- `docs/project-store.md`
- `docs/task-store.md`

### Dokumenten-Struktur
- `CODE_REVIEW_BACKLOG.md` — Technische Schulden und Code-Qualität
- `FEEDBACK-0.9.1.md` — Feature-Wünsche und große Umbau-Ziele
- Querverweise zwischen beiden wo nötig (z.B. B-014 → Feedback #1)

### Nächste Session
- Restliche Stores (Material, Equipment, StorageLocation) — geht schneller weil Patterns bekannt
- Dann: Phase 4 (db.ts, supabase.ts, Sync Service)

## Session 3 (2026-04-06)

### Dateien durchgegangen

**1. src/entities/material/model/store.ts**
- Zwei Entitäten in einem Store: Material + MaterialRequirement
- Bedarfsrechnung in `materialWithStock`: pro Material Gesamtbedarf aus allen Projekten summiert (filter + reduce Chain)
- `adjustStock(id, delta)` als Convenience-Wrapper mit `Math.max(0, ...)` gegen negative Bestände
- Kaskadierende Löschung: `deleteMaterial` löscht Requirements ohne trackChange (bekannt) und ohne User-Warnung → B-015
- `uniqueOwners` mit Type Predicate `(o): o is string` und Set-Deduplizierung
- Inkonsistenz bei State-Bereinigung: splice für Material, filter-Neuzuweisung für Requirements (beides funktioniert, kein Bug)
- Kurzdoku: `docs/material-store.md`

**2. src/entities/equipment/model/store.ts**
- Nahezu 1:1 Kopie des Material Stores, zwei Unterschiede: kein `unit`-Feld, kein `icon`-Feld
- `equipmentWithStock` nutzt Verbrauchslogik (currentStock - totalRequired), passt aber nicht zu wiederverwendbarem Equipment → Feedback #4
- `adjustStock` wird durch Feedback #4 überflüssig oder muss umgebaut werden
- Gleiche kaskadierende Löschung ohne trackChange/User-Warnung wie Material Store → B-015
- Variable heißt `equipment` (Singular) weil Englisch uncountable
- **Beobachtung:** Material Store und Equipment Store sind so ähnlich, dass nach Feedback #4 eine gemeinsame Basis (z.B. ein generischer Inventory-Store oder Composable) sinnvoll wäre — erst nach dem Equipment-Umbau evaluieren
- Kurzdoku: `docs/equipment-store.md`

**3. src/entities/storage-location/model/store.ts**
- Schlankster Store: nur eine Entität, keine Requirements, kein Stock-Management
- `locationByName` als einziger Getter im Projekt der per Name statt ID sucht (erzwingt aber keine Eindeutigkeit)
- Keine kaskadierende Löschung — aber verwaiste Fremdschlüssel in Material/Equipment wenn Lagerort gelöscht wird → B-016
- Kurzdoku: `docs/storage-location-store.md`



### TypeScript/JS-Konzepte gelernt

| Konzept | Beispiel | Erklärung |
|---------|----------|-----------|
| Type Predicate | `(o): o is string => !!o` | Sagt dem Compiler: nach dem Filter ist der Typ garantiert `string` |
| `!!` (Double Bang) | `!!o` | Wandelt jeden Wert in Boolean um (`undefined`→`false`, `"text"`→`true`) |
| `new Set()` | `new Set(owners)` | Datenstruktur die nur eindeutige Werte speichert — entfernt Duplikate |
| Method Chaining | `.filter().reduce()` | Mehrere Array-Methoden hintereinander, jede arbeitet auf dem Ergebnis der vorherigen |
| `.reduce()` | `(sum, r) => sum + r.requiredAmount, 0` | Array auf einen einzelnen Wert reduzieren, `0` ist Startwert |
| Spread in Objekt | `{ ...material, totalRequired }` | Alle Felder kopieren + neue Felder anhängen |
| Shorthand Property | `{ totalRequired }` | Kurzform für `{ totalRequired: totalRequired }` |
| `void` | `Promise<void>` | Funktion gibt kein Ergebnis zurück |
| Shadowing | `item` statt `equipment` in Loop | Vermeidet Namenskonflikt mit äußerer Variable |
| Mutating vs. Non-mutating | `.splice()` mutiert, `.filter()` erzeugt neu | Beide Wege sind bei Vue reaktiv |
| Entität vs. Objekt | Project, Material = Entitäten | Entität = Ding aus der echten Welt das in der App abgebildet wird |

### Backlog-Einträge
- B-015: Kaskadierende Löschung ohne User-Warnung (Material Store + Equipment Store + Project Store). Status: to-be-checked in Phase 6 (Pages)
- B-016: Verwaiste storageLocationId nach Lagerort-Löschung. Drei Optionen: Lösch-Schutz (empfohlen), Umlagern-Dialog, oder kaskadierende Bereinigung. Status: to-be-checked in Phase 6


### Erstellte Kurzdokus
- `docs/material-store.md`
- `docs/equipment-store.md`
- `docs/storage-location-store.md`

### Ergänzungen an Projektdateien
- `CLAUDE.md`: Neuer Abschnitt "Code-Kommentare" (Regeln für Inline-Kommentare)
- System-Prompt Ergänzung: "Erkläre Code Zeile für Zeile mit Syntax-Erklärungen, gehe von keinem TypeScript-Vorwissen aus"

### Noch offen für nächste Session
- StorageLocation Store (letzter Store, vermutlich der schlankste)
- Dann: Phase 4 — db.ts, supabase.ts, Sync Service
- Nach den Stores: Zwischenstand pushen damit Claude Code die Kurzdokus hat

### Status nach Session 3
- **Phase 1 (Config):** ✅ Komplett
- **Phase 2 (Entity Types):** ✅ Komplett
- **Phase 3 (Stores):** ✅ Komplett — alle 5 Stores durchgegangen
- **Nächste Session:** Phase 4 — db.ts, supabase.ts, Sync Service
- **Vor nächster Session:** Zwischenstand pushen (docs/, Backlog, Session-Notizen, CLAUDE.md)

### Beobachtung für später
- Material Store und Equipment Store sind nahezu identisch. Nach Feedback #4 (Equipment-Umbau) evaluieren ob eine gemeinsame Basis (generischer Inventory-Store oder Composable) sinnvoll wäre.

## Session 4 (2026-04-08 / 2026-04-09)

### Supabase Security — B-001 behoben

**Schritt 1: Shared Secret + RLS (erste Iteration)**
- RLS auf allen 7 Tabellen aktiviert
- `is_authorized()` Funktion prüft `x-app-secret` Header
- `app_access` Policy pro Tabelle
- Custom Header in `supabase.ts` via `global.headers`
- Neue Env-Variable: `VITE_APP_SECRET`
- Getestet: curl ohne Header gibt `[]` zurück
- Bewertung: 3/10 Security — Secret liegt im Frontend-Bundle

**Schritt 2: Upgrade auf Supabase Auth (zweite Iteration)**
- Shared Secret als unzureichend bewertet
- Supabase Auth aktiviert mit Shared Account (1x Email+Passwort)
- `LoginPage.vue` gebaut: Passwort-only UI, Email hardcoded
- Router Guard in `router.ts`: unauthentifizierte User → `/login`
- Auto-Sync in `App.vue` an Session gekoppelt (`getSession()` Check)
- `supabase.ts` erweitert: `signIn()`, `getSession()`, `signOut()`
- RLS-Policies umgestellt: `TO authenticated USING (true)`
- Alte `is_authorized()` Funktion + `app_access` Policies entfernt
- `VITE_APP_SECRET` aus allen `.env`-Dateien und Vercel entfernt
- Bewertung: 6/10 Security — Passwort steht nirgends im Code
- `SECURITY.md` angelegt als Referenz für Claude Code

**Dateien geändert/erstellt**
- `src/shared/api/supabase.ts` — Auth-Funktionen hinzugefügt, Shared Secret entfernt
- `src/pages/LoginPage.vue` — Neu: Login-Screen mit Passwortfeld
- `src/app/router.ts` — Login-Route + Auth Guard
- `src/app/App.vue` — Auto-Sync nur nach Login
- `SECURITY.md` — Neu: Security-Architektur Dokumentation
- `CODE_REVIEW_BACKLOG.md` — B-001 Status aktualisiert

**Erkenntnisse**
- Supabase RLS gibt bei fehlender Berechtigung leere Arrays zurück, keine Fehler — tückisch zum Debuggen
- `VITE_`-Prefix bedeutet: Variable landet im Frontend-Bundle, nie für Secrets nutzen
- Vite liest `.env` nur beim Start — nach Änderung Dev-Server neu starten
- Header-Tippfehler (`x.app-secret` statt `x-app-secret`) war schwer zu finden — immer DevTools Network Tab prüfen
- Frontend-only Apps können Secrets grundsätzlich nicht schützen — echte Security braucht Auth

**Nächste Session**
- Weiter mit Phase 3: Restliche Stores (Material, Equipment, StorageLocation)
- Dann Phase 4: db.ts, supabase.ts, Sync Service

## Session 5 (2026-04-09)

### Phase 4: Datenbank & API — komplett abgeschlossen

**1. src/shared/api/db.ts (Dexie Setup)**
- Dexie als IndexedDB-Wrapper erklärt: Schema ≠ Spalten sondern Indexe
- 4 Schema-Versionen, Version 4 ist Leer-Migration → B-018
- Klassen-Vererbung (`extends Dexie`), `super()`, Non-null Assertion (`!`)
- `generateId()`: UUID v4 mit Fallback für Non-Secure Contexts (HTTP im LAN)
- Diskussion: `uuid` Library vs. eigener Fallback → eigener Code reicht, funktioniert
- `SyncMeta` als Change-Tracking-Tabelle für bidirektionalen Sync
- `trackChange()` Zeile für Zeile erklärt (Template Literals, Shorthand Properties, Date.now vs new Date)
- Boolean/Number Inkonsistenz bei `synced` → B-017
- Untypisierter `table` Parameter → B-019
- Kurzdoku: `docs/db.md`

**2. src/shared/api/supabase.ts (Supabase Client + Auth)**
- Lazy Singleton Pattern vs. Eager Singleton (db.ts)
- `import.meta.env` für Build-Zeit Env-Variablen
- Auth-Funktionen: signIn (Result-Objekt Pattern), getSession (Nested Destructuring), signOut
- `checkConnection()` ist RLS-blind — praxisbestätigt durch Moritz → B-020
- Fehlende Rückgabetypen bei getSession/signOut → B-021
- Kurzdoku: `docs/supabase.md`

**3. src/features/sync-data/ (Sync Service)**
- Barrel Export in `index.ts` erklärt
- Field Mapping: camelCase (lokal) ↔ snake_case (Supabase), `|| null` vs `|| undefined` vs `?? null`
- `TableSyncConfig<T>` — generische Abstraktion für alle 7 Tabellen
- Sync-Reihenfolge bewusst: Basis-Tabellen zuerst, dann abhängige (wegen FK-Constraints)
- `syncTable` Kern-Algorithmus (9 Schritte): Deletes pushen → Full Fetch → Maps bauen → Last-Write-Wins Vergleich → Remote-Only pullen → Batch Upserts → SyncMeta aufräumen
- FK-Violation Fallback (Error 23503): Einzeln hochladen, Orphans lokal löschen → B-024
- Project-spezifische Logik in generischem Code → B-022
- `select('*')` Full Table Scan → B-023
- Redundante SyncMeta-Abfrage → B-025
- Custom Categories localStorage-Sync nach Pull bestätigt B-004
- Dynamic Import (`await import(...)`) zur Vermeidung zirkulärer Abhängigkeiten
- Shared State auf Modul-Ebene (refs außerhalb der Composable)
- Kurzdoku: `docs/sync-service.md`

**4. supabase-schema.sql**
- Alte Datei war veraltet (RLS DISABLE, falscher Status-Default, fehlende Policies) → B-026
- Schema aus laufender DB exportiert via `information_schema` Queries
- Aktualisierte Datei erstellt mit korrektem RLS, FK-Constraints, strukturierten Abschnitten
- B-026 behoben, ins Repo committed
- Status-Default Mismatch entdeckt: DB hat `'planning'`, App hat `'planned'` → B-027

### B-016 Update
- Supabase hat `ON DELETE SET NULL` auf `storage_location_id` — die DB räumt Remote korrekt auf
- Problem bleibt nur lokal zwischen Löschung und nächstem Sync
- Weniger kritisch als ursprünglich angenommen

### TypeScript/JS-Konzepte gelernt

| Konzept | Beispiel | Erklärung |
|---------|----------|-----------|
| `extends` | `class X extends Dexie` | Vererbung — X bekommt alle Methoden/Felder von Dexie |
| `super()` | `super('BushcraftPlaner')` | Ruft den Constructor der Elternklasse auf |
| `!` (Non-null Assertion) | `projects!: EntityTable<...>` | "Ich garantiere: wird nicht null sein" |
| `EntityTable<T, K>` | `EntityTable<Project, 'id'>` | Generischer Typ: Tabelle mit T-Objekten, Schlüssel K |
| Bitweise Operatoren | `& 0x0f`, `\| 0x40` | Manipulieren einzelne Bits in einer Zahl |
| Template Literal | `` `${table}-${id}` `` | String mit eingebetteten Ausdrücken |
| Default Parameter | `olderThanDays = 7` | Standardwert wenn Argument weggelassen wird |
| `.where().filter()` | Index-Query + JS-Filter | Zweistufige Filterung: schnell (Index) → fein (JS) |
| Lazy Singleton | `if (!client) { client = create() }` | Instanz erst beim ersten Zugriff erstellt |
| `import.meta.env` | `import.meta.env.VITE_SUPABASE_URL` | Vites Build-Zeit Env-Variablen |
| Nested Destructuring | `{ data: { session } }` | Wert aus verschachteltem Objekt in einem Schritt |
| `Boolean()` | `Boolean(x && y)` | Erzwingt echten Boolean statt truthy/falsy |
| Result-Objekt Pattern | `{ success: boolean; error?: string }` | Fehler als Rückgabewert statt Exception |
| `T extends {...}` | `T extends { id: string }` | Generischer Typ mit Constraint |
| `NonNullable<T>` | `NonNullable<X \| null>` → `X` | Utility Type: entfernt null/undefined |
| `ReturnType<typeof fn>` | `ReturnType<typeof getSupabase>` | Extrahiert den Rückgabetyp einer Funktion |
| `new Map()` | `new Map(arr.map(x => [x.id, x]))` | Lookup-Map für O(1)-Zugriff per Key |
| Dynamic `import()` | `await import('@entities/...')` | Modul erst zur Laufzeit laden |
| `finally` | `try {...} finally { cleanup }` | Läuft immer, egal ob Erfolg oder Fehler |
| `?? null` vs `\|\| null` | `duration ?? null` vs `notes \|\| null` | `??` nur null/undefined, `\|\|` alle falsy |
| `;(expr)` | `;(merged as any).field = ...` | Semikolon am Zeilenanfang verhindert ASI-Fehler |

### Backlog-Einträge (B-017 bis B-027)
- B-017: SyncMeta `synced` boolean/number Inkonsistenz
- B-018: Version 4 ist eine Leer-Migration
- B-019: trackChange `table` Parameter ist untypisiert
- B-020: checkConnection ist RLS-blind (praxisbestätigt)
- B-021: getSession / signOut ohne expliziten Rückgabetyp
- B-022: syncTable hat Project-spezifische Logik im generischen Code
- B-023: select('*') lädt immer die komplette Tabelle
- B-024: FK-Violation Fallback löscht lokale Daten ohne Warnung
- B-025: SyncMeta-Abfrage für gelöschte IDs ist redundant
- B-026: supabase-schema.sql war veraltet — behoben
- B-027: projects.status Default-Mismatch DB ('planning') vs. App ('planned')

### Erstellte Kurzdokus
- `docs/db.md` (ausstehend)
- `docs/supabase.md` (ausstehend)
- `docs/sync-service.md` (ausstehend)
- `docs/supabase-schema.md` (ausstehend)

### Status nach Session 5
- **Phase 1 (Config):** ✅ Komplett
- **Phase 2 (Entity Types):** ✅ Komplett
- **Phase 3 (Stores):** ✅ Komplett
- **Phase 4 (Datenbank & API):** ✅ Komplett
- **Nächste Session:** Phase 5 — Shared Components (Base UI, Composables, Config)