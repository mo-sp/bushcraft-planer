import { ref } from 'vue'
import { useOnline } from '@vueuse/core'
import { getSupabase, isSupabaseConfigured } from '@shared/api/supabase'
import { db } from '@shared/api/db'
import type { Project } from '@entities/project/model/types'
import { getRandomPlaceholderColor } from '@entities/project/model/types'
import type { Task } from '@entities/task/model/types'
import type { Material, MaterialRequirement } from '@entities/material/model/types'
import type { Equipment, EquipmentRequirement } from '@entities/equipment/model/types'
import type { StorageLocation } from '@entities/storage-location/model/types'

export interface SyncResult {
  pushed: number
  pulled: number
  deleted: number
  errors: string[]
}

// Extract the original record ID from syncMeta composite ID
// Format: `${tableName}-${recordId}-${timestamp}`
function extractRecordId(metaId: string, tableName: string): string {
  const withoutPrefix = metaId.substring(tableName.length + 1)
  const lastDash = withoutPrefix.lastIndexOf('-')
  return withoutPrefix.substring(0, lastDash)
}

function toISO(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
}

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d)
}

// --- Field mapping: Local <-> Supabase ---

function projectToRemote(p: Project) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    custom_category_name: p.customCategoryName || null,
    storage_location_id: p.storageLocationId || null,
    participants: p.participants && p.participants.length > 0 ? p.participants : null,
    responsible: p.responsible || null,
    status: p.status,
    notes: p.notes || null,
    image_url: p.imageUrl || null,
    sketch_url: p.sketchUrl || null,
    created_at: toISO(p.createdAt),
    updated_at: toISO(p.updatedAt),
  }
}

function projectFromRemote(r: Record<string, any>): Project {
  return {
    id: r.id,
    name: r.name,
    description: r.description || '',
    category: r.category,
    customCategoryName: r.custom_category_name || undefined,
    storageLocationId: r.storage_location_id || undefined,
    participants: r.participants || [],
    responsible: r.responsible || undefined,
    status: r.status || 'planned',
    notes: r.notes || '',
    imageUrl: r.image_url || undefined,
    sketchUrl: r.sketch_url || undefined,
    imagePlaceholder: getRandomPlaceholderColor(),
    createdBy: 'sync',
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
  }
}

function taskToRemote(t: Task) {
  return {
    id: t.id,
    project_id: t.projectId,
    title: t.title,
    description: t.description || null,
    duration: t.duration ?? null,
    manpower: t.manpower,
    assignees: t.assignees && t.assignees.length > 0 ? t.assignees : null,
    is_completed: t.isCompleted,
    order: t.order,
    created_at: toISO(t.createdAt),
    updated_at: toISO(t.updatedAt),
  }
}

function taskFromRemote(r: Record<string, any>): Task {
  return {
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    description: r.description || undefined,
    duration: r.duration ?? undefined,
    manpower: r.manpower ?? 1,
    assignees: r.assignees || undefined,
    isCompleted: r.is_completed ?? false,
    order: r.order ?? 0,
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
  }
}

function storageLocationToRemote(l: StorageLocation) {
  return {
    id: l.id,
    name: l.name,
    description: l.description || null,
    icon: l.icon || null,
    created_at: toISO(l.createdAt),
    updated_at: toISO(l.updatedAt),
  }
}

function storageLocationFromRemote(r: Record<string, any>): StorageLocation {
  return {
    id: r.id,
    name: r.name,
    description: r.description || undefined,
    icon: r.icon || undefined,
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
  }
}

function materialToRemote(m: Material) {
  return {
    id: m.id,
    name: m.name,
    specifications: m.specifications || null,
    unit: m.unit || null,
    current_stock: m.currentStock,
    icon: m.icon || null,
    owner: m.owner || null,
    storage_location_id: m.storageLocationId || null,
    created_at: toISO(m.createdAt),
    updated_at: toISO(m.updatedAt),
  }
}

function materialFromRemote(r: Record<string, any>): Material {
  return {
    id: r.id,
    name: r.name,
    specifications: r.specifications || undefined,
    unit: r.unit || undefined,
    currentStock: r.current_stock ?? 0,
    icon: r.icon || undefined,
    owner: r.owner || undefined,
    storageLocationId: r.storage_location_id || undefined,
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
  }
}

function materialReqToRemote(mr: MaterialRequirement) {
  return {
    id: mr.id,
    material_id: mr.materialId,
    project_id: mr.projectId,
    required_amount: mr.requiredAmount,
    created_at: toISO(mr.createdAt),
    updated_at: toISO(mr.updatedAt),
  }
}

function materialReqFromRemote(r: Record<string, any>): MaterialRequirement {
  return {
    id: r.id,
    materialId: r.material_id,
    projectId: r.project_id,
    requiredAmount: r.required_amount ?? 0,
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
  }
}

