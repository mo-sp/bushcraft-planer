<script setup lang="ts">
import { watch } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  closable?: boolean
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  centered: false
})

const emit = defineEmits<{
  close: []
}>()

function close() {
  if (props.closable) {
    emit('close')
  }
}

// Prevent body scroll when modal is open
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        :class="[
          'fixed inset-0 z-50 flex justify-center p-4',
          centered ? 'items-center' : 'items-end sm:items-center'
        ]"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-deep-500/80 backdrop-blur-sm"
          @click="close"
        />

        <!-- Modal content -->
        <Transition
          enter-active-class="duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="open"
            :class="[
              'relative w-full max-w-lg max-h-[85vh] bg-deep-200 shadow-xl overflow-hidden flex flex-col border border-deep-50/30',
              centered ? 'rounded-2xl' : 'rounded-t-2xl sm:rounded-2xl safe-bottom'
            ]"
          >
            <!-- Header -->
            <div
              v-if="title || closable"
              class="flex items-center justify-between p-4 border-b border-deep-100"
            >
              <h2 class="text-lg font-semibold text-earth-100">
                {{ title }}
              </h2>
              <button
                v-if="closable"
                class="p-2 -mr-2 rounded-full hover:bg-deep-100 transition-colors"
                @click="close"
              >
                <X class="w-5 h-5 text-earth-400" />
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-4">
              <slot />
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="p-4 border-t border-deep-100 bg-deep-300"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
