import Dexie, { type EntityTable } from 'dexie'
import type { Project } from '@entities/project/model/types'
import type { Task } from '@entities/task/model/types'
import type { Material, MaterialRequirement } from '@entities/material/model/types'
import type { Equipment, EquipmentRequirement } from '@entities/equipment/model/types'

// Database schema with sync support
export interface SyncMeta {
  id: string
  table: string
  action: 'create' | 'update' | 'delete'
  timestamp: Date
  synced: boolean
}

class BushcraftDatabase extends Dexie {
  projects!: EntityTable<Project, 'id'>
  tasks!: EntityTable<Task, 'id'>
  materials!: EntityTable<Material, 'id'>
  materialRequirements!: EntityTable<MaterialRequirement, 'id'>
  equipment!: EntityTable<Equipment, 'id'>
  equipmentRequirements!: EntityTable<EquipmentRequirement, 'id'>
  syncMeta!: EntityTable<SyncMeta, 'id'>

  constructor() {
    super('BushcraftPlaner')

    this.version(1).stores({
      projects: 'id, name, category, status, createdAt, updatedAt, syncedAt',
      tasks: 'id, projectId, order, isCompleted, createdAt, updatedAt, syncedAt',
      materials: 'id, name, createdAt, updatedAt, syncedAt',
      materialRequirements: 'id, materialId, projectId, createdAt, updatedAt, syncedAt',
      syncMeta: 'id, table, action, timestamp, synced'
    })

    // Version 2: Add equipment tables
    this.version(2).stores({
      projects: 'id, name, category, status, createdAt, updatedAt, syncedAt',
      tasks: 'id, projectId, order, isCompleted, createdAt, updatedAt, syncedAt',
      materials: 'id, name, createdAt, updatedAt, syncedAt',
      materialRequirements: 'id, materialId, projectId, createdAt, updatedAt, syncedAt',
      equipment: 'id, name, createdAt, updatedAt, syncedAt',
      equipmentRequirements: 'id, equipmentId, projectId, createdAt, updatedAt, syncedAt',
      syncMeta: 'id, table, action, timestamp, synced'
    })
  }
}

export const db = new BushcraftDatabase()

// Helper to generate UUIDs (with fallback for non-secure contexts like HTTP on mobile)
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: generate UUID v4 using crypto.getRandomValues
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// Track changes for sync
export async function trackChange(
  table: string,
  id: string,
  action: 'create' | 'update' | 'delete'
): Promise<void> {
  await db.syncMeta.put({
    id: `${table}-${id}-${Date.now()}`,
    table,
    action,
    timestamp: new Date(),
    synced: false
  })
}

// Get unsynced changes
export async function getUnsyncedChanges(): Promise<SyncMeta[]> {
  return db.syncMeta.where('synced').equals(0).toArray()
}

// Mark changes as synced
export async function markAsSynced(ids: string[]): Promise<void> {
  await db.syncMeta.bulkUpdate(
    ids.map(id => ({ key: id, changes: { synced: true } }))
  )
}

// Clear old synced changes (cleanup)
export async function clearOldSyncMeta(olderThanDays = 7): Promise<void> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - olderThanDays)

  await db.syncMeta
    .where('synced')
    .equals(1)
    .filter(meta => meta.timestamp < cutoff)
    .delete()
}
