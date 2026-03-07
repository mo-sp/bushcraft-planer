<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string
  label: string
}

interface OptionGroup {
  label: string
  options: Option[]
}

interface Props {
  modelValue: string
  options?: Option[]
  groups?: OptionGroup[]
  emptyLabel?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Auswählen...',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedValue = computed({
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
    <select
      v-model="selectedValue"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full px-4 py-3 rounded-xl border-2 bg-deep-300 text-earth-100 transition-colors duration-200 appearance-none cursor-pointer',
        'focus:outline-none focus:ring-0',
        'bg-[url(\'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%237ec15a%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E\')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat',
        error
          ? 'border-red-500 focus:border-red-400'
          : 'border-deep-100 focus:border-forest-500',
        { 'opacity-50 cursor-not-allowed': disabled }
      ]"
    >
      <option value="" disabled class="bg-deep-300">
        {{ placeholder }}
      </option>
      <option v-if="emptyLabel" value="" class="bg-deep-300">
        {{ emptyLabel }}
      </option>

      <template v-if="groups">
        <optgroup
          v-for="group in groups"
          :key="group.label"
          :label="group.label"
          class="bg-deep-300"
        >
          <option
            v-for="opt in group.options"
            :key="opt.value"
            :value="opt.value"
            class="bg-deep-300"
          >
            {{ opt.label }}
          </option>
        </optgroup>
      </template>

      <template v-else>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="bg-deep-300"
        >
          {{ option.label }}
        </option>
      </template>
    </select>
    <p v-if="error" class="text-sm text-red-400">
      {{ error }}
    </p>
  </div>
</template>
