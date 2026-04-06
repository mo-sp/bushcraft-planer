# Material Types – Kurzdoku

**Datei:** `src/entities/material/model/types.ts`

## Zweck
Definiert Datenstrukturen für Materialien (Verbrauchsgüter) und deren Zuweisung zu Projekten.

## Interfaces

### Material (Haupttyp)
| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| id | string | ✅ | Eindeutige ID |
| name | string | ✅ | Materialname |
| specifications | string | ❌ | Variante/Details (z.B. "2m, gerade") |
| unit | string | ❌ | Einheit (Freitext, Vorschläge via COMMON_UNITS) |
| currentStock | number | ✅ | Aktueller Bestand |
| icon | string | ❌ | Lucide-Icon-Name |
| owner | string | ❌ | Besitzer (Freitext, kein FK) |
| storageLocationId | string | ❌ | FK zu StorageLocation |
| createdAt/updatedAt | Date | ✅ | Zeitstempel |
| syncedAt | Date | ❌ | Letzter Supabase-Sync |

### MaterialRequirement (Verknüpfungstabelle)
Many-to-Many zwischen Material und Project.
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | string | Eindeutige ID |
| materialId | string | FK zu Material |
| projectId | string | FK zu Project |
| requiredAmount | number | Benötigte Menge |

### Create/Update-Inputs
- Drei-Interface-Pattern für beide Entitäten (Material + MaterialRequirement)
- `currentStock` optional bei Create → Store setzt Default (vermutlich 0)

## Konstanten
| Export | Typ | Beschreibung |
|--------|-----|-------------|
| UNIT_GROUPS | UnitGroup[] | Gruppierte Einheiten (Menge, Länge, Gewicht, Volumen) |
| COMMON_UNITS | string[] | Flache Liste aller Einheiten (aus UNIT_GROUPS abgeleitet) |
| MATERIAL_ICONS | string[] | Verfügbare Lucide-Icon-Namen |

## Patterns & Konzepte
- **Zwei Entitäten in einer Datei:** Material + MaterialRequirement
- **Many-to-Many via Requirement-Tabelle:** Eigene Entity mit requiredAmount
- **FK als optionaler String:** storageLocationId — keine Runtime-Validierung
- **Owner als Freitext:** Kein FK, passt zum useKnownPersons-Autocomplete-Pattern

## Abhängigkeiten
- Keine Imports — reines Type-File
- Wird referenziert von: Material Store, ProjectDetailPage, InventoryPage, Sync Service