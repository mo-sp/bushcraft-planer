import { ref, onMounted, onUnmounted } from 'vue'
import { useOnline } from '@vueuse/core'
import { getSupabase, isSupabaseConfigured } from '@shared/api/supabase'
import { db, getUnsyncedChanges, markAsSynced, clearOldSyncMeta } from '@shared/api/db'
import { config } from '@shared/config/env'

export function useSync() {
  const isOnline = useOnline()
  const isSyncing = ref(false)
  const lastSyncedAt = ref<Date | null>(null)
  const syncError = ref<string | null>(null)

  let syncInterval: ReturnType<typeof setInterval> | null = null

  async function syncToRemote(): Promise<void> {
    if (!isSupabaseConfigured() || !isOnline.value || isSyncing.value) {
      return
    }

    const supabase = getSupabase()
    if (!supabase) return

    isSyncing.value = true
    syncError.value = null

    try {
      const changes = await getUnsyncedChanges()
      const syncedIds: string[] = []

      for (const change of changes) {
        try {
          if (change.table === 'projects') {
            await syncProjectChange(supabase, change)
          } else if (change.table === 'tasks') {
            await syncTaskChange(supabase, change)
          } else if (change.table === 'materials') {
            await syncMaterialChange(supabase, change)
          } else if (change.table === 'materialRequirements') {
            await syncMaterialRequirementChange(supabase, change)
          }
          syncedIds.push(change.id)
        } catch (err) {
          console.error(`Failed to sync ${change.table} ${change.action}:`, err)
        }
      }

      if (syncedIds.length > 0) {
        await markAsSynced(syncedIds)
      }

      lastSyncedAt.value = new Date()

      // Cleanup old sync metadata
      await clearOldSyncMeta()
    } catch (err) {
      syncError.value = 'Synchronisation fehlgeschlagen'
      console.error('Sync failed:', err)
    } finally {
      isSyncing.value = false
    }
  }

  async function syncProjectChange(supabase: ReturnType<typeof getSupabase>, change: { action: string; id: string }): Promise<void> {
    if (!supabase) return
    const idParts = change.id.split('-')
    const projectId = idParts.slice(1, -1).join('-')

    if (change.action === 'delete') {
      await supabase.from('projects').delete().eq('id', projectId)
    } else {
      const project = await db.projects.get(projectId)
      if (project) {
        const { error } = await supabase.from('projects').upsert({
          id: project.id,
          name: project.name,
          description: project.description,
          category: project.category,
          image_url: project.imageUrl,
          image_placeholder: project.imagePlaceholder,
          status: project.status,
          created_by: project.createdBy
        })
        if (error) throw error
      }
    }
  }

  async function syncTaskChange(supabase: ReturnType<typeof getSupabase>, change: { action: string; id: string }): Promise<void> {
    if (!supabase) return
    const idParts = change.id.split('-')
    const taskId = idParts.slice(1, -1).join('-')

    if (change.action === 'delete') {
      await supabase.from('tasks').delete().eq('id', taskId)
    } else {
      const task = await db.tasks.get(taskId)
      if (task) {
        const { error } = await supabase.from('tasks').upsert({
          id: task.id,
          project_id: task.projectId,
          title: task.title,
          description: task.description,
          is_completed: task.isCompleted,
          order: task.order
        })
        if (error) throw error
      }
    }
  }

  async function syncMaterialChange(supabase: ReturnType<typeof getSupabase>, change: { action: string; id: string }): Promise<void> {
    if (!supabase) return
    const idParts = change.id.split('-')
    const materialId = idParts.slice(1, -1).join('-')

    if (change.action === 'delete') {
      await supabase.from('materials').delete().eq('id', materialId)
    } else {
      const material = await db.materials.get(materialId)
      if (material) {
        const { error } = await supabase.from('materials').upsert({
          id: material.id,
          name: material.name,
          unit: material.unit,
          current_stock: material.currentStock,
          icon: material.icon
        })
        if (error) throw error
      }
    }
  }

  async function syncMaterialRequirementChange(supabase: ReturnType<typeof getSupabase>, change: { action: string; id: string }): Promise<void> {
    if (!supabase) return
    const idParts = change.id.split('-')
    const reqId = idParts.slice(1, -1).join('-')

    if (change.action === 'delete') {
      await supabase.from('material_requirements').delete().eq('id', reqId)
    } else {
      const req = await db.materialRequirements.get(reqId)
      if (req) {
        const { error } = await supabase.from('material_requirements').upsert({
          id: req.id,
          material_id: req.materialId,
          project_id: req.projectId,
          required_amount: req.requiredAmount
        })
        if (error) throw error
      }
    }
  }

  function startAutoSync(): void {
    if (syncInterval) return

    // Initial sync
    syncToRemote()

    // Periodic sync
    syncInterval = setInterval(() => {
      syncToRemote()
    }, config.sync.interval)
  }

  function stopAutoSync(): void {
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
  }

  onMounted(() => {
    if (isSupabaseConfigured()) {
      startAutoSync()
    }
  })

  onUnmounted(() => {
    stopAutoSync()
  })

  return {
    isSyncing,
    lastSyncedAt,
    syncError,
    syncToRemote,
    startAutoSync,
    stopAutoSync
  }
}
