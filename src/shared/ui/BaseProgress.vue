<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'forest' | 'status'
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showLabel: false,
  size: 'md',
  color: 'forest'
})

const percentage = computed(() => {
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

const statusColor = computed(() => {
  if (props.color !== 'status') return null
  if (percentage.value >= 100) return 'bg-green-500'
  if (percentage.value > 0) return 'bg-amber-500'
  return 'bg-gray-500'
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      :class="[
        'flex-1 bg-deep-100 rounded-full overflow-hidden border border-earth-600/50',
        {
          'h-1': size === 'sm',
          'h-2': size === 'md',
          'h-3': size === 'lg'
        }
      ]"
    >
      <div
        :class="[
          'h-full rounded-full transition-all duration-300 ease-out',
          color === 'forest' ? 'bg-forest-500' : statusColor
        ]"
        :style="{ width: `${percentage}%` }"
      />
    </div>
    <span
      v-if="showLabel"
      :class="[
        'text-earth-400 font-medium tabular-nums',
        {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg'
        }
      ]"
    >
      {{ Math.round(percentage) }}%
    </span>
  </div>
</template>
