<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Minus, Trash2, Package, AlertTriangle, Search } from 'lucide-vue-next'
import { useMaterialStore } from '@entities/material/model/store'
import { COMMON_UNITS } from '@entities/material/model/types'
import {
  BaseButton, BaseCard, BaseInput, BaseSelect, BaseModal, BaseEmptyState, BaseBadge
} from '@shared/ui'

const materialStore = useMaterialStore()

const searchQuery = ref('')
const showAddMaterial = ref(false)
const showDeleteConfirm = ref<string | null>(null)

// New material form
const newMaterial = ref({
  name: '',
  unit: 'Stück',
  currentStock: 0
})

const filteredMaterials = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return materialStore.materialWithStock

  return materialStore.materialWithStock.filter(m =>
    m.name.toLowerCase().includes(query)
  )
})

const unitOptions = computed(() =>
  COMMON_UNITS.map(unit => ({ value: unit, label: unit }))
)

function resetForm() {
  newMaterial.value = {
    name: '',
    unit: 'Stück',
    currentStock: 0
  }
}

async function addMaterial() {
  if (!newMaterial.value.name.trim()) return

  await materialStore.createMaterial({
    name: newMaterial.value.name.trim(),
    unit: newMaterial.value.unit,
    currentStock: newMaterial.value.currentStock || 0
  })

  resetForm()
  showAddMaterial.value = false
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
        <h1 class="text-2xl font-bold text-bark-800">Materialien</h1>
        <p class="text-bark-500 text-sm mt-1">
          {{ materialStore.materials.length }} Material{{ materialStore.materials.length !== 1 ? 'ien' : '' }}
        </p>
      </div>
      <BaseButton @click="showAddMaterial = true">
        <Plus class="w-5 h-5" />
        Neu
      </BaseButton>
    </header>

    <!-- Low stock warning -->
    <BaseCard
      v-if="materialStore.lowStockMaterials.length > 0"
      class="mb-4 bg-amber-50 border border-amber-200"
    >
      <div class="flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-medium text-amber-800">Niedriger Bestand</p>
          <p class="text-sm text-amber-700 mt-1">
            {{ materialStore.lowStockMaterials.map(m => m.name).join(', ') }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Search -->
    <div class="relative mb-4">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Material suchen..."
        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-earth-200 bg-white text-bark-800 placeholder-bark-400 focus:outline-none focus:border-forest-500 transition-colors"
      >
    </div>

    <!-- Material list -->
    <div v-if="filteredMaterials.length > 0" class="space-y-3">
      <BaseCard
        v-for="material in filteredMaterials"
        :key="material.id"
      >
        <div class="flex items-center justify-between gap-4">
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-bark-800 truncate">
                {{ material.name }}
              </h3>
              <BaseBadge
                v-if="material.isLow"
                variant="warning"
                size="sm"
              >
                Niedrig
              </BaseBadge>
            </div>
            <p class="text-sm text-bark-500 mt-0.5">
              {{ material.totalRequired > 0 ? `${material.totalRequired} benötigt` : 'Nicht zugewiesen' }}
            </p>
          </div>

          <!-- Stock controls -->
          <div class="flex items-center gap-2">
            <button
              class="w-10 h-10 rounded-xl bg-earth-200 text-bark-600 flex items-center justify-center hover:bg-earth-300 active:scale-95 transition-all disabled:opacity-50"
              :disabled="material.currentStock <= 0"
              @click="adjustStock(material.id, -1)"
            >
              <Minus class="w-5 h-5" />
            </button>

            <div class="w-16 text-center">
              <span class="text-lg font-semibold text-bark-800 tabular-nums">
                {{ material.currentStock }}
              </span>
              <span class="text-xs text-bark-500 block">
                {{ material.unit }}
              </span>
            </div>

            <button
              class="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center hover:bg-forest-700 active:scale-95 transition-all"
              @click="adjustStock(material.id, 1)"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <!-- Delete button -->
          <button
            class="p-2 rounded-lg text-bark-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            @click="showDeleteConfirm = material.id"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </BaseCard>
    </div>

    <!-- Empty state -->
    <BaseEmptyState
      v-else-if="materialStore.materials.length === 0"
      :icon="Package"
      title="Keine Materialien"
      description="Füge Materialien hinzu, um deinen Bestand zu verwalten."
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
          placeholder="z.B. Paracord"
          required
        />

        <BaseSelect
          v-model="newMaterial.unit"
          label="Einheit"
          :options="unitOptions"
        />

        <BaseInput
          v-model="newMaterial.currentStock"
          type="number"
          label="Anfangsbestand"
          placeholder="0"
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

    <!-- Delete confirmation modal -->
    <BaseModal
      :open="showDeleteConfirm !== null"
      title="Material löschen?"
      @close="showDeleteConfirm = null"
    >
      <p class="text-bark-600">
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
