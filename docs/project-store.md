# Project Store – Kurzdoku

**Datei:** `src/entities/project/model/store.ts`

## Zweck
Pinia Setup Store für CRUD-Operationen auf Projekten. Verwaltet Projekte, Custom Categories und bietet reaktive Getter.

## State
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| projects | ref<Project[]> | Alle Projekte (Cache der Dexie-Daten) |
| customCategories | ref<Record<string, string>> | Custom Kategorien aus localStorage (id → name) |
| loading | ref<boolean> | Lade-Status |
| error | ref<string \| null> | Fehlermeldung oder null |

## Getters (computed)
| Name | Rückgabe | Beschreibung |
|------|----------|-------------|
| allCategories | Record<string, string> | Builtin + Custom (localStorage) + aus Projekten abgeleitet |
| projectsByStatus | Record<ProjectStatus, Project[]> | Projekte gruppiert nach Status |
| projectById | (id) => Project \| undefined | Parametrisierter Getter, O(n) Suche |

## Actions
| Name | Async | Beschreibung |
|------|-------|-------------|
| loadProjects | ✅ | Lädt aus Dexie + Custom Categories aus localStorage |
| addCustomCategory | ❌ | Speichert in localStorage, gibt custom_ID zurück |
| getCategoryName | ❌ | Dreifacher Fallback: customName → allCategories → localStorage (B-013) |
| createProject | ✅ | Baut vollständiges Project aus CreateProjectInput, speichert in Dexie |
| updateProject | ✅ | Partial Update via Object.assign, mutiert lokalen State direkt |
| deleteProject | ✅ | Kaskadierende Löschung (Tasks, MatReqs, EqReqs) mit Sync-Tracking |
| setProjectStatus | ✅ | Convenience-Wrapper um updateProject |

## Patterns
- **Dexie → trackChange → lokaler State:** Jede Action schreibt erst in Dexie, trackt für Sync, updatet dann den ref
- **ref als Cache:** UI liest aus ref (schnell, reaktiv), Persistenz liegt in Dexie
- **Object.assign Mutation:** updateProject mutiert bestehendes Objekt statt neues zu erstellen
- **Kaskadierende Löschung:** deleteProject sammelt erst abhängige IDs, löscht dann alles mit einzelnem trackChange pro Eintrag

## Abhängigkeiten
- **Imports:** Pinia, Vue (ref/computed), Dexie (db, generateId, trackChange), Project Types
- **Wird genutzt von:** DashboardPage, ProjectDetailPage, ProjectNewPage, Sync Service
- **Nutzt:** localStorage (Custom Categories — siehe B-004, B-013)

## Bekannte Issues
- B-004: Custom Categories in localStorage statt Dexie/Supabase
- B-013: getCategoryName dreifacher Fallback