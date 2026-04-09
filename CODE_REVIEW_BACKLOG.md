# Nature Boyz – Optimierungs-Backlog

> Wird gefüllt während wir den Code gemeinsam durchgehen.

---

## Bereits aus Doku erkennbar

### B-001: Kein Auth / RLS deaktiviert
- **Bereich:** Security
- **Status:** Behoben (Supabase Auth + RLS)
- **Beschreibung:** Supabase Auth mit Shared Account (Email+Passwort). RLS aktiviert auf allen 7 Tabellen mit Policy `TO authenticated`. Ohne Login kein Datenzugriff möglich. Login-Screen mit Passwortfeld, Email hardcoded. Router Guard leitet unauthentifizierte User auf /login um. Auto-Sync startet erst nach erfolgreicher Authentifizierung.
- **Risiko:** Gering. Angreifer müsste das Passwort kennen, das nirgends im Code steht.
- **Vorschlag:** Langfristig individuelle Accounts pro User evaluieren.

### B-002: Last-Write-Wins Konflikte
- **Bereich:** Sync
- **Beschreibung:** Bei gleichzeitiger Bearbeitung desselben Eintrags gewinnt der letzte Schreiber
- **Risiko:** Datenverlust möglich wenn zwei Leute gleichzeitig dasselbe Feld editieren
- **Vorschlag:** Für die Gruppengröße okay, aber field-level merging wäre robuster

### B-003: Bilder als Base64 in IndexedDB
- **Bereich:** Performance / Storage
- **Beschreibung:** Projektbilder werden Base64-codiert in IndexedDB gespeichert
- **Risiko:** Speicherverbrauch steigt stark, Sync wird langsam bei vielen Bildern
- **Vorschlag:** Supabase Storage nutzen, nur URL speichern

### B-004: Custom Categories in localStorage
- **Bereich:** Architektur
- **Beschreibung:** Custom Kategorien werden teils in localStorage, teils aus Projekten abgeleitet
- **Risiko:** Inkonsistenz zwischen Geräten, localStorage hat Größenlimits
- **Vorschlag:** Eigene Dexie-Tabelle + Supabase-Tabelle für Kategorien

### B-005: Keine Tests für Stores/Sync
- **Bereich:** Testing
- **Beschreibung:** Vitest ist eingerichtet aber vermutlich wenig/keine Tests vorhanden
- **Vorschlag:** Mindestens Store-CRUD und Sync-Logik testen

### B-006: Keine Error Boundaries
- **Bereich:** UX / Stabilität
- **Beschreibung:** Kein globales Error-Handling sichtbar
- **Vorschlag:** Vue Error Handler + Fallback-UI bei Crashes

---

## Während Code-Review gefunden

### B-007: Toter @widgets Alias
- **Bereich:** Config-Hygiene
- **Datei:** `tsconfig.app.json`, `vite.config.ts`
- **Beschreibung:** Der Path-Alias `@widgets/*` ist in beiden Configs definiert, aber es gibt keinen `src/widgets/` Ordner im Projekt.
- **Vorschlag:** Alias entfernen, oder Ordner anlegen falls geplant.

### B-008: SVG-Icons statt PNG für PWA
- **Bereich:** PWA
- **Datei:** `vite.config.ts`
- **Beschreibung:** Icons sind als SVG (`icon-192.svg`, `icon-512.svg`) definiert. SVGs sind super für Skalierung, aber manche ältere Geräte/Browser unterstützen SVG-Icons im Manifest nicht.
- **Vorschlag:** Zusätzlich PNG-Fallbacks generieren (z.B. mit `sharp` oder online-Tool). Auch `includeAssets` referenziert `icons/*.png`, die SVGs werden dort aber nicht erwähnt.

### B-009: ProjectCategory Union mit `| string` entwertet Type-Safety
- **Bereich:** TypeScript / Typ-Sicherheit
- **Datei:** `src/entities/project/model/types.ts`
- **Beschreibung:** `type ProjectCategory = 'construction' | 'exploration' | 'tools' | 'custom' | string` — das `| string` am Ende macht die konkreten Werte wirkungslos. TypeScript behandelt den gesamten Typ als `string`, sodass Tippfehler nicht erkannt werden.
- **Vorschlag:** Trennung in `BuiltinCategory` und `CustomCategory`: z.B. `type ProjectCategory = BuiltinCategory | \`custom_${string}\`` oder die Custom-Kategorie rein über `customCategoryName` abbilden.

