export interface StorageLocation {
  id: string
  name: string
  description?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
}

export interface CreateStorageLocationInput {
  name: string
  description?: string
  icon?: string
}

export interface UpdateStorageLocationInput {
  name?: string
  description?: string
  icon?: string
}

export const DEFAULT_STORAGE_LOCATIONS: CreateStorageLocationInput[] = [
  { name: 'Hippie-Wald', description: 'Unser Hauptlager im Wald', icon: 'trees' },
  { name: 'Geheimplatz', description: 'Der versteckte Spot', icon: 'map-pin' },
  { name: 'Moorwald-Lager', description: 'Lager am Moorwald', icon: 'cloud-fog' },
]
