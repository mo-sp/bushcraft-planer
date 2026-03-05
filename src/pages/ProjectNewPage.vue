<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Building2, Compass, Hammer, FolderPlus, Plus, Package, Backpack, Trash2, Search, Pencil } from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { PROJECT_CATEGORY_LABELS } from '@entities/project/model/types'
import { COMMON_UNITS } from '@entities/material/model/types'
import { BaseButton, BaseInput, BaseTextarea, BaseModal, BaseSelect, BaseCard } from '@shared/ui'

const router = useRouter()
const projectStore = useProjectStore()
const materialStore = useMaterialStore()
const equipmentStore = useEquipmentStore()

const name = ref('')
const description = ref('')
const category = ref('construction')
const customCategoryName = ref('')
const isSubmitting = ref(false)
const showCustomCategoryModal = ref(false)
const newCategoryName = ref('')

// Item selection state (materials + equipment)
type ItemType = 'material' | 'equipment'

interface SelectedItem {
  type: ItemType
  itemId: string
  name: string
  specifications?: string
  amount: number
  unit?: string
}

const selectedItems = ref<SelectedItem[]>([])
const showItemModal = ref(false)
const showNewItemModal = ref(false)
const showEditModal = ref(false)
const editingIndex = ref<number | null>(null)
const editAmount = ref(1)
const itemSearchQuery = ref('')
const selectedItemId = ref<string | null>(null)
const selectedItemType = ref<ItemType | null>(null)
const itemAmount = ref(1)

// New item form
const newItem = ref({
  type: 'material' as ItemType,
  name: '',
  specifications: '',
  unit: ''
})

const categoryIcons: Record<string, typeof Building2> = {
  construction: Building2,
  exploration: Compass,
  tools: Hammer,
  custom: FolderPlus
}

function getCategoryIcon(key: string) {
  return categoryIcons[key] || FolderPlus
}

const isValid = computed(() => {
  return name.value.trim().length > 0
})

// Combined items from both stores
const allItems = computed(() => {
  const materials = materialStore.materials.map(m => ({
    type: 'material' as ItemType,
    id: m.id,
    name: m.name,
    specifications: m.specifications,
    currentStock: m.currentStock,
    unit: m.unit
  }))

  const equipment = equipmentStore.equipment.map(e => ({
    type: 'equipment' as ItemType,
    id: e.id,
    name: e.name,
    specifications: e.specifications,
    currentStock: e.currentStock,
    unit: undefined
  }))

  return [...materials, ...equipment]
})

// Filtered items for search
const filteredItems = computed(() => {
  const query = itemSearchQuery.value.toLowerCase().trim()

  if (!query) return allItems.value

  return allItems.value.filter(item =>
    item.name.toLowerCase().includes(query) ||
    (item.specifications && item.specifications.toLowerCase().includes(query))
  )
})

const unitOptions = computed(() =>
  [{ value: '', label: 'Keine Einheit' }, ...COMMON_UNITS.map(unit => ({ value: unit, label: unit }))]
)

function selectCategory(key: string) {
  if (key === 'custom') {
    showCustomCategoryModal.value = true
  } else {
    category.value = key
    customCategoryName.value = ''
  }
}

function confirmCustomCategory() {
  if (newCategoryName.value.trim()) {
    const catId = projectStore.addCustomCategory(newCategoryName.value.trim())
    category.value = catId
    customCategoryName.value = newCategoryName.value.trim()
    showCustomCategoryModal.value = false
    newCategoryName.value = ''
  }
}

// Item functions
function openItemModal() {
  itemSearchQuery.value = ''
  selectedItemId.value = null
  selectedItemType.value = null
  itemAmount.value = 1
  showItemModal.value = true
}

function selectItem(type: ItemType, itemId: string) {
  selectedItemType.value = type
  selectedItemId.value = itemId
}

