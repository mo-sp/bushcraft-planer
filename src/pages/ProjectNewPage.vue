<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Building2, Compass, Hammer, FolderPlus } from 'lucide-vue-next'
import { useProjectStore } from '@entities/project/model/store'
import { PROJECT_CATEGORY_LABELS } from '@entities/project/model/types'
import { BaseButton, BaseInput, BaseTextarea, BaseModal } from '@shared/ui'

const router = useRouter()
const projectStore = useProjectStore()

const name = ref('')
const description = ref('')
const category = ref('construction')
const customCategoryName = ref('')
const isSubmitting = ref(false)
const showCustomCategoryModal = ref(false)
const newCategoryName = ref('')

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
      router.replace(`/project/${project.id}`)
    }
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.back()
}

// Display category name is handled directly in template
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
  </div>
</template>
