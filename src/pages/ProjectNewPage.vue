<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Building2, Compass, Hammer, FolderPlus, Plus, Package, Backpack, Trash2, Search, Pencil, ImagePlus, X, Clock, Users, Copy, CheckCircle2 } from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { useTaskStore } from '@entities/task/model/store'
import { useStorageLocationStore } from '@entities/storage-location/model/store'
import { UNIT_GROUPS } from '@entities/material/model/types'
import { BaseButton, BaseInput, BaseTextarea, BaseModal, BaseSelect, BaseCard, BaseNumberStepper, BaseComboInput } from '@shared/ui'
import { useKnownPersons } from '@shared/lib/useKnownPersons'

// Task planning state
interface PlannedTask {
  title: string
  duration?: number
  manpower: number
  assignees?: string[]
}

import { compressImage } from '@shared/lib/imageUtils'

const router = useRouter()
const projectStore = useProjectStore()
const materialStore = useMaterialStore()
const equipmentStore = useEquipmentStore()
const taskStore = useTaskStore()
const locationStore = useStorageLocationStore()
const { knownPersons } = useKnownPersons()

const name = ref('')
const description = ref('')
const category = ref('construction')
const customCategoryName = ref('')
const storageLocationId = ref('')
const participants = ref<string[]>([])
const responsible = ref('')
const newParticipant = ref('')

const locationOptions = computed(() =>
  locationStore.locations.map(l => ({ value: l.id, label: l.name }))
)
const isSubmitting = ref(false)
const showCustomCategoryModal = ref(false)
const newCategoryName = ref('')
const projectImageUrl = ref<string | undefined>()
const projectImageInput = ref<HTMLInputElement | null>(null)

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
  unit: '',
  owner: '',
  storageLocationId: ''
})

const categoryIcons: Record<string, typeof Building2> = {
  construction: Building2,
  exploration: Compass,
  tools: Hammer,
  custom: FolderPlus
}

function getCategoryIcon(key: string) {
  if (key === 'custom') return FolderPlus
  return categoryIcons[key] || FolderPlus
}

// Categories: all known ones (defaults + custom from localStorage + derived from projects) + "Neue Kategorie"
const displayCategories = computed(() => {
  return { ...projectStore.allCategories, custom: 'Neue Kategorie' }
})

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

const unitGroups = computed(() =>
  UNIT_GROUPS.map(group => ({
    label: group.label,
    options: group.units.map(unit => ({ value: unit, label: unit }))
  }))
)

function triggerImageUpload() {
  projectImageInput.value?.click()
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  projectImageUrl.value = await compressImage(file)
  input.value = ''
}

function removeImage() {
  projectImageUrl.value = undefined
}

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
    newCategoryName.value = ''
    showCustomCategoryModal.value = false
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
  newItem.value = { type: 'material', name: '', specifications: '', unit: '', owner: '', storageLocationId: storageLocationId.value }
  showNewItemModal.value = true
}

async function createNewItem() {
  if (!newItem.value.name.trim()) return

  if (newItem.value.type === 'material') {
    const material = await materialStore.createMaterial({
      name: newItem.value.name.trim(),
      specifications: newItem.value.specifications.trim() || undefined,
      unit: newItem.value.unit || undefined,
      owner: newItem.value.owner.trim() || undefined,
      storageLocationId: newItem.value.storageLocationId || undefined,
      currentStock: 0
    })

    if (material) {
      selectedItems.value.push({
        type: 'material',
        itemId: material.id,
        name: material.name,
        specifications: material.specifications,
        amount: itemAmount.value || 1,
        unit: material.unit
      })
      showNewItemModal.value = false
      showItemModal.value = false
    }
  } else {
    const equipment = await equipmentStore.createEquipment({
      name: newItem.value.name.trim(),
      specifications: newItem.value.specifications.trim() || undefined,
      owner: newItem.value.owner.trim() || undefined,
      storageLocationId: newItem.value.storageLocationId || undefined,
      currentStock: 0
    })

    if (equipment) {
      selectedItems.value.push({
        type: 'equipment',
        itemId: equipment.id,
        name: equipment.name,
        specifications: equipment.specifications,
        amount: itemAmount.value || 1
      })
      showNewItemModal.value = false
      showItemModal.value = false
    }
  }
}

// Task planning
const plannedTasks = ref<PlannedTask[]>([])
const showTaskModal = ref(false)
const showEditTaskModal = ref(false)
const editingTaskIndex = ref<number | null>(null)
const taskForm = ref({ title: '', duration: 0, manpower: 1 })
const taskAssignees = ref<string[]>([])
const taskAssignee = ref('')
const showTaskTemplates = ref(false)

// Task assignee suggestions: known persons minus already assigned
const taskAssigneeSuggestions = computed(() =>
  knownPersons.value.filter(p => !taskAssignees.value.includes(p))
)

