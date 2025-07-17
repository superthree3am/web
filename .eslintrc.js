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
    'plugin:vue/vue3-essential', // kamu pakai ini di package.json
    'eslint:recommended'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off'
  }
};
