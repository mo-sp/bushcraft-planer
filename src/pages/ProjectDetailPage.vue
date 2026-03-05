<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, MoreVertical, Plus, Trash2, CheckCircle2,
  Tent, Flame, Hammer, Folder, Package
} from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useTaskStore } from '@entities/task/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import type { ProjectStatus } from '@entities/project/model/types'
import { PROJECT_STATUS_LABELS, PROJECT_CATEGORY_LABELS } from '@entities/project/model/types'
import {
  BaseButton, BaseCard, BaseBadge, BaseProgress, BaseModal,
  BaseInput, BaseCheckbox, BaseEmptyState
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

const showMenu = ref(false)
const showAddTask = ref(false)
const showDeleteConfirm = ref(false)
const newTaskTitle = ref('')
const isDeleting = ref(false)

const categoryIcons = {
  shelter: Tent,
  fire: Flame,
  tools: Hammer,
  custom: Folder
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

async function toggleTask(taskId: string) {
  await taskStore.toggleTask(taskId)
}

async function addTask() {
  if (!newTaskTitle.value.trim()) return

  await taskStore.createTask({
    projectId: projectId.value,
    title: newTaskTitle.value.trim()
  })

  newTaskTitle.value = ''
  showAddTask.value = false
}

async function deleteTask(taskId: string) {
  await taskStore.deleteTask(taskId)
}

async function setStatus(status: ProjectStatus) {
  await projectStore.setProjectStatus(projectId.value, status)
  showMenu.value = false
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
</script>

<template>
  <div v-if="project" class="pb-6">
    <!-- Header image -->
    <div
      class="h-48 relative flex items-center justify-center"
      :style="{ backgroundColor: project.imagePlaceholder }"
    >
      <!-- Back button -->
      <button
        class="absolute top-4 left-4 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors safe-top"
        @click="goBack"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>

      <!-- Menu button -->
      <button
        class="absolute top-4 right-4 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors safe-top"
        @click="showMenu = !showMenu"
      >
        <MoreVertical class="w-6 h-6" />
      </button>

      <!-- Category icon -->
      <component
        :is="categoryIcons[project.category]"
        class="w-16 h-16 text-white/60"
      />

      <!-- Menu dropdown -->
      <Transition
        enter-active-class="duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showMenu"
          class="absolute top-16 right-4 w-48 bg-white rounded-xl shadow-lg overflow-hidden z-10"
        >
          <button
            v-for="(label, status) in PROJECT_STATUS_LABELS"
            :key="status"
            class="w-full px-4 py-3 text-left text-sm hover:bg-earth-100 transition-colors flex items-center gap-2"
            @click="setStatus(status)"
          >
            <CheckCircle2
              v-if="project.status === status"
              class="w-4 h-4 text-forest-600"
            />
            <span :class="{ 'ml-6': project.status !== status }">
              {{ label }}
            </span>
          </button>
          <hr class="border-earth-200" />
          <button
            class="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            @click="showDeleteConfirm = true; showMenu = false"
          >
            <Trash2 class="w-4 h-4" />
            Löschen
          </button>
        </div>
      </Transition>
    </div>

    <!-- Content -->
    <div class="px-4 -mt-6 relative">
      <!-- Info card -->
      <BaseCard class="mb-4">
        <div class="flex items-start justify-between gap-3 mb-2">
          <h1 class="text-xl font-bold text-bark-800">
            {{ project.name }}
          </h1>
          <BaseBadge :variant="getStatusVariant(project.status)">
            {{ PROJECT_STATUS_LABELS[project.status] }}
          </BaseBadge>
        </div>

        <p class="text-bark-500 text-sm mb-1">
          {{ PROJECT_CATEGORY_LABELS[project.category] }}
        </p>

        <p v-if="project.description" class="text-bark-600 mt-3">
          {{ project.description }}
        </p>

        <!-- Progress -->
        <div class="mt-4 pt-4 border-t border-earth-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-bark-600">Fortschritt</span>
            <span class="text-sm text-bark-500">
              {{ taskStore.completedTasksCount(projectId) }}/{{ taskStore.totalTasksCount(projectId) }} Aufgaben
            </span>
          </div>
          <BaseProgress
            :value="taskStore.projectProgress(projectId)"
            color="status"
          />
        </div>
      </BaseCard>

      <!-- Tasks section -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-bark-800">Aufgaben</h2>
          <BaseButton size="sm" @click="showAddTask = true">
            <Plus class="w-4 h-4" />
            Hinzufügen
          </BaseButton>
        </div>

        <BaseCard v-if="tasks.length > 0" padding="none">
          <div class="divide-y divide-earth-200">
            <div
              v-for="task in tasks"
              :key="task.id"
              class="flex items-center gap-3 px-4 py-3 group"
            >
              <BaseCheckbox
                :model-value="task.isCompleted"
                :label="task.title"
                size="lg"
                class="flex-1"
                @update:model-value="toggleTask(task.id)"
              />
              <button
                class="p-2 rounded-lg text-bark-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                @click="deleteTask(task.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </BaseCard>

        <BaseEmptyState
          v-else
          :icon="CheckCircle2"
          title="Keine Aufgaben"
          description="Füge Aufgaben hinzu um deinen Fortschritt zu verfolgen."
        />
      </div>

      <!-- Materials section -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-bark-800">Materialien</h2>
        </div>

        <BaseCard v-if="requirements.length > 0" padding="none">
          <div class="divide-y divide-earth-200">
            <div
              v-for="req in requirements"
              :key="req.id"
              class="flex items-center justify-between px-4 py-3"
            >
              <span class="text-bark-700">{{ getMaterialName(req.materialId) }}</span>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'font-medium tabular-nums',
                    getMaterialStock(req.materialId) >= req.requiredAmount
                      ? 'text-green-600'
                      : 'text-amber-600'
                  ]"
                >
                  {{ getMaterialStock(req.materialId) }}/{{ req.requiredAmount }}
                </span>
                <span class="text-bark-400 text-sm">
                  {{ getMaterialUnit(req.materialId) }}
                </span>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseEmptyState
          v-else
          :icon="Package"
          title="Keine Materialien"
          description="Dieses Projekt hat noch keine Materialanforderungen."
        />
      </div>
    </div>

    <!-- Add task modal -->
    <BaseModal
      :open="showAddTask"
      title="Neue Aufgabe"
      @close="showAddTask = false"
    >
      <form @submit.prevent="addTask">
        <BaseInput
          v-model="newTaskTitle"
          placeholder="Aufgabenbeschreibung..."
          autofocus
        />
      </form>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showAddTask = false"
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

    <!-- Delete confirmation modal -->
    <BaseModal
      :open="showDeleteConfirm"
      title="Projekt löschen?"
      @close="showDeleteConfirm = false"
    >
      <p class="text-bark-600">
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
      :icon="Folder"
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
