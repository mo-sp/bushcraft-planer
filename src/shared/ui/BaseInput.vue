<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url'
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      class="text-sm font-medium text-earth-200"
    >
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <input
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full px-4 py-3 rounded-xl border-2 bg-deep-300 text-earth-100 placeholder-earth-500 transition-colors duration-200',
        'focus:outline-none focus:ring-0',
        error
          ? 'border-red-500 focus:border-red-400'
          : 'border-deep-100 focus:border-forest-500',
        { 'opacity-50 cursor-not-allowed': disabled }
      ]"
    >
    <p v-if="error" class="text-sm text-red-400">
      {{ error }}
    </p>
  </div>
</template>
