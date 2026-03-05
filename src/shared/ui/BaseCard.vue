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
      'bg-white rounded-2xl shadow-card transition-shadow duration-200',
      { 'hover:shadow-card-hover cursor-pointer': hoverable },
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
