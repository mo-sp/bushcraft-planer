<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Tent, Flame, Hammer, Folder, Filter } from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useTaskStore } from '@entities/task/model/store'
import type { ProjectCategory, ProjectStatus } from '@entities/project/model/types'
import { PROJECT_CATEGORY_LABELS, PROJECT_STATUS_LABELS } from '@entities/project/model/types'
import { BaseCard, BaseButton, BaseBadge, BaseProgress, BaseEmptyState } from '@shared/ui'

const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

// Filters
const selectedCategory = ref<ProjectCategory | 'all'>('all')
const selectedStatus = ref<ProjectStatus | 'all'>('all')
const showFilters = ref(false)

const categoryIcons = {
  shelter: Tent,
  fire: Flame,
  tools: Hammer,
  custom: Folder
}

const filteredProjects = computed(() => {
  return projectStore.projects.filter(project => {
    if (selectedCategory.value !== 'all' && project.category !== selectedCategory.value) {
      return false
    }
    if (selectedStatus.value !== 'all' && project.status !== selectedStatus.value) {
      return false
    }
    return true
  })
})

const hasFilters = computed(() => {
  return selectedCategory.value !== 'all' || selectedStatus.value !== 'all'
})

function clearFilters() {
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
}

function goToProject(id: string) {
  router.push(`/project/${id}`)
}

function createProject() {
  router.push('/project/new')
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
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-bark-800">Meine Projekte</h1>
        <p class="text-bark-500 text-sm mt-1">
          {{ projectStore.projects.length }} Projekt{{ projectStore.projects.length !== 1 ? 'e' : '' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          :class="{ 'text-forest-600': hasFilters }"
          @click="showFilters = !showFilters"
        >
          <Filter class="w-5 h-5" />
        </BaseButton>
        <BaseButton @click="createProject">
          <Plus class="w-5 h-5" />
          Neu
        </BaseButton>
      </div>
    </header>

    <!-- Filters -->
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <BaseCard v-if="showFilters" class="mb-4">
        <div class="space-y-3">
          <!-- Category filter -->
          <div>
            <p class="text-sm font-medium text-bark-600 mb-2">Kategorie</p>
            <div class="flex flex-wrap gap-2">
              <button
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-forest-600 text-white'
                    : 'bg-earth-200 text-bark-600'
                ]"
                @click="selectedCategory = 'all'"
              >
                Alle
              </button>
              <button
                v-for="(label, key) in PROJECT_CATEGORY_LABELS"
                :key="key"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
                  selectedCategory === key
                    ? 'bg-forest-600 text-white'
                    : 'bg-earth-200 text-bark-600'
                ]"
                @click="selectedCategory = key"
              >
                <component :is="categoryIcons[key]" class="w-4 h-4" />
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Status filter -->
          <div>
            <p class="text-sm font-medium text-bark-600 mb-2">Status</p>
            <div class="flex flex-wrap gap-2">
              <button
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedStatus === 'all'
                    ? 'bg-forest-600 text-white'
                    : 'bg-earth-200 text-bark-600'
                ]"
                @click="selectedStatus = 'all'"
              >
                Alle
              </button>
              <button
                v-for="(label, key) in PROJECT_STATUS_LABELS"
                :key="key"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedStatus === key
                    ? 'bg-forest-600 text-white'
                    : 'bg-earth-200 text-bark-600'
                ]"
                @click="selectedStatus = key"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Clear filters -->
          <button
            v-if="hasFilters"
            class="text-sm text-forest-600 hover:underline"
            @click="clearFilters"
          >
            Filter zurücksetzen
          </button>
        </div>
      </BaseCard>
    </Transition>

    <!-- Project list -->
    <div v-if="filteredProjects.length > 0" class="space-y-3">
      <BaseCard
        v-for="project in filteredProjects"
        :key="project.id"
        hoverable
        @click="goToProject(project.id)"
      >
        <div class="flex gap-4">
          <!-- Image placeholder -->
          <div
            class="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
            :style="{ backgroundColor: project.imagePlaceholder }"
          >
            <component
              :is="categoryIcons[project.category]"
              class="w-8 h-8 text-white/80"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h3 class="font-semibold text-bark-800 truncate">
                {{ project.name }}
              </h3>
              <BaseBadge :variant="getStatusVariant(project.status)" size="sm">
                {{ PROJECT_STATUS_LABELS[project.status] }}
              </BaseBadge>
            </div>

            <p class="text-sm text-bark-500 line-clamp-2 mb-2">
              {{ project.description || 'Keine Beschreibung' }}
            </p>

            <!-- Progress -->
            <div class="flex items-center gap-2">
              <BaseProgress
                :value="taskStore.projectProgress(project.id)"
                size="sm"
                color="status"
                class="flex-1"
              />
              <span class="text-xs text-bark-500 tabular-nums">
                {{ taskStore.completedTasksCount(project.id) }}/{{ taskStore.totalTasksCount(project.id) }}
              </span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Empty state -->
    <BaseEmptyState
      v-else-if="projectStore.projects.length === 0"
      :icon="Tent"
      title="Noch keine Projekte"
      description="Erstelle dein erstes Bushcraft-Projekt und beginne mit der Planung."
    >
      <template #action>
        <BaseButton @click="createProject">
          <Plus class="w-5 h-5" />
          Projekt erstellen
        </BaseButton>
      </template>
    </BaseEmptyState>

    <!-- No results -->
    <BaseEmptyState
      v-else
      :icon="Filter"
      title="Keine Ergebnisse"
      description="Keine Projekte entsprechen den ausgewählten Filtern."
    >
      <template #action>
        <BaseButton variant="secondary" @click="clearFilters">
          Filter zurücksetzen
        </BaseButton>
      </template>
    </BaseEmptyState>
  </div>
</template>
