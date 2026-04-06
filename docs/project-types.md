# src/entities/project/model/types.ts — Kurzdoku

## Zweck
Definiert das Datenmodell für Projekte: welche Felder ein Projekt hat, welche Werte erlaubt sind, und Hilfs-Konstanten fürs UI.

## TypeScript-Konzepte in dieser Datei
| Konzept | Beispiel | Bedeutung |
|---------|----------|-----------|
| `type` (Alias) | `type ProjectStatus = 'planned' \| 'in_progress' \| 'completed'` | Gibt einem Typ einen Namen |
| Union Type `\|` | `'construction' \| 'exploration'` | Wert muss einer der Optionen sein |
| `interface` | `interface Project { ... }` | Beschreibt die Form eines Objekts |
| Optionale Felder `?` | `imageUrl?: string` | Feld kann fehlen (undefined) |
| Array-Typ `[]` | `participants?: string[]` | Liste von Werten |
| `Record<K, V>` | `Record<ProjectStatus, string>` | Wörterbuch (Schlüssel → Wert) |
| `as` (Type Assertion) | `COLORS[i] as string` | "Vertrau mir, das ist dieser Typ" |

## Interfaces
- **Project** — Vollständiges Projekt aus der Datenbank (alle Felder)
- **CreateProjectInput** — Zum Anlegen (ohne id, createdAt, etc.)
- **UpdateProjectInput** — Zum Bearbeiten (alles optional)

## Konstanten
- `PROJECT_CATEGORY_LABELS` — Englischer Key → Deutscher UI-Text
- `PROJECT_CATEGORY_ICONS` — Englischer Key → Lucide Icon-Name
- `PROJECT_STATUS_LABELS` — Status → Deutscher UI-Text
- `PLACEHOLDER_COLORS` — Zufällige Hintergrundfarben für Projekte ohne Bild

## Felder von Project
| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| id | string | ja | UUID des Projekts |
| name | string | ja | Projektname |
| description | string | ja | Beschreibung |
| category | ProjectCategory | ja | Kategorie (construction, exploration, tools, custom) |
| customCategoryName | string | nein | Name einer benutzerdefinierten Kategorie |
| storageLocationId | string | nein | Verknüpfter Lagerort |
| participants | string[] | nein | Liste der Teilnehmer |
| responsible | string | nein | Verantwortliche Person |
| imageUrl | string | nein | Projektfoto (Base64) |
| sketchUrl | string | nein | Projektskizze (Base64) |
| imagePlaceholder | string | ja | Platzhalter-Farbe |
| status | ProjectStatus | ja | planned / in_progress / completed |
| notes | string | ja | Freitext-Notizen |
| createdAt | Date | ja | Erstellungszeitpunkt |
| updatedAt | Date | ja | Letzter Änderungszeitpunkt |
| createdBy | string | ja | Ersteller |
| syncedAt | Date | nein | Letzter Sync-Zeitpunkt |
