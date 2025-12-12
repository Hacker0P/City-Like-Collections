// This file helps with auto-updates for PWA
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user if you want manual control
    // For now, autoUpdate in vite.config.js handles most, but this helper ensures registration
    if (confirm("New content available. Reload?")) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline")
  },
})
