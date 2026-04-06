# Storage Location Store — Kurzdoku

> `src/entities/storage-location/model/store.ts`

## Zweck
Pinia Setup Store für Lagerort-CRUD. Der schlankste Store im Projekt — nur eine Entität, keine Requirements, kein Stock-Management.

## State

| Variable | Typ | Beschreibung |
|----------|-----|-------------|
| `locations` | `ref<StorageLocation[]>` | Alle Lagerorte, alphabetisch sortiert |
| `loading` | `ref<boolean>` | Ladezustand |
| `error` | `ref<string \| null>` | Fehlermeldung oder null |

## Getter

| Name | Parameter | Rückgabe | Beschreibung |
|------|-----------|----------|-------------|
| `locationById` | `id` | `StorageLocation \| undefined` | Einzelner Lagerort per ID |
| `locationByName` | `name` | `StorageLocation \| undefined` | Einzelner Lagerort per Name (einzigartig unter den Stores — nur hier gibt es Suche per Name) |

## Actions

| Name | Beschreibung |
|------|-------------|
| `loadLocations()` | Lädt alle Lagerorte aus Dexie |
| `createLocation(input)` | Erstellt Lagerort (nur name, description, icon), sortiert alphabetisch |
| `updateLocation(id, input)` | Update mit Object.assign auf lokalem State |
| `deleteLocation(id)` | Löscht Lagerort (⚠ keine Bereinigung von storageLocationId in Material/Equipment → B-016) |

## Patterns & Besonderheiten
- **Einziger Store ohne Requirements:** Verknüpfung zu Material/Equipment läuft über `storageLocationId` in den anderen Stores, nicht über eine Zwischentabelle
- **Keine kaskadierende Löschung:** Anders als Material/Equipment/Project Store — `deleteLocation` bereinigt keine Fremdschlüssel → B-016
- **`locationByName`:** Einziger Getter im Projekt der per Name statt per ID sucht. Erzwingt aber keine Eindeutigkeit — Duplikate wären möglich
- **Schlankster Store:** 9 Exports vs. 18 bei Material/Equipment

## Abhängigkeiten
- `@shared/api/db` → Dexie-Instanz, generateId, trackChange
- `./types` → StorageLocation, CreateStorageLocationInput, UpdateStorageLocationInput

## Backlog-Bezug
- B-006: error-State wird gesetzt aber nirgends in der UI angezeigt
- B-016: Verwaiste storageLocationId nach Lagerort-Löschung