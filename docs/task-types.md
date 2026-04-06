# Task Types – Kurzdoku

**Datei:** `src/entities/task/model/types.ts`

## Zweck
Definiert die Datenstruktur für Aufgaben innerhalb eines Projekts.

## Interfaces

### Task (Haupttyp)
| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| id | string | ✅ | Eindeutige ID |
| projectId | string | ✅ | Zugehöriges Projekt |
| title | string | ✅ | Aufgabenname |
| description | string | ❌ | Detailbeschreibung |
| duration | number | ❌ | Geplante Dauer in Minuten |
| manpower | number | ✅ | Benötigte Mannstärke (default 1) |
| assignees | string[] | ❌ | Zugewiesene Personen |
| isCompleted | boolean | ✅ | Erledigt ja/nein |
| order | number | ✅ | Sortierreihenfolge |
| createdAt | Date | ✅ | Erstellt am |
| updatedAt | Date | ✅ | Zuletzt geändert |
| syncedAt | Date | ❌ | Letzter Supabase-Sync |

### CreateTaskInput
Felder für neue Tasks. `order` fehlt — wird vom Store automatisch vergeben.

### UpdateTaskInput
Alle Felder optional (Partial-Update-Pattern).

## Patterns & Konzepte
- **Drei-Interface-Pattern:** Task / CreateTaskInput / UpdateTaskInput (wie Project)
- **Status als Boolean:** `isCompleted` statt Union Type — einfacher als bei Project
- **manpower/assignees Dualität:** Kommentar sagt `manpower = assignees.length` wenn assignees gesetzt — Business-Regel lebt nicht im Typ, muss im Store erzwungen werden

## Abhängigkeiten
- Keine Imports — reines Type-File
- Wird referenziert von: Task Store, ProjectDetailPage, Sync Service

## Hinweise
- Kein `TaskStatus` Union Type — bei Einführung von Bauabschnitten (Feedback #1) müsste das erweitert werden (z.B. `blocked | ready | in-progress | done`)
- Keine Konstanten/Labels (anders als Project types)