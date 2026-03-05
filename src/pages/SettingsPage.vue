<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'
import {
  Cloud, CloudOff, Database, Trash2, Info
} from 'lucide-vue-next'
import { db } from '@shared/api/db'
import { isSupabaseConfigured } from '@shared/api/supabase'
import { BaseCard, BaseButton, BaseModal } from '@shared/ui'

const isOnline = useOnline()
const showClearConfirm = ref(false)
const isClearing = ref(false)

const syncStatus = computed(() => {
  if (!isSupabaseConfigured()) {
    return { text: 'Nicht konfiguriert', icon: CloudOff, color: 'text-bark-500' }
  }
  if (!isOnline.value) {
    return { text: 'Offline', icon: CloudOff, color: 'text-amber-600' }
  }
  return { text: 'Verbunden', icon: Cloud, color: 'text-green-600' }
})

async function clearAllData() {
  if (isClearing.value) return
  isClearing.value = true

  try {
    await db.projects.clear()
    await db.tasks.clear()
    await db.materials.clear()
    await db.materialRequirements.clear()
    await db.syncMeta.clear()

    // Reload the page to reset all stores
    window.location.reload()
  } finally {
    isClearing.value = false
  }
}
</script>

<template>
  <div class="px-4 py-6">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-bark-800">Einstellungen</h1>
    </header>

    <!-- Sync status -->
    <BaseCard class="mb-4">
      <div class="flex items-center gap-4">
        <div
          :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center',
            syncStatus.color === 'text-green-600' ? 'bg-green-100' :
            syncStatus.color === 'text-amber-600' ? 'bg-amber-100' : 'bg-bark-100'
          ]"
        >
          <component
            :is="syncStatus.icon"
            :class="['w-6 h-6', syncStatus.color]"
          />
        </div>
        <div>
          <h3 class="font-medium text-bark-800">Synchronisation</h3>
          <p :class="['text-sm', syncStatus.color]">
            {{ syncStatus.text }}
          </p>
        </div>
      </div>

      <div v-if="!isSupabaseConfigured()" class="mt-4 p-3 bg-earth-100 rounded-lg">
        <p class="text-sm text-bark-600">
          Supabase ist nicht konfiguriert. Die App funktioniert vollständig offline.
          Um Sync zu aktivieren, füge die Supabase-Umgebungsvariablen hinzu.
        </p>
      </div>
    </BaseCard>

    <!-- Data management -->
    <BaseCard class="mb-4">
      <h3 class="font-medium text-bark-800 mb-4">Datenverwaltung</h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 bg-earth-100 rounded-lg">
          <div class="flex items-center gap-3">
            <Database class="w-5 h-5 text-bark-500" />
            <span class="text-sm text-bark-700">Lokale Datenbank</span>
          </div>
          <span class="text-sm text-bark-500">IndexedDB</span>
        </div>

        <BaseButton
          variant="danger"
          full-width
          @click="showClearConfirm = true"
        >
          <Trash2 class="w-5 h-5" />
          Alle Daten löschen
        </BaseButton>
      </div>
    </BaseCard>

    <!-- App info -->
    <BaseCard>
      <h3 class="font-medium text-bark-800 mb-4">Info</h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-bark-600">Version</span>
          <span class="text-sm text-bark-800 font-medium">1.0.0</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-bark-600">Framework</span>
          <span class="text-sm text-bark-800 font-medium">Vue 3</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-bark-600">PWA</span>
          <span class="text-sm text-green-600 font-medium">Aktiv</span>
        </div>
      </div>

      <div class="mt-4 p-3 bg-forest-50 rounded-lg">
        <div class="flex items-start gap-2">
          <Info class="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-forest-700">
            Diese App kann offline verwendet werden.
            Installiere sie auf deinem Gerät für schnelleren Zugriff.
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Clear data modal -->
    <BaseModal
      :open="showClearConfirm"
      title="Alle Daten löschen?"
      @close="showClearConfirm = false"
    >
      <p class="text-bark-600">
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
