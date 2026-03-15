export type ProjectCategory = 'construction' | 'exploration' | 'tools' | 'custom' | string

export type ProjectStatus = 'planned' | 'in_progress' | 'completed'

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  customCategoryName?: string
  storageLocationId?: string
  participants?: string[]
  responsible?: string
  imageUrl?: string
  sketchUrl?: string
  imagePlaceholder: string
  status: ProjectStatus
  notes: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  syncedAt?: Date
}

export interface CreateProjectInput {
  name: string
  description: string
  category: ProjectCategory
  customCategoryName?: string
  storageLocationId?: string
  participants?: string[]
  responsible?: string
  notes?: string
  imageUrl?: string
  sketchUrl?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  category?: ProjectCategory
  customCategoryName?: string
  storageLocationId?: string
  participants?: string[]
  responsible?: string
  status?: ProjectStatus
  notes?: string
  imageUrl?: string
  sketchUrl?: string
}

export const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  construction: 'Bauprojekte',
  exploration: 'Erkundung',
  tools: 'Werkzeuge & Ausrüstung',
  custom: 'Neue Kategorie'
}

export const PROJECT_CATEGORY_ICONS: Record<string, string> = {
  construction: 'building',
  exploration: 'compass',
  tools: 'hammer',
  custom: 'plus'
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Geplant',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen'
}

export const PLACEHOLDER_COLORS: string[] = [
  '#2d5016', // forest-700
  '#6e5739', // earth-700
  '#523d33', // bark-700
  '#846654', // bark-500
  '#4d8f35', // forest-500
]

export function getRandomPlaceholderColor(): string {
  const index = Math.floor(Math.random() * PLACEHOLDER_COLORS.length)
  return PLACEHOLDER_COLORS[index] as string
}
