<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Minus, Trash2, Warehouse, Search, Edit3 } from 'lucide-vue-next'
import { useMaterialStore } from '@entities/material/model/store'
import { useProjectStore } from '@entities/project/model/store'
import { useStorageLocationStore } from '@entities/storage-location/model/store'
import { UNIT_GROUPS } from '@entities/material/model/types'
import type { Material } from '@entities/material/model/types'
import {
  BaseButton, BaseCard, BaseInput, BaseSelect, BaseModal, BaseEmptyState, BaseNumberStepper, BaseComboInput
} from '@shared/ui'
import { useKnownPersons } from '@shared/lib/useKnownPersons'

const materialStore = useMaterialStore()
const projectStore = useProjectStore()
const locationStore = useStorageLocationStore()
const { knownPersons } = useKnownPersons()

const searchQuery = ref('')
const selectedLocationFilter = ref<string | null>(null)
const selectedOwnerFilter = ref<string | null>(null)
const showAddMaterial = ref(false)
const showEditMaterial = ref(false)
const showDeleteConfirm = ref<string | null>(null)
const showDetailModal = ref(false)
const detailMaterial = ref<(Material & { totalRequired: number }) | null>(null)

// New material form
const newMaterial = ref({
  name: '',
  specifications: '',
  unit: '',
  currentStock: 0,
  owner: '',
  storageLocationId: ''
})

// Edit material form
const editingMaterialId = ref('')
const editMaterial = ref({
  name: '',
  specifications: '',
  unit: '',
  currentStock: 0,
  owner: '',
  storageLocationId: ''
})

const locationOptions = computed(() =>
  locationStore.locations.map(l => ({ value: l.id, label: l.name }))
)

// Locations that have at least one material assigned
const usedLocations = computed(() => {
  const ids = new Set(materialStore.materials.filter(m => m.storageLocationId).map(m => m.storageLocationId!))
  return locationStore.locations.filter(l => ids.has(l.id))
})

const hasUnassigned = computed(() =>
  materialStore.materials.some(m => !m.storageLocationId)
)

const uniqueOwners = computed(() => {
  const owners = new Set(materialStore.materials.filter(m => m.owner).map(m => m.owner!))
  return [...owners].sort()
})

const hasUnowned = computed(() =>
  materialStore.materials.some(m => !m.owner)
)

const filteredMaterials = computed(() => {
  let items = materialStore.materialWithStock

  // Location filter
  const loc = selectedLocationFilter.value
  if (loc === 'none') {
    items = items.filter(m => !m.storageLocationId)
  } else if (loc) {
    items = items.filter(m => m.storageLocationId === loc)
  }

  // Owner filter
  const owner = selectedOwnerFilter.value
  if (owner === 'none') {
    items = items.filter(m => !m.owner)
  } else if (owner) {
    items = items.filter(m => m.owner === owner)
  }

  // Search filter
  const query = searchQuery.value.toLowerCase().trim()
  if (query) {
    items = items.filter(m => m.name.toLowerCase().includes(query))
  }

  return items
})

const unitGroups = computed(() =>
  UNIT_GROUPS.map(group => ({
    label: group.label,
    options: group.units.map(unit => ({ value: unit, label: unit }))
  }))
)

// Get projects assigned to a material
function getAssignedProjects(materialId: string) {
  const reqs = materialStore.requirementsByMaterial(materialId)
  return reqs.map(r => {
    const project = projectStore.projectById(r.projectId)
    return project ? { name: project.name, amount: r.requiredAmount } : null
  }).filter(Boolean) as { name: string; amount: number }[]
}

function openDetail(material: Material & { totalRequired: number }) {
  detailMaterial.value = material
  showDetailModal.value = true
}

function getLocationName(locationId?: string): string | undefined {
  if (!locationId) return undefined
  return locationStore.locationById(locationId)?.name
}

function resetForm() {
  newMaterial.value = {
    name: '',
    specifications: '',
    unit: '',
    currentStock: 0,
    owner: '',
    storageLocationId: ''
  }
}