### B-010: PROJECT_CATEGORY_LABELS nutzt Record<string, string> statt Record<ProjectCategory, string>
- **Bereich:** TypeScript / Typ-Sicherheit
- **Datei:** `src/entities/project/model/types.ts`
- **Beschreibung:** `PROJECT_CATEGORY_LABELS` und `PROJECT_CATEGORY_ICONS` nutzen `Record<string, string>` statt `Record<ProjectCategory, string>`. Dadurch merkt TS nicht wenn ein Key fehlt oder falsch geschrieben ist.
- **Vorschlag:** Mindestens die Builtin-Categories typisieren. Geht aber erst wenn B-009 gefixt ist.

### B-011: UNIT_GROUPS/COMMON_UNITS ohne `as const`
- **Bereich:** TypeScript / Typ-Sicherheit (informational)
- **Datei:** `src/entities/material/model/types.ts`
- **Beschreibung:** `UNIT_GROUPS` ist ohne `as const` definiert, daher ist `COMMON_UNITS` für TypeScript nur `string[]`. Ein typisierter `MaterialUnit`-Typ wäre technisch möglich, ist aber für den Use Case nicht sinnvoll — Freitext-Einheiten sollen erlaubt sein.
- **Status:** Kein Problem, bewusste Entscheidung. Nur als Lernbeispiel für `as const` dokumentiert.

### B-012: Seed Data in types.ts statt eigener Datei
- **Bereich:** Architektur / Code-Organisation
- **Datei:** `src/entities/storage-location/model/types.ts`
- **Beschreibung:** `DEFAULT_STORAGE_LOCATIONS` enthält echte Daten (3 vordefinierte Lagerorte), lebt aber im Type-File. Type-Files sollten nur Typdefinitionen und UI-Konstanten (Labels, Icons) enthalten, keine Seed Data.
- **Vorschlag:** In eigene `seed.ts` oder direkt in den Store auslagern wo die Initialisierung stattfindet.

### B-013: getCategoryName hat fragilen dreifachen Fallback
- **Bereich:** Code-Qualität / Wartbarkeit
- **Datei:** `src/entities/project/model/store.ts`
- **Beschreibung:** `getCategoryName()` versucht drei Quellen nacheinander: erst den `customName`-Parameter, dann das `allCategories`-Computed, dann nochmal direkt `localStorage.getItem()` als Fallback. Der dritte Fallback parst JSON bei jedem Aufruf und existiert laut Kommentar weil "sync may have written it after store init". Symptom der fehlenden Sync-Fähigkeit von Custom Categories (B-004).
- **Vorschlag:** Wird obsolet wenn B-004 (Custom Categories in Dexie/Supabase) umgesetzt wird.

