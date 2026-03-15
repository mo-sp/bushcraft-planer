<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'
import { Capacitor } from '@capacitor/core'
import {
  Cloud, CloudOff, Trash2, Info, RefreshCw, UserCog, X, VolumeX, Volume2
} from 'lucide-vue-next'
import { db } from '@shared/api/db'
import { isSupabaseConfigured } from '@shared/api/supabase'
import { useProjectStore } from '@entities/project/model/store'
import { useMaterialStore } from '@entities/material/model/store'
import { useEquipmentStore } from '@entities/equipment/model/store'
import { useStorageLocationStore } from '@entities/storage-location/model/store'
import { useTaskStore } from '@entities/task/model/store'
import { useSync } from '@features/sync-data'
import { BaseCard, BaseButton, BaseModal, BaseComboInput } from '@shared/ui'
import { useKnownPersons } from '@shared/lib/useKnownPersons'

const isOnline = useOnline()
const isNative = Capacitor.isNativePlatform()
const projectStore = useProjectStore()
const materialStore = useMaterialStore()
const equipmentStore = useEquipmentStore()
const storageLocationStore = useStorageLocationStore()
const taskStore = useTaskStore()
const showClearConfirm = ref(false)
const isClearing = ref(false)
const introSongMuted = ref(localStorage.getItem('introSongMuted') === 'true')

function toggleIntroSongMute() {
  introSongMuted.value = !introSongMuted.value
  localStorage.setItem('introSongMuted', String(introSongMuted.value))
}

const { isSyncing, lastSyncedAt, syncError, fullSync } = useSync()
const { knownPersons, addPerson, removeManualPerson } = useKnownPersons()
const newPersonName = ref('')
const syncMessage = ref<string | null>(null)

// Person rename
const showRenameModal = ref(false)
const renameFrom = ref('')
const renameTo = ref('')
const renameResult = ref<string | null>(null)

async function renamePerson() {
  const oldName = renameFrom.value.trim()
  const newName = renameTo.value.trim()
  if (!oldName || !newName || oldName === newName) return

  let count = 0

  // Rename in materials
  for (const m of materialStore.materials) {
    if (m.owner === oldName) {
      await materialStore.updateMaterial(m.id, { owner: newName })
      count++
    }
  }

  // Rename in equipment
  for (const e of equipmentStore.equipment) {
    if (e.owner === oldName) {
      await equipmentStore.updateEquipment(e.id, { owner: newName })
      count++
    }
  }

  // Rename in projects (participants + responsible)
  for (const p of projectStore.projects) {
    let changed = false
    const updates: Record<string, any> = {}
    if (p.responsible === oldName) {
      updates.responsible = newName
      changed = true
    }
    if (p.participants?.includes(oldName)) {
      updates.participants = p.participants.map(n => n === oldName ? newName : n)
      changed = true
    }
    if (changed) {
      await projectStore.updateProject(p.id, updates)
      count++
    }
  }

  // Rename in task assignees
  for (const t of taskStore.tasks) {
    if (t.assignees?.includes(oldName)) {
      await taskStore.updateTask(t.id, {
        assignees: t.assignees.map(n => n === oldName ? newName : n)
      })
      count++
    }
  }

  renameResult.value = `"${oldName}" → "${newName}" (${count} Einträge aktualisiert)`
  renameFrom.value = ''
  renameTo.value = ''
}

// Person delete
const showDeletePersonConfirm = ref<string | null>(null)

