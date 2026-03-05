<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      // Variants
      {
        'bg-forest-600 text-white hover:bg-forest-700 active:bg-forest-800': variant === 'primary',
        'bg-earth-200 text-bark-700 hover:bg-earth-300 active:bg-earth-400': variant === 'secondary',
        'bg-transparent text-bark-600 hover:bg-earth-200 active:bg-earth-300': variant === 'ghost',
        'bg-red-500 text-white hover:bg-red-600 active:bg-red-700': variant === 'danger'
      },
      // Sizes
      {
        'text-sm px-3 py-1.5 min-h-[32px]': size === 'sm',
        'text-base px-4 py-2.5 min-h-[44px]': size === 'md',
        'text-lg px-6 py-3 min-h-[52px]': size === 'lg'
      },
      // Full width
      { 'w-full': fullWidth }
    ]"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
    />
    <slot />
  </button>
</template>
