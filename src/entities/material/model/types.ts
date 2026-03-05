export interface Material {
  id: string
  name: string
  unit?: string           // Optional
  currentStock: number
  icon?: string
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
}

export interface MaterialRequirement {
  id: string
  materialId: string
  projectId: string
  requiredAmount: number
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
}

export interface CreateMaterialInput {
  name: string
  unit?: string           // Optional
  currentStock?: number
  icon?: string
}

export interface UpdateMaterialInput {
  name?: string
  unit?: string
  currentStock?: number
  icon?: string
}

export interface CreateMaterialRequirementInput {
  materialId: string
  projectId: string
  requiredAmount: number
}

export interface UpdateMaterialRequirementInput {
  requiredAmount?: number
}

export const COMMON_UNITS: string[] = [
  'Stück',
  'Meter',
  'kg',
  'Gramm',
  'Liter',
  'cm',
  'Bündel',
  'Packung'
]

export const MATERIAL_ICONS: string[] = [
  'log',
  'rope',
  'leaf',
  'stone',
  'feather',
  'droplets',
  'flame',
  'package'
]