function confirmItemSelection() {
  if (!selectedItemId.value || !selectedItemType.value) return

  const item = allItems.value.find(i => i.id === selectedItemId.value && i.type === selectedItemType.value)
  if (!item) return

  // Check if already added
  const existing = selectedItems.value.find(
    i => i.itemId === selectedItemId.value && i.type === selectedItemType.value
  )
  if (existing) {
    existing.amount += itemAmount.value
  } else {
    selectedItems.value.push({
      type: item.type,
      itemId: item.id,
      name: item.name,
      specifications: item.specifications,
      amount: itemAmount.value,
      unit: item.unit
    })
  }

  showItemModal.value = false
  selectedItemId.value = null
  selectedItemType.value = null
  itemAmount.value = 1
}

function removeItem(index: number) {
  selectedItems.value.splice(index, 1)
}

function openEditModal(index: number) {
  const item = selectedItems.value[index]
  if (!item) return
  editingIndex.value = index
  editAmount.value = item.amount
  showEditModal.value = true
}

function confirmEdit() {
  if (editingIndex.value !== null && editAmount.value > 0) {
    const item = selectedItems.value[editingIndex.value]
    if (item) {
      item.amount = editAmount.value
    }
  }
  showEditModal.value = false
  editingIndex.value = null
}

function openNewItemModal() {
  newItem.value = { type: 'material', name: '', specifications: '', unit: '' }
  showNewItemModal.value = true
}

async function createNewItem() {
  if (!newItem.value.name.trim()) return

  if (newItem.value.type === 'material') {
    const material = await materialStore.createMaterial({
      name: newItem.value.name.trim(),
      specifications: newItem.value.specifications.trim() || undefined,
      unit: newItem.value.unit || undefined,
      currentStock: 0
    })

    if (material) {
      showNewItemModal.value = false
      selectedItemType.value = 'material'
      selectedItemId.value = material.id
    }
  } else {
    const equipment = await equipmentStore.createEquipment({
      name: newItem.value.name.trim(),
      specifications: newItem.value.specifications.trim() || undefined,
      currentStock: 0
    })

    if (equipment) {
      showNewItemModal.value = false
      selectedItemType.value = 'equipment'
      selectedItemId.value = equipment.id
    }
  }
}

function getItemDisplayName(item: { name: string; specifications?: string }) {
  if (item.specifications) {
    return `${item.name} (${item.specifications})`
  }
  return item.name
}

function getItemIcon(type: ItemType) {
  return type === 'material' ? Package : Backpack
}