// Task templates: completed tasks from all projects (unique by title)
const taskTemplates = computed(() => {
  const seen = new Set<string>()
  return taskStore.tasks
    .filter(t => t.isCompleted)
    .filter(t => {
      const key = t.title.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.title.localeCompare(b.title))
})

function applyTaskTemplate(template: { title: string; description?: string; duration?: number; manpower: number; assignees?: string[] }) {
  taskForm.value = {
    title: template.title,
    duration: template.duration ?? 0,
    manpower: template.manpower
  }
  taskAssignees.value = template.assignees ? [...template.assignees] : []
  showTaskTemplates.value = false
}

function addTaskAssignee() {
  const name = taskAssignee.value.trim()
  if (name && !taskAssignees.value.includes(name)) {
    taskAssignees.value.push(name)
  }
  taskAssignee.value = ''
}

function removeTaskAssignee(index: number) {
  taskAssignees.value.splice(index, 1)
}

function openAddTaskModal() {
  taskForm.value = { title: '', duration: 0, manpower: 1 }
  taskAssignees.value = []
  taskAssignee.value = ''
  showTaskTemplates.value = false
  showTaskModal.value = true
}

function confirmAddTask() {
  if (!taskForm.value.title.trim()) return
  const assignees = taskAssignees.value.length > 0 ? [...taskAssignees.value] : undefined
  plannedTasks.value.push({
    title: taskForm.value.title.trim(),
    duration: taskForm.value.duration,
    manpower: assignees ? assignees.length : taskForm.value.manpower,
    assignees
  })
  showTaskModal.value = false
}

function openEditTaskModal(index: number) {
  const task = plannedTasks.value[index]
  if (!task) return
  editingTaskIndex.value = index
  taskForm.value = { title: task.title, duration: task.duration ?? 0, manpower: task.manpower }
  taskAssignees.value = task.assignees ? [...task.assignees] : []
  taskAssignee.value = ''
  showEditTaskModal.value = true
}

function confirmEditTask() {
  if (editingTaskIndex.value === null || !taskForm.value.title.trim()) return
  const assignees = taskAssignees.value.length > 0 ? [...taskAssignees.value] : undefined
  plannedTasks.value[editingTaskIndex.value] = {
    title: taskForm.value.title.trim(),
    duration: taskForm.value.duration,
    manpower: assignees ? assignees.length : taskForm.value.manpower,
    assignees
  }
  showEditTaskModal.value = false
  editingTaskIndex.value = null
}

function removeTask(index: number) {
  plannedTasks.value.splice(index, 1)
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min.`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} Std. ${m} Min.` : `${h} Std.`
}

// Participant suggestions: known persons minus already added
const participantSuggestions = computed(() =>
  knownPersons.value.filter(p => !participants.value.includes(p))
)

function addParticipant() {
  const name = newParticipant.value.trim()
  if (name && !participants.value.includes(name)) {
    participants.value.push(name)
  }
  newParticipant.value = ''
}

function removeParticipant(index: number) {
  participants.value.splice(index, 1)
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
      customCategoryName: customCategoryName.value || undefined,
      storageLocationId: storageLocationId.value || undefined,
      participants: participants.value.length > 0 ? participants.value : undefined,
      responsible: responsible.value.trim() || undefined,
      imageUrl: projectImageUrl.value
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

      // Create planned tasks
      for (const task of plannedTasks.value) {
        await taskStore.createTask({
          projectId: project.id,
          title: task.title,
          duration: task.duration,
          manpower: task.manpower,
          assignees: task.assignees
        })
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

      <!-- Project Image -->
      <div>
        <label class="text-sm font-medium text-earth-200 mb-3 block">
          Projektbild (optional)
        </label>
        <input
          ref="projectImageInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />
        <div v-if="projectImageUrl" class="relative rounded-xl overflow-hidden">
          <img :src="projectImageUrl" alt="Projektbild" class="w-full h-40 object-cover" />
          <button
            type="button"
            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            @click="removeImage"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        <button
          v-else
          type="button"
          class="w-full flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-deep-100 text-earth-400 hover:border-forest-500 hover:text-forest-400 transition-colors"
          @click="triggerImageUpload"
        >
          <ImagePlus class="w-6 h-6" />
          <span>Bild hochladen</span>
        </button>
      </div>

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

      <!-- Planned Tasks -->
      <div>
        <label class="text-sm font-medium text-earth-200 mb-3 block">
          Geplante Aufgaben
        </label>

        <!-- Task list -->
        <div v-if="plannedTasks.length > 0" class="space-y-2 mb-3">
          <BaseCard
            v-for="(task, index) in plannedTasks"
            :key="index"
            class="!p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-earth-100 truncate">{{ task.title }}</p>
                <div class="flex items-center gap-2 text-sm text-earth-400 flex-wrap">
                  <span v-if="task.duration" class="flex items-center gap-1">
                    <Clock class="w-3.5 h-3.5" />
                    {{ formatDuration(task.duration) }}
                  </span>
                  <template v-if="task.assignees && task.assignees.length > 0">
                    <span
                      v-for="person in task.assignees"
                      :key="person"
                      class="inline-flex items-center px-2 py-0.5 rounded-full bg-forest-900/40 text-forest-300 text-xs border border-forest-700/40"
                    >
                      {{ person }}
                    </span>
                  </template>
                  <span v-else-if="task.manpower > 1" class="flex items-center gap-1">
                    <Users class="w-3.5 h-3.5" />
                    {{ task.manpower }} Personen
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="p-2 rounded-lg text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
                  @click="openEditTaskModal(index)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                  @click="removeTask(index)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Add task button -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-deep-100 text-earth-400 hover:border-forest-500 hover:text-forest-400 transition-colors"
          @click="openAddTaskModal"
        >
          <Plus class="w-5 h-5" />
          <span>Aufgabe hinzufügen</span>
        </button>
      </div>

      <!-- Category -->
      <div>
        <label class="text-sm font-medium text-earth-200 mb-3 block">
          Kategorie
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(label, key) in displayCategories"
            :key="key"
            type="button"
            :class="[
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              category === key
                ? 'border-forest-500 bg-forest-900/30'
                : 'border-deep-100 bg-deep-200 hover:border-deep-50'
            ]"
            @click="selectCategory(key)"
          >
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                category === key ? 'bg-forest-600' : 'bg-deep-100'
              ]"
            >
              <component
                :is="getCategoryIcon(key)"
                :class="[
                  'w-5 h-5',
                  category === key ? 'text-white' : 'text-earth-400'
                ]"
              />
            </div>
            <span
              :class="[
                'text-sm font-medium text-left',
                category === key ? 'text-forest-300' : 'text-earth-300'
              ]"
            >
              {{ label }}
            </span>
          </button>
        </div>
      </div>

      <!-- Storage Location -->
      <BaseSelect
        v-model="storageLocationId"
        label="Lagerort (optional)"
        :options="locationOptions"
        empty-label="Kein Lagerort"
      />

      <!-- Responsible -->
      <BaseComboInput
        v-model="responsible"
        :suggestions="knownPersons"
        label="Idee / Verantwortlich (optional)"
        placeholder="z.B. Moritz"
      />

      <!-- Participants -->
      <div>
        <label class="text-sm font-medium text-earth-200 mb-3 block">
          Beteiligte (optional)
        </label>
        <!-- Added participants as badges -->
        <div v-if="participants.length > 0" class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="(person, i) in participants"
            :key="i"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-900/40 text-forest-300 text-sm border border-forest-700/40"
          >
            {{ person }}
            <button
              type="button"
              class="text-forest-500 hover:text-red-400 transition-colors"
              @click="removeParticipant(i)"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
        <!-- Add participant input -->
        <div class="flex gap-2">
          <div class="flex-1">
            <BaseComboInput
              v-model="newParticipant"
              :suggestions="participantSuggestions"
              placeholder="Name eingeben..."
              @enter="addParticipant"
            />
          </div>
          <BaseButton
            type="button"
            :disabled="!newParticipant.trim()"
            @click="addParticipant"
          >
            <Plus class="w-5 h-5" />
          </BaseButton>
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
        <BaseNumberStepper
          v-model="itemAmount"
          :min="1"
          label="Menge"
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
          :groups="unitGroups"
          empty-label="Keine Einheit"
        />

        <BaseComboInput
          v-model="newItem.owner"
          :suggestions="knownPersons"
          label="Eigentümer (optional)"
          placeholder="z.B. Moritz, Tim"
        />

        <BaseSelect
          v-model="newItem.storageLocationId"
          label="Lagerort (optional)"
          :options="locationOptions"
          empty-label="Kein Lagerort"
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
      <BaseNumberStepper
        v-model="editAmount"
        :min="1"
        label="Menge"
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

    <!-- Add Task Modal -->
    <BaseModal
      :open="showTaskModal"
      title="Aufgabe hinzufügen"
      @close="showTaskModal = false"
    >
      <form @submit.prevent="confirmAddTask" class="space-y-4">
        <!-- Task templates button -->
        <div v-if="taskTemplates.length > 0 && !showTaskTemplates">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-deep-100 text-earth-400 hover:border-forest-500 hover:text-forest-400 transition-colors"
            @click="showTaskTemplates = true"
          >
            <Copy class="w-4 h-4" />
            <span>Aus früherer Aufgabe übernehmen</span>
          </button>
        </div>

        <!-- Template list -->
        <div v-if="showTaskTemplates" class="max-h-40 overflow-y-auto space-y-1">
          <button
            v-for="tpl in taskTemplates"
            :key="tpl.id"
            type="button"
            class="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-deep-100 bg-deep-200 hover:border-forest-500 transition-all text-left"
            @click="applyTaskTemplate(tpl)"
          >
            <CheckCircle2 class="w-4 h-4 text-green-400 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-earth-200 truncate">{{ tpl.title }}</p>
              <div class="flex items-center gap-2 text-xs text-earth-500">
                <span v-if="tpl.duration">{{ formatDuration(tpl.duration) }}</span>
                <span v-if="tpl.assignees && tpl.assignees.length > 0">{{ tpl.assignees.join(', ') }}</span>
                <span v-else-if="tpl.manpower > 1">{{ tpl.manpower }} Pers.</span>
              </div>
            </div>
          </button>
          <button
            type="button"
            class="w-full text-center text-sm text-earth-500 py-2"
            @click="showTaskTemplates = false"
          >
            Abbrechen
          </button>
        </div>

        <BaseInput
          v-model="taskForm.title"
          label="Aufgabe"
          placeholder="z.B. Holz sammeln, Stöcke zuschneiden"
          required
        />

        <!-- Assignees -->
        <div>
          <label class="text-sm font-medium text-earth-200 mb-2 block">Zugewiesen an (optional)</label>
          <div v-if="taskAssignees.length > 0" class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="(person, i) in taskAssignees"
              :key="i"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-900/40 text-forest-300 text-sm border border-forest-700/40"
            >
              {{ person }}
              <button
                type="button"
                class="text-forest-500 hover:text-red-400 transition-colors"
                @click="removeTaskAssignee(i)"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <BaseComboInput
                v-model="taskAssignee"
                :suggestions="taskAssigneeSuggestions"
                placeholder="Name eingeben..."
                @enter="addTaskAssignee"
              />
            </div>
            <BaseButton
              type="button"
              :disabled="!taskAssignee.trim()"
              @click="addTaskAssignee"
            >
              <Plus class="w-5 h-5" />
            </BaseButton>
          </div>
        </div>

        <BaseNumberStepper
          v-model="taskForm.duration"
          :min="0"
          :step="15"
          label="Dauer (Minuten, optional)"
        />
        <div :class="{ 'opacity-40 pointer-events-none': taskAssignees.length > 0 }">
          <BaseNumberStepper
            v-model="taskForm.manpower"
            :min="1"
            label="Mannstärke"
          />
          <p v-if="taskAssignees.length > 0" class="text-xs text-earth-500 mt-1">
            Automatisch: {{ taskAssignees.length }}
          </p>
        </div>
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showTaskModal = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!taskForm.title.trim()"
            @click="confirmAddTask"
          >
            Hinzufügen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit Task Modal -->
    <BaseModal
      :open="showEditTaskModal"
      title="Aufgabe bearbeiten"
      @close="showEditTaskModal = false"
    >
      <form @submit.prevent="confirmEditTask" class="space-y-4">
        <BaseInput
          v-model="taskForm.title"
          label="Aufgabe"
          placeholder="z.B. Holz sammeln"
          required
        />

        <!-- Assignees -->
        <div>
          <label class="text-sm font-medium text-earth-200 mb-2 block">Zugewiesen an (optional)</label>
          <div v-if="taskAssignees.length > 0" class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="(person, i) in taskAssignees"
              :key="i"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-900/40 text-forest-300 text-sm border border-forest-700/40"
            >
              {{ person }}
              <button
                type="button"
                class="text-forest-500 hover:text-red-400 transition-colors"
                @click="removeTaskAssignee(i)"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <BaseComboInput
                v-model="taskAssignee"
                :suggestions="taskAssigneeSuggestions"
                placeholder="Name eingeben..."
                @enter="addTaskAssignee"
              />
            </div>
            <BaseButton
              type="button"
              :disabled="!taskAssignee.trim()"
              @click="addTaskAssignee"
            >
              <Plus class="w-5 h-5" />
            </BaseButton>
          </div>
        </div>

        <BaseNumberStepper
          v-model="taskForm.duration"
          :min="0"
          :step="15"
          label="Dauer (Minuten, optional)"
        />
        <div :class="{ 'opacity-40 pointer-events-none': taskAssignees.length > 0 }">
          <BaseNumberStepper
            v-model="taskForm.manpower"
            :min="1"
            label="Mannstärke"
          />
          <p v-if="taskAssignees.length > 0" class="text-xs text-earth-500 mt-1">
            Automatisch: {{ taskAssignees.length }}
          </p>
        </div>
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showEditTaskModal = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!taskForm.title.trim()"
            @click="confirmEditTask"
          >
            Speichern
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
