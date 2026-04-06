# Task Store – Kurzdoku

**Datei:** `src/entities/task/model/store.ts`

## Zweck
Pinia Setup Store für CRUD auf Tasks. Tasks gehören immer zu einem Projekt (projectId).

## State
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| tasks | ref<Task[]> | Alle geladenen Tasks (Cache) |
| loading | ref<boolean> | Lade-Status |
| error | ref<string \| null> | Fehlermeldung |

## Getters (alle parametrisiert nach projectId)
| Name | Rückgabe | Beschreibung |
|------|----------|-------------|
| tasksByProject | Task[] | Gefiltert + sortiert nach order |
| completedTasksCount | number | Anzahl erledigter Tasks |
| totalTasksCount | number | Anzahl aller Tasks |
| projectProgress | number | Fortschritt in Prozent (0-100) |

## Actions
| Name | Async | Beschreibung |
|------|-------|-------------|
| loadTasks | ✅ | Lädt alle oder pro Projekt, Merge-Logik für Projektwechsel |
| createTask | ✅ | Automatische order (max+1), manpower/assignees Business-Regel |
| updateTask | ✅ | Partial Update via Object.assign |
| toggleTask | ✅ | Convenience: flippt isCompleted |
| deleteTask | ✅ | Einfache Löschung (keine Kaskade nötig) |
| reorderTasks | ✅ | Bulk-Update der order-Felder — aktuell nicht genutzt (kein D&D aktiv) |

## Patterns
- **Smart Merge bei loadTasks:** Nur angefragte Projekt-Tasks werden ersetzt, Rest bleibt
- **manpower/assignees Sync:** createTask setzt manpower = assignees.length wenn assignees vorhanden
- **Automatische Order:** Neue Tasks bekommen max(order) + 1

## Bekannte Issues
- B-014: reorderTasks ohne trackChange — nicht akut, D&D nicht aktiv, wird beim Task-Rework (Feedback #1) mitbehandelt

## Abhängigkeiten
- Imports: Pinia, Vue, Dexie (db, generateId, trackChange), Task Types
- Wird genutzt von: ProjectDetailPage, DashboardPage (Fortschritt), Sync Service