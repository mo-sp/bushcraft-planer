<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  modelValue: string
  suggestions: string[]
  label?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'enter': []
}>()

const showDropdown = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const filteredSuggestions = computed(() => {
  const query = props.modelValue.toLowerCase().trim()
  if (!query) return props.suggestions
  return props.suggestions.filter(s =>
    s.toLowerCase().includes(query) && s !== props.modelValue
  )
})

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  showDropdown.value = true
}

function selectSuggestion(name: string) {
  emit('update:modelValue', name)
  showDropdown.value = false
  nextTick(() => inputRef.value?.blur())
}

function onFocus() {
  if (props.suggestions.length > 0) {
    showDropdown.value = true
  }
}

function onBlur() {
  // Delay to allow click on suggestion
  setTimeout(() => { showDropdown.value = false }, 150)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 relative">
    <label v-if="label" class="text-sm font-medium text-earth-200">
      {{ label }}
    </label>
    <input
      ref="inputRef"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full px-4 py-3 rounded-xl border-2 bg-deep-300 text-earth-100 placeholder-earth-500 transition-colors duration-200 focus:outline-none focus:ring-0 border-deep-100 focus:border-forest-500"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keyup.enter="emit('enter')"
    >
    <!-- Suggestions dropdown -->
    <div
      v-if="showDropdown && filteredSuggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-deep-300 border-2 border-deep-100 rounded-xl overflow-hidden z-50 shadow-lg"
    >
      <button
        v-for="name in filteredSuggestions"
        :key="name"
        type="button"
        class="w-full text-left px-4 py-2.5 text-sm text-earth-200 hover:bg-deep-200 active:bg-deep-100 transition-colors"
        @mousedown.prevent="selectSuggestion(name)"
      >
        {{ name }}
      </button>
    </div>
  </div>
</template>
