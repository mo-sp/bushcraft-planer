<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  done: []
}>()

const show = ref(true)
const fadeOut = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)
const showHint = ref(false)
const logoLoaded = ref(false)

function dismiss() {
  if (fadeOut.value) return
  fadeOut.value = true

  // Fade out audio
  if (audioRef.value) {
    const audio = audioRef.value
    const fadeInterval = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.05)
      } else {
        clearInterval(fadeInterval)
        audio.pause()
      }
    }, 50)
  }

  setTimeout(() => {
    show.value = false
    emit('done')
  }, 600)
}

function handleKey() {
  if (showHint.value) dismiss()
}

function handleTouch() {
  if (showHint.value) dismiss()
}

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = 0.7
    audioRef.value.play().catch(() => {
      // Autoplay may be blocked - that's ok
    })
  }

  setTimeout(() => {
    showHint.value = true
  }, 2000)

  window.addEventListener('keydown', handleKey)
  window.addEventListener('touchstart', handleTouch)
  window.addEventListener('click', handleTouch)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('touchstart', handleTouch)
  window.removeEventListener('click', handleTouch)
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<template>
  <Transition
    leave-active-class="transition-opacity duration-500"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-deep-400"
      :class="{ 'opacity-0 transition-opacity duration-500': fadeOut }"
    >
      <!-- Audio -->
      <audio ref="audioRef" src="/intro-song.mp3" preload="auto" />

      <!-- Logo with fade-in -->
      <div
        class="transition-all duration-1000 ease-out"
        :class="logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
      >
        <img
          src="/logo.jpg"
          alt="Nature Boyz"
          class="w-56 h-56 rounded-3xl object-cover shadow-2xl shadow-black/50 border-2 border-forest-700/30"
          @load="logoLoaded = true"
        />
      </div>

      <!-- Title -->
      <div
        class="mt-8 text-center transition-all duration-1000 delay-300"
        :class="logoLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <h1 class="text-4xl font-bold text-forest-300 tracking-wide">Nature Boyz</h1>
        <p class="text-lg text-forest-500 mt-1">Bushcraft Project Planer</p>
      </div>

      <!-- Credits -->
      <div
        class="mt-10 text-center transition-all duration-1000 delay-700"
        :class="logoLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <p class="text-earth-400 text-sm">Entwickelt von</p>
        <p class="text-earth-200 text-lg font-semibold mt-1">Claude & Moritz</p>
        <p class="text-forest-600 text-xs mt-3 tracking-wider uppercase">Version 0.8.0 Beta</p>
      </div>

      <!-- Continue hint -->
      <div
        class="absolute bottom-12 transition-opacity duration-700"
        :class="showHint ? 'opacity-100' : 'opacity-0'"
      >
        <p class="text-earth-500 text-sm animate-pulse">
          Beliebige Taste zum Fortfahren
        </p>
      </div>
    </div>
  </Transition>
</template>
