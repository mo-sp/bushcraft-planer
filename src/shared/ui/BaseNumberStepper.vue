<script setup lang="ts">
import { Plus, Minus } from 'lucide-vue-next'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  step: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function increment() {
  const next = props.modelValue + props.step
  if (props.max !== undefined && next > props.max) return
  emit('update:modelValue', next)
}

function decrement() {
  const next = props.modelValue - props.step
  if (next < props.min) return
  emit('update:modelValue', next)
}

function onInput(event: Event) {
  const val = Number((event.target as HTMLInputElement).value)
  if (!isNaN(val)) {
    emit('update:modelValue', Math.max(props.min, props.max !== undefined ? Math.min(val, props.max) : val))
  }
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-earth-200">
      {{ label }}
    </label>
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="w-12 h-12 rounded-xl bg-forest-700 text-white flex items-center justify-center hover:bg-forest-600 active:scale-95 transition-all disabled:bg-forest-900 disabled:text-forest-600 border border-forest-500/40"
        :disabled="modelValue <= min"
        @click="decrement"
      >
        <Minus class="w-5 h-5" />
      </button>

      <input
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        class="flex-1 text-center text-xl font-semibold text-earth-100 bg-deep-300 border-2 border-deep-100 rounded-xl py-3 focus:outline-none focus:border-forest-500 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        @input="onInput"
      />

      <button
        type="button"
        class="w-12 h-12 rounded-xl bg-forest-600 text-white flex items-center justify-center hover:bg-forest-500 active:scale-95 transition-all disabled:opacity-30"
        :disabled="max !== undefined && modelValue >= max"
        @click="increment"
      >
        <Plus class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
