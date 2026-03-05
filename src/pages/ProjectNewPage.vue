<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Tent, Flame, Hammer, Folder } from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import type { ProjectCategory } from '@entities/project/model/types'
import { PROJECT_CATEGORY_LABELS } from '@entities/project/model/types'
import { BaseButton, BaseInput, BaseTextarea } from '@shared/ui'

const router = useRouter()
const projectStore = useProjectStore()

const name = ref('')
const description = ref('')
const category = ref<ProjectCategory>('shelter')
const isSubmitting = ref(false)

const categoryIcons = {
  shelter: Tent,
  fire: Flame,
  tools: Hammer,
  custom: Folder
}

const isValid = computed(() => {
  return name.value.trim().length > 0
})

async function submit() {
  if (!isValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const project = await projectStore.createProject({
      name: name.value.trim(),
      description: description.value.trim(),
      category: category.value
    })

    if (project) {
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
        class="p-2 -ml-2 rounded-full hover:bg-earth-200 transition-colors"
        @click="goBack"
      >
        <ArrowLeft class="w-6 h-6 text-bark-600" />
      </button>
      <h1 class="text-xl font-bold text-bark-800">Neues Projekt</h1>
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

      <!-- Category -->
      <div>
        <label class="text-sm font-medium text-bark-700 mb-3 block">
          Kategorie
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(label, key) in PROJECT_CATEGORY_LABELS"
            :key="key"
            type="button"
            :class="[
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              category === key
                ? 'border-forest-500 bg-forest-50'
                : 'border-earth-200 bg-white hover:border-earth-300'
            ]"
            @click="category = key"
          >
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                category === key ? 'bg-forest-500' : 'bg-earth-200'
              ]"
            >
              <component
                :is="categoryIcons[key]"
                :class="[
                  'w-5 h-5',
                  category === key ? 'text-white' : 'text-bark-500'
                ]"
              />
            </div>
            <span
              :class="[
                'text-sm font-medium',
                category === key ? 'text-forest-700' : 'text-bark-600'
              ]"
            >
              {{ label }}
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
  </div>
</template>
