import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path' // <-- tambahkan ini

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // <-- tambahkan ini
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage'
    }
  }
})
