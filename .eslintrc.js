module.exports = {
  // ...
  // plugins: ['vitest'], // HAPUS ini
  env: {
    // 'vitest/globals': true, // HAPUS ini
    jest: true, // GANTI dengan ini jika perlu
  },
  overrides: [
    {
      files: ['**/*.spec.js'],
      env: {
        jest: true, // ini aktifkan global seperti `describe`, `it`, `expect`
      },
    },
  ],
};
