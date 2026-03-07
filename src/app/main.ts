import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

import App from './App.vue'
import router from './router'

import '../style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Android hardware back button
if (Capacitor.isNativePlatform()) {
  CapApp.addListener('backButton', () => {
    if (router.currentRoute.value.path === '/') {
      CapApp.minimizeApp()
    } else {
      router.back()
    }
  })
}
