<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'
import {
  Cloud, CloudOff, Database, Trash2, Info, RefreshCw
} from 'lucide-vue-next'
import { db } from '@shared/api/db'
import { isSupabaseConfigured } from '@shared/api/supabase'
import { useProjectStore } from '@entities/project/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { useStorageLocationStore } from '@entities/storage-location/model/store'
import { useSync } from '@features/sync-data'
import { BaseCard, BaseButton, BaseModal } from '@shared/ui'

const isOnline = useOnline()
const projectStore = useProjectStore()
const materialStore = useMaterialStore()
const equipmentStore = useEquipmentStore()
const storageLocationStore = useStorageLocationStore()
const showClearConfirm = ref(false)
const isClearing = ref(false)

const { isSyncing, lastSyncedAt, syncError, fullSync } = useSync()
const syncMessage = ref<string | null>(null)

async function handleSync() {
  syncMessage.value = null
  const result = await fullSync()
  if (result.errors.length > 0) {
    syncMessage.value = `Sync mit ${result.errors.length} Fehler(n) - ${result.pushed} hoch, ${result.pulled} runter`
  } else {
    syncMessage.value = `Sync erfolgreich - ${result.pushed} hoch, ${result.pulled} runter, ${result.deleted} gelöscht`
  }
  // Reload stores to reflect pulled/deleted data
  if (result.pulled > 0 || result.deleted > 0) {
    await Promise.all([
      projectStore.loadProjects(),
      materialStore.loadMaterials(),
      equipmentStore.loadEquipment(),
      storageLocationStore.loadLocations()
    ])
  }
}

const syncStatus = computed(() => {
  if (!isSupabaseConfigured()) {
    return { text: 'Nicht konfiguriert', icon: CloudOff, color: 'text-earth-500' }
  }
  if (!isOnline.value) {
    return { text: 'Offline', icon: CloudOff, color: 'text-amber-400' }
  }
  return { text: 'Verbunden', icon: Cloud, color: 'text-green-400' }
})

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

async function clearAllData() {
  if (isClearing.value) return
  isClearing.value = true

  try {
    await db.projects.clear()
    await db.tasks.clear()
    await db.materials.clear()
    await db.materialRequirements.clear()
    await db.equipment.clear()
    await db.equipmentRequirements.clear()
    await db.storageLocations.clear()
    await db.syncMeta.clear()
    localStorage.removeItem('customCategories')

    // Reload stores instead of full page reload
    await Promise.all([
      projectStore.loadProjects(),
      materialStore.loadMaterials(),
      equipmentStore.loadEquipment(),
      storageLocationStore.loadLocations()
    ])
    showClearConfirm.value = false
  } finally {
    isClearing.value = false
  }
}
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-earth-100">Einstellungen</h1>
    </header>

    <!-- Sync status -->
    <BaseCard class="mb-4">
      <div class="flex items-center gap-4 mb-4">
        <div
          :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center',
            syncStatus.color === 'text-green-400' ? 'bg-green-900/30' :
            syncStatus.color === 'text-amber-400' ? 'bg-amber-900/30' : 'bg-deep-200'
          ]"
        >
          <component
            :is="syncStatus.icon"
            :class="['w-6 h-6', syncStatus.color]"
          />
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-earth-100">Synchronisation</h3>
          <p :class="['text-sm', syncStatus.color]">
            {{ syncStatus.text }}
          </p>
          <p v-if="lastSyncedAt" class="text-xs text-earth-500">
            Zuletzt: {{ formatTime(lastSyncedAt) }}
          </p>
        </div>
      </div>

      <div v-if="isSupabaseConfigured() && isOnline" class="space-y-3">
        <BaseButton
          variant="primary"
          full-width
          :loading="isSyncing"
          @click="handleSync"
        >
          <RefreshCw class="w-5 h-5" />
          Jetzt synchronisieren
        </BaseButton>

        <p v-if="syncMessage" :class="['text-sm text-center', syncError ? 'text-amber-400' : 'text-forest-400']">
          {{ syncMessage }}
        </p>
      </div>

      <div v-else-if="!isSupabaseConfigured()" class="p-3 bg-deep-200 rounded-lg">
        <p class="text-sm text-earth-400">
          Supabase ist nicht konfiguriert. Die App funktioniert vollständig offline.
        </p>
      </div>
    </BaseCard>

    <!-- Data management -->
    <BaseCard class="mb-4">
      <h3 class="font-medium text-earth-100 mb-4">Datenverwaltung</h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 bg-deep-200 rounded-lg">
          <div class="flex items-center gap-3">
            <Database class="w-5 h-5 text-earth-400" />
            <span class="text-sm text-earth-200">Lokale Datenbank</span>
          </div>
          <span class="text-sm text-earth-400">IndexedDB</span>
        </div>

        <BaseButton
          variant="danger"
          full-width
          @click="showClearConfirm = true"
        >
          <Trash2 class="w-5 h-5" />
          Lokale Daten vollständig löschen
        </BaseButton>
      </div>
    </BaseCard>

    <!-- App info -->
    <BaseCard>
      <h3 class="font-medium text-earth-100 mb-4">Info</h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-earth-400">Version</span>
          <span class="text-sm text-earth-200 font-medium">0.8.0 Beta</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-earth-400">Framework</span>
          <span class="text-sm text-earth-200 font-medium">Vue 3</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-earth-400">PWA</span>
          <span class="text-sm text-green-400 font-medium">Aktiv</span>
        </div>
      </div>

      <div class="mt-4 p-3 bg-forest-900/30 rounded-lg border border-forest-700/30">
        <div class="flex items-start gap-2">
          <Info class="w-5 h-5 text-forest-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-forest-300">
            Diese App kann offline verwendet werden.
            Installiere sie auf deinem Gerät für schnelleren Zugriff.
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Clear data modal -->
    <BaseModal
      :open="showClearConfirm"
      title="Lokale Daten vollständig löschen?"
      @close="showClearConfirm = false"
    >
      <p class="text-earth-300">
        Diese Aktion löscht alle Projekte, Aufgaben und Materialien unwiderruflich.
        Bist du sicher?
      </p>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showClearConfirm = false"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            variant="danger"
            full-width
            :loading="isClearing"
            @click="clearAllData"
          >
            Alles löschen
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
