<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft, Plus, Trash2, CheckCircle2, Edit3, Save, X,
  Building2, Compass, Hammer, FolderPlus, Package, Backpack, Clock, Users, StickyNote, Image, PenLine, Upload, Search
} from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useTaskStore } from '@entities/task/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { UNIT_GROUPS } from '@entities/material/model/types'
import type { ProjectStatus } from '@entities/project/model/types'
import { PROJECT_STATUS_LABELS } from '@entities/project/model/types'
import type { Task } from '@entities/task/model/types'
import {
  BaseButton, BaseCard, BaseBadge, BaseProgress, BaseModal,
  BaseInput, BaseTextarea, BaseCheckbox, BaseEmptyState, BaseSelect, BaseNumberStepper
} from '@shared/ui'
import { compressImage } from '@shared/lib/imageUtils'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const materialStore = useMaterialStore()
const equipmentStore = useEquipmentStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectStore.projectById(projectId.value))
const tasks = computed(() => taskStore.tasksByProject(projectId.value))
const materialReqs = computed(() => materialStore.requirementsByProject(projectId.value))
const equipmentReqs = computed(() => equipmentStore.requirementsByProject(projectId.value))

// Inline editing states
const editingField = ref<string | null>(null)
const editName = ref('')
const editDescription = ref('')
const editNotes = ref('')

// Modals
const showAddTask = ref(false)
const showEditTask = ref(false)
const showDeleteConfirm = ref(false)
const showAddItem = ref(false)
const showNewItemModal = ref(false)
const showEditReq = ref(false)
const isDeleting = ref(false)

// New task form
const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskDuration = ref<number | ''>('')
const newTaskManpower = ref(1)

// Edit task form
const editingTaskId = ref('')
const editTaskTitle = ref('')
const editTaskDescription = ref('')
const editTaskDuration = ref<number | ''>('')
const editTaskManpower = ref(1)

// Item selection (materials + equipment)
type ItemType = 'material' | 'equipment'
const itemSearchQuery = ref('')
const selectedItemId = ref<string | null>(null)
const selectedItemType = ref<ItemType | null>(null)
const itemAmount = ref(1)

// New item form
const newItem = ref({ type: 'material' as ItemType, name: '', specifications: '', unit: '' })

// Edit requirement
const editingReqId = ref('')
const editingReqType = ref<ItemType>('material')
const editReqAmount = ref(1)

// Combined items from both stores
const allItems = computed(() => {
  const materials = materialStore.materials.map(m => ({
    type: 'material' as ItemType, id: m.id, name: m.name,
    specifications: m.specifications, currentStock: m.currentStock, unit: m.unit
  }))
  const equipment = equipmentStore.equipment.map(e => ({
    type: 'equipment' as ItemType, id: e.id, name: e.name,
    specifications: e.specifications, currentStock: e.currentStock, unit: undefined
  }))
  return [...materials, ...equipment]
})

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

// Image upload
const imageInput = ref<HTMLInputElement | null>(null)
const sketchInput = ref<HTMLInputElement | null>(null)
const showSketchModal = ref(false)
const showImageModal = ref(false)

const categoryIcons: Record<string, typeof Building2> = {
  construction: Building2,
  exploration: Compass,
  tools: Hammer,
  custom: FolderPlus
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || FolderPlus
}

function getItemIcon(type: ItemType) {
  return type === 'material' ? Package : Backpack
}

function getItemDisplayName(item: { name: string; specifications?: string }) {
  return item.specifications ? `${item.name} (${item.specifications})` : item.name
}

onMounted(async () => {
  await taskStore.loadTasks(projectId.value)
})

watch(projectId, async (newId) => {
  if (newId) {
    await taskStore.loadTasks(newId)
  }
})

function goBack() {
  router.back()
}

// Inline editing functions
function startEditField(field: string) {
  if (!project.value) return
  editingField.value = field
  if (field === 'name') editName.value = project.value.name
  if (field === 'description') editDescription.value = project.value.description
  if (field === 'notes') editNotes.value = project.value.notes || ''
}

