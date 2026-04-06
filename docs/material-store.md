# Material Store — Kurzdoku

> `src/entities/material/model/store.ts`

## Zweck
Pinia Setup Store für Material- und MaterialRequirement-CRUD. Verwaltet zwei Entitäten in einem Store, weil Requirements ohne Material keinen Sinn ergeben.

## State

| Variable | Typ | Beschreibung |
|----------|-----|-------------|
| `materials` | `ref<Material[]>` | Alle Materialien, alphabetisch sortiert |
| `requirements` | `ref<MaterialRequirement[]>` | Alle Material-Projekt-Verknüpfungen |
| `loading` | `ref<boolean>` | Ladezustand |
| `error` | `ref<string \| null>` | Fehlermeldung oder null |

## Getter

| Name | Parameter | Rückgabe | Beschreibung |
|------|-----------|----------|-------------|
| `materialById` | `id` | `Material \| undefined` | Einzelnes Material per ID |
| `requirementsByProject` | `projectId` | `MaterialRequirement[]` | Alle Requirements eines Projekts |
| `requirementsByMaterial` | `materialId` | `MaterialRequirement[]` | Alle Projekte die ein Material brauchen |
| `materialWithStock` | — | `(Material & StockInfo)[]` | Jedes Material + totalRequired, available, isLow |
| `lowStockMaterials` | — | `(Material & StockInfo)[]` | Nur Materialien wo Bestand < Bedarf |
| `materialsByLocation` | `locationId` | `Material[]` | Materialien an einem Lagerort |
| `materialsByOwner` | `owner` | `Material[]` | Materialien eines Besitzers |
| `uniqueOwners` | — | `string[]` | Deduplizierte, sortierte Owner-Liste |

## Actions

| Name | Beschreibung |
|------|-------------|
| `loadMaterials()` | Lädt alle Materials + Requirements aus Dexie |
| `createMaterial(input)` | Erstellt Material, sortiert danach alphabetisch |
| `updateMaterial(id, input)` | Update mit Object.assign auf lokalem State |
| `adjustStock(id, delta)` | Convenience-Wrapper: Bestand ändern um +/- delta, min 0 |
| `deleteMaterial(id)` | Löscht Material + kaskadierende Löschung aller Requirements (⚠ kein trackChange für Requirements, ⚠ keine User-Warnung → B-015) |
| `createRequirement(input)` | MaterialRequirement anlegen |
| `updateRequirement(id, input)` | MaterialRequirement updaten |
| `deleteRequirement(id)` | Einzelnes Requirement löschen |

## Patterns & Besonderheiten
- **Zwei Entitäten, ein Store:** Materials + MaterialRequirements werden zusammen geladen und verwaltet
- **Bedarfsrechnung:** `materialWithStock` berechnet pro Material den Gesamtbedarf aus allen Projekten (O(n×m))
- **Kaskadierende Löschung:** `deleteMaterial` löscht Requirements ohne trackChange (bekanntes Sync-Thema) und ohne User-Warnung (B-015)
- **Type Predicate:** `uniqueOwners` nutzt `(o): o is string` um nach dem Filter den Typ einzugrenzen
- **Sortierung:** `createMaterial` sortiert nach Push mit `localeCompare` (sprachbewusst)

## Abhängigkeiten
- `@shared/api/db` → Dexie-Instanz, generateId, trackChange
- `./types` → Material, MaterialRequirement + Input-Typen

## Backlog-Bezug
- B-006: error-State wird gesetzt aber nirgends in der UI angezeigt
- B-015: Kaskadierende Löschung ohne User-Warnung (to-be-checked in Phase 6)