### B-014: reorderTasks ohne trackChange — Sync-Lücke
- **Bereich:** Sync
- **Datei:** `src/entities/task/model/store.ts`
- **Beschreibung:** `reorderTasks()` nutzt `db.tasks.bulkUpdate()` für die neue Reihenfolge, ruft aber kein `trackChange()` auf. Die Umsortierung wird lokal in Dexie gespeichert, aber nicht für den Supabase-Sync protokolliert.
- **Status:** Nicht akut — Drag & Drop ist in der App nicht aktiv. Wird beim Task-Rework (Feedback #1) mitbehandelt.
- **Vorschlag:** Nach dem `bulkUpdate` für jede Task-ID ein `trackChange('tasks', id, 'update')` aufrufen.

### B-015: Kaskadierende Löschung ohne User-Warnung
- **Bereich:** UX / Datensicherheit
- **Datei:** `src/entities/material/model/store.ts`, `src/entities/project/model/store.ts`
- **Beschreibung:** `deleteMaterial()` löscht automatisch alle zugehörigen MaterialRequirements, `deleteProject()` löscht Tasks und alle Requirements. Auf Store-Ebene gibt es keine Prüfung ob noch Verknüpfungen existieren. Ob die UI eine Bestätigungswarnung zeigt, ist noch unklar.
- **Status:** To-be-checked — wird in Phase 6 (Pages) geprüft wenn wir die UI-Seiten durchgehen.
- **Vorschlag:** Falls keine UI-Warnung existiert: Bestätigungsdialog einbauen ("Material X wird noch in 3 Projekten gebraucht. Trotzdem löschen?")

### B-016: Verwaiste storageLocationId nach Lagerort-Löschung
- **Bereich:** Datenintegrität
- **Datei:** `src/entities/storage-location/model/store.ts`
- **Beschreibung:** `deleteLocation()` löscht den Lagerort, bereinigt aber nicht die `storageLocationId` in Material- und Equipment-Einträgen die auf diesen Lagerort zeigen. Die Referenz zeigt danach ins Leere.
- **Status:** To-be-checked — in Phase 6 prüfen ob die UI damit umgeht oder ob es zu Fehlern führt.
- **Vorschlag (Optionen, eine davon wählen):**
  1. **Lösch-Schutz (empfohlen):** Löschung verhindern solange noch Gegenstände oder Projekte am Lagerort hängen. Hinweis an den User: "Lagerort kann nicht gelöscht werden — es sind noch X Materialien und Y Ausrüstungsgegenstände zugewiesen."
  2. **Umlagern vor Löschung:** Dialog der alle zugewiesenen Items zeigt und den User auffordert, diese zuerst einem anderen Lagerort zuzuweisen. Erst wenn der Lagerort leer ist, wird Löschung freigegeben.

  ### B-017: SyncMeta `synced` boolean/number Inkonsistenz
- **Bereich:** TypeScript / Dexie
- **Datei:** `src/shared/api/db.ts`
- **Beschreibung:** `synced` ist als `boolean` typisiert, aber `getUnsyncedChanges()` nutzt `.equals(0)` statt `.equals(false)`. Funktioniert weil Dexie intern konvertiert, aber ist irreführend.
- **Vorschlag:** Entweder `equals(false)` nutzen oder den Typ auf `number` (bzw. `0 | 1`) ändern.

### B-018: Version 4 ist eine Leer-Migration
- **Bereich:** Config-Hygiene
- **Datei:** `src/shared/api/db.ts`
- **Beschreibung:** Version 4 ("Add assignees on tasks") ändert keine Indexe gegenüber Version 3. Die Migration existiert ohne Effekt.
- **Vorschlag:** Kommentar anpassen dass kein Index-Update nötig war, oder bei nächster echter Schema-Änderung zusammenlegen.

### B-019: trackChange `table` Parameter ist untypisiert
- **Bereich:** TypeScript / Typ-Sicherheit
- **Datei:** `src/shared/api/db.ts`
- **Beschreibung:** `table: string` erlaubt beliebige Strings. Ein Tippfehler wie `trackChange('projecst', ...)` fällt nicht auf. Gleiches gilt für `SyncMeta.table`.
- **Vorschlag:** Union Type definieren: `type SyncTable = 'projects' | 'tasks' | 'materials' | 'materialRequirements' | 'equipment' | 'equipmentRequirements' | 'storageLocations'`

### B-020: checkConnection ist RLS-blind
- **Bereich:** Sync / Auth
- **Datei:** `src/shared/api/supabase.ts`
- **Beschreibung:** `checkConnection()` macht `select('id').limit(1)` auf `projects`. Mit RLS aktiv und ohne Login gibt Supabase kein Error sondern ein leeres Array zurück. Der Check sagt "Verbindung steht" obwohl kein Datenzugriff möglich ist. Praxisbestätigt: "Sync erfolgreich" obwohl keine DB-Verbindung bestand.
- **Vorschlag:** Entweder Session-Check einbauen (`getSession()` prüfen), oder eine dedizierte Health-Check-RPC-Funktion in Supabase nutzen.

### B-021: getSession / signOut ohne expliziten Rückgabetyp
- **Bereich:** TypeScript / Konsistenz
- **Datei:** `src/shared/api/supabase.ts`
- **Beschreibung:** `signIn` hat einen expliziten Rückgabetyp, `getSession` und `signOut` nicht. Für eine zentrale API-Datei inkonsistent.
- **Vorschlag:** Rückgabetypen ergänzen: `Promise<Session | null>` und `Promise<void>`.

### B-022: syncTable hat Project-spezifische Logik im generischen Code
- **Bereich:** Architektur / Wartbarkeit
- **Datei:** `src/features/sync-data/composables/useSync.ts`
- **Beschreibung:** Innerhalb von `syncTable` (Schritt 5) gibt es ein `if (config.localTableName === 'projects')` das `imagePlaceholder` und `createdBy` preserviert. Das bricht die generische Abstraktion — wenn weitere Entities lokale-only Felder bekommen, muss die generische Funktion erneut angefasst werden.
- **Vorschlag:** `TableSyncConfig` um ein optionales `preserveLocalFields?: (local: T, merged: T) => T` erweitern und die Project-Logik dort rein.

### B-023: select('*') lädt immer die komplette Tabelle
- **Bereich:** Performance / Skalierbarkeit
- **Datei:** `src/features/sync-data/composables/useSync.ts`
- **Beschreibung:** `syncTable` Schritt 2 macht `select('*')` ohne Filter. Bei wachsenden Datenmengen (Bilder als Base64 in Projects — B-003) wird das zunehmend langsam.
- **Vorschlag:** Für eure Gruppengröße aktuell kein Problem. Langfristig: Delta-Sync mit `updated_at > lastSyncedAt` Filter, oder zumindest schwere Felder (imageUrl) ausschließen.

### B-024: FK-Violation Fallback löscht lokale Daten ohne Warnung
- **Bereich:** Datenintegrität / UX
- **Datei:** `src/features/sync-data/composables/useSync.ts`
- **Beschreibung:** Bei PostgreSQL Error `23503` (FK-Violation) wird der fehlerhafte Record lokal gelöscht (`localTable.delete(record.id)`). Der User erfährt nichts davon. Verknüpft mit B-015.
- **Vorschlag:** Mindestens loggen welche Records betroffen sind. Besser: in ein `syncConflicts`-Array sammeln und dem User anzeigen.

### B-025: SyncMeta-Abfrage für gelöschte IDs ist redundant
- **Bereich:** Performance
- **Datei:** `src/features/sync-data/composables/useSync.ts`
- **Beschreibung:** In `syncTable` werden Delete-Metas zweimal abgefragt: einmal in Schritt 1 (um Deletes zu pushen) und nochmal nach Schritt 4 (um `locallyDeletedIds` zu bauen). Die zweite Abfrage könnte die Ergebnisse der ersten wiederverwenden.
- **Vorschlag:** `deleteMeta` aus Schritt 1 wiederverwenden und mit bereits gesyncten Deletes ergänzen. Spart eine DB-Query pro Tabelle pro Sync.

### B-026: supabase-schema.sql war veraltet
- **Bereich:** Dokumentation / DevOps
- **Datei:** `supabase-schema.sql`
- **Status:** Behoben (Session 5) — Schema-Datei aus laufender DB exportiert und aktualisiert. Enthält jetzt korrekten RLS-Stand (ENABLE + authenticated_access Policies), korrekte FK-Constraints, strukturierte Abschnitte nach Abhängigkeitsreihenfolge.

### B-027: projects.status Default-Mismatch DB vs. App
- **Bereich:** Datenintegrität
- **Datei:** `supabase-schema.sql`, `src/entities/project/model/types.ts`
- **Beschreibung:** Der DB-Default für `projects.status` ist `'planning'`, aber der TypeScript-Typ `ProjectStatus` definiert `'planned' | 'in-progress' | 'completed'`. Wenn Supabase je den Default einsetzt (z.B. bei einem Insert ohne Status-Feld), entsteht ein Status den die App nicht kennt.
- **Vorschlag:** In Supabase den Default auf `'planned'` ändern: `ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'planned';`
 
<!-- Template:
### B-XXX: Titel
- **Bereich:** 
- **Datei:** 
- **Beschreibung:** 
- **Vorschlag:** 
-->