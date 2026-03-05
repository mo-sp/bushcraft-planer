import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, generateId, trackChange } from '@shared/api/db'
import type {
  Equipment,
  EquipmentRequirement,
  CreateEquipmentInput,
  UpdateEquipmentInput,
  CreateEquipmentRequirementInput,
  UpdateEquipmentRequirementInput
} from './types'

export const useEquipmentStore = defineStore('equipment', () => {
  // State
  const equipment = ref<Equipment[]>([])
  const requirements = ref<EquipmentRequirement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const equipmentById = computed(() => {
    return (id: string) => equipment.value.find(e => e.id === id)
  })

  const requirementsByProject = computed(() => {
    return (projectId: string) =>
      requirements.value.filter(r => r.projectId === projectId)
  })

  const requirementsByEquipment = computed(() => {
    return (equipmentId: string) =>
      requirements.value.filter(r => r.equipmentId === equipmentId)
  })

  const equipmentWithStock = computed(() => {
    return equipment.value.map(item => {
      const totalRequired = requirements.value
        .filter(r => r.equipmentId === item.id)
        .reduce((sum, r) => sum + r.requiredAmount, 0)

      return {
        ...item,
        totalRequired,
        available: item.currentStock - totalRequired,
        isLow: item.currentStock < totalRequired
      }
    })
  })

  const lowStockEquipment = computed(() => {
    return equipmentWithStock.value.filter(e => e.isLow)
  })

  // Actions
  async function loadEquipment(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      equipment.value = await db.equipment.orderBy('name').toArray()
      requirements.value = await db.equipmentRequirements.toArray()
    } catch (e) {
      error.value = 'Fehler beim Laden der Ausrüstung'
      console.error('Failed to load equipment:', e)
    } finally {
      loading.value = false
    }
  }

  async function createEquipment(input: CreateEquipmentInput): Promise<Equipment | null> {
    const now = new Date()
    const item: Equipment = {
      id: generateId(),
      name: input.name,
      specifications: input.specifications,
      currentStock: input.currentStock ?? 0,
      createdAt: now,
      updatedAt: now
    }

    try {
      await db.equipment.add(item)
      await trackChange('equipment', item.id, 'create')
      equipment.value.push(item)
      equipment.value.sort((a, b) => a.name.localeCompare(b.name))
      return item
    } catch (e) {
      error.value = 'Fehler beim Erstellen der Ausrüstung'
      console.error('Failed to create equipment:', e)
      return null
    }
  }

  async function updateEquipment(id: string, input: UpdateEquipmentInput): Promise<boolean> {
    const item = equipment.value.find(e => e.id === id)
    if (!item) return false

    const updates = {
      ...input,
      updatedAt: new Date()
    }

    try {
      await db.equipment.update(id, updates)
      await trackChange('equipment', id, 'update')
      Object.assign(item, updates)
      return true
    } catch (e) {
      error.value = 'Fehler beim Aktualisieren der Ausrüstung'
      console.error('Failed to update equipment:', e)
      return false
    }
  }

  async function adjustStock(id: string, delta: number): Promise<boolean> {
    const item = equipment.value.find(e => e.id === id)
    if (!item) return false

    const newStock = Math.max(0, item.currentStock + delta)
    return updateEquipment(id, { currentStock: newStock })
  }

  async function deleteEquipment(id: string): Promise<boolean> {
    try {
      await db.equipment.delete(id)
      await trackChange('equipment', id, 'delete')

      // Also delete related requirements
      await db.equipmentRequirements.where('equipmentId').equals(id).delete()

      // Update local state
      const index = equipment.value.findIndex(e => e.id === id)
      if (index !== -1) {
        equipment.value.splice(index, 1)
      }
      requirements.value = requirements.value.filter(r => r.equipmentId !== id)
      return true
    } catch (e) {
      error.value = 'Fehler beim Löschen der Ausrüstung'
      console.error('Failed to delete equipment:', e)
      return false
    }
  }

  // Equipment Requirements
  async function createRequirement(
    input: CreateEquipmentRequirementInput
  ): Promise<EquipmentRequirement | null> {
    const now = new Date()
    const requirement: EquipmentRequirement = {
      id: generateId(),
      equipmentId: input.equipmentId,
      projectId: input.projectId,
      requiredAmount: input.requiredAmount,
      createdAt: now,
      updatedAt: now
    }

    try {
      await db.equipmentRequirements.add(requirement)
      await trackChange('equipmentRequirements', requirement.id, 'create')
      requirements.value.push(requirement)
      return requirement
    } catch (e) {
      error.value = 'Fehler beim Erstellen der Ausrüstungsanforderung'
      console.error('Failed to create requirement:', e)
      return null
    }
  }

  async function updateRequirement(
    id: string,
    input: UpdateEquipmentRequirementInput
  ): Promise<boolean> {
    const requirement = requirements.value.find(r => r.id === id)
    if (!requirement) return false

    const updates = {
      ...input,
      updatedAt: new Date()
    }

    try {
      await db.equipmentRequirements.update(id, updates)
      await trackChange('equipmentRequirements', id, 'update')
      Object.assign(requirement, updates)
      return true
    } catch (e) {
      error.value = 'Fehler beim Aktualisieren der Ausrüstungsanforderung'
      console.error('Failed to update requirement:', e)
      return false
    }
  }

  async function deleteRequirement(id: string): Promise<boolean> {
    try {
      await db.equipmentRequirements.delete(id)
      await trackChange('equipmentRequirements', id, 'delete')

      const index = requirements.value.findIndex(r => r.id === id)
      if (index !== -1) {
        requirements.value.splice(index, 1)
      }
      return true
    } catch (e) {
      error.value = 'Fehler beim Löschen der Ausrüstungsanforderung'
      console.error('Failed to delete requirement:', e)
      return false
    }
  }

  return {
    // State
    equipment,
    requirements,
    loading,
    error,
    // Getters
    equipmentById,
    requirementsByProject,
    requirementsByEquipment,
    equipmentWithStock,
    lowStockEquipment,
    // Actions
    loadEquipment,
    createEquipment,
    updateEquipment,
    adjustStock,
    deleteEquipment,
    createRequirement,
    updateRequirement,
    deleteRequirement
  }
})
