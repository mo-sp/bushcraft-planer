<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { RefreshCw } from 'lucide-vue-next'
import AppNavigation from './AppNavigation.vue'
import SplashScreen from './SplashScreen.vue'
import { useProjectStore } from '@entities/project/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { useStorageLocationStore } from '@entities/storage-location/model/store'
import { isSupabaseConfigured } from '@shared/api/supabase'
import { useSync } from '@features/sync-data'

const projectStore = useProjectStore()
const materialStore = useMaterialStore()
const equipmentStore = useEquipmentStore()
const storageLocationStore = useStorageLocationStore()
const { isSyncing, lastSyncedAt, syncError, fullSync } = useSync()
const isOnline = useOnline()
const isLoading = ref(true)
const showSplash = ref(true)
const autoSyncDone = ref(false)

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'gerade eben'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `vor ${minutes} Min.`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`
}

// Reactive timestamp that updates every 30s for time-ago display
const now = ref(Date.now())
onMounted(() => {
  setInterval(() => { now.value = Date.now() }, 30000)
})

const timeAgo = computed(() => {
  if (!lastSyncedAt.value) return null
  // Touch now.value to trigger reactivity
  void now.value
  return formatTimeAgo(lastSyncedAt.value)
})

const syncAge = computed(() => {
  if (!lastSyncedAt.value) return 'never'
  const minutes = (Date.now() - lastSyncedAt.value.getTime()) / 60000
  if (minutes < 5) return 'fresh'
  if (minutes < 60) return 'ok'
  return 'stale'
})

async function reloadStores() {
  await Promise.all([
    projectStore.loadProjects(),
    materialStore.loadMaterials(),
    equipmentStore.loadEquipment(),
    storageLocationStore.loadLocations()
  ])
}

async function handleManualSync() {
  const result = await fullSync()
  if (result.pulled > 0 || result.deleted > 0) {
    await reloadStores()
  }
}

onMounted(async () => {
  try {
    await reloadStores()
  } finally {
    isLoading.value = false
  }

  // Auto-sync in background after local data is loaded
  if (isSupabaseConfigured() && isOnline.value) {
    try {
      const result = await fullSync()
      if (result.pulled > 0 || result.deleted > 0) {
        await reloadStores()
      }
    } catch (e) {
      console.error('Auto-sync failed:', e)
    } finally {
      autoSyncDone.value = true
    }
  }
})
</script>

<template>
  <!-- Splash Screen -->
  <SplashScreen v-if="showSplash" @done="showSplash = false" />

  <div class="min-h-screen flex flex-col bg-deep-200">
    <!-- Header with brand -->
    <header class="bg-deep-400 safe-top sticky top-0 z-50 border-b border-deep-100/20">
      <div class="flex items-center justify-center gap-4 px-4 py-4">
        <img
          src="/logo.jpg"
          alt="Nature Boyz Logo"
          class="w-16 h-16 rounded-xl object-cover"
        />
        <div class="text-center">
          <h1 class="text-3xl font-bold text-forest-300 tracking-wide">Nature Boyz</h1>
          <p class="text-sm text-forest-500 -mt-0.5">Bushcraft Project Planer</p>
        </div>
      </div>

      <!-- Sync status bar -->
      <div
        v-if="isSupabaseConfigured()"
        class="flex items-center justify-center gap-2 px-4 py-1.5 border-t border-deep-100/15"
      >
        <button
          v-if="isOnline && !isSyncing"
          class="flex items-center gap-1.5 text-xs transition-colors"
          :class="{
            'text-forest-400': syncAge === 'fresh',
            'text-earth-400': syncAge === 'ok',
            'text-amber-400': syncAge === 'stale' || syncAge === 'never'
          }"
          @click="handleManualSync"
        >
          <RefreshCw class="w-3 h-3" />
          <span v-if="lastSyncedAt">{{ timeAgo }}</span>
          <span v-else>Noch nicht synchronisiert</span>
        </button>
        <div
          v-else-if="isSyncing"
          class="flex items-center gap-1.5 text-xs text-forest-400"
        >
          <RefreshCw class="w-3 h-3 animate-spin" />
          <span>Synchronisiere...</span>
        </div>
        <span
          v-else
          class="text-xs text-earth-500"
        >
          Offline
        </span>
        <span
          v-if="syncError && !isSyncing"
          class="text-xs text-red-400"
        >
          · Fehler
        </span>
      </div>
    </header>

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
        class="bg-amber-600 text-white text-center py-2 text-sm font-medium"
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
        <div class="w-12 h-12 border-4 border-forest-700 border-t-forest-400 rounded-full animate-spin" />
        <p class="text-earth-300">Lade Daten...</p>
      </div>
    </div>

    <!-- Main content -->
    <template v-else>
      <main class="flex-1 pb-24 overflow-y-auto">
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
