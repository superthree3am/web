module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true, // jika kamu pakai vitest, juga aman
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
  ],
  rules: {
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off', // jika kamu pakai nama file "index.vue"
  },
  overrides: [
    {
      files: ['**/*.spec.js'],
      env: { jest: true },
      rules: { 'no-undef': 'off' },
    },
  ],
};