async function saveField(field: string) {
  if (!project.value) return
  const updates: Record<string, string> = {}
  if (field === 'name') updates.name = editName.value
  if (field === 'description') updates.description = editDescription.value
  if (field === 'notes') updates.notes = editNotes.value
  await projectStore.updateProject(projectId.value, updates)
  editingField.value = null
}

function cancelEdit() {
  editingField.value = null
}

async function setStatus(status: ProjectStatus) {
  await projectStore.setProjectStatus(projectId.value, status)
}

async function toggleTask(taskId: string) {
  await taskStore.toggleTask(taskId)
}

function resetTaskForm() {
  newTaskTitle.value = ''
  newTaskDescription.value = ''
  newTaskDuration.value = ''
  newTaskManpower.value = 1
}

async function addTask() {
  if (!newTaskTitle.value.trim()) return

  await taskStore.createTask({
    projectId: projectId.value,
    title: newTaskTitle.value.trim(),
    description: newTaskDescription.value.trim() || undefined,
    duration: newTaskDuration.value || undefined,
    manpower: newTaskManpower.value
  })

  resetTaskForm()
  showAddTask.value = false
}

function startEditTask(task: Task) {
  editingTaskId.value = task.id
  editTaskTitle.value = task.title
  editTaskDescription.value = task.description || ''
  editTaskDuration.value = task.duration || ''
  editTaskManpower.value = task.manpower || 1
  showEditTask.value = true
}

async function saveEditTask() {
  if (!editTaskTitle.value.trim()) return
  await taskStore.updateTask(editingTaskId.value, {
    title: editTaskTitle.value.trim(),
    description: editTaskDescription.value.trim() || undefined,
    duration: editTaskDuration.value || undefined,
    manpower: editTaskManpower.value
  })
  showEditTask.value = false
}

async function deleteTask(taskId: string) {
  await taskStore.deleteTask(taskId)
}

// Item selection functions
function openAddItem() {
  itemSearchQuery.value = ''
  selectedItemId.value = null
  selectedItemType.value = null
  itemAmount.value = 1
  showAddItem.value = true
}

function selectItem(type: ItemType, id: string) {
  selectedItemType.value = type
  selectedItemId.value = id
}