async function addMaterial() {
  if (!newMaterial.value.name.trim()) return

  await materialStore.createMaterial({
    name: newMaterial.value.name.trim(),
    specifications: newMaterial.value.specifications.trim() || undefined,
    unit: newMaterial.value.unit || undefined,
    currentStock: newMaterial.value.currentStock || 0,
    owner: newMaterial.value.owner.trim() || undefined,
    storageLocationId: newMaterial.value.storageLocationId || undefined
  })

  resetForm()
  showAddMaterial.value = false
}

function startEditMaterial(material: Material & { totalRequired: number }) {
  editingMaterialId.value = material.id
  editMaterial.value = {
    name: material.name,
    specifications: material.specifications || '',
    unit: material.unit || '',
    currentStock: material.currentStock,
    owner: material.owner || '',
    storageLocationId: material.storageLocationId || ''
  }
  showEditMaterial.value = true
}

async function saveEditMaterial() {
  if (!editMaterial.value.name.trim()) return

  await materialStore.updateMaterial(editingMaterialId.value, {
    name: editMaterial.value.name.trim(),
    specifications: editMaterial.value.specifications.trim() || undefined,
    unit: editMaterial.value.unit || undefined,
    currentStock: editMaterial.value.currentStock,
    owner: editMaterial.value.owner.trim() || undefined,
    storageLocationId: editMaterial.value.storageLocationId || undefined
  })

  showEditMaterial.value = false
}

async function adjustStock(id: string, delta: number) {
  await materialStore.adjustStock(id, delta)
}

