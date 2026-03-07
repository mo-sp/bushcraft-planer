<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Minus, Trash2, Backpack, Search, Edit3 } from 'lucide-vue-next'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { useProjectStore } from '@entities/project/model/store'
import type { Equipment } from '@entities/equipment/model/types'
import {
  BaseButton, BaseCard, BaseInput, BaseModal, BaseEmptyState, BaseNumberStepper
} from '@shared/ui'

const equipmentStore = useEquipmentStore()
const projectStore = useProjectStore()

const searchQuery = ref('')
const showAddEquipment = ref(false)
const showEditEquipment = ref(false)
const showDeleteConfirm = ref<string | null>(null)
const showDetailModal = ref(false)
const detailEquipment = ref<(Equipment & { totalRequired: number }) | null>(null)

// New equipment form
const newEquipment = ref({
  name: '',
  specifications: '',
  currentStock: 0
})

// Edit equipment form
const editingEquipmentId = ref('')
const editEquipment = ref({
  name: '',
  specifications: '',
  currentStock: 0
})

const filteredEquipment = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return equipmentStore.equipmentWithStock

  return equipmentStore.equipmentWithStock.filter(e =>
    e.name.toLowerCase().includes(query) ||
    (e.specifications && e.specifications.toLowerCase().includes(query))
  )
})

// Get projects assigned to an equipment item
function getAssignedProjects(equipmentId: string) {
  const reqs = equipmentStore.requirementsByEquipment(equipmentId)
  return reqs.map(r => {
    const project = projectStore.projectById(r.projectId)
    return project ? { name: project.name, amount: r.requiredAmount } : null
  }).filter(Boolean) as { name: string; amount: number }[]
}

function openDetail(item: Equipment & { totalRequired: number }) {
  detailEquipment.value = item
  showDetailModal.value = true
}

function resetForm() {
  newEquipment.value = {
    name: '',
    specifications: '',
    currentStock: 0
  }
}

async function addEquipment() {
  if (!newEquipment.value.name.trim()) return

  await equipmentStore.createEquipment({
    name: newEquipment.value.name.trim(),
    specifications: newEquipment.value.specifications.trim() || undefined,
    currentStock: newEquipment.value.currentStock || 0
  })

  resetForm()
  showAddEquipment.value = false
}

function startEditEquipment(item: Equipment & { totalRequired: number }) {
  editingEquipmentId.value = item.id
  editEquipment.value = {
    name: item.name,
    specifications: item.specifications || '',
    currentStock: item.currentStock
  }
  showEditEquipment.value = true
}

async function saveEditEquipment() {
  if (!editEquipment.value.name.trim()) return

  await equipmentStore.updateEquipment(editingEquipmentId.value, {
    name: editEquipment.value.name.trim(),
    specifications: editEquipment.value.specifications.trim() || undefined,
    currentStock: editEquipment.value.currentStock
  })

  showEditEquipment.value = false
}

async function adjustStock(id: string, delta: number) {
  await equipmentStore.adjustStock(id, delta)
}

