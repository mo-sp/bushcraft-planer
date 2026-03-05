<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, Edit3, Save, X,
  Building2, Compass, Hammer, FolderPlus, Package, Clock, Users, StickyNote
} from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useTaskStore } from '@entities/task/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import type { ProjectStatus } from '@entities/project/model/types'
import { PROJECT_STATUS_LABELS } from '@entities/project/model/types'
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

// Edit mode
const isEditing = ref(false)
const editName = ref('')
const editDescription = ref('')
const editNotes = ref('')

// Modals
const showAddTask = ref(false)
const showDeleteConfirm = ref(false)
const showAddMaterial = ref(false)
const isDeleting = ref(false)

// New task form
const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskDuration = ref<number | ''>('')
const newTaskManpower = ref(1)

// New material requirement
const selectedMaterialId = ref('')
const requiredAmount = ref(1)

const categoryIcons: Record<string, typeof Building2> = {
  construction: Building2,
  exploration: Compass,
  tools: Hammer,
  custom: FolderPlus
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || FolderPlus
}

// Status options are displayed as clickable buttons in the template

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

function startEditing() {
  if (!project.value) return
  editName.value = project.value.name
  editDescription.value = project.value.description
  editNotes.value = project.value.notes || ''
  isEditing.value = true
}

async function saveEditing() {
  if (!project.value) return
  await projectStore.updateProject(projectId.value, {
    name: editName.value,
    description: editDescription.value,
    notes: editNotes.value
  })
  isEditing.value = false
}

function cancelEditing() {
  isEditing.value = false
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

async function deleteTask(taskId: string) {
  await taskStore.deleteTask(taskId)
}

async function addMaterialRequirement() {
  if (!selectedMaterialId.value || requiredAmount.value <= 0) return

  const material = materialStore.materialById(selectedMaterialId.value)
  if (!material || material.currentStock < requiredAmount.value) {
    return // Not enough stock
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
</script>

<template>
  <div v-if="project" class="pb-6">
    <!-- Header image -->
    <div
      class="h-40 relative flex items-center justify-center"
      :style="{ backgroundColor: project.imagePlaceholder }"
    >
      <!-- Back button -->
      <button
        class="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 transition-colors safe-top"
        @click="goBack"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>

      <!-- Edit button -->
      <button
        v-if="!isEditing"
        class="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 transition-colors safe-top"
        @click="startEditing"
      >
        <Edit3 class="w-6 h-6" />
      </button>

      <!-- Save/Cancel buttons when editing -->
      <div v-else class="absolute top-4 right-4 flex gap-2 safe-top">
        <button
          class="p-2 rounded-full bg-green-600 text-white hover:bg-green-500 transition-colors"
          @click="saveEditing"
        >
          <Save class="w-6 h-6" />
        </button>
        <button
          class="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
          @click="cancelEditing"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Category icon -->
      <component
        :is="getCategoryIcon(project.category)"
        class="w-14 h-14 text-white/60"
      />
    </div>

    <!-- Content -->
    <div class="px-4 -mt-6 relative">
      <!-- Info card -->
      <BaseCard class="mb-4">
        <!-- Editable title -->
        <div v-if="isEditing" class="mb-4">
          <BaseInput v-model="editName" label="Projektname" />
        </div>
        <div v-else class="flex items-start justify-between gap-3 mb-2">
          <h1 class="text-xl font-bold text-earth-100">
            {{ project.name }}
          </h1>
        </div>

        <!-- Category -->
        <p class="text-sm text-forest-400 mb-2">
          {{ getCategoryName() }}
        </p>

        <!-- Status selector -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="(label, status) in PROJECT_STATUS_LABELS"
            :key="status"
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              project.status === status
                ? 'ring-2 ring-offset-2 ring-offset-deep-100'
                : ''
            ]"
            @click="setStatus(status as ProjectStatus)"
          >
            <BaseBadge :variant="getStatusVariant(status as ProjectStatus)">
              {{ label }}
            </BaseBadge>
          </button>
        </div>

        <!-- Description -->
        <div v-if="isEditing" class="mb-4">
          <BaseTextarea v-model="editDescription" label="Beschreibung" :rows="3" />
        </div>
        <p v-else-if="project.description" class="text-earth-300 mb-4">
          {{ project.description }}
        </p>

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
        <div v-if="isEditing">
          <BaseTextarea
            v-model="editNotes"
            placeholder="Ideen, Skizzen, Gedanken..."
            :rows="6"
          />
        </div>
        <div v-else-if="project.notes" class="text-earth-300 whitespace-pre-wrap">
          {{ project.notes }}
        </div>
        <p v-else class="text-earth-500 italic">
          Noch keine Notizen. Tippe auf Bearbeiten um Notizen hinzuzufügen.
        </p>
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
                <button
                  class="p-2 rounded-lg text-earth-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                  @click="deleteTask(task.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
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
              <div class="flex items-center gap-3">
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
                  class="p-1 rounded text-earth-500 hover:text-red-400 transition-colors"
                  @click="deleteRequirement(req.id)"
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
          description="Weise Materialien aus dem Lager zu."
        />
      </div>

      <!-- Delete button -->
      <BaseButton
        variant="danger"
        full-width
        @click="showDeleteConfirm = true"
      >
        <Trash2 class="w-5 h-5" />
        Projekt löschen
      </BaseButton>
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