async function deleteMaterial(id: string) {
  await materialStore.deleteMaterial(id)
  showDeleteConfirm.value = null
}
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-earth-100">Materiallager</h1>
        <p class="text-earth-400 text-sm mt-1">
          {{ materialStore.materials.length }} Material{{ materialStore.materials.length !== 1 ? 'ien' : '' }}
        </p>
      </div>
      <BaseButton @click="showAddMaterial = true">
        <Plus class="w-5 h-5" />
        Neu
      </BaseButton>
    </header>

    <!-- Search & Location filter (sticky) -->
    <div class="sticky top-0 z-30 bg-deep-200 pb-3 -mx-4 px-4 pt-1 space-y-2">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Material suchen..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
        >
      </div>

      <!-- Location filter badges -->
      <div v-if="usedLocations.length > 0 || hasUnassigned" class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedLocationFilter === null
            ? 'bg-forest-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedLocationFilter = null"
        >
          Alle
        </button>
        <button
          v-for="loc in usedLocations"
          :key="loc.id"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedLocationFilter === loc.id
            ? 'bg-forest-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedLocationFilter = selectedLocationFilter === loc.id ? null : loc.id"
        >
          {{ loc.name }}
        </button>
        <button
          v-if="hasUnassigned"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedLocationFilter === 'none'
            ? 'bg-earth-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedLocationFilter = selectedLocationFilter === 'none' ? null : 'none'"
        >
          Ohne Lager
        </button>
      </div>

      <!-- Owner filter badges -->
      <div v-if="uniqueOwners.length > 0" class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedOwnerFilter === null
            ? 'bg-amber-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedOwnerFilter = null"
        >
          Alle Besitzer
        </button>
        <button
          v-for="owner in uniqueOwners"
          :key="owner"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedOwnerFilter === owner
            ? 'bg-amber-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedOwnerFilter = selectedOwnerFilter === owner ? null : owner"
        >
          {{ owner }}
        </button>
        <button
          v-if="hasUnowned"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedOwnerFilter === 'none'
            ? 'bg-earth-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedOwnerFilter = selectedOwnerFilter === 'none' ? null : 'none'"
        >
          Kein Besitzer
        </button>
      </div>
    </div>

    <!-- Material list -->
    <div v-if="filteredMaterials.length > 0" class="space-y-3">
      <BaseCard
        v-for="material in filteredMaterials"
        :key="material.id"
      >
        <div class="flex items-center gap-2">
          <!-- Info (clickable for detail) -->
          <div
            class="flex-1 min-w-0 cursor-pointer"
            @click="openDetail(material)"
          >
            <h3 class="font-medium text-earth-100 truncate text-sm">
              {{ material.name }}
              <span v-if="material.specifications" class="text-earth-400 font-normal">
                ({{ material.specifications }})
              </span>
            </h3>
            <div class="flex items-center gap-2 mt-0.5 flex-wrap">
              <span v-if="material.owner" class="text-xs text-amber-400">{{ material.owner }}</span>
              <span v-if="material.storageLocationId" class="text-xs text-forest-400">
                {{ getLocationName(material.storageLocationId) }}
              </span>
              <span v-if="!material.owner && !material.storageLocationId" class="text-xs text-earth-400">
                {{ material.totalRequired > 0 ? `${material.totalRequired} benötigt` : 'Nicht zugewiesen' }}
              </span>
            </div>
          </div>

          <!-- Stock controls -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              class="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center active:scale-95 transition-all disabled:bg-forest-900 disabled:text-forest-600 border border-forest-500/40"
              :disabled="material.currentStock <= 0"
              @click="adjustStock(material.id, -1)"
            >
              <Minus class="w-5 h-5" />
            </button>

            <div class="w-10 text-center">
              <span class="text-sm font-semibold text-earth-100 tabular-nums">
                {{ material.currentStock }}
              </span>
              <span v-if="material.unit" class="text-[10px] text-earth-500 block leading-tight">
                {{ material.unit }}
              </span>
            </div>

            <button
              class="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center active:scale-95 transition-all"
              @click="adjustStock(material.id, 1)"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <!-- Edit & Delete -->
          <div class="flex items-center gap-0 flex-shrink-0">
            <button
              class="p-1.5 rounded-lg text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
              @click="startEditMaterial(material)"
              title="Bearbeiten"
            >
              <Edit3 class="w-5 h-5" />
            </button>
            <button
              class="p-1.5 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
              @click="showDeleteConfirm = material.id"
              title="Löschen"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Empty state -->
    <BaseEmptyState
      v-else-if="materialStore.materials.length === 0"
      :icon="Warehouse"
      title="Kein Material"
      description="Füge Materialien hinzu, um den Bestand zu verwalten."
    >
      <template #action>
        <BaseButton @click="showAddMaterial = true">
          <Plus class="w-5 h-5" />
          Material hinzufügen
        </BaseButton>
      </template>
    </BaseEmptyState>

    <!-- No search results -->
    <BaseEmptyState
      v-else
      :icon="Search"
      title="Keine Ergebnisse"
      :description="`Kein Material mit '${searchQuery}' gefunden.`"
    />

    <!-- Detail modal -->
    <BaseModal
      :open="showDetailModal"
      :title="detailMaterial?.name || 'Material'"
      centered
      @close="showDetailModal = false"
    >
      <div v-if="detailMaterial" class="space-y-4">
        <div v-if="detailMaterial.specifications">
          <p class="text-xs text-earth-500 mb-1">Details</p>
          <p class="text-earth-200">{{ detailMaterial.specifications }}</p>
        </div>

        <div class="flex gap-6 flex-wrap">
          <div>
            <p class="text-xs text-earth-500 mb-1">Bestand</p>
            <p class="text-earth-200 font-medium">
              {{ detailMaterial.currentStock }} {{ detailMaterial.unit || 'Stück' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-earth-500 mb-1">Benötigt</p>
            <p class="text-earth-200 font-medium">
              {{ detailMaterial.totalRequired }} {{ detailMaterial.unit || 'Stück' }}
            </p>
          </div>
          <div v-if="detailMaterial.owner">
            <p class="text-xs text-earth-500 mb-1">Eigentümer</p>
            <p class="text-amber-400 font-medium">{{ detailMaterial.owner }}</p>
          </div>
          <div v-if="detailMaterial.storageLocationId">
            <p class="text-xs text-earth-500 mb-1">Lagerort</p>
            <p class="text-forest-400 font-medium">{{ getLocationName(detailMaterial.storageLocationId) }}</p>
          </div>
        </div>

        <div>
          <p class="text-xs text-earth-500 mb-2">Zugewiesen an Projekte</p>
          <div v-if="getAssignedProjects(detailMaterial.id).length > 0" class="space-y-2">
            <div
              v-for="(proj, i) in getAssignedProjects(detailMaterial.id)"
              :key="i"
              class="flex items-center justify-between bg-deep-100/50 rounded-lg px-3 py-2"
            >
              <span class="text-earth-200 text-sm">{{ proj.name }}</span>
              <span class="text-earth-400 text-sm">{{ proj.amount }} {{ detailMaterial.unit || 'Stück' }}</span>
            </div>
          </div>
          <p v-else class="text-earth-500 text-sm">Keinem Projekt zugewiesen</p>
        </div>
      </div>
    </BaseModal>

    <!-- Add material modal -->
    <BaseModal
      :open="showAddMaterial"
      title="Neues Material"
      @close="showAddMaterial = false; resetForm()"
    >
      <form @submit.prevent="addMaterial" class="space-y-4">
        <BaseInput
          v-model="newMaterial.name"
          label="Name"
          placeholder="z.B. Stock, Stein, Seil"
          required
        />

        <BaseInput
          v-model="newMaterial.specifications"
          label="Maße / Spezifikation (optional)"
          placeholder="z.B. 2 Meter gerade, rund 10x10cm"
        />

        <BaseSelect
          v-model="newMaterial.unit"
          label="Einheit (optional)"
          :groups="unitGroups"
          empty-label="Keine Einheit"
        />

        <BaseComboInput
          v-model="newMaterial.owner"
          :suggestions="knownPersons"
          label="Eigentümer (optional)"
          placeholder="z.B. Moritz, Tim"
        />

        <BaseSelect
          v-model="newMaterial.storageLocationId"
          label="Lagerort (optional)"
          :options="locationOptions"
          empty-label="Kein Lagerort"
        />

        <BaseNumberStepper
          v-model="newMaterial.currentStock"
          label="Anfangsbestand"
        />
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showAddMaterial = false; resetForm()"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!newMaterial.name.trim()"
            @click="addMaterial"
          >
            Hinzufügen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit material modal -->
    <BaseModal
      :open="showEditMaterial"
      title="Material bearbeiten"
      @close="showEditMaterial = false"
    >
      <form @submit.prevent="saveEditMaterial" class="space-y-4">
        <BaseInput
          v-model="editMaterial.name"
          label="Name"
          placeholder="z.B. Stock, Stein, Seil"
          required
        />

        <BaseInput
          v-model="editMaterial.specifications"
          label="Maße / Spezifikation (optional)"
          placeholder="z.B. 2 Meter gerade, rund 10x10cm"
        />

        <BaseSelect
          v-model="editMaterial.unit"
          label="Einheit (optional)"
          :groups="unitGroups"
          empty-label="Keine Einheit"
        />

        <BaseComboInput
          v-model="editMaterial.owner"
          :suggestions="knownPersons"
          label="Eigentümer (optional)"
          placeholder="z.B. Moritz, Tim"
        />

        <BaseSelect
          v-model="editMaterial.storageLocationId"
          label="Lagerort (optional)"
          :options="locationOptions"
          empty-label="Kein Lagerort"
        />

        <BaseNumberStepper
          v-model="editMaterial.currentStock"
          label="Aktueller Bestand"
        />
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showEditMaterial = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!editMaterial.name.trim()"
            @click="saveEditMaterial"
          >
            Speichern
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal
      :open="showDeleteConfirm !== null"
      title="Material löschen?"
      @close="showDeleteConfirm = null"
    >
      <p class="text-earth-300">
        Möchtest du dieses Material wirklich löschen?
        Alle Zuweisungen zu Projekten werden ebenfalls entfernt.
      </p>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showDeleteConfirm = null"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            variant="danger"
            full-width
            @click="deleteMaterial(showDeleteConfirm!)"
          >
            Löschen
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
