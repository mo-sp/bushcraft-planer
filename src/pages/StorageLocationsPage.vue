<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Trash2, Edit3, MapPin, Search, Package, Backpack } from 'lucide-vue-next'
import { useStorageLocationStore } from '@entities/storage-location/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { DEFAULT_STORAGE_LOCATIONS } from '@entities/storage-location/model/types'
import type { StorageLocation } from '@entities/storage-location/model/types'
import {
  BaseButton, BaseCard, BaseInput, BaseModal, BaseEmptyState
} from '@shared/ui'

const locationStore = useStorageLocationStore()
const materialStore = useMaterialStore()
const equipmentStore = useEquipmentStore()

const searchQuery = ref('')
const showAddLocation = ref(false)
const showEditLocation = ref(false)
const showDeleteConfirm = ref<string | null>(null)
const showDetailModal = ref(false)
const detailLocation = ref<StorageLocation | null>(null)

// New location form
const newLocation = ref({
  name: '',
  description: ''
})

// Edit location form
const editingLocationId = ref('')
const editLocation = ref({
  name: '',
  description: ''
})

const filteredLocations = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return locationStore.locations

  return locationStore.locations.filter(l =>
    l.name.toLowerCase().includes(query) ||
    (l.description && l.description.toLowerCase().includes(query))
  )
})

function getMaterialCount(locationId: string): number {
  return materialStore.materialsByLocation(locationId).length
}

function getEquipmentCount(locationId: string): number {
  return equipmentStore.equipmentByLocation(locationId).length
}

function openDetail(location: StorageLocation) {
  detailLocation.value = location
  showDetailModal.value = true
}

function resetForm() {
  newLocation.value = { name: '', description: '' }
}

async function addLocation() {
  if (!newLocation.value.name.trim()) return

  await locationStore.createLocation({
    name: newLocation.value.name.trim(),
    description: newLocation.value.description.trim() || undefined
  })

  resetForm()
  showAddLocation.value = false
}

function startEditLocation(location: StorageLocation) {
  editingLocationId.value = location.id
  editLocation.value = {
    name: location.name,
    description: location.description || ''
  }
  showEditLocation.value = true
}

async function saveEditLocation() {
  if (!editLocation.value.name.trim()) return

  await locationStore.updateLocation(editingLocationId.value, {
    name: editLocation.value.name.trim(),
    description: editLocation.value.description.trim() || undefined
  })

  showEditLocation.value = false
}

async function deleteLocation(id: string) {
  // Clear storageLocationId on items that reference this location
  const mats = materialStore.materialsByLocation(id)
  for (const m of mats) {
    await materialStore.updateMaterial(m.id, { storageLocationId: undefined })
  }
  const eqs = equipmentStore.equipmentByLocation(id)
  for (const e of eqs) {
    await equipmentStore.updateEquipment(e.id, { storageLocationId: undefined })
  }

  await locationStore.deleteLocation(id)
  showDeleteConfirm.value = null
}

