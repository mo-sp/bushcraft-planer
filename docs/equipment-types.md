# Equipment Types – Kurzdoku

**Datei:** `src/entities/equipment/model/types.ts`

## Zweck
Definiert Datenstrukturen für Ausrüstung (wiederverwendbare Gegenstände) und deren Zuweisung zu Projekten.

## Interfaces

### Equipment (Haupttyp)
| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| id | string | ✅ | Eindeutige ID |
| name | string | ✅ | Ausrüstungsname |
| specifications | string | ❌ | Details (z.B. "wasserdicht", "30L") |
| currentStock | number | ✅ | Aktueller Bestand |
| owner | string | ❌ | Besitzer (Freitext) |
| storageLocationId | string | ❌ | FK zu StorageLocation |
| createdAt/updatedAt | Date | ✅ | Zeitstempel |
| syncedAt | Date | ❌ | Letzter Supabase-Sync |

### EquipmentRequirement (Verknüpfungstabelle)
Many-to-Many zwischen Equipment und Project. Struktur identisch zu MaterialRequirement.

### Create/Update-Inputs
Drei-Interface-Pattern für beide Entitäten.

## Unterschied zu Material
| Aspekt | Material | Equipment |
|--------|----------|-----------|
| unit | ✅ (Freitext + Vorschläge) | ❌ (implizit Stück) |
| icon | ✅ (Lucide-Icon-Name) | ❌ |
| Konstanten | UNIT_GROUPS, COMMON_UNITS, MATERIAL_ICONS | Keine |
| Verbrauchslogik | Verbrauchsgut (Stock sinkt) | Aktuell wie Material — Umbau geplant (Feedback #4) |

## Hinweis: Feedback #4
Aktuell hat Equipment dieselbe Stock/Requirement-Logik wie Material. Geplanter Umbau: Kategorien/Typen statt Einzelteile, Mehrfachzuweisung, kein Bestandsabzug.

## Abhängigkeiten
- Keine Imports — reines Type-File
- Wird referenziert von: Equipment Store, ProjectDetailPage, EquipmentPage, Sync Service