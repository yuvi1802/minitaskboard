import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: [
      'firebase',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions',
      'firebase/messaging',
      'firebase/analytics',
      'firebase/storage',
      'vue-router'
    ]
  }
})