async function confirmAddItem() {
  if (!selectedItemId.value || !selectedItemType.value || itemAmount.value <= 0) return

  if (selectedItemType.value === 'material') {
    // Check if already assigned
    const existing = materialReqs.value.find(r => r.materialId === selectedItemId.value)
    if (existing) {
      await materialStore.updateRequirement(existing.id, {
        requiredAmount: existing.requiredAmount + itemAmount.value
      })
    } else {
      await materialStore.createRequirement({
        projectId: projectId.value,
        materialId: selectedItemId.value,
        requiredAmount: itemAmount.value
      })
    }
  } else {
    const existing = equipmentReqs.value.find(r => r.equipmentId === selectedItemId.value)
    if (existing) {
      await equipmentStore.updateRequirement(existing.id, {
        requiredAmount: existing.requiredAmount + itemAmount.value
      })
    } else {
      await equipmentStore.createRequirement({
        projectId: projectId.value,
        equipmentId: selectedItemId.value,
        requiredAmount: itemAmount.value
      })
    }
  }

  showAddItem.value = false
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

function startEditReq(reqId: string, type: ItemType, amount: number) {
  editingReqId.value = reqId
  editingReqType.value = type
  editReqAmount.value = amount
  showEditReq.value = true
}

async function saveEditReq() {
  if (editReqAmount.value <= 0) return
  if (editingReqType.value === 'material') {
    await materialStore.updateRequirement(editingReqId.value, { requiredAmount: editReqAmount.value })
  } else {
    await equipmentStore.updateRequirement(editingReqId.value, { requiredAmount: editReqAmount.value })
  }
  showEditReq.value = false
}

async function deleteReq(reqId: string, type: ItemType) {
  if (type === 'material') {
    await materialStore.deleteRequirement(reqId)
  } else {
    await equipmentStore.deleteRequirement(reqId)
  }
}

function getEquipmentName(id: string): string {
  return equipmentStore.equipmentById(id)?.name ?? 'Unbekannt'
}

function getEquipmentStock(id: string): number {
  return equipmentStore.equipmentById(id)?.currentStock ?? 0
}

async function deleteProject() {
  if (isDeleting.value) return
  isDeleting.value = true
  showDeleteConfirm.value = false

  const id = projectId.value
  router.replace('/')
  await projectStore.deleteProject(id)
}

function getStatusVariant(status: ProjectStatus) {
  switch (status) {
    case 'planned':
      return 'default'
    case 'in_progress':
      return 'warning'
    case 'completed':
      return 'success'
  }
}

function getMaterialName(materialId: string): string {
  const material = materialStore.materialById(materialId)
  return material?.name ?? 'Unbekannt'
}

function getMaterialStock(materialId: string): number {
  const material = materialStore.materialById(materialId)
  return material?.currentStock ?? 0
}

function getMaterialUnit(materialId: string): string {
  const material = materialStore.materialById(materialId)
  return material?.unit ?? ''
}

function getCategoryName(): string {
  if (!project.value) return ''
  return projectStore.getCategoryName(project.value.category, project.value.customCategoryName)
}

function formatDuration(minutes?: number): string {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} Min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Image handling
function triggerImageUpload() {
  imageInput.value?.click()
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const compressed = await compressImage(file)
  await projectStore.updateProject(projectId.value, { imageUrl: compressed })
  input.value = ''
}

async function removeImage() {
  await projectStore.updateProject(projectId.value, { imageUrl: undefined })
}

// Sketch handling
function triggerSketchUpload() {
  sketchInput.value?.click()
}

async function handleSketchUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const compressed = await compressImage(file)
  await projectStore.updateProject(projectId.value, { sketchUrl: compressed })
  input.value = ''
}

async function removeSketch() {
  await projectStore.updateProject(projectId.value, { sketchUrl: undefined })
}
</script>

