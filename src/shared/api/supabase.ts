import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Environment variables (will be set in .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase client singleton
let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured. Running in offline-only mode.')
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }

  return supabaseClient
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// Check if we're online and Supabase is reachable
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

// Database types for Supabase (will match Postgres schema)
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          image_url: string | null
          image_placeholder: string
          status: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          is_completed: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      materials: {
        Row: {
          id: string
          name: string
          unit: string
          current_stock: number
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['materials']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['materials']['Insert']>
      }
      material_requirements: {
        Row: {
          id: string
          material_id: string
          project_id: string
          required_amount: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['material_requirements']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['material_requirements']['Insert']>
      }
    }
  }
}
