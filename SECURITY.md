# Nature Boyz – Security Architecture

## Authentication
- Supabase Auth with shared account (single email + password)
- Password-only login UI (email hardcoded in app code)
- Session persisted in localStorage, auto-refreshed by Supabase client
- Router guard redirects unauthenticated users to /login
- Auto-sync only runs after successful authentication

## Row Level Security (RLS)
- RLS enabled on all 7 tables
- Policy: `FOR ALL TO authenticated USING (true) WITH CHECK (true)`
- Unauthenticated requests (anon role) get zero rows, no error
- No per-user restrictions (shared data model)

## API Keys
- Anon key (publishable) is in the frontend bundle — this is expected
- Service role key is NEVER used in frontend code
- Anon key alone grants no data access (RLS blocks it)

## Environment Variables
- `VITE_SUPABASE_URL` — public, safe in code
- `VITE_SUPABASE_ANON_KEY` — public, safe in code
- No secrets in environment variables or source code

## Rules for Claude Code
- NEVER commit passwords, secrets, or service role keys
- NEVER disable or weaken RLS policies
- NEVER use service role key in frontend code
- New tables MUST have RLS enabled with authenticated-only policy
- Auth session check must remain in router guard and App.vue sync logic