<template>
  <div v-if="project" class="pb-6 relative">
    <!-- Subtle background image -->
    <div
      v-if="project.imageUrl"
      class="fixed inset-0 z-0 pointer-events-none"
      :style="{
        backgroundImage: `url(${project.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.04
      }"
    />

    <!-- Header area -->
    <div
      class="h-44 relative flex items-center justify-center"
      :class="project.imageUrl ? 'cursor-pointer' : 'bg-deep-100'"
      @click="project.imageUrl ? showImageModal = true : null"
    >

      <!-- Back button - markanter Pfeil -->
      <button
        class="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-deep-200/90 text-earth-100 hover:bg-deep-100 transition-colors safe-top z-10"
        @click.stop="goBack"
      >
        <ChevronLeft class="w-7 h-7" stroke-width="3" />
      </button>

      <!-- Top right buttons -->
      <div class="absolute top-4 right-4 flex gap-2 safe-top z-10">
        <button
          class="w-10 h-10 flex items-center justify-center rounded-full bg-deep-200/90 text-earth-300 hover:bg-deep-100 hover:text-earth-100 transition-colors"
          @click.stop="triggerImageUpload"
          title="Bild hochladen"
        >
          <Image class="w-5 h-5" />
        </button>
        <button
          v-if="project.imageUrl"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-deep-200/90 text-earth-300 hover:bg-deep-100 hover:text-red-300 transition-colors"
          @click.stop="removeImage"
          title="Bild entfernen"
        >
          <X class="w-5 h-5" />
        </button>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-full bg-red-900/70 text-red-300 hover:bg-red-800 hover:text-red-200 transition-colors"
          @click.stop="showDeleteConfirm = true"
          title="Projekt löschen"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>

      <!-- Hidden file input -->
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="hidden"
        @click.stop
        @change="handleImageUpload"
      />

      <!-- Category icon (only when no image) -->
      <component
        v-if="!project.imageUrl"
        :is="getCategoryIcon(project.category)"
        class="w-16 h-16 text-earth-500/60"
      />

    </div>

    <!-- Content -->
    <div class="px-4 -mt-6 relative">
      <!-- Info card -->
      <BaseCard class="mb-4">
        <!-- Editable title -->
        <div
          v-if="editingField === 'name'"
          class="mb-3"
        >
          <BaseInput v-model="editName" label="Projektname" />
          <div class="flex gap-2 mt-2 ml-5">
            <button class="p-2 rounded bg-green-600 text-white hover:bg-green-500" @click="saveField('name')">
              <Save class="w-5 h-5" />
            </button>
            <button class="p-2 rounded bg-deep-50 text-earth-300 hover:bg-deep-100" @click="cancelEdit">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          v-else
          class="mb-2 cursor-pointer hover:bg-deep-50/50 -mx-2 px-2 py-1 rounded transition-colors"
          @click="startEditField('name')"
        >
          <h1 class="text-xl font-bold text-earth-100">
            {{ project.name }}
          </h1>
        </div>

        <!-- Category (clickable für größere Schrift) -->
        <p class="text-base text-forest-400 mb-3 font-medium">
          {{ getCategoryName() }}
        </p>

        <!-- Status selector - aktive Phase deutlich hervorgehoben -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="(label, status) in PROJECT_STATUS_LABELS"
            :key="status"
            :class="[
              'px-4 py-2.5 rounded-full text-sm font-semibold transition-all border-2',
              project.status === status
                ? 'scale-110 shadow-lg border-forest-400'
                : 'opacity-50 hover:opacity-80 border-transparent'
            ]"
            @click="setStatus(status as ProjectStatus)"
          >
            <BaseBadge :variant="getStatusVariant(status as ProjectStatus)" size="md">
              {{ label }}
            </BaseBadge>
          </button>
        </div>

        <!-- Editable Description -->
        <div
          v-if="editingField === 'description'"
          class="mb-4"
        >
          <BaseTextarea v-model="editDescription" label="Beschreibung" :rows="3" />
          <div class="flex gap-2 mt-2 ml-5">
            <button class="p-2 rounded bg-green-600 text-white hover:bg-green-500" @click="saveField('description')">
              <Save class="w-5 h-5" />
            </button>
            <button class="p-2 rounded bg-deep-50 text-earth-300 hover:bg-deep-100" @click="cancelEdit">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          v-else
          class="mb-4 cursor-pointer hover:bg-deep-50/50 -mx-2 px-2 py-1 rounded transition-colors min-h-[2rem]"
          @click="startEditField('description')"
        >
          <p v-if="project.description" class="text-earth-300">
            {{ project.description }}
          </p>
          <p v-else class="text-earth-500 italic text-sm">
            Tippe um Beschreibung hinzuzufügen...
          </p>
        </div>

        <!-- Progress -->
        <div class="pt-4 border-t border-deep-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-earth-300">Fortschritt</span>
            <span class="text-sm text-earth-400">
              {{ taskStore.completedTasksCount(projectId) }}/{{ taskStore.totalTasksCount(projectId) }} Aufgaben
            </span>
          </div>
          <BaseProgress
            :value="taskStore.projectProgress(projectId)"
            color="status"
          />
        </div>
      </BaseCard>

      <!-- Notes section -->
      <BaseCard class="mb-4">
        <div class="flex items-center gap-2 mb-3">
          <StickyNote class="w-5 h-5 text-forest-400" />
          <h2 class="text-lg font-semibold text-earth-100">Notizen & Brainstorming</h2>
        </div>
        <div
          v-if="editingField === 'notes'"
        >
          <BaseTextarea
            v-model="editNotes"
            placeholder="Ideen, Skizzen, Gedanken..."
            :rows="6"
          />
          <div class="flex gap-2 mt-2 ml-5">
            <button class="p-2 rounded bg-green-600 text-white hover:bg-green-500" @click="saveField('notes')">
              <Save class="w-5 h-5" />
            </button>
            <button class="p-2 rounded bg-deep-50 text-earth-300 hover:bg-deep-100" @click="cancelEdit">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          v-else
          class="cursor-pointer hover:bg-deep-50/50 -mx-2 px-2 py-1 rounded transition-colors min-h-[3rem]"
          @click="startEditField('notes')"
        >
          <div v-if="project.notes" class="text-earth-300 whitespace-pre-wrap">
            {{ project.notes }}
          </div>
          <p v-else class="text-earth-500 italic">
            Tippe um Notizen hinzuzufügen...
          </p>
        </div>
      </BaseCard>

      <!-- Sketch section -->
      <BaseCard class="mb-4">
        <div class="flex items-center gap-2 mb-3">
          <PenLine class="w-5 h-5 text-forest-400" />
          <h2 class="text-lg font-semibold text-earth-100">Skizze</h2>
        </div>

        <input
          ref="sketchInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleSketchUpload"
        />

        <div v-if="project.sketchUrl" class="flex items-center gap-3">
          <button
            class="flex-1 flex items-center gap-3 p-3 rounded-xl bg-deep-200 hover:bg-deep-100 transition-colors text-left"
            @click="showSketchModal = true"
          >
            <PenLine class="w-5 h-5 text-forest-400 flex-shrink-0" />
            <span class="text-earth-200">Skizze anzeigen</span>
          </button>
          <button
            class="p-2.5 rounded-lg text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
            @click="triggerSketchUpload"
            title="Neue Skizze"
          >
            <Upload class="w-4 h-4" />
          </button>
          <button
            class="p-2.5 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
            @click="removeSketch"
            title="Skizze entfernen"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <button
          v-else
          class="w-full flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-deep-100 text-earth-400 hover:border-forest-500 hover:text-forest-400 transition-colors"
          @click="triggerSketchUpload"
        >
          <Upload class="w-5 h-5" />
          <span>Skizze hochladen</span>
        </button>
      </BaseCard>

      <!-- Tasks section -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-earth-100">Aufgaben</h2>
          <BaseButton size="sm" @click="showAddTask = true">
            <Plus class="w-4 h-4" />
            Hinzufügen
          </BaseButton>
        </div>

        <BaseCard v-if="tasks.length > 0" padding="none">
          <div class="divide-y divide-deep-100">
            <div
              v-for="task in tasks"
              :key="task.id"
              class="px-4 py-3"
            >
              <div class="flex items-start gap-3">
                <BaseCheckbox
                  :model-value="task.isCompleted"
                  size="lg"
                  class="mt-0.5"
                  @update:model-value="toggleTask(task.id)"
                />
                <div class="flex-1 min-w-0">
                  <p :class="['font-medium', task.isCompleted ? 'line-through text-earth-500' : 'text-earth-200']">
                    {{ task.title }}
                  </p>
                  <p v-if="task.description" class="text-sm text-earth-400 mt-0.5">
                    {{ task.description }}
                  </p>
                  <div v-if="task.duration || task.manpower > 1" class="flex items-center gap-3 mt-1">
                    <span v-if="task.duration" class="text-xs text-earth-500 flex items-center gap-1">
                      <Clock class="w-3 h-3" />
                      {{ formatDuration(task.duration) }}
                    </span>
                    <span v-if="task.manpower > 1" class="text-xs text-earth-500 flex items-center gap-1">
                      <Users class="w-3 h-3" />
                      {{ task.manpower }} Personen
                    </span>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button
                    class="p-2.5 rounded-lg text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
                    @click="startEditTask(task)"
                    title="Bearbeiten"
                  >
                    <Edit3 class="w-5 h-5" />
                  </button>
                  <button
                    class="p-2.5 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                    @click="deleteTask(task.id)"
                    title="Löschen"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseEmptyState
          v-else
          :icon="CheckCircle2"
          title="Keine Aufgaben"
          description="Füge Aufgaben hinzu um den Fortschritt zu verfolgen."
        />
      </div>

      <!-- Materials & Equipment section -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-earth-100">Material & Ausrüstung</h2>
          <BaseButton size="sm" @click="openAddItem">
            <Plus class="w-4 h-4" />
            Hinzufügen
          </BaseButton>
        </div>

        <BaseCard v-if="materialReqs.length > 0 || equipmentReqs.length > 0" padding="none">
          <div class="divide-y divide-deep-100">
            <!-- Material requirements -->
            <div
              v-for="req in materialReqs"
              :key="req.id"
              class="flex items-center justify-between px-4 py-3"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <Package class="w-4 h-4 text-forest-400 flex-shrink-0" />
                <span class="text-earth-200 truncate">{{ getMaterialName(req.materialId) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'font-medium tabular-nums',
                    getMaterialStock(req.materialId) >= req.requiredAmount
                      ? 'text-green-400'
                      : 'text-amber-400'
                  ]"
                >
                  {{ getMaterialStock(req.materialId) }}/{{ req.requiredAmount }}
                </span>
                <span v-if="getMaterialUnit(req.materialId)" class="text-earth-500 text-sm">
                  {{ getMaterialUnit(req.materialId) }}
                </span>
                <button
                  class="p-2 rounded text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
                  @click="startEditReq(req.id, 'material', req.requiredAmount)"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
                <button
                  class="p-2 rounded text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                  @click="deleteReq(req.id, 'material')"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Equipment requirements -->
            <div
              v-for="req in equipmentReqs"
              :key="req.id"
              class="flex items-center justify-between px-4 py-3"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <Backpack class="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span class="text-earth-200 truncate">{{ getEquipmentName(req.equipmentId) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'font-medium tabular-nums',
                    getEquipmentStock(req.equipmentId) >= req.requiredAmount
                      ? 'text-green-400'
                      : 'text-amber-400'
                  ]"
                >
                  {{ getEquipmentStock(req.equipmentId) }}/{{ req.requiredAmount }}
                </span>
                <span class="text-earth-500 text-sm">Stück</span>
                <button
                  class="p-2 rounded text-earth-500 hover:text-forest-400 hover:bg-forest-900/30 transition-colors"
                  @click="startEditReq(req.id, 'equipment', req.requiredAmount)"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
                <button
                  class="p-2 rounded text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                  @click="deleteReq(req.id, 'equipment')"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseEmptyState
          v-else
          :icon="Package"
          title="Keine Materialien"
          description="Füge Material oder Ausrüstung hinzu."
        />
      </div>
    </div>

    <!-- Add task modal -->
    <BaseModal
      :open="showAddTask"
      title="Neue Aufgabe"
      @close="showAddTask = false; resetTaskForm()"
    >
      <div class="space-y-4">
        <BaseInput
          v-model="newTaskTitle"
          label="Aufgabe"
          placeholder="Was soll erledigt werden?"
        />
        <BaseTextarea
          v-model="newTaskDescription"
          label="Details (optional)"
          placeholder="Weitere Informationen..."
          :rows="2"
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model.number="newTaskDuration"
            type="number"
            label="Dauer (Minuten)"
            placeholder="60"
          />
          <BaseInput
            v-model.number="newTaskManpower"
            type="number"
            label="Personen"
            placeholder="1"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showAddTask = false; resetTaskForm()"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!newTaskTitle.trim()"
            @click="addTask"
          >
            Hinzufügen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit task modal -->
    <BaseModal
      :open="showEditTask"
      title="Aufgabe bearbeiten"
      @close="showEditTask = false"
    >
      <div class="space-y-4">
        <BaseInput
          v-model="editTaskTitle"
          label="Aufgabe"
          placeholder="Was soll erledigt werden?"
        />
        <BaseTextarea
          v-model="editTaskDescription"
          label="Details (optional)"
          placeholder="Weitere Informationen..."
          :rows="2"
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model.number="editTaskDuration"
            type="number"
            label="Dauer (Minuten)"
            placeholder="60"
          />
          <BaseInput
            v-model.number="editTaskManpower"
            type="number"
            label="Personen"
            placeholder="1"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showEditTask = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!editTaskTitle.trim()"
            @click="saveEditTask"
          >
            Speichern
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Add item modal -->
    <BaseModal
      :open="showAddItem"
      title="Material / Ausrüstung hinzufügen"
      @close="showAddItem = false"
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
              <span class="text-earth-600">·</span>
              {{ item.type === 'material' ? 'Material' : 'Ausrüstung' }}
            </p>
          </div>
        </button>

        <div v-if="filteredItems.length === 0" class="text-center py-6 text-earth-500">
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

      <!-- Amount -->
      <div v-if="selectedItemId" class="mb-4">
        <BaseNumberStepper v-model="itemAmount" :min="1" label="Menge" />
      </div>

      <template #footer>
        <div class="flex gap-3">
          <BaseButton variant="secondary" full-width @click="showAddItem = false">
            Abbrechen
          </BaseButton>
          <BaseButton full-width :disabled="!selectedItemId" @click="confirmAddItem">
            Hinzufügen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- New item modal -->
    <BaseModal
      :open="showNewItemModal"
      title="Neu anlegen"
      @close="showNewItemModal = false"
    >
      <form @submit.prevent="createNewItem" class="space-y-4">
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
      </form>

      <template #footer>
        <div class="flex gap-3">
          <BaseButton variant="secondary" full-width @click="showNewItemModal = false">
            Abbrechen
          </BaseButton>
          <BaseButton full-width :disabled="!newItem.name.trim()" @click="createNewItem">
            Anlegen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit requirement modal -->
    <BaseModal
      :open="showEditReq"
      title="Menge anpassen"
      @close="showEditReq = false"
    >
      <BaseNumberStepper v-model="editReqAmount" :min="1" label="Benötigte Menge" />
      <template #footer>
        <div class="flex gap-3">
          <BaseButton variant="secondary" full-width @click="showEditReq = false">
            Abbrechen
          </BaseButton>
          <BaseButton full-width :disabled="editReqAmount <= 0" @click="saveEditReq">
            Speichern
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal
      :open="showDeleteConfirm"
      title="Projekt löschen?"
      @close="showDeleteConfirm = false"
    >
      <p class="text-earth-300">
        Möchtest du das Projekt "{{ project?.name }}" wirklich löschen?
        Diese Aktion kann nicht rückgängig gemacht werden.
      </p>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showDeleteConfirm = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            variant="danger"
            full-width
            :loading="isDeleting"
            @click="deleteProject"
          >
            Löschen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Image viewer modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showImageModal && project?.imageUrl"
          class="fixed inset-0 z-50 flex items-center justify-center p-6"
          @click.self="showImageModal = false"
        >
          <div class="absolute inset-0 bg-black/70" @click="showImageModal = false" />
          <div class="relative max-w-3xl max-h-[85vh] z-10">
            <img
              :src="project.imageUrl"
              alt="Projektbild"
              class="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <button
              class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-deep-200 text-earth-200 flex items-center justify-center hover:bg-deep-100 transition-colors shadow-lg border border-deep-50/30"
              @click="showImageModal = false"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Sketch viewer modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSketchModal && project?.sketchUrl"
          class="fixed inset-0 z-50 flex items-center justify-center p-6"
          @click.self="showSketchModal = false"
        >
          <div class="absolute inset-0 bg-black/70" @click="showSketchModal = false" />
          <div class="relative max-w-3xl max-h-[85vh] z-10">
            <img
              :src="project.sketchUrl"
              alt="Skizze"
              class="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <button
              class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-deep-200 text-earth-200 flex items-center justify-center hover:bg-deep-100 transition-colors shadow-lg border border-deep-50/30"
              @click="showSketchModal = false"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>

  <!-- Project not found -->
  <div v-else class="px-4 py-6">
    <BaseEmptyState
      :icon="FolderPlus"
      title="Projekt nicht gefunden"
      description="Das gesuchte Projekt existiert nicht oder wurde gelöscht."
    >
      <template #action>
        <BaseButton @click="router.push('/')">
          Zurück zur Übersicht
        </BaseButton>
      </template>
    </BaseEmptyState>
  </div>
</template>
