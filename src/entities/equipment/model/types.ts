export interface Equipment {
  id: string
  name: string
  specifications?: string // z.B. "wasserdicht", "30L Volumen"
  currentStock: number
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
}

export interface EquipmentRequirement {
  id: string
  equipmentId: string
  projectId: string
  requiredAmount: number
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
}

export interface CreateEquipmentInput {
  name: string
  specifications?: string
  currentStock?: number
}

export interface UpdateEquipmentInput {
  name?: string
  specifications?: string
  currentStock?: number
}

export interface CreateEquipmentRequirementInput {
  equipmentId: string
  projectId: string
  requiredAmount: number
}

export interface UpdateEquipmentRequirementInput {
  requiredAmount?: number
}
