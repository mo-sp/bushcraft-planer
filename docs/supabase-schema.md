# supabase-schema.sql — Supabase Datenbankschema

**Datei:** `supabase-schema.sql` (Projektroot)
**Zweck:** DDL-Referenz für das Supabase PostgreSQL-Schema. Wird nicht automatisch ausgeführt — dient als Doku und für Neu-Setup.

---

## Tabellen (7)

| Tabelle | Beschreibung | FK-Abhängigkeiten |
|---------|-------------|-------------------|
| `storage_locations` | Lagerorte | keine (Basis) |
| `projects` | Projekte | → storage_locations (SET NULL) |
| `materials` | Material-Inventar | → storage_locations (SET NULL) |
| `equipment` | Ausrüstung | → storage_locations (SET NULL) |
| `tasks` | Aufgaben pro Projekt | → projects (CASCADE) |
| `material_requirements` | Material-Bedarf pro Projekt | → materials (CASCADE), → projects (CASCADE) |
| `equipment_requirements` | Ausrüstungs-Bedarf pro Projekt | → equipment (CASCADE), → projects (CASCADE) |

## FK-Löschregeln

| Regel | Bedeutung | Wo genutzt |
|-------|-----------|------------|
| `CASCADE` | Abhängige Einträge werden mitgelöscht | Tasks, Requirements |
| `SET NULL` | FK-Feld wird auf NULL gesetzt | storage_location_id in Projects/Materials/Equipment |

## Security

- **RLS:** ENABLE auf allen 7 Tabellen
- **Policy:** `authenticated_access` — `FOR ALL TO authenticated USING (true) WITH CHECK (true)`
- **Auth:** Supabase Auth mit Shared Account (Email+Passwort), kein individueller Login

## Indexe

- FK-Spalten indexiert für JOIN-Performance (project_id, material_id, equipment_id)
- storage_location_id indexiert auf materials + equipment

## Bekannte Issues
- B-027: Default `'planning'` auf projects.status, App erwartet `'planned'`

## Hinweise
- Datei manuell aktuell halten nach Schema-Änderungen
- Anlegereihenfolge beachten: Basis-Tabellen zuerst (storage_locations), dann abhängige
- Stand: 2026-04-09 (aus laufender DB exportiert)