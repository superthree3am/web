import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      // Tambahkan baris ini untuk mengecualikan file dari cakupan
      exclude: [
        '**/node_modules/**', // Mengecualikan semua yang ada di node_modules
        '**/dist/**',         // Mengecualikan output build
        '**/postcss.config.js',
        '**/tailwind.config.js',
        '**/vue.config.js', // Mengecualikan konfigurasi Vite
        '**/vitest.config.js',
        '**/.eslintrc.js',
        '**/babel.config.js',
        '**/src/views/SetNewPassword/index.vue',
         // Mengecualikan konfigurasi Vitest
        // Tambahkan pola lain jika ada file atau folder yang ingin dikecualikan
      ],
    }
  }
})