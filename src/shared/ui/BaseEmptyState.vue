<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon?: Component
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div
      v-if="icon"
      class="w-16 h-16 mb-4 rounded-full bg-deep-100 flex items-center justify-center"
    >
      <component :is="icon" class="w-8 h-8 text-forest-500" />
    </div>
    <h3 class="text-lg font-semibold text-earth-200 mb-1">
      {{ title }}
    </h3>
    <p v-if="description" class="text-earth-400 max-w-xs">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
