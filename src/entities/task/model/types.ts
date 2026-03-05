export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  duration?: number        // Geplante Dauer in Minuten
  manpower: number         // Benötigte Mannstärke (default 1)
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
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  duration?: number
  manpower?: number
  isCompleted?: boolean
  order?: number
}
