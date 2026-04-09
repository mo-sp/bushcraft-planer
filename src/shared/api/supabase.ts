import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  }

  return supabaseClient
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export async function checkConnection(): Promise<boolean> {
  const client = getSupabase()
  if (!client) return false

  try {
    const { error } = await client.from('projects').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

const SHARED_EMAIL = 'nature@boyz.app'

export async function signIn(password: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase()
  if (!client) return { success: false, error: 'Supabase nicht konfiguriert' }

  const { error } = await client.auth.signInWithPassword({
    email: SHARED_EMAIL,
    password
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getSession() {
  const client = getSupabase()
  if (!client) return null

  const { data: { session } } = await client.auth.getSession()
  return session
}

export async function signOut() {
  const client = getSupabase()
  if (!client) return

  await client.auth.signOut()
}