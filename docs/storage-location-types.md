# Storage Location Types – Kurzdoku

**Datei:** `src/entities/storage-location/model/types.ts`

## Zweck
Definiert Datenstrukturen für Lagerorte im Wald.

## Interfaces

### StorageLocation (Haupttyp)
| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| id | string | ✅ | Eindeutige ID |
| name | string | ✅ | Ortsname |
| description | string | ❌ | Beschreibung |
| icon | string | ❌ | Lucide-Icon-Name |
| createdAt/updatedAt | Date | ✅ | Zeitstempel |
| syncedAt | Date | ❌ | Letzter Supabase-Sync |

### Create/Update-Inputs
Drei-Interface-Pattern. Schlankste Variante — nur name, description, icon.

## Konstanten
| Export | Beschreibung |
|--------|-------------|
| DEFAULT_STORAGE_LOCATIONS | 3 Seed-Einträge (Hippie-Wald, Geheimplatz, Moorwald-Lager) |

## Besonderheiten
- **Kein owner** — Lagerorte gehören der Gruppe
- **Keine Requirement-Tabelle** — Verknüpfung läuft über storageLocationId in Material/Equipment
- **Seed Data im Type-File** — DEFAULT_STORAGE_LOCATIONS wäre in seed.ts besser aufgehoben

## Abhängigkeiten
- Keine Imports — reines Type-File
- Wird referenziert von: StorageLocation Store, Material/Equipment (via FK), StorageLocationsPage, Sync Service
- Geplant: Kisten-System (Feedback #7) wird Unter-Ebene hinzufügen