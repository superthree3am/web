module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  rules: {
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: ['**/*.spec.js'],
      env: {
        jest: true, // ⬅️ Ini akan aktifkan globals: describe, it, expect
      },
      rules: {
        'no-undef': 'off', // ⬅️ Matikan error "not defined" karena sudah dihandle jest
      },
    },
  ],
};
