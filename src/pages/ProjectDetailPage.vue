<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft, Plus, Trash2, CheckCircle2, Edit3, Save, X,
  Building2, Compass, Hammer, FolderPlus, Package, Clock, Users, StickyNote, Image
} from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useTaskStore } from '@entities/task/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import type { ProjectStatus } from '@entities/project/model/types'
import { PROJECT_STATUS_LABELS } from '@entities/project/model/types'
import type { Task } from '@entities/task/model/types'
import {
  BaseButton, BaseCard, BaseBadge, BaseProgress, BaseModal,
  BaseInput, BaseTextarea, BaseCheckbox, BaseEmptyState, BaseSelect
} from '@shared/ui'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const materialStore = useMaterialStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectStore.projectById(projectId.value))
const tasks = computed(() => taskStore.tasksByProject(projectId.value))
const requirements = computed(() => materialStore.requirementsByProject(projectId.value))

// Inline editing states
const editingField = ref<string | null>(null)
const editName = ref('')
const editDescription = ref('')
const editNotes = ref('')

// Modals
const showAddTask = ref(false)
const showEditTask = ref(false)
const showDeleteConfirm = ref(false)
const showAddMaterial = ref(false)
const showEditMaterial = ref(false)
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

// New material requirement
const selectedMaterialId = ref('')
const requiredAmount = ref(1)

// Edit material requirement
const editingReqId = ref('')
const editReqAmount = ref(1)

// Image upload
const imageInput = ref<HTMLInputElement | null>(null)

const categoryIcons: Record<string, typeof Building2> = {
  construction: Building2,
  exploration: Compass,
  tools: Hammer,
  custom: FolderPlus
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || FolderPlus
}

const availableMaterials = computed(() => {
  return materialStore.materials.map(m => ({
    value: m.id,
    label: `${m.name} (${m.currentStock} verfügbar)`
  }))
})

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

async function addMaterialRequirement() {
  if (!selectedMaterialId.value || requiredAmount.value <= 0) return

  const material = materialStore.materialById(selectedMaterialId.value)
  if (!material || material.currentStock < requiredAmount.value) {
    return
  }

  await materialStore.createRequirement({
    projectId: projectId.value,
    materialId: selectedMaterialId.value,
    requiredAmount: requiredAmount.value
  })

  selectedMaterialId.value = ''
  requiredAmount.value = 1
  showAddMaterial.value = false
}

function startEditMaterial(reqId: string, amount: number) {
  editingReqId.value = reqId
  editReqAmount.value = amount
  showEditMaterial.value = true
}

async function saveEditMaterial() {
  if (editReqAmount.value <= 0) return
  await materialStore.updateRequirement(editingReqId.value, {
    requiredAmount: editReqAmount.value
  })
  showEditMaterial.value = false
}

async function deleteRequirement(reqId: string) {
  await materialStore.deleteRequirement(reqId)
}

async function deleteProject() {
  if (isDeleting.value) return
  isDeleting.value = true

  try {
    const success = await projectStore.deleteProject(projectId.value)
    if (success) {
      router.replace('/')
    }
  } finally {
    isDeleting.value = false
  }
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

  // Convert to base64 for local storage
  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target?.result as string
    await projectStore.updateProject(projectId.value, { imageUrl: base64 })
  }
  reader.readAsDataURL(file)
  input.value = ''
}

async function removeImage() {
  await projectStore.updateProject(projectId.value, { imageUrl: undefined })
}
</script>

<template>
  <div v-if="project" class="pb-6">
    <!-- Header image -->
    <div
      class="h-44 relative flex items-center justify-center bg-deep-100"
      :style="project.imageUrl ? { backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
    >
      <!-- Overlay for better button visibility when image is present -->
      <div v-if="project.imageUrl" class="absolute inset-0 bg-black/30" />

      <!-- Back button - markanter Pfeil -->
      <button
        class="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-deep-200/90 text-earth-100 hover:bg-deep-100 transition-colors safe-top"
        @click="goBack"
      >
        <ChevronLeft class="w-7 h-7" stroke-width="3" />
      </button>

      <!-- Top right buttons: Delete + Image -->
      <div class="absolute top-4 right-4 flex gap-2 safe-top z-10">
        <button
          class="w-10 h-10 flex items-center justify-center rounded-full bg-deep-200/90 text-earth-300 hover:bg-deep-100 hover:text-earth-100 transition-colors"
          @click="triggerImageUpload"
          title="Bild hochladen"
        >
          <Image class="w-5 h-5" />
        </button>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-full bg-red-900/70 text-red-300 hover:bg-red-800 hover:text-red-200 transition-colors"
          @click="showDeleteConfirm = true"
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
        @change="handleImageUpload"
      />

      <!-- Category icon (only when no image) -->
      <component
        v-if="!project.imageUrl"
        :is="getCategoryIcon(project.category)"
        class="w-16 h-16 text-earth-500/60"
      />

      <!-- Remove image button (when image present) -->
      <button
        v-if="project.imageUrl"
        class="absolute bottom-3 right-3 px-2 py-1 text-xs rounded bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
        @click="removeImage"
      >
        Bild entfernen
      </button>
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

      <!-- Materials section -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-earth-100">Materialien</h2>
          <BaseButton size="sm" @click="showAddMaterial = true">
            <Plus class="w-4 h-4" />
            Zuweisen
          </BaseButton>
        </div>

        <BaseCard v-if="requirements.length > 0" padding="none">
          <div class="divide-y divide-deep-100">
            <div
              v-for="req in requirements"
              :key="req.id"
              class="flex items-center justify-between px-4 py-3"
            >
              <span class="text-earth-200">{{ getMaterialName(req.materialId) }}</span>
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
                  @click="startEditMaterial(req.id, req.requiredAmount)"
                  title="Menge anpassen"
                >
                  <Edit3 class="w-5 h-5" />
                </button>
                <button
                  class="p-2 rounded text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                  @click="deleteRequirement(req.id)"
                  title="Entfernen"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseEmptyState
          v-else
          :icon="Package"
          title="Keine Materialien"
          description="Weise Materialien aus dem Lager zu."
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

    <!-- Add material modal -->
    <BaseModal
      :open="showAddMaterial"
      title="Material zuweisen"
      @close="showAddMaterial = false"
    >
      <div class="space-y-4">
        <BaseSelect
          v-model="selectedMaterialId"
          :options="availableMaterials"
          label="Material"
          placeholder="Material auswählen..."
        />
        <BaseInput
          v-model.number="requiredAmount"
          type="number"
          label="Benötigte Menge"
          placeholder="1"
        />
      </div>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showAddMaterial = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            full-width
            :disabled="!selectedMaterialId || requiredAmount <= 0"
            @click="addMaterialRequirement"
          >
            Zuweisen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit material requirement modal -->
    <BaseModal
      :open="showEditMaterial"
      title="Menge anpassen"
      @close="showEditMaterial = false"
    >
      <div class="space-y-4">
        <BaseInput
          v-model.number="editReqAmount"
          type="number"
          label="Benötigte Menge"
          placeholder="1"
        />
      </div>
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
            :disabled="editReqAmount <= 0"
            @click="saveEditMaterial"
          >
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
        Möchtest du das Projekt "{{ project.name }}" wirklich löschen?
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
