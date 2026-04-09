# Sync Service — Bidirektionaler Supabase Sync

**Dateien:** `src/features/sync-data/composables/useSync.ts`, `src/features/sync-data/index.ts`
**Zweck:** Bidirektionaler Sync aller 7 Tabellen zwischen Dexie (lokal) und Supabase (remote)

---

## Architektur

```
index.ts          → Barrel Export (re-exportiert useSync)
composables/
  useSync.ts      → Field Mapping + syncTable-Algorithmus + useSync Composable
```

## Sync-Algorithmus (`syncTable`, 9 Schritte)

1. **Lokale Deletes pushen** — SyncMeta mit `action: 'delete'` → Remote löschen
2. **Alle Remote-Records laden** — `select('*')` Full Fetch (→ B-023)
3. **Alle lokalen Records laden** — `localTable.toArray()`
4. **Maps bauen** — `Map<id, record>` für O(1) Lookup + `Set<id>` für lokal gelöschte IDs
5. **Lokale Records abgleichen** — Last-Write-Wins per `updatedAt` Vergleich
6. **Remote-Only Records pullen** — Neue Einträge von anderen Geräten (außer lokal gelöschte)
7. **Remote Upserts** — Batches von 50, FK-Violation Fallback einzeln (→ B-024)
8. **Lokale Upserts** — `bulkPut` in Dexie
9. **SyncMeta aufräumen** — Pending create/update als synced markieren

## Sync-Reihenfolge (wegen FK-Constraints)

1. `storage_locations` (Basis)
2. `materials`, `equipment` (FK → storage_locations)
3. `projects` (FK → storage_locations)
4. `tasks` (FK → projects)
5. `material_requirements` (FK → materials + projects)
6. `equipment_requirements` (FK → equipment + projects)

## Field Mapping

Für jede Entity ein Funktionspaar:
- **`entityToRemote()`** — camelCase → snake_case, `undefined` → `null`
- **`entityFromRemote()`** — snake_case → camelCase, `null` → `undefined`

Unterschied `|| null` vs `?? null`: `??` bewahrt `0` und `''`, `||` ersetzt alle falsy Werte.

## useSync Composable

| Export | Typ | Beschreibung |
|--------|-----|-------------|
| `isSyncing` | `Ref<boolean>` | Shared State — alle Aufrufer sehen denselben Status |
| `lastSyncedAt` | `Ref<Date \| null>` | Letzter Sync-Zeitpunkt (persistiert in localStorage) |
| `syncError` | `Ref<string \| null>` | Fehlermeldung des letzten Syncs |
| `lastResult` | `Ref<SyncResult \| null>` | Pushed/Pulled/Deleted/Errors Zähler |
| `fullSync()` | `Promise<SyncResult>` | Führt kompletten Sync aller Tabellen durch |

- **Shared State:** Refs leben auf Modul-Ebene (außerhalb der Composable), alle Instanzen teilen denselben Zustand
- **Preconditions:** Supabase konfiguriert + Browser online (`useOnline()` aus VueUse)
- **Custom Categories:** Nach Pull werden Categories aus Projekten in localStorage geschrieben (B-004)
- **Dynamic Import:** `await import('@entities/project/model/store')` vermeidet zirkuläre Abhängigkeiten

## Abhängigkeiten
- `vue` (ref), `@vueuse/core` (useOnline)
- `@shared/api/supabase` (getSupabase, isSupabaseConfigured)
- `@shared/api/db` (db, SyncMeta)
- Alle Entity-Typen

## Backlog
- B-022: Project-spezifische Logik in generischem `syncTable`
- B-023: `select('*')` Full Table Scan
- B-024: FK-Violation Fallback löscht lokal ohne Warnung
- B-025: Redundante SyncMeta-Abfrage für gelöschte IDs