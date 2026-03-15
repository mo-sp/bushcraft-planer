import { computed, ref } from 'vue'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { useProjectStore } from '@entities/project/model/store'
import { useTaskStore } from '@entities/task/model/store'

const STORAGE_KEY = 'manualPersons'

// Shared state across all composable instances
const manualPersons = ref<string[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

function saveManualPersons() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manualPersons.value))
}

/**
 * Collects all unique person names across materials, equipment, projects, tasks
 * and manually created persons. Used for autocomplete suggestions in person/owner inputs.
 */
export function useKnownPersons() {
  const materialStore = useMaterialStore()
  const equipmentStore = useEquipmentStore()
  const projectStore = useProjectStore()
  const taskStore = useTaskStore()

  const knownPersons = computed(() => {
    const names = new Set<string>()

    for (const name of manualPersons.value) names.add(name)

    for (const m of materialStore.materials) {
      if (m.owner) names.add(m.owner)
    }
    for (const e of equipmentStore.equipment) {
      if (e.owner) names.add(e.owner)
    }
    for (const p of projectStore.projects) {
      if (p.responsible) names.add(p.responsible)
      if (p.participants) {
        for (const name of p.participants) names.add(name)
      }
    }
    for (const t of taskStore.tasks) {
      if (t.assignees) {
        for (const name of t.assignees) names.add(name)
      }
    }

    return [...names].sort()
  })

  function addPerson(name: string) {
    const trimmed = name.trim()
    if (!trimmed || manualPersons.value.includes(trimmed)) return
    manualPersons.value.push(trimmed)
    saveManualPersons()
  }

  function removeManualPerson(name: string) {
    manualPersons.value = manualPersons.value.filter(n => n !== name)
    saveManualPersons()
  }

  return { knownPersons, addPerson, removeManualPerson }
}
