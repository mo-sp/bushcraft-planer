# supabase.ts — Supabase Client & Auth

**Datei:** `src/shared/api/supabase.ts`
**Zweck:** Supabase-Client Singleton (Lazy), Auth-Funktionen (Shared Account), Connection Check

---

## Client

| Export | Typ | Beschreibung |
|--------|-----|-------------|
| `getSupabase()` | `SupabaseClient \| null` | Lazy Singleton — erstellt Client beim ersten Aufruf, `null` wenn Env-Vars fehlen |
| `isSupabaseConfigured()` | `boolean` | Prüft ob URL + Key gesetzt sind |

- **Env-Variablen:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (aus `.env`, `VITE_`-Prefix = im Bundle sichtbar)
- **Auth-Optionen:** `persistSession: true` (Token in localStorage), `autoRefreshToken: true` (automatische Verlängerung)

## Auth

| Funktion | Rückgabe | Beschreibung |
|----------|----------|-------------|
| `signIn(password)` | `{ success, error? }` | Login mit Shared Account (`nature@boyz.app` hardcoded) |
| `getSession()` | `Session \| null` | Aktuelle Auth-Session (fehlender expliziter Rückgabetyp → B-021) |
| `signOut()` | `void` | Logout, löscht Session aus localStorage (fehlender Rückgabetyp → B-021) |

## Connection Check

| Funktion | Beschreibung |
|----------|-------------|
| `checkConnection()` | `select('id').limit(1)` auf `projects` — RLS-blind: gibt `true` auch ohne Login → B-020 |

## Patterns
- **Lazy Singleton** (vs. Eager in `db.ts`): Client kann ohne Env-Vars nicht erstellt werden
- **Result-Objekt** bei `signIn`: `{ success: boolean; error?: string }` statt Exception
- **Nested Destructuring**: `{ data: { session } }` bei `getSession()`

## Abhängigkeiten
- `@supabase/supabase-js`

## Backlog
- B-020: `checkConnection` RLS-blind
- B-021: Fehlende Rückgabetypen bei `getSession`/`signOut`