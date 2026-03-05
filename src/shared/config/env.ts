// Environment configuration
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string || ''
  },
  app: {
    name: 'Bushcraft Planer',
    version: import.meta.env.VITE_APP_VERSION as string || '1.0.0'
  },
  sync: {
    // How often to attempt sync (ms)
    interval: 30000,
    // Max retries for failed sync
    maxRetries: 3
  }
} as const

export function isProduction(): boolean {
  return import.meta.env.PROD
}

export function isDevelopment(): boolean {
  return import.meta.env.DEV
}