async function submit() {
  if (!isValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const project = await projectStore.createProject({
      name: name.value.trim(),
      description: description.value.trim(),
      category: category.value,
      customCategoryName: customCategoryName.value || undefined
    })

    if (project) {
      // Create requirements for materials and equipment
      for (const item of selectedItems.value) {
        if (item.type === 'material') {
          await materialStore.createRequirement({
            projectId: project.id,
            materialId: item.itemId,
            requiredAmount: item.amount
          })
        } else {
          await equipmentStore.createRequirement({
            projectId: project.id,
            equipmentId: item.itemId,
            requiredAmount: item.amount
          })
        }
      }

      router.replace(`/project/${project.id}`)
    }
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="flex items-center gap-4 mb-6">
      <button
        class="p-2 -ml-2 rounded-full hover:bg-deep-100 transition-colors"
        @click="goBack"
      >
        <ArrowLeft class="w-6 h-6 text-earth-300" />
      </button>
      <h1 class="text-xl font-bold text-earth-100">Neues Projekt</h1>
    </header>

    <!-- Form -->
    <form @submit.prevent="submit" class="space-y-6">
      <!-- Name -->
      <BaseInput
        v-model="name"
        label="Projektname"
        placeholder="z.B. Waldläufer-Unterstand"
        required
      />

      <!-- Description -->
      <BaseTextarea
        v-model="description"
        label="Beschreibung"
        placeholder="Beschreibe dein Projekt..."
        :rows="3"
      />

      <!-- Materials & Equipment Section -->
      <div>
        <label class="text-sm font-medium text-earth-200 mb-3 block">
          Benötigte Materialien / Ausrüstung
        </label>

        <!-- Selected items list -->
        <div v-if="selectedItems.length > 0" class="space-y-2 mb-3">
          <BaseCard
            v-for="(item, index) in selectedItems"
            :key="index"
            class="!p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div
                  :class="[
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    item.type === 'material' ? 'bg-forest-600/30' : 'bg-amber-600/30'
                  ]"
                >
                  <component
                    :is="getItemIcon(item.type)"
                    :class="[
                      'w-4 h-4',
                      item.type === 'material' ? 'text-forest-400' : 'text-amber-400'
                    ]"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-earth-100 truncate">
                    {{ getItemDisplayName(item) }}
                  </p>
                  <p class="text-sm text-earth-400">
                    {{ item.amount }} {{ item.unit || 'Stück' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="p-2 rounded-lg text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
                  @click="openEditModal(index)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                  @click="removeItem(index)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Add item button -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-deep-100 text-earth-400 hover:border-forest-500 hover:text-forest-400 transition-colors"
          @click="openItemModal"
        >
          <Plus class="w-5 h-5" />
          <span>Material / Ausrüstung hinzufügen</span>
        </button>
      </div>

      <!-- Category -->
      <div>
        <label class="text-sm font-medium text-earth-200 mb-3 block">
          Kategorie
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(label, key) in PROJECT_CATEGORY_LABELS"
            :key="key"
            type="button"
            :class="[
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              category === key || (key === 'custom' && customCategoryName)
                ? 'border-forest-500 bg-forest-900/30'
                : 'border-deep-100 bg-deep-200 hover:border-deep-50'
            ]"
            @click="selectCategory(key)"
          >
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                category === key || (key === 'custom' && customCategoryName) ? 'bg-forest-600' : 'bg-deep-100'
              ]"
            >
              <component
                :is="getCategoryIcon(key)"
                :class="[
                  'w-5 h-5',
                  category === key || (key === 'custom' && customCategoryName) ? 'text-white' : 'text-earth-400'
                ]"
              />
            </div>
            <span
              :class="[
                'text-sm font-medium text-left',
                category === key || (key === 'custom' && customCategoryName) ? 'text-forest-300' : 'text-earth-300'
              ]"
            >
              {{ key === 'custom' && customCategoryName ? customCategoryName : label }}
            </span>
          </button>
        </div>
      </div>

      <!-- Submit -->
      <BaseButton
        type="submit"
        full-width
        size="lg"
        :loading="isSubmitting"
        :disabled="!isValid"
      >
        Projekt erstellen
      </BaseButton>
    </form>

    <!-- Custom Category Modal -->
    <BaseModal
      :open="showCustomCategoryModal"
      title="Neue Kategorie"
      @close="showCustomCategoryModal = false"
    >
      <BaseInput
        v-model="newCategoryName"
        label="Kategoriename"
        placeholder="z.B. Wasserversorgung"
        autofocus
      />
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showCustomCategoryModal = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!newCategoryName.trim()"
            @click="confirmCustomCategory"
          >
            Erstellen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Item Selection Modal -->
    <BaseModal
      :open="showItemModal"
      title="Material / Ausrüstung auswählen"
      @close="showItemModal = false"
    >
      <!-- Search -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
        <input
          v-model="itemSearchQuery"
          type="search"
          placeholder="Suchen..."
          class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
        >
      </div>

      <!-- Item list -->
      <div class="max-h-60 overflow-y-auto space-y-2 mb-4">
        <button
          v-for="item in filteredItems"
          :key="`${item.type}-${item.id}`"
          type="button"
          :class="[
            'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
            selectedItemId === item.id && selectedItemType === item.type
              ? 'border-forest-500 bg-forest-900/30'
              : 'border-deep-100 bg-deep-200 hover:border-deep-50'
          ]"
          @click="selectItem(item.type, item.id)"
        >
          <div
            :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center',
              selectedItemId === item.id && selectedItemType === item.type
                ? 'bg-forest-600'
                : item.type === 'material' ? 'bg-forest-900/30' : 'bg-amber-900/30'
            ]"
          >
            <component
              :is="getItemIcon(item.type)"
              :class="[
                'w-5 h-5',
                selectedItemId === item.id && selectedItemType === item.type
                  ? 'text-white'
                  : item.type === 'material' ? 'text-forest-400' : 'text-amber-400'
              ]"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p
              :class="[
                'font-medium truncate',
                selectedItemId === item.id && selectedItemType === item.type ? 'text-forest-300' : 'text-earth-200'
              ]"
            >
              {{ getItemDisplayName(item) }}
            </p>
            <p class="text-sm text-earth-500">
              {{ item.currentStock }} {{ item.unit || 'Stück' }} auf Lager
              <span class="text-earth-600">•</span>
              {{ item.type === 'material' ? 'Material' : 'Ausrüstung' }}
            </p>
          </div>
        </button>

        <!-- Empty state -->
        <div
          v-if="filteredItems.length === 0"
          class="text-center py-6 text-earth-500"
        >
          <Package class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nichts gefunden</p>
        </div>
      </div>

      <!-- New item button -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-deep-100 text-earth-400 hover:border-forest-500 hover:text-forest-400 transition-colors mb-4"
        @click="openNewItemModal"
      >
        <Plus class="w-5 h-5" />
        <span>Neues Material / Ausrüstung anlegen</span>
      </button>

      <!-- Amount input -->
      <div v-if="selectedItemId" class="mb-4">
        <BaseInput
          v-model.number="itemAmount"
          type="number"
          label="Menge"
          :min="1"
        />
      </div>

      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showItemModal = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!selectedItemId"
            @click="confirmItemSelection"
          >
            Hinzufügen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- New Item Modal -->
    <BaseModal
      :open="showNewItemModal"
      title="Neu anlegen"
      @close="showNewItemModal = false"
    >
      <form @submit.prevent="createNewItem" class="space-y-4">
        <!-- Type selection -->
        <div>
          <label class="text-sm font-medium text-earth-200 mb-2 block">Typ</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              :class="[
                'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                newItem.type === 'material'
                  ? 'border-forest-500 bg-forest-900/30 text-forest-300'
                  : 'border-deep-100 bg-deep-200 text-earth-400 hover:border-deep-50'
              ]"
              @click="newItem.type = 'material'"
            >
              <Package class="w-5 h-5" />
              <span>Material</span>
            </button>
            <button
              type="button"
              :class="[
                'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                newItem.type === 'equipment'
                  ? 'border-amber-500 bg-amber-900/30 text-amber-300'
                  : 'border-deep-100 bg-deep-200 text-earth-400 hover:border-deep-50'
              ]"
              @click="newItem.type = 'equipment'"
            >
              <Backpack class="w-5 h-5" />
              <span>Ausrüstung</span>
            </button>
          </div>
        </div>

        <BaseInput
          v-model="newItem.name"
          label="Name"
          :placeholder="newItem.type === 'material' ? 'z.B. Stock, Stein, Seil' : 'z.B. Rucksack, Zelt, Messer'"
          required
        />

        <BaseInput
          v-model="newItem.specifications"
          label="Maße / Details (optional)"
          :placeholder="newItem.type === 'material' ? 'z.B. 2 Meter gerade' : 'z.B. 30L wasserdicht'"
        />

        <BaseSelect
          v-if="newItem.type === 'material'"
          v-model="newItem.unit"
          label="Einheit (optional)"
          :options="unitOptions"
        />
      </form>

      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showNewItemModal = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!newItem.name.trim()"
            @click="createNewItem"
          >
            Anlegen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit Amount Modal -->
    <BaseModal
      :open="showEditModal"
      title="Menge bearbeiten"
      @close="showEditModal = false"
    >
      <BaseInput
        v-model.number="editAmount"
        type="number"
        label="Menge"
        :min="1"
        autofocus
      />

      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showEditModal = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="editAmount < 1"
            @click="confirmEdit"
          >
            Speichern
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
