<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Warehouse, Settings } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'dashboard', label: 'Projekte', icon: LayoutDashboard, path: '/' },
  { name: 'inventory', label: 'Materiallager', icon: Warehouse, path: '/inventory' },
  { name: 'settings', label: 'Einstellungen', icon: Settings, path: '/settings' }
]

const currentRoute = computed(() => route.name)

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-deep-400 border-t border-deep-100/30 safe-bottom z-40">
    <div class="flex items-center justify-around max-w-lg mx-auto">
      <button
        v-for="item in navItems"
        :key="item.name"
        :class="[
          'flex flex-col items-center gap-1 py-3 px-4 min-w-[70px] transition-colors',
          currentRoute === item.name
            ? 'text-forest-400'
            : 'text-earth-500 active:text-earth-400'
        ]"
        @click="navigate(item.path)"
      >
        <component
          :is="item.icon"
          :class="[
            'w-6 h-6 transition-transform',
            currentRoute === item.name ? 'scale-110' : ''
          ]"
        />
        <span class="text-xs font-medium">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>
