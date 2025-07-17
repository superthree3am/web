module.exports = {
  // ...
  plugins: ['vitest'],
  env: {
    'vitest/globals': true, // <--- ini penting
  },
  extends: [
    // ...
    'plugin:vitest/recommended'
  ],
};
