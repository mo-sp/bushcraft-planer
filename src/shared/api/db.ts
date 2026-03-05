import Dexie, { type EntityTable } from 'dexie'
import type { Project } from '@entities/project/model/types'
import type { Task } from '@entities/task/model/types'
import type { Material, MaterialRequirement } from '@entities/material/model/types'

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
  }
}

export const db = new BushcraftDatabase()

// Helper to generate UUIDs
export function generateId(): string {
  return crypto.randomUUID()
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
