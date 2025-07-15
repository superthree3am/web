module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    'vitest/globals': true, // ⬅️ tambahkan ini untuk menghindari 'describe', 'it', dsb. error
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:vitest/recommended' // ⬅️ rekomendasi rules vitest
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['vue', 'vitest'],
  rules: {
    // Tambahkan custom rules jika perlu
  },
};
