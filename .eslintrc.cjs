module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
  ],
  plugins: ['vue'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-debugger': 'warn',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
    'vue/html-indent': ['warn', 2],
    'vue/attributes-order': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/v-on-event-hyphenation': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/require-default-prop': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', '**/*.spec.js'],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  ],
};
