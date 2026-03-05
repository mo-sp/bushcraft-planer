<script setup lang="ts">
interface Props {
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  hoverable: false,
  padding: 'md'
})
</script>

<template>
  <div
    :class="[
      'bg-deep-100 rounded-2xl shadow-card transition-all duration-200 border border-deep-50/30',
      { 'hover:shadow-card-hover hover:border-forest-600/50 cursor-pointer active:scale-[0.98]': hoverable },
      {
        'p-0': padding === 'none',
        'p-3': padding === 'sm',
        'p-4': padding === 'md',
        'p-6': padding === 'lg'
      }
    ]"
  >
    <slot />
  </div>
</template>
