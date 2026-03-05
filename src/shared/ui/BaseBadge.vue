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
        'bg-bark-100 text-bark-700': variant === 'default',
        'bg-green-100 text-green-700': variant === 'success',
        'bg-amber-100 text-amber-700': variant === 'warning',
        'bg-red-100 text-red-700': variant === 'danger',
        'bg-forest-100 text-forest-700': variant === 'forest',
        'bg-earth-200 text-earth-700': variant === 'earth'
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