async function deleteEquipment(id: string) {
  await equipmentStore.deleteEquipment(id)
  showDeleteConfirm.value = null
}
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-earth-100">Ausrüstungslager</h1>
        <p class="text-earth-400 text-sm mt-1">
          {{ equipmentStore.equipment.length }} Ausrüstung{{ equipmentStore.equipment.length !== 1 ? 'en' : '' }}
        </p>
      </div>
      <BaseButton @click="showAddEquipment = true">
        <Plus class="w-5 h-5" />
        Neu
      </BaseButton>
    </header>

    <!-- Search (sticky) -->
    <div class="sticky top-0 z-30 bg-deep-200 pb-3 -mx-4 px-4 pt-1">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Ausrüstung suchen..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
        >
      </div>
    </div>

    <!-- Equipment list -->
    <div v-if="filteredEquipment.length > 0" class="space-y-3">
      <BaseCard
        v-for="item in filteredEquipment"
        :key="item.id"
      >
        <div class="flex items-center gap-2">
          <!-- Info (clickable for detail) -->
          <div
            class="flex-1 min-w-0 cursor-pointer"
            @click="openDetail(item)"
          >
            <h3 class="font-medium text-earth-100 truncate text-sm">
              {{ item.name }}
              <span v-if="item.specifications" class="text-earth-400 font-normal">
                ({{ item.specifications }})
              </span>
            </h3>
            <p class="text-xs text-earth-400 mt-0.5">
              {{ item.totalRequired > 0 ? `${item.totalRequired} benötigt` : 'Nicht zugewiesen' }}
            </p>
          </div>

          <!-- Stock controls -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              class="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center active:scale-95 transition-all disabled:bg-forest-900 disabled:text-forest-600 border border-forest-500/40"
              :disabled="item.currentStock <= 0"
              @click="adjustStock(item.id, -1)"
            >
              <Minus class="w-5 h-5" />
            </button>

            <div class="w-10 text-center">
              <span class="text-sm font-semibold text-earth-100 tabular-nums">
                {{ item.currentStock }}
              </span>
              <span class="text-[10px] text-earth-500 block leading-tight">
                Stück
              </span>
            </div>

            <button
              class="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center active:scale-95 transition-all"
              @click="adjustStock(item.id, 1)"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <!-- Edit & Delete -->
          <div class="flex items-center gap-0 flex-shrink-0">
            <button
              class="p-1.5 rounded-lg text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
              @click="startEditEquipment(item)"
              title="Bearbeiten"
            >
              <Edit3 class="w-5 h-5" />
            </button>
            <button
              class="p-1.5 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
              @click="showDeleteConfirm = item.id"
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
      v-else-if="equipmentStore.equipment.length === 0"
      :icon="Backpack"
      title="Keine Ausrüstung"
      description="Füge Ausrüstung hinzu, um den Bestand zu verwalten."
    >
      <template #action>
        <BaseButton @click="showAddEquipment = true">
          <Plus class="w-5 h-5" />
          Ausrüstung hinzufügen
        </BaseButton>
      </template>
    </BaseEmptyState>

    <!-- No search results -->
    <BaseEmptyState
      v-else
      :icon="Search"
      title="Keine Ergebnisse"
      :description="`Keine Ausrüstung mit '${searchQuery}' gefunden.`"
    />

    <!-- Detail modal -->
    <BaseModal
      :open="showDetailModal"
      :title="detailEquipment?.name || 'Ausrüstung'"
      centered
      @close="showDetailModal = false"
    >
      <div v-if="detailEquipment" class="space-y-4">
        <div v-if="detailEquipment.specifications">
          <p class="text-xs text-earth-500 mb-1">Details</p>
          <p class="text-earth-200">{{ detailEquipment.specifications }}</p>
        </div>

        <div class="flex gap-6">
          <div>
            <p class="text-xs text-earth-500 mb-1">Bestand</p>
            <p class="text-earth-200 font-medium">
              {{ detailEquipment.currentStock }} Stück
            </p>
          </div>
          <div>
            <p class="text-xs text-earth-500 mb-1">Benötigt</p>
            <p class="text-earth-200 font-medium">
              {{ detailEquipment.totalRequired }} Stück
            </p>
          </div>
        </div>

        <div>
          <p class="text-xs text-earth-500 mb-2">Zugewiesen an Projekte</p>
          <div v-if="getAssignedProjects(detailEquipment.id).length > 0" class="space-y-2">
            <div
              v-for="(proj, i) in getAssignedProjects(detailEquipment.id)"
              :key="i"
              class="flex items-center justify-between bg-deep-100/50 rounded-lg px-3 py-2"
            >
              <span class="text-earth-200 text-sm">{{ proj.name }}</span>
              <span class="text-earth-400 text-sm">{{ proj.amount }} Stück</span>
            </div>
          </div>
          <p v-else class="text-earth-500 text-sm">Keinem Projekt zugewiesen</p>
        </div>
      </div>
    </BaseModal>

    <!-- Add equipment modal -->
    <BaseModal
      :open="showAddEquipment"
      title="Neue Ausrüstung"
      @close="showAddEquipment = false; resetForm()"
    >
      <form @submit.prevent="addEquipment" class="space-y-4">
        <BaseInput
          v-model="newEquipment.name"
          label="Name"
          placeholder="z.B. Rucksack, Zelt, Messer"
          required
        />

        <BaseInput
          v-model="newEquipment.specifications"
          label="Details (optional)"
          placeholder="z.B. 30L wasserdicht, 2-Personen"
        />

        <BaseNumberStepper
          v-model="newEquipment.currentStock"
          label="Anfangsbestand"
        />
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showAddEquipment = false; resetForm()"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!newEquipment.name.trim()"
            @click="addEquipment"
          >
            Hinzufügen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit equipment modal -->
    <BaseModal
      :open="showEditEquipment"
      title="Ausrüstung bearbeiten"
      @close="showEditEquipment = false"
    >
      <form @submit.prevent="saveEditEquipment" class="space-y-4">
        <BaseInput
          v-model="editEquipment.name"
          label="Name"
          placeholder="z.B. Rucksack, Zelt, Messer"
          required
        />

        <BaseInput
          v-model="editEquipment.specifications"
          label="Details (optional)"
          placeholder="z.B. 30L wasserdicht, 2-Personen"
        />

        <BaseNumberStepper
          v-model="editEquipment.currentStock"
          label="Aktueller Bestand"
        />
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showEditEquipment = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!editEquipment.name.trim()"
            @click="saveEditEquipment"
          >
            Speichern
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal
      :open="showDeleteConfirm !== null"
      title="Ausrüstung löschen?"
      @close="showDeleteConfirm = null"
    >
      <p class="text-earth-300">
        Möchtest du diese Ausrüstung wirklich löschen?
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
            @click="deleteEquipment(showDeleteConfirm!)"
          >
            Löschen
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