async function deletePerson(name: string) {
  // Remove owner from materials
  for (const m of materialStore.materials) {
    if (m.owner === name) {
      await materialStore.updateMaterial(m.id, { owner: undefined })
    }
  }

  // Remove owner from equipment
  for (const e of equipmentStore.equipment) {
    if (e.owner === name) {
      await equipmentStore.updateEquipment(e.id, { owner: undefined })
    }
  }

  // Remove from projects
  for (const p of projectStore.projects) {
    const updates: Record<string, any> = {}
    let changed = false
    if (p.responsible === name) {
      updates.responsible = undefined
      changed = true
    }
    if (p.participants?.includes(name)) {
      updates.participants = p.participants.filter(n => n !== name)
      changed = true
    }
    if (changed) {
      await projectStore.updateProject(p.id, updates)
    }
  }

  // Remove from task assignees
  for (const t of taskStore.tasks) {
    if (t.assignees?.includes(name)) {
      await taskStore.updateTask(t.id, {
        assignees: t.assignees.filter(n => n !== name)
      })
    }
  }

  removeManualPerson(name)
  showDeletePersonConfirm.value = null
}

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
      storageLocationStore.loadLocations(),
      taskStore.loadTasks()
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
      storageLocationStore.loadLocations(),
      taskStore.loadTasks()
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

        <!-- Data counts -->
        <div v-if="lastSyncedAt" class="grid grid-cols-2 gap-2 mt-1">
          <div class="flex items-center justify-between p-2 bg-deep-200 rounded-lg">
            <span class="text-xs text-earth-400">Projekte</span>
            <span class="text-xs text-earth-200 font-medium">{{ projectStore.projects.length }}</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-deep-200 rounded-lg">
            <span class="text-xs text-earth-400">Material</span>
            <span class="text-xs text-earth-200 font-medium">{{ materialStore.materials.length }}</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-deep-200 rounded-lg">
            <span class="text-xs text-earth-400">Ausrüstung</span>
            <span class="text-xs text-earth-200 font-medium">{{ equipmentStore.equipment.length }}</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-deep-200 rounded-lg">
            <span class="text-xs text-earth-400">Lagerorte</span>
            <span class="text-xs text-earth-200 font-medium">{{ storageLocationStore.locations.length }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="!isSupabaseConfigured()" class="p-3 bg-deep-200 rounded-lg">
        <p class="text-sm text-earth-400">
          Supabase ist nicht konfiguriert. Die App funktioniert vollständig offline.
        </p>
      </div>

      <!-- Sync info -->
      <div class="mt-4 p-3 bg-deep-200 rounded-lg space-y-2">
        <p class="text-sm text-earth-300 font-medium">Wann wird synchronisiert?</p>
        <ul class="text-xs text-earth-400 space-y-1 ml-3 list-disc">
          <li>Automatisch beim App-Start</li>
          <li>Manuell per Klick auf den Sync-Status oben</li>
        </ul>
        <p class="text-xs text-earth-500 mt-2">
          Alle können gleichzeitig arbeiten. Änderungen an verschiedenen Einträgen werden problemlos zusammengeführt.
          Bei gleichzeitiger Bearbeitung desselben Feldes gewinnt die letzte Änderung.
        </p>
      </div>
    </BaseCard>

    <!-- Person management -->
    <BaseCard class="mb-4">
      <div class="flex items-center gap-3 mb-4">
        <UserCog class="w-5 h-5 text-earth-400" />
        <h3 class="font-medium text-earth-100">Personen</h3>
      </div>

      <div v-if="knownPersons.length > 0" class="flex flex-wrap gap-2 mb-3">
        <span
          v-for="person in knownPersons"
          :key="person"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-deep-200 text-earth-300 text-sm border border-deep-50/30"
        >
          {{ person }}
          <button
            class="text-earth-500 hover:text-red-400 transition-colors"
            @click="showDeletePersonConfirm = person"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </span>
      </div>
      <p v-else class="text-sm text-earth-500 mb-3">Noch keine Personen vorhanden.</p>

      <!-- Add person -->
      <form class="flex gap-2 mb-3" @submit.prevent="addPerson(newPersonName); newPersonName = ''">
        <BaseComboInput
          v-model="newPersonName"
          :suggestions="[]"
          placeholder="Neue Person..."
          class="flex-1"
          @enter="addPerson(newPersonName); newPersonName = ''"
        />
        <BaseButton
          variant="primary"
          :disabled="!newPersonName.trim() || knownPersons.includes(newPersonName.trim())"
          @click="addPerson(newPersonName); newPersonName = ''"
        >
          Hinzufügen
        </BaseButton>
      </form>

      <BaseButton
        v-if="knownPersons.length > 0"
        variant="secondary"
        full-width
        @click="showRenameModal = true; renameResult = null"
      >
        <UserCog class="w-5 h-5" />
        Person umbenennen
      </BaseButton>
    </BaseCard>

    <!-- Sound settings -->
    <BaseCard class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <component :is="introSongMuted ? VolumeX : Volume2" class="w-5 h-5 text-earth-400" />
          <div>
            <h3 class="font-medium text-earth-100">Intro-Song</h3>
            <p class="text-sm text-earth-400">Sound beim App-Start</p>
          </div>
        </div>
        <button
          :class="[
            'relative w-12 h-7 rounded-full transition-colors',
            introSongMuted ? 'bg-deep-100' : 'bg-forest-600'
          ]"
          @click="toggleIntroSongMute"
        >
          <span
            :class="[
              'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
              introSongMuted ? 'left-0.5' : 'left-5.5'
            ]"
          />
        </button>
      </div>
    </BaseCard>

    <!-- App info -->
    <BaseCard class="mb-4">
      <h3 class="font-medium text-earth-100 mb-4">Info</h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-earth-400">Version</span>
          <span class="text-sm text-earth-200 font-medium">0.9.0</span>
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

      <div v-if="!isNative" class="mt-4 p-3 bg-forest-900/30 rounded-lg border border-forest-700/30">
        <div class="flex items-start gap-2">
          <Info class="w-5 h-5 text-forest-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-forest-300">
            Diese App kann offline verwendet werden.
            Installiere sie auf deinem Gerät für schnelleren Zugriff.
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Data management (at the bottom, rarely needed) -->
    <BaseCard>
      <h3 class="font-medium text-earth-100 mb-2">Gefahrenzone</h3>
      <p class="text-xs text-earth-500 mb-4">
        Löscht alle lokalen Daten. Nach erneutem Sync werden die Cloud-Daten wiederhergestellt.
      </p>
      <BaseButton
        variant="danger"
        full-width
        @click="showClearConfirm = true"
      >
        <Trash2 class="w-5 h-5" />
        Lokale Daten vollständig löschen
      </BaseButton>
    </BaseCard>

    <!-- Delete person confirmation -->
    <BaseModal
      :open="showDeletePersonConfirm !== null"
      title="Person entfernen?"
      @close="showDeletePersonConfirm = null"
    >
      <p class="text-earth-300">
        <span class="font-medium text-earth-100">"{{ showDeletePersonConfirm }}"</span>
        wird als Eigentümer, Verantwortlicher und Beteiligter überall entfernt.
      </p>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="showDeletePersonConfirm = null"
          >
            Abbrechen
          </BaseButton>
          <BaseButton
            variant="danger"
            full-width
            @click="deletePerson(showDeletePersonConfirm!)"
          >
            Entfernen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Rename person modal -->
    <BaseModal
      :open="showRenameModal"
      title="Person umbenennen"
      @close="showRenameModal = false"
    >
      <div class="space-y-4">
        <BaseComboInput
          v-model="renameFrom"
          :suggestions="knownPersons"
          label="Alter Name"
          placeholder="Name auswählen..."
        />
        <BaseComboInput
          v-model="renameTo"
          :suggestions="[]"
          label="Neuer Name"
          placeholder="Neuen Namen eingeben..."
        />
        <p v-if="renameResult" class="text-sm text-forest-400">
          {{ renameResult }}
        </p>
      </div>
      <template #footer>
        <div class="space-y-2">
          <div class="flex gap-3">
            <BaseButton
              variant="secondary"
              full-width
              @click="showRenameModal = false"
            >
              Schließen
            </BaseButton>
            <BaseButton
              full-width
              :disabled="!renameFrom.trim() || !renameTo.trim() || renameFrom === renameTo"
              @click="renamePerson"
            >
              Umbenennen
            </BaseButton>
          </div>
          <BaseButton
            v-if="renameFrom.trim() && knownPersons.includes(renameFrom.trim())"
            variant="danger"
            full-width
            @click="showRenameModal = false; showDeletePersonConfirm = renameFrom.trim()"
          >
            <Trash2 class="w-4 h-4" />
            "{{ renameFrom.trim() }}" komplett entfernen
          </BaseButton>
        </div>
      </template>
    </BaseModal>

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