function equipmentToRemote(e: Equipment) {
  return {
    id: e.id,
    name: e.name,
    specifications: e.specifications || null,
    current_stock: e.currentStock,
    owner: e.owner || null,
    storage_location_id: e.storageLocationId || null,
    created_at: toISO(e.createdAt),
    updated_at: toISO(e.updatedAt),
  }
}

function equipmentFromRemote(r: Record<string, any>): Equipment {
  return {
    id: r.id,
    name: r.name,
    specifications: r.specifications || undefined,
    currentStock: r.current_stock ?? 0,
    owner: r.owner || undefined,
    storageLocationId: r.storage_location_id || undefined,
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
  }
}

function equipmentReqToRemote(er: EquipmentRequirement) {
  return {
    id: er.id,
    equipment_id: er.equipmentId,
    project_id: er.projectId,
    required_amount: er.requiredAmount,
    created_at: toISO(er.createdAt),
    updated_at: toISO(er.updatedAt),
  }
}

function equipmentReqFromRemote(r: Record<string, any>): EquipmentRequirement {
  return {
    id: r.id,
    equipmentId: r.equipment_id,
    projectId: r.project_id,
    requiredAmount: r.required_amount ?? 0,
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
  }
}

// --- Generic table sync ---

interface TableSyncConfig<T> {
  localTableName: string       // Dexie table name (for syncMeta)
  remoteTableName: string      // Supabase table name
  toRemote: (local: T) => Record<string, any>
  fromRemote: (remote: Record<string, any>) => T
}

// Sync order: base tables first, then dependent tables
const TABLE_CONFIGS: TableSyncConfig<any>[] = [
  { localTableName: 'storageLocations', remoteTableName: 'storage_locations', toRemote: storageLocationToRemote, fromRemote: storageLocationFromRemote },
  { localTableName: 'materials', remoteTableName: 'materials', toRemote: materialToRemote, fromRemote: materialFromRemote },
  { localTableName: 'equipment', remoteTableName: 'equipment', toRemote: equipmentToRemote, fromRemote: equipmentFromRemote },
  { localTableName: 'projects', remoteTableName: 'projects', toRemote: projectToRemote, fromRemote: projectFromRemote },
  { localTableName: 'tasks', remoteTableName: 'tasks', toRemote: taskToRemote, fromRemote: taskFromRemote },
  { localTableName: 'materialRequirements', remoteTableName: 'material_requirements', toRemote: materialReqToRemote, fromRemote: materialReqFromRemote },
  { localTableName: 'equipmentRequirements', remoteTableName: 'equipment_requirements', toRemote: equipmentReqToRemote, fromRemote: equipmentReqFromRemote },
]

