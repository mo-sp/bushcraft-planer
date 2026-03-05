export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
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
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  isCompleted?: boolean
  order?: number
}