async function loadDefaults() {
  for (const loc of DEFAULT_STORAGE_LOCATIONS) {
    const exists = locationStore.locationByName(loc.name)
    if (!exists) {
      await locationStore.createLocation(loc)
    }
  }
}
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-earth-100">Lagerorte</h1>
        <p class="text-earth-400 text-sm mt-1">
          {{ locationStore.locations.length }} Lagerort{{ locationStore.locations.length !== 1 ? 'e' : '' }}
        </p>
      </div>
      <BaseButton @click="showAddLocation = true">
        <Plus class="w-5 h-5" />
        Neu
      </BaseButton>
    </header>

    <!-- Search -->
    <div class="sticky top-0 z-30 bg-deep-200 pb-3 -mx-4 px-4 pt-1">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Lagerort suchen..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
        >
      </div>
    </div>

    <!-- Location list -->
    <div v-if="filteredLocations.length > 0" class="space-y-3">
      <BaseCard
        v-for="location in filteredLocations"
        :key="location.id"
      >
        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div
            class="w-12 h-12 rounded-xl bg-forest-900/40 flex items-center justify-center flex-shrink-0 cursor-pointer"
            @click="openDetail(location)"
          >
            <MapPin class="w-6 h-6 text-forest-400" />
          </div>

          <!-- Info -->
          <div
            class="flex-1 min-w-0 cursor-pointer"
            @click="openDetail(location)"
          >
            <h3 class="font-medium text-earth-100 truncate">
              {{ location.name }}
            </h3>
            <p v-if="location.description" class="text-xs text-earth-400 truncate mt-0.5">
              {{ location.description }}
            </p>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-xs text-forest-400 flex items-center gap-1">
                <Package class="w-3 h-3" />
                {{ getMaterialCount(location.id) }}
              </span>
              <span class="text-xs text-amber-400 flex items-center gap-1">
                <Backpack class="w-3 h-3" />
                {{ getEquipmentCount(location.id) }}
              </span>
            </div>
          </div>

          <!-- Edit & Delete -->
          <div class="flex items-center gap-0 flex-shrink-0">
            <button
              class="p-1.5 rounded-lg text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
              @click="startEditLocation(location)"
              title="Bearbeiten"
            >
              <Edit3 class="w-5 h-5" />
            </button>
            <button
              class="p-1.5 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
              @click="showDeleteConfirm = location.id"
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
      v-else-if="locationStore.locations.length === 0"
      :icon="MapPin"
      title="Keine Lagerorte"
      description="Erstelle Lagerorte, um Material und Ausrüstung zuzuweisen."
    >
      <template #action>
        <div class="flex flex-col gap-2 w-full">
          <BaseButton @click="showAddLocation = true">
            <Plus class="w-5 h-5" />
            Lagerort erstellen
          </BaseButton>
          <BaseButton variant="secondary" @click="loadDefaults">
            <MapPin class="w-5 h-5" />
            Standardlager laden
          </BaseButton>
        </div>
      </template>
    </BaseEmptyState>

    <!-- No search results -->
    <BaseEmptyState
      v-else
      :icon="Search"
      title="Keine Ergebnisse"
      :description="`Kein Lagerort mit '${searchQuery}' gefunden.`"
    />

    <!-- Detail modal -->
    <BaseModal
      :open="showDetailModal"
      :title="detailLocation?.name || 'Lagerort'"
      centered
      @close="showDetailModal = false"
    >
      <div v-if="detailLocation" class="space-y-4">
        <div v-if="detailLocation.description">
          <p class="text-xs text-earth-500 mb-1">Beschreibung</p>
          <p class="text-earth-200">{{ detailLocation.description }}</p>
        </div>

        <div>
          <p class="text-xs text-earth-500 mb-2">Material ({{ getMaterialCount(detailLocation.id) }})</p>
          <div v-if="getMaterialCount(detailLocation.id) > 0" class="space-y-1">
            <div
              v-for="mat in materialStore.materialsByLocation(detailLocation.id)"
              :key="mat.id"
              class="flex items-center justify-between bg-deep-100/50 rounded-lg px-3 py-2"
            >
              <span class="text-earth-200 text-sm">
                {{ mat.name }}
                <span v-if="mat.specifications" class="text-earth-400">({{ mat.specifications }})</span>
              </span>
              <span class="text-earth-400 text-sm">{{ mat.currentStock }} {{ mat.unit || 'Stk' }}</span>
            </div>
          </div>
          <p v-else class="text-earth-500 text-sm">Kein Material an diesem Ort</p>
        </div>

        <div>
          <p class="text-xs text-earth-500 mb-2">Ausrüstung ({{ getEquipmentCount(detailLocation.id) }})</p>
          <div v-if="getEquipmentCount(detailLocation.id) > 0" class="space-y-1">
            <div
              v-for="eq in equipmentStore.equipmentByLocation(detailLocation.id)"
              :key="eq.id"
              class="flex items-center justify-between bg-deep-100/50 rounded-lg px-3 py-2"
            >
              <span class="text-earth-200 text-sm">
                {{ eq.name }}
                <span v-if="eq.specifications" class="text-earth-400">({{ eq.specifications }})</span>
              </span>
              <span class="text-earth-400 text-sm">{{ eq.currentStock }} Stk</span>
            </div>
          </div>
          <p v-else class="text-earth-500 text-sm">Keine Ausrüstung an diesem Ort</p>
        </div>
      </div>
    </BaseModal>

    <!-- Add location modal -->
    <BaseModal
      :open="showAddLocation"
      title="Neuer Lagerort"
      @close="showAddLocation = false; resetForm()"
    >
      <form @submit.prevent="addLocation" class="space-y-4">
        <BaseInput
          v-model="newLocation.name"
          label="Name"
          placeholder="z.B. Hippie-Wald, Zuhause"
          required
        />

        <BaseInput
          v-model="newLocation.description"
          label="Beschreibung (optional)"
          placeholder="z.B. Hauptlager im Wald"
        />
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showAddLocation = false; resetForm()"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!newLocation.name.trim()"
            @click="addLocation"
          >
            Erstellen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit location modal -->
    <BaseModal
      :open="showEditLocation"
      title="Lagerort bearbeiten"
      @close="showEditLocation = false"
    >
      <form @submit.prevent="saveEditLocation" class="space-y-4">
        <BaseInput
          v-model="editLocation.name"
          label="Name"
          placeholder="z.B. Hippie-Wald, Zuhause"
          required
        />

        <BaseInput
          v-model="editLocation.description"
          label="Beschreibung (optional)"
          placeholder="z.B. Hauptlager im Wald"
        />
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showEditLocation = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!editLocation.name.trim()"
            @click="saveEditLocation"
          >
            Speichern
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal
      :open="showDeleteConfirm !== null"
      title="Lagerort löschen?"
      @close="showDeleteConfirm = null"
    >
      <p class="text-earth-300">
        Möchtest du diesen Lagerort wirklich löschen?
        Material und Ausrüstung an diesem Ort werden nicht gelöscht, aber haben keinen Lagerort mehr zugewiesen.
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
            @click="deleteLocation(showDeleteConfirm!)"
          >
            Löschen
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