async function syncTable<T extends { id: string; updatedAt: Date }>(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  config: TableSyncConfig<T>,
  result: SyncResult
): Promise<void> {
  const localTable = (db as any)[config.localTableName]

  // 1. Handle local deletes → push to remote
  const deleteMeta = await db.syncMeta
    .where('table').equals(config.localTableName)
    .filter(m => m.action === 'delete' && !m.synced)
    .toArray()

  for (const meta of deleteMeta) {
    try {
      const recordId = extractRecordId(meta.id, config.localTableName)
      await supabase.from(config.remoteTableName).delete().eq('id', recordId)
      await db.syncMeta.update(meta.id, { synced: true })
      result.deleted++
    } catch (err) {
      result.errors.push(`Delete ${config.remoteTableName}: ${err}`)
    }
  }

  // 2. Fetch all remote records
  const { data: remoteRecords, error: fetchError } = await supabase
    .from(config.remoteTableName)
    .select('*')

  if (fetchError) {
    result.errors.push(`Fetch ${config.remoteTableName}: ${fetchError.message}`)
    return
  }

  // 3. Fetch all local records
  const localRecords: T[] = await localTable.toArray()

  // 4. Build maps
  const remoteMap = new Map((remoteRecords || []).map((r: any) => [r.id, r]))
  const localMap = new Map(localRecords.map(l => [l.id, l]))

  // Collect IDs that were deleted locally (to avoid re-importing them)
  const locallyDeletedIds = new Set<string>()
  const allDeleteMeta = await db.syncMeta
    .where('table').equals(config.localTableName)
    .filter(m => m.action === 'delete')
    .toArray()
  for (const meta of allDeleteMeta) {
    locallyDeletedIds.add(extractRecordId(meta.id, config.localTableName))
  }

  const toUpsertRemote: Record<string, any>[] = []
  const toUpsertLocal: T[] = []

  // 5. Process local records
  for (const local of localRecords) {
    const remote = remoteMap.get(local.id)
    if (!remote) {
      // Local only → push to remote
      toUpsertRemote.push(config.toRemote(local))
    } else {
      const remoteUpdated = new Date(remote.updated_at).getTime()
      const localUpdated = toDate(local.updatedAt).getTime()
      if (localUpdated > remoteUpdated) {
        // Local is newer → push
        toUpsertRemote.push(config.toRemote(local))
      } else if (remoteUpdated > localUpdated) {
        // Remote is newer → pull
        const merged = config.fromRemote(remote)
        // Preserve local-only fields for projects
        if (config.localTableName === 'projects') {
          const localProject = local as any
          ;(merged as any).imagePlaceholder = localProject.imagePlaceholder
          ;(merged as any).createdBy = localProject.createdBy || 'sync'
        }
        toUpsertLocal.push(merged)
      }
      // If equal, skip
    }
  }

  // 6. Process remote-only records (new from other users)
  for (const [id, remote] of remoteMap) {
    if (!localMap.has(id) && !locallyDeletedIds.has(id)) {
      toUpsertLocal.push(config.fromRemote(remote))
    }
  }

  // 7. Execute remote upserts (in batches of 50)
  for (let i = 0; i < toUpsertRemote.length; i += 50) {
    const batch = toUpsertRemote.slice(i, i + 50)
    const { error } = await supabase.from(config.remoteTableName).upsert(batch)
    if (error) {
      if (error.code === '23503') {
        // FK constraint violation - push records one by one, skip orphans
        for (const record of batch) {
          const { error: singleErr } = await supabase.from(config.remoteTableName).upsert(record)
          if (singleErr) {
            // Orphaned record - remove locally
            await localTable.delete(record.id)
          } else {
            result.pushed++
          }
        }
      } else {
        result.errors.push(`Upsert ${config.remoteTableName}: ${error.message}`)
      }
    } else {
      result.pushed += batch.length
    }
  }

  // 8. Execute local upserts
  if (toUpsertLocal.length > 0) {
    await localTable.bulkPut(toUpsertLocal)
    result.pulled += toUpsertLocal.length
  }

  // 9. Mark create/update syncMeta as synced
  const pendingMeta = await db.syncMeta
    .where('table').equals(config.localTableName)
    .filter(m => !m.synced && m.action !== 'delete')
    .toArray()
  if (pendingMeta.length > 0) {
    await db.syncMeta.bulkUpdate(
      pendingMeta.map(m => ({ key: m.id, changes: { synced: true } }))
    )
  }
}

// --- Composable ---

// Shared state across all useSync() instances
const sharedSyncing = ref(false)
const sharedLastSyncedAt = ref<Date | null>(
  localStorage.getItem('lastSyncedAt')
    ? new Date(localStorage.getItem('lastSyncedAt')!)
    : null
)
const sharedSyncError = ref<string | null>(null)
const sharedLastResult = ref<SyncResult | null>(null)

export function useSync() {
  const isOnline = useOnline()
  const isSyncing = sharedSyncing
  const lastSyncedAt = sharedLastSyncedAt
  const syncError = sharedSyncError
  const lastResult = sharedLastResult

  async function fullSync(): Promise<SyncResult> {
    const result: SyncResult = { pushed: 0, pulled: 0, deleted: 0, errors: [] }

    if (!isSupabaseConfigured() || !isOnline.value) {
      result.errors.push('Offline oder Supabase nicht konfiguriert')
      return result
    }

    const supabase = getSupabase()
    if (!supabase) {
      result.errors.push('Supabase-Client nicht verfügbar')
      return result
    }

    isSyncing.value = true
    syncError.value = null

    try {
      for (const config of TABLE_CONFIGS) {
        await syncTable(supabase, config, result)
      }

      // Persist custom categories from synced projects into localStorage
      if (result.pulled > 0) {
        const projects = await db.projects.toArray()
        const stored = localStorage.getItem('customCategories')
        const customs: Record<string, string> = stored ? JSON.parse(stored) : {}
        let changed = false
        for (const p of projects) {
          if (p.customCategoryName && p.category && !customs[p.category]) {
            customs[p.category] = p.customCategoryName
            changed = true
          }
        }
        if (changed) {
          localStorage.setItem('customCategories', JSON.stringify(customs))
          // Trigger store reload so allCategories picks up new custom categories
          const { useProjectStore } = await import('@entities/project/model/store')
          const projectStore = useProjectStore()
          await projectStore.loadProjects()
        }
      }

      lastSyncedAt.value = new Date()
      localStorage.setItem('lastSyncedAt', lastSyncedAt.value.toISOString())
      lastResult.value = result

      if (result.errors.length > 0) {
        syncError.value = `${result.errors.length} Fehler beim Sync`
      }
    } catch (err) {
      syncError.value = 'Synchronisation fehlgeschlagen'
      result.errors.push(String(err))
      console.error('Sync failed:', err)
    } finally {
      isSyncing.value = false
    }

    return result
  }

  return {
    isSyncing,
    lastSyncedAt,
    syncError,
    lastResult,
    fullSync,
  }
}
