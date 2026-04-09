# db.ts — Dexie Datenbank Setup

**Datei:** `src/shared/api/db.ts`
**Zweck:** Lokale IndexedDB-Datenbank via Dexie, UUID-Generierung, Change-Tracking für Sync

---

## Datenbank

| Export | Typ | Beschreibung |
|--------|-----|-------------|
| `db` | `BushcraftDatabase` | Singleton-Instanz (Eager), wird von allen Stores importiert |

### Tabellen (7 + SyncMeta)

| Tabelle | Entity | Primärschlüssel |
|---------|--------|----------------|
| `projects` | Project | `id` |
| `tasks` | Task | `id` |
| `materials` | Material | `id` |
| `materialRequirements` | MaterialRequirement | `id` |
| `equipment` | Equipment | `id` |
| `equipmentRequirements` | EquipmentRequirement | `id` |
| `storageLocations` | StorageLocation | `id` |
| `syncMeta` | SyncMeta | `id` |

### Schema-Versionen

| Version | Änderung |
|---------|----------|
| 1 | Projects, Tasks, Materials, MaterialRequirements, SyncMeta |
| 2 | Equipment + EquipmentRequirements |
| 3 | StorageLocations + owner/storageLocationId Indexe |
| 4 | Leer-Migration (Kommentar: assignees, kein neuer Index) → B-018 |

## SyncMeta (Change-Tracking)

```ts
interface SyncMeta {
  id: string        // Format: `${table}-${recordId}-${timestamp}`
  table: string     // Tabellenname (untypisiert → B-019)
  action: 'create' | 'update' | 'delete'
  timestamp: Date
  synced: boolean   // false = noch nicht hochgeladen (Abfrage nutzt 0/1 → B-017)
}
```

## Exportierte Funktionen

| Funktion | Beschreibung |
|----------|-------------|
| `generateId()` | UUID v4 — `crypto.randomUUID()` mit Fallback für HTTP (Non-Secure Context) |
| `trackChange(table, id, action)` | Schreibt SyncMeta-Eintrag, wird von allen Store-CRUD-Operationen aufgerufen |
| `getUnsyncedChanges()` | Alle SyncMeta mit `synced: false` |
| `markAsSynced(ids)` | Setzt `synced: true` per `bulkUpdate` |
| `clearOldSyncMeta(days)` | Löscht gesyncte Einträge älter als N Tage (Default: 7) |

## Abhängigkeiten
- `dexie` (IndexedDB-Wrapper)
- Alle Entity-Typen aus `@entities/*/model/types`

## Backlog
- B-017: `synced` boolean vs. `.equals(0)`
- B-018: Version 4 Leer-Migration
- B-019: `table` Parameter untypisiert