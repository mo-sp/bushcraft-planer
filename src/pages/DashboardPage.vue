<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Building2, Compass, Hammer, FolderPlus, Filter, Trees, Search } from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { useTaskStore } from '@entities/task/model/store'
import type { ProjectStatus } from '@entities/project/model/types'
import { PROJECT_STATUS_LABELS } from '@entities/project/model/types'
import { BaseCard, BaseButton, BaseBadge, BaseProgress, BaseEmptyState } from '@shared/ui'

const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

// Filters
const selectedCategory = ref<string | 'all'>('all')
const selectedStatus = ref<ProjectStatus | 'all'>('all')
const showFilters = ref(false)
const searchQuery = ref('')

const categoryIcons: Record<string, typeof Building2> = {
  construction: Building2,
  exploration: Compass,
  tools: Hammer,
  custom: FolderPlus
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || FolderPlus
}

const filteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return projectStore.projects.filter(project => {
    if (query && !project.name.toLowerCase().includes(query) && !project.description.toLowerCase().includes(query)) {
      return false
    }
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

function getCategoryName(project: { category: string; customCategoryName?: string }) {
  return projectStore.getCategoryName(project.category, project.customCategoryName)
}
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-earth-100">Unsere Projekte</h1>
        <p class="text-earth-400 text-sm mt-1">
          {{ projectStore.projects.length }} Projekt{{ projectStore.projects.length !== 1 ? 'e' : '' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          :class="{ 'text-forest-400': hasFilters }"
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

    <!-- Search -->
    <div class="relative mb-4">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Projekt suchen..."
        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
      >
    </div>

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
            <p class="text-sm font-medium text-earth-300 mb-2">Kategorie</p>
            <div class="flex flex-wrap gap-2">
              <button
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-forest-600 text-white'
                    : 'bg-deep-200 text-earth-300 border border-deep-50/30'
                ]"
                @click="selectedCategory = 'all'"
              >
                Alle
              </button>
              <button
                v-for="(label, key) in projectStore.allCategories"
                :key="key"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
                  selectedCategory === key
                    ? 'bg-forest-600 text-white'
                    : 'bg-deep-200 text-earth-300 border border-deep-50/30'
                ]"
                @click="selectedCategory = key"
              >
                <component :is="getCategoryIcon(key)" class="w-4 h-4" />
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Status filter -->
          <div>
            <p class="text-sm font-medium text-earth-300 mb-2">Status</p>
            <div class="flex flex-wrap gap-2">
              <button
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedStatus === 'all'
                    ? 'bg-forest-600 text-white'
                    : 'bg-deep-200 text-earth-300 border border-deep-50/30'
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
                    : 'bg-deep-200 text-earth-300 border border-deep-50/30'
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
            class="text-sm text-forest-400 hover:underline"
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
          <!-- Project image or placeholder -->
          <div
            v-if="project.imageUrl"
            class="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden"
          >
            <img
              :src="project.imageUrl"
              :alt="project.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
            :style="{ backgroundColor: project.imagePlaceholder }"
          >
            <component
              :is="getCategoryIcon(project.category)"
              class="w-8 h-8 text-white/80"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h3 class="font-semibold text-earth-100 truncate">
                {{ project.name }}
              </h3>
              <BaseBadge :variant="getStatusVariant(project.status)" size="sm">
                {{ PROJECT_STATUS_LABELS[project.status] }}
              </BaseBadge>
            </div>

            <p class="text-xs text-forest-400 mb-1">
              {{ getCategoryName(project) }}
            </p>

            <p class="text-sm text-earth-400 line-clamp-1 mb-2">
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
              <span class="text-xs text-earth-500 tabular-nums">
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
      :icon="Trees"
      title="Noch keine Projekte"
      description="Erstelle euer erstes Bushcraft-Projekt und beginnt mit der Planung."
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
