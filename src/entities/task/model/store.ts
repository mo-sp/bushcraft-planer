import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, generateId, trackChange } from '@shared/api/db'
import type { Task, CreateTaskInput, UpdateTaskInput } from './types'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const tasksByProject = computed(() => {
    return (projectId: string) =>
      tasks.value
        .filter(t => t.projectId === projectId)
        .sort((a, b) => a.order - b.order)
  })

  const completedTasksCount = computed(() => {
    return (projectId: string) =>
      tasks.value.filter(t => t.projectId === projectId && t.isCompleted).length
  })

  const totalTasksCount = computed(() => {
    return (projectId: string) =>
      tasks.value.filter(t => t.projectId === projectId).length
  })

  const projectProgress = computed(() => {
    return (projectId: string) => {
      const total = totalTasksCount.value(projectId)
      if (total === 0) return 0
      return Math.round((completedTasksCount.value(projectId) / total) * 100)
    }
  })

  // Actions
  async function loadTasks(projectId?: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      if (projectId) {
        const projectTasks = await db.tasks
          .where('projectId')
          .equals(projectId)
          .sortBy('order')
        // Merge with existing tasks from other projects
        tasks.value = [
          ...tasks.value.filter(t => t.projectId !== projectId),
          ...projectTasks
        ]
      } else {
        tasks.value = await db.tasks.orderBy('order').toArray()
      }
    } catch (e) {
      error.value = 'Fehler beim Laden der Aufgaben'
      console.error('Failed to load tasks:', e)
    } finally {
      loading.value = false
    }
  }

  async function createTask(input: CreateTaskInput): Promise<Task | null> {
    const now = new Date()
    const existingTasks = tasks.value.filter(t => t.projectId === input.projectId)
    const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order), -1)

    const task: Task = {
      id: generateId(),
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      isCompleted: false,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now
    }

    try {
      await db.tasks.add(task)
      await trackChange('tasks', task.id, 'create')
      tasks.value.push(task)
      return task
    } catch (e) {
      error.value = 'Fehler beim Erstellen der Aufgabe'
      console.error('Failed to create task:', e)
      return null
    }
  }

  async function updateTask(id: string, input: UpdateTaskInput): Promise<boolean> {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return false

    const updates = {
      ...input,
      updatedAt: new Date()
    }

    try {
      await db.tasks.update(id, updates)
      await trackChange('tasks', id, 'update')
      Object.assign(task, updates)
      return true
    } catch (e) {
      error.value = 'Fehler beim Aktualisieren der Aufgabe'
      console.error('Failed to update task:', e)
      return false
    }
  }

  async function toggleTask(id: string): Promise<boolean> {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return false
    return updateTask(id, { isCompleted: !task.isCompleted })
  }

  async function deleteTask(id: string): Promise<boolean> {
    try {
      await db.tasks.delete(id)
      await trackChange('tasks', id, 'delete')

      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
      return true
    } catch (e) {
      error.value = 'Fehler beim Löschen der Aufgabe'
      console.error('Failed to delete task:', e)
      return false
    }
  }

  async function reorderTasks(_projectId: string, taskIds: string[]): Promise<boolean> {
    try {
      const updates = taskIds.map((id, index) => ({
        key: id,
        changes: { order: index, updatedAt: new Date() }
      }))

      await db.tasks.bulkUpdate(updates)

      // Update local state
      taskIds.forEach((id, index) => {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
          task.order = index
          task.updatedAt = new Date()
        }
      })

      return true
    } catch (e) {
      error.value = 'Fehler beim Sortieren der Aufgaben'
      console.error('Failed to reorder tasks:', e)
      return false
    }
  }

  return {
    // State
    tasks,
    loading,
    error,
    // Getters
    tasksByProject,
    completedTasksCount,
    totalTasksCount,
    projectProgress,
    // Actions
    loadTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    reorderTasks
  }
})
