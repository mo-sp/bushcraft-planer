import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, generateId, trackChange } from '@shared/api/db'
import type {
  StorageLocation,
  CreateStorageLocationInput,
  UpdateStorageLocationInput
} from './types'

export const useStorageLocationStore = defineStore('storageLocations', () => {
  // State
  const locations = ref<StorageLocation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const locationById = computed(() => {
    return (id: string) => locations.value.find(l => l.id === id)
  })

  const locationByName = computed(() => {
    return (name: string) => locations.value.find(l => l.name === name)
  })

  // Actions
  async function loadLocations(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      locations.value = await db.storageLocations.orderBy('name').toArray()
    } catch (e) {
      error.value = 'Fehler beim Laden der Lagerorte'
      console.error('Failed to load storage locations:', e)
    } finally {
      loading.value = false
    }
  }

  async function createLocation(input: CreateStorageLocationInput): Promise<StorageLocation | null> {
    const now = new Date()
    const location: StorageLocation = {
      id: generateId(),
      name: input.name,
      description: input.description,
      icon: input.icon,
      createdAt: now,
      updatedAt: now
    }

    try {
      await db.storageLocations.add(location)
      await trackChange('storageLocations', location.id, 'create')
      locations.value.push(location)
      locations.value.sort((a, b) => a.name.localeCompare(b.name))
      return location
    } catch (e) {
      error.value = 'Fehler beim Erstellen des Lagerorts'
      console.error('Failed to create storage location:', e)
      return null
    }
  }

  async function updateLocation(id: string, input: UpdateStorageLocationInput): Promise<boolean> {
    const location = locations.value.find(l => l.id === id)
    if (!location) return false

    const updates = {
      ...input,
      updatedAt: new Date()
    }

    try {
      await db.storageLocations.update(id, updates)
      await trackChange('storageLocations', id, 'update')
      Object.assign(location, updates)
      return true
    } catch (e) {
      error.value = 'Fehler beim Aktualisieren des Lagerorts'
      console.error('Failed to update storage location:', e)
      return false
    }
  }

  async function deleteLocation(id: string): Promise<boolean> {
    try {
      await db.storageLocations.delete(id)
      await trackChange('storageLocations', id, 'delete')

      const index = locations.value.findIndex(l => l.id === id)
      if (index !== -1) {
        locations.value.splice(index, 1)
      }
      return true
    } catch (e) {
      error.value = 'Fehler beim Löschen des Lagerorts'
      console.error('Failed to delete storage location:', e)
      return false
    }
  }

  return {
    // State
    locations,
    loading,
    error,
    // Getters
    locationById,
    locationByName,
    // Actions
    loadLocations,
    createLocation,
    updateLocation,
    deleteLocation
  }
})
