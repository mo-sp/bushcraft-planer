<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Building2, Compass, Hammer, FolderPlus, Trees, Search } from 'lucide-vue-next'
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
const selectedParticipant = ref<string | 'all'>('all')
const searchQuery = ref('')

// All unique participants across projects
const allParticipants = computed(() => {
  const names = new Set<string>()
  for (const p of projectStore.projects) {
    if (p.responsible) names.add(p.responsible)
    if (p.participants) {
      for (const name of p.participants) names.add(name)
    }
  }
  return [...names].sort()
})

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
    if (selectedParticipant.value !== 'all') {
      const persons = [...(project.participants || [])]
      if (project.responsible) persons.push(project.responsible)
      if (!persons.includes(selectedParticipant.value)) return false
    }
    return true
  })
})

function clearFilters() {
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
  selectedParticipant.value = 'all'
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
      <BaseButton @click="createProject">
        <Plus class="w-5 h-5" />
        Neu
      </BaseButton>
    </header>

    <!-- Search & filters (sticky) -->
    <div class="sticky top-0 z-30 bg-deep-200 pb-3 -mx-4 px-4 pt-1 space-y-2">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Projekt suchen..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
        >
      </div>

      <!-- Participant filter badges -->
      <div v-if="allParticipants.length > 0" class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedParticipant === 'all'
            ? 'bg-amber-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedParticipant = 'all'"
        >
          Alle
        </button>
        <button
          v-for="person in allParticipants"
          :key="person"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedParticipant === person
            ? 'bg-amber-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedParticipant = selectedParticipant === person ? 'all' : person"
        >
          {{ person }}
        </button>
      </div>

      <!-- Status filter badges -->
      <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedStatus === 'all'
            ? 'bg-forest-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedStatus = 'all'"
        >
          Alle Status
        </button>
        <button
          v-for="(label, key) in PROJECT_STATUS_LABELS"
          :key="key"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedStatus === key
            ? 'bg-forest-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedStatus = selectedStatus === key ? 'all' : key"
        >
          {{ label }}
        </button>
      </div>

      <!-- Category filter badges -->
      <div v-if="Object.keys(projectStore.allCategories).length > 1" class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedCategory === 'all'
            ? 'bg-forest-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedCategory = 'all'"
        >
          Alle Kategorien
        </button>
        <button
          v-for="(label, key) in projectStore.allCategories"
          :key="key"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="selectedCategory === key
            ? 'bg-forest-600 text-white'
            : 'bg-deep-300 text-earth-400 border border-deep-100'"
          @click="selectedCategory = selectedCategory === key ? 'all' : key"
        >
          {{ label }}
        </button>
      </div>
    </div>

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

            <!-- Participants & responsible -->
            <div v-if="(project.participants && project.participants.length > 0) || project.responsible" class="flex flex-wrap gap-1 mb-2">
              <span
                v-if="project.responsible"
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 text-[10px] font-medium border border-amber-700/30"
              >
                {{ project.responsible }}
              </span>
              <span
                v-for="person in (project.participants || []).filter(p => p !== project.responsible)"
                :key="person"
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-forest-900/30 text-forest-400 text-[10px] font-medium border border-forest-700/30"
              >
                {{ person }}
              </span>
            </div>

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
      :icon="Search"
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
