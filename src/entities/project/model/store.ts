import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, generateId, trackChange } from '@shared/api/db'
import type {
  Project,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput
} from './types'
import { getRandomPlaceholderColor, PROJECT_CATEGORY_LABELS } from './types'

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const customCategories = ref<Record<string, string>>({}) // id -> name
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const allCategories = computed(() => {
    return { ...PROJECT_CATEGORY_LABELS, ...customCategories.value }
  })

  const projectsByStatus = computed(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      planned: [],
      in_progress: [],
      completed: []
    }
    projects.value.forEach(p => {
      grouped[p.status].push(p)
    })
    return grouped
  })

  const projectById = computed(() => {
    return (id: string) => projects.value.find(p => p.id === id)
  })

  // Actions
  async function loadProjects(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      projects.value = await db.projects.orderBy('updatedAt').reverse().toArray()

      // Load custom categories from localStorage
      const stored = localStorage.getItem('customCategories')
      if (stored) {
        customCategories.value = JSON.parse(stored)
      }
    } catch (e) {
      error.value = 'Fehler beim Laden der Projekte'
      console.error('Failed to load projects:', e)
    } finally {
      loading.value = false
    }
  }

  function addCustomCategory(name: string): string {
    const id = `custom_${Date.now()}`
    customCategories.value[id] = name
    localStorage.setItem('customCategories', JSON.stringify(customCategories.value))
    return id
  }

  function getCategoryName(category: string, customName?: string): string {
    if (customName) return customName
    return allCategories.value[category] || category
  }

  async function createProject(input: CreateProjectInput): Promise<Project | null> {
    const now = new Date()
    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description,
      category: input.category,
      customCategoryName: input.customCategoryName,
      imageUrl: input.imageUrl,
      imagePlaceholder: getRandomPlaceholderColor(),
      status: 'planned',
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
      createdBy: 'local'
    }

    try {
      await db.projects.add(project)
      await trackChange('projects', project.id, 'create')
      projects.value.unshift(project)
      return project
    } catch (e) {
      error.value = 'Fehler beim Erstellen des Projekts'
      console.error('Failed to create project:', e)
      return null
    }
  }

  async function updateProject(id: string, input: UpdateProjectInput): Promise<boolean> {
    const project = projects.value.find(p => p.id === id)
    if (!project) return false

    const updates = {
      ...input,
      updatedAt: new Date()
    }

    try {
      await db.projects.update(id, updates)
      await trackChange('projects', id, 'update')

      // Update local state
      Object.assign(project, updates)
      return true
    } catch (e) {
      error.value = 'Fehler beim Aktualisieren des Projekts'
      console.error('Failed to update project:', e)
      return false
    }
  }

  async function deleteProject(id: string): Promise<boolean> {
    try {
      await db.projects.delete(id)
      await trackChange('projects', id, 'delete')

      // Also delete related tasks and material requirements
      await db.tasks.where('projectId').equals(id).delete()
      await db.materialRequirements.where('projectId').equals(id).delete()

      // Update local state
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value.splice(index, 1)
      }
      return true
    } catch (e) {
      error.value = 'Fehler beim Löschen des Projekts'
      console.error('Failed to delete project:', e)
      return false
    }
  }

  async function setProjectStatus(id: string, status: ProjectStatus): Promise<boolean> {
    return updateProject(id, { status })
  }

  return {
    // State
    projects,
    customCategories,
    loading,
    error,
    // Getters
    allCategories,
    projectsByStatus,
    projectById,
    // Actions
    loadProjects,
    addCustomCategory,
    getCategoryName,
    createProject,
    updateProject,
    deleteProject,
    setProjectStatus
  }
})
