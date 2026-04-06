# tsconfig-Dateien — Kurzdoku

## Zweck
TypeScript-Compiler-Konfiguration. Steuert wie streng der Code geprüft wird und welche Features erlaubt sind.

## Dateien

### tsconfig.json (Root)
- Kompiliert selbst nichts (`"files": []`)
- Verweist auf zwei Unter-Configs via `references`

### tsconfig.app.json (Browser-Code)
- Gilt für: `src/**/*.ts`, `src/**/*.tsx`, `src/**/*.vue`
- Erbt von: `@vue/tsconfig/tsconfig.dom.json` (DOM-APIs verfügbar)
- Path Aliases: `@/` → `src/`, `@entities/` → `src/entities/`, etc.
- Strict Mode aktiv (alle strengen Prüfungen an)
- Kennt Vite-Typen (`import.meta.env`)

### tsconfig.node.json (Build-Tools)
- Gilt nur für: `vite.config.ts`
- Target: ES2023 (modernes Node.js)
- Kein DOM verfügbar
- `noEmit: true` — prüft nur, erzeugt kein JS (Vite macht den Build)

## Wichtige Optionen
| Option | Bedeutung |
|--------|-----------|
| `strict` | Alle strengen Typ-Prüfungen aktiv |
| `paths` | Import-Abkürzungen (@entities, @shared, etc.) |
| `noUnusedLocals` | Unbenutzte Variablen = Fehler |
| `erasableSyntaxOnly` | Nur TS-Features die beim Kompilieren wegfallen |
| `noEmit` | Nur prüfen, nicht kompilieren (Build macht Vite) |
