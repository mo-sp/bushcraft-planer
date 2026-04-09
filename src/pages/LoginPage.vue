<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Trees, AlertCircle } from 'lucide-vue-next'
import { signIn } from '@shared/api/supabase'
import { BaseButton } from '@shared/ui'

const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  const result = await signIn(password.value)

  if (result.success) {
    window.location.href = ('/')
  } else {
    error.value = 'Falsches Passwort'
    password.value = ''
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 bg-deep-200">
    <div class="w-full max-w-sm space-y-8">
      <!-- Logo & Title -->
      <div class="text-center space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-forest-600/20 flex items-center justify-center mx-auto">
          <Trees class="w-8 h-8 text-forest-400" />
        </div>
        <h1 class="text-2xl font-bold text-earth-100">Nature Boyz</h1>
        <p class="text-earth-400 text-sm">Bushcraft Planer</p>
      </div>

      <!-- Login Form -->
      <div class="space-y-4">
        <div class="relative">
          <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-500" />
          <input
            v-model="password"
            type="password"
            placeholder="Passwort eingeben..."
            class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-deep-100 bg-deep-300 text-earth-100 placeholder-earth-500 focus:outline-none focus:border-forest-500 transition-colors"
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- Error -->
        <div v-if="error" class="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <BaseButton
          class="w-full justify-center"
          :disabled="!password || loading"
          @click="handleLogin"
        >
          {{ loading ? 'Anmelden...' : 'Anmelden' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>