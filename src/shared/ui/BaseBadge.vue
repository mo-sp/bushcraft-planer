<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'forest' | 'earth'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      // Variants
      {
        'bg-deep-50 text-earth-300': variant === 'default',
        'bg-green-900/50 text-green-400': variant === 'success',
        'bg-yellow-900/50 text-yellow-400': variant === 'warning',
        'bg-red-900/50 text-red-400': variant === 'danger',
        'bg-forest-900/50 text-forest-400': variant === 'forest',
        'bg-earth-800/50 text-earth-300': variant === 'earth'
      },
      // Sizes
      {
        'text-xs px-2 py-0.5': size === 'sm',
        'text-sm px-2.5 py-1': size === 'md'
      }
    ]"
  >
    <slot />
  </span>
</template>
