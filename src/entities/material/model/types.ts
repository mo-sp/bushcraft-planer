export interface Material {
  id: string
  name: string
  specifications?: string // z.B. "2 Meter, gerade" oder "rund 10x10cm"
  unit?: string           // Optional
  currentStock: number
  icon?: string
  owner?: string          // e.g. "Moritz"
  storageLocationId?: string // FK to storage_locations
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
  specifications?: string // z.B. "2 Meter, gerade"
  unit?: string           // Optional
  currentStock?: number
  icon?: string
  owner?: string
  storageLocationId?: string
}

export interface UpdateMaterialInput {
  name?: string
  specifications?: string
  unit?: string
  currentStock?: number
  icon?: string
  owner?: string
  storageLocationId?: string
}

export interface CreateMaterialRequirementInput {
  materialId: string
  projectId: string
  requiredAmount: number
}

export interface UpdateMaterialRequirementInput {
  requiredAmount?: number
}

export interface UnitGroup {
  label: string
  units: string[]
}

export const UNIT_GROUPS: UnitGroup[] = [
  { label: 'Menge', units: ['Stück', 'Paar', 'Bündel', 'Packung'] },
  { label: 'Länge', units: ['mm', 'cm', 'Meter'] },
  { label: 'Gewicht', units: ['Gramm', 'kg'] },
  { label: 'Volumen', units: ['ml', 'Liter'] },
]

export const COMMON_UNITS: string[] = UNIT_GROUPS.flatMap(g => g.units)

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
