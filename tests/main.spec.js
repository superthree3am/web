import { describe, it, expect, vi } from 'vitest';

vi.mock('vue', async () => {
  const vue = await vi.importActual('vue');
  return {
    ...vue,
    createApp: () => ({
      use: vi.fn().mockReturnThis(),
      mount: vi.fn().mockReturnThis()
    })
  };
});

vi.mock('@/App.vue', () => ({
  default: {}
}));

vi.mock('@/router', () => ({
  default: {} // ✅ Fix ini penting!
}));

vi.mock('pinia', async () => {
  const pinia = await vi.importActual('pinia');
  return {
    ...pinia,
    createPinia: () => ({})
  };
});

vi.mock('@/assets/css/main.css', () => ({}));

import '@/main.js'; // jalankan main.js untuk testing

describe('main.js', () => {
  it('should run without crashing', () => {
    expect(true).toBe(true);
  });
});
