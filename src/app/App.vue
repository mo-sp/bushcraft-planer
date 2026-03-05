<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useOnline } from '@vueuse/core'
import AppNavigation from './AppNavigation.vue'
import { useProjectStore } from '@entities/project/model/store'
import { useMaterialStore } from '@entities/material/model/store'

const projectStore = useProjectStore()
const materialStore = useMaterialStore()
const isOnline = useOnline()
const isLoading = ref(true)

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.loadProjects(),
      materialStore.loadMaterials()
    ])
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-earth-100">
    <!-- Offline indicator -->
    <Transition
      enter-active-class="transform transition duration-300"
      enter-from-class="-translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transform transition duration-300"
      leave-from-class="translate-y-0"
      leave-to-class="-translate-y-full"
    >
      <div
        v-if="!isOnline"
        class="bg-amber-500 text-white text-center py-2 text-sm font-medium safe-top"
      >
        Offline - Änderungen werden lokal gespeichert
      </div>
    </Transition>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="flex-1 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin" />
        <p class="text-bark-600">Lade Daten...</p>
      </div>
    </div>

    <!-- Main content -->
    <template v-else>
      <main class="flex-1 pb-20">
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-active-class="duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <!-- Bottom navigation -->
      <AppNavigation />
    </template>
  </div>
</template>
