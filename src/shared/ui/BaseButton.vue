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
        'bg-forest-600 text-white hover:bg-forest-500 active:bg-forest-700': variant === 'primary',
        'bg-deep-50 text-earth-200 hover:bg-deep-100 active:bg-deep-200 border border-deep-50/50': variant === 'secondary',
        'bg-transparent text-earth-300 hover:bg-deep-100 active:bg-deep-200': variant === 'ghost',
        'bg-red-600 text-white hover:bg-red-500 active:bg-red-700': variant === 'danger'
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
