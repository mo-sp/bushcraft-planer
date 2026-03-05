export type ProjectCategory = 'shelter' | 'fire' | 'tools' | 'custom'

export type ProjectStatus = 'planned' | 'in_progress' | 'completed'

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  imageUrl?: string
  imagePlaceholder: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
  syncedAt?: Date
}

export interface CreateProjectInput {
  name: string
  description: string
  category: ProjectCategory
  imageUrl?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  category?: ProjectCategory
  status?: ProjectStatus
  imageUrl?: string
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  shelter: 'Shelter & Unterkünfte',
  fire: 'Feuer & Kochen',
  tools: 'Werkzeuge & Ausrüstung',
  custom: 'Eigene Kategorie'
}

export const PROJECT_CATEGORY_ICONS: Record<ProjectCategory, string> = {
  shelter: 'tent',
  fire: 'flame',
  tools: 'hammer',
  custom: 'folder'
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
