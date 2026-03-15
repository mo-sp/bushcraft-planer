import { computed } from 'vue'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { useProjectStore } from '@entities/project/model/store'

/**
 * Collects all unique person names across materials, equipment and projects.
 * Used for autocomplete suggestions in person/owner inputs.
 */
export function useKnownPersons() {
  const materialStore = useMaterialStore()
  const equipmentStore = useEquipmentStore()
  const projectStore = useProjectStore()

  const knownPersons = computed(() => {
    const names = new Set<string>()

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

    return [...names].sort()
  })

  return { knownPersons }
}
