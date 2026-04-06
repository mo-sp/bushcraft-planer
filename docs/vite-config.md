# vite.config.ts — Kurzdoku

## Zweck
Build-Tool-Konfiguration. Steuert Dev-Server, Produktion-Build, PWA und Import-Aliases.

## Struktur

### Plugins
| Plugin | Funktion |
|--------|----------|
| `vue()` | Verarbeitet .vue Single-File-Components |
| `VitePWA()` | Service Worker, Manifest, Offline-Caching |

### PWA-Konfiguration
- **registerType: autoUpdate** — Service Worker aktualisiert sich selbst
- **Manifest** — App-Name, Farben, Icons für Installation auf Home-Bildschirm
- **Workbox** — Cacht alle statischen Dateien + Supabase-Anfragen (NetworkFirst, 24h)

### Dev-Server
- `allowedHosts: ['dev-sandbox']` — Erlaubt Zugriff über VM-Hostname

### Resolve Aliases
Gleiche Aliases wie in tsconfig.app.json (müssen an beiden Stellen definiert sein):
- `@/` → `src/`
- `@entities/` → `src/entities/`
- `@shared/` → `src/shared/`
- etc.

## Zusammenspiel
- `npm run dev` → Vite liest diese Datei → startet Dev-Server auf :5173
- `npm run build` → Vite bündelt alles in optimierte Dateien für Produktion
- TypeScript-Prüfung dieser Datei: `tsconfig.node.json`
