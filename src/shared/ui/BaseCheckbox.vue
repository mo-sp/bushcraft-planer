<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isChecked = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function toggle() {
  if (!props.disabled) {
    isChecked.value = !isChecked.value
  }
}
</script>

<template>
  <label
    :class="[
      'flex items-center gap-3 cursor-pointer select-none',
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    @click.prevent="toggle"
  >
    <div
      :class="[
        'flex items-center justify-center rounded-lg border-2 transition-all duration-200',
        isChecked
          ? 'bg-forest-600 border-forest-600'
          : 'bg-deep-300 border-deep-100',
        {
          'w-5 h-5': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-8 h-8': size === 'lg'
        }
      ]"
    >
      <Check
        v-if="isChecked"
        :class="[
          'text-white',
          {
            'w-3 h-3': size === 'sm',
            'w-4 h-4': size === 'md',
            'w-5 h-5': size === 'lg'
          }
        ]"
        :stroke-width="3"
      />
    </div>
    <span
      v-if="label"
      :class="[
        { 'line-through text-earth-500': isChecked, 'text-earth-200': !isChecked },
        {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg'
        }
      ]"
    >
      {{ label }}
    </span>
  </label>
</template>
