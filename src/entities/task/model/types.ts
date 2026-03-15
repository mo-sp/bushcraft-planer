export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  duration?: number        // Geplante Dauer in Minuten
  manpower: number         // Benötigte Mannstärke (default 1)
  assignees?: string[]     // Assigned persons (when set, manpower = assignees.length)
  isCompleted: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
}

export interface CreateTaskInput {
  projectId: string
  title: string
  description?: string
  duration?: number
  manpower?: number
  assignees?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  duration?: number
  manpower?: number
  assignees?: string[]
  isCompleted?: boolean
  order?: number
}
