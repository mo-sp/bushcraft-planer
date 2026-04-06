# Equipment Store — Kurzdoku

> `src/entities/equipment/model/store.ts`

## Zweck
Pinia Setup Store für Equipment- und EquipmentRequirement-CRUD. Nahezu identisch zum Material Store — gleiche Patterns, gleiche Struktur, zwei Entitäten in einem Store.

## State

| Variable | Typ | Beschreibung |
|----------|-----|-------------|
| `equipment` | `ref<Equipment[]>` | Alle Ausrüstungsgegenstände, alphabetisch sortiert |
| `requirements` | `ref<EquipmentRequirement[]>` | Alle Equipment-Projekt-Verknüpfungen |
| `loading` | `ref<boolean>` | Ladezustand |
| `error` | `ref<string \| null>` | Fehlermeldung oder null |

## Getter

| Name | Parameter | Rückgabe | Beschreibung |
|------|-----------|----------|-------------|
| `equipmentById` | `id` | `Equipment \| undefined` | Einzelnes Equipment per ID |
| `requirementsByProject` | `projectId` | `EquipmentRequirement[]` | Alle Requirements eines Projekts |
| `requirementsByEquipment` | `equipmentId` | `EquipmentRequirement[]` | Alle Projekte die ein Equipment brauchen |
| `equipmentWithStock` | — | `(Equipment & StockInfo)[]` | Jedes Equipment + totalRequired, available, isLow (⚠ Logik passt nicht zu wiederverwendbarem Equipment → Feedback #4) |
| `lowStockEquipment` | — | `(Equipment & StockInfo)[]` | Nur Equipment wo Bestand < Bedarf |
| `equipmentByLocation` | `locationId` | `Equipment[]` | Equipment an einem Lagerort |
| `equipmentByOwner` | `owner` | `Equipment[]` | Equipment eines Besitzers |
| `uniqueOwners` | — | `string[]` | Deduplizierte, sortierte Owner-Liste |

## Actions

| Name | Beschreibung |
|------|-------------|
| `loadEquipment()` | Lädt alle Equipment + Requirements aus Dexie |
| `createEquipment(input)` | Erstellt Equipment (ohne unit/icon, anders als Material), sortiert alphabetisch |
| `updateEquipment(id, input)` | Update mit Object.assign auf lokalem State |
| `adjustStock(id, delta)` | Convenience-Wrapper: Bestand ändern um +/- delta, min 0 (⚠ wird durch Feedback #4 überflüssig/umgebaut) |
| `deleteEquipment(id)` | Löscht Equipment + kaskadierende Löschung aller Requirements (⚠ kein trackChange für Requirements, ⚠ keine User-Warnung → B-015) |
| `createRequirement(input)` | EquipmentRequirement anlegen |
| `updateRequirement(id, input)` | EquipmentRequirement updaten |
| `deleteRequirement(id)` | Einzelnes Requirement löschen |

## Patterns & Besonderheiten
- **Fast identisch zum Material Store:** Gleiche Struktur, gleiche Patterns — Unterschied nur: kein `unit`-Feld, kein `icon`-Feld
- **Bedarfsrechnung passt nicht:** `equipmentWithStock` rechnet wie Material (Verbrauchslogik), aber Equipment ist wiederverwendbar → Feedback #4
- **Kaskadierende Löschung:** Wie Material Store — ohne trackChange, ohne User-Warnung (B-015)
- **Naming:** Variable heißt `equipment` (Singular), weil "equipment" im Englischen uncountable ist

## Abhängigkeiten
- `@shared/api/db` → Dexie-Instanz, generateId, trackChange
- `./types` → Equipment, EquipmentRequirement + Input-Typen

## Backlog-/Feedback-Bezug
- B-006: error-State wird gesetzt aber nirgends in der UI angezeigt
- B-015: Kaskadierende Löschung ohne User-Warnung (to-be-checked in Phase 6)
- Feedback #4: Equipment-Logik grundlegend umbauen (wiederverwendbar statt Verbrauch)