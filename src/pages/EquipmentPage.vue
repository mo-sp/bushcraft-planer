<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Minus, Trash2, Backpack, AlertTriangle, Search } from 'lucide-vue-next'
import { useEquipmentStore } from '@entities/equipment/model/store'
import {
  BaseButton, BaseCard, BaseInput, BaseModal, BaseEmptyState, BaseBadge
} from '@shared/ui'

const equipmentStore = useEquipmentStore()

const searchQuery = ref('')
const showAddEquipment = ref(false)
const showDeleteConfirm = ref<string | null>(null)

// New equipment form
const newEquipment = ref({
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

    <!-- Low stock warning -->
    <BaseCard
      v-if="equipmentStore.lowStockEquipment.length > 0"
      class="mb-4 !bg-amber-900/30 border-amber-600/50"
    >
      <div class="flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-medium text-amber-300">Niedriger Bestand</p>
          <p class="text-sm text-amber-400 mt-1">
            {{ equipmentStore.lowStockEquipment.map(e => e.name).join(', ') }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Search -->
    <div class="relative mb-4">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Ausrüstung suchen..."
        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
      >
    </div>

    <!-- Equipment list -->
    <div v-if="filteredEquipment.length > 0" class="space-y-3">
      <BaseCard
        v-for="item in filteredEquipment"
        :key="item.id"
      >
        <div class="flex items-center justify-between gap-4">
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-earth-100 truncate">
                {{ item.name }}
                <span v-if="item.specifications" class="text-earth-400 font-normal">
                  ({{ item.specifications }})
                </span>
              </h3>
              <BaseBadge
                v-if="item.isLow"
                variant="warning"
                size="sm"
              >
                Niedrig
              </BaseBadge>
            </div>
            <p class="text-sm text-earth-400 mt-0.5">
              {{ item.totalRequired > 0 ? `${item.totalRequired} benötigt` : 'Nicht zugewiesen' }}
            </p>
          </div>

          <!-- Stock controls -->
          <div class="flex items-center gap-2">
            <button
              class="w-10 h-10 rounded-xl bg-deep-200 text-earth-300 flex items-center justify-center hover:bg-deep-100 active:scale-95 transition-all disabled:opacity-50 border border-deep-50/30"
              :disabled="item.currentStock <= 0"
              @click="adjustStock(item.id, -1)"
            >
              <Minus class="w-5 h-5" />
            </button>

            <div class="w-16 text-center">
              <span class="text-lg font-semibold text-earth-100 tabular-nums">
                {{ item.currentStock }}
              </span>
              <span class="text-xs text-earth-500 block">
                Stück
              </span>
            </div>

            <button
              class="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center hover:bg-forest-500 active:scale-95 transition-all"
              @click="adjustStock(item.id, 1)"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <!-- Delete button -->
          <button
            class="p-2 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
            @click="showDeleteConfirm = item.id"
          >
            <Trash2 class="w-5 h-5" />
          </button>
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

        <BaseInput
          v-model.number="newEquipment.currentStock"
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
