import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, generateId, trackChange } from '@shared/api/db'
import type {
  Material,
  MaterialRequirement,
  CreateMaterialInput,
  UpdateMaterialInput,
  CreateMaterialRequirementInput,
  UpdateMaterialRequirementInput
} from './types'

export const useMaterialStore = defineStore('materials', () => {
  // State
  const materials = ref<Material[]>([])
  const requirements = ref<MaterialRequirement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const materialById = computed(() => {
    return (id: string) => materials.value.find(m => m.id === id)
  })

  const requirementsByProject = computed(() => {
    return (projectId: string) =>
      requirements.value.filter(r => r.projectId === projectId)
  })

  const requirementsByMaterial = computed(() => {
    return (materialId: string) =>
      requirements.value.filter(r => r.materialId === materialId)
  })

  const materialWithStock = computed(() => {
    return materials.value.map(material => {
      const totalRequired = requirements.value
        .filter(r => r.materialId === material.id)
        .reduce((sum, r) => sum + r.requiredAmount, 0)

      return {
        ...material,
        totalRequired,
        available: material.currentStock - totalRequired,
        isLow: material.currentStock < totalRequired
      }
    })
  })

  const lowStockMaterials = computed(() => {
    return materialWithStock.value.filter(m => m.isLow)
  })

  // Actions
  async function loadMaterials(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      materials.value = await db.materials.orderBy('name').toArray()
      requirements.value = await db.materialRequirements.toArray()
    } catch (e) {
      error.value = 'Fehler beim Laden der Materialien'
      console.error('Failed to load materials:', e)
    } finally {
      loading.value = false
    }
  }

  async function createMaterial(input: CreateMaterialInput): Promise<Material | null> {
    const now = new Date()
    const material: Material = {
      id: generateId(),
      name: input.name,
      unit: input.unit,
      currentStock: input.currentStock ?? 0,
      icon: input.icon,
      createdAt: now,
      updatedAt: now
    }

    try {
      await db.materials.add(material)
      await trackChange('materials', material.id, 'create')
      materials.value.push(material)
      materials.value.sort((a, b) => a.name.localeCompare(b.name))
      return material
    } catch (e) {
      error.value = 'Fehler beim Erstellen des Materials'
      console.error('Failed to create material:', e)
      return null
    }
  }

  async function updateMaterial(id: string, input: UpdateMaterialInput): Promise<boolean> {
    const material = materials.value.find(m => m.id === id)
    if (!material) return false

    const updates = {
      ...input,
      updatedAt: new Date()
    }

    try {
      await db.materials.update(id, updates)
      await trackChange('materials', id, 'update')
      Object.assign(material, updates)
      return true
    } catch (e) {
      error.value = 'Fehler beim Aktualisieren des Materials'
      console.error('Failed to update material:', e)
      return false
    }
  }

  async function adjustStock(id: string, delta: number): Promise<boolean> {
    const material = materials.value.find(m => m.id === id)
    if (!material) return false

    const newStock = Math.max(0, material.currentStock + delta)
    return updateMaterial(id, { currentStock: newStock })
  }

  async function deleteMaterial(id: string): Promise<boolean> {
    try {
      await db.materials.delete(id)
      await trackChange('materials', id, 'delete')

      // Also delete related requirements
      await db.materialRequirements.where('materialId').equals(id).delete()

      // Update local state
      const index = materials.value.findIndex(m => m.id === id)
      if (index !== -1) {
        materials.value.splice(index, 1)
      }
      requirements.value = requirements.value.filter(r => r.materialId !== id)
      return true
    } catch (e) {
      error.value = 'Fehler beim Löschen des Materials'
      console.error('Failed to delete material:', e)
      return false
    }
  }

  // Material Requirements
  async function createRequirement(
    input: CreateMaterialRequirementInput
  ): Promise<MaterialRequirement | null> {
    const now = new Date()
    const requirement: MaterialRequirement = {
      id: generateId(),
      materialId: input.materialId,
      projectId: input.projectId,
      requiredAmount: input.requiredAmount,
      createdAt: now,
      updatedAt: now
    }

    try {
      await db.materialRequirements.add(requirement)
      await trackChange('materialRequirements', requirement.id, 'create')
      requirements.value.push(requirement)
      return requirement
    } catch (e) {
      error.value = 'Fehler beim Erstellen der Materialanforderung'
      console.error('Failed to create requirement:', e)
      return null
    }
  }

  async function updateRequirement(
    id: string,
    input: UpdateMaterialRequirementInput
  ): Promise<boolean> {
    const requirement = requirements.value.find(r => r.id === id)
    if (!requirement) return false

    const updates = {
      ...input,
      updatedAt: new Date()
    }

    try {
      await db.materialRequirements.update(id, updates)
      await trackChange('materialRequirements', id, 'update')
      Object.assign(requirement, updates)
      return true
    } catch (e) {
      error.value = 'Fehler beim Aktualisieren der Materialanforderung'
      console.error('Failed to update requirement:', e)
      return false
    }
  }

  async function deleteRequirement(id: string): Promise<boolean> {
    try {
      await db.materialRequirements.delete(id)
      await trackChange('materialRequirements', id, 'delete')

      const index = requirements.value.findIndex(r => r.id === id)
      if (index !== -1) {
        requirements.value.splice(index, 1)
      }
      return true
    } catch (e) {
      error.value = 'Fehler beim Löschen der Materialanforderung'
      console.error('Failed to delete requirement:', e)
      return false
    }
  }

  return {
    // State
    materials,
    requirements,
    loading,
    error,
    // Getters
    materialById,
    requirementsByProject,
    requirementsByMaterial,
    materialWithStock,
    lowStockMaterials,
    // Actions
    loadMaterials,
    createMaterial,
    updateMaterial,
    adjustStock,
    deleteMaterial,
    createRequirement,
    updateRequirement,
    deleteRequirement
  }
})
