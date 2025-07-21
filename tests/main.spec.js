// main.test.js

// Mock fungsi Vue createApp dan method-methodnya
// Kami menggunakan vi.fn() untuk Vitest, yang umumnya digunakan dengan proyek Vue 3.
// Jika Anda menggunakan Jest, ganti `vi` dengan `jest`.
import { vi } from 'vitest';

const mockUse = vi.fn();
const mockMount = vi.fn();
const mockCreateApp = vi.fn(() => ({
  use: mockUse,
  mount: mockMount,
}));

// Mock fungsi createPinia
const mockCreatePinia = vi.fn(() => ({})); // Instance Pinia tidak memerlukan method spesifik untuk tes ini

// Mock import router
const mockRouter = {}; // Instance Router tidak memerlukan method spesifik untuk tes ini

// Mock komponen App (opsional, tetapi praktik yang baik untuk mencegah rendering komponen yang sebenarnya)
const mockApp = {};

// Mock import CSS (import CSS tidak memiliki efek runtime dalam tes)
vi.mock('../src/assets/css/main.css', () => ({})); // Perbarui path CSS

// Mock modul-modul yang diimpor oleh main.js
vi.mock('vue', () => ({
  createApp: mockCreateApp,
}));

vi.mock('pinia', () => ({
  createPinia: mockCreatePinia,
}));

vi.mock('../src/router', () => ({ // Perbarui path router
  default: mockRouter,
}));

vi.mock('../src/App.vue', () => ({ // Perbarui path App.vue
  default: mockApp,
}));

// Blok describe untuk suite pengujian
describe('main.js', () => {
  // Sebelum setiap tes, reset mock untuk memastikan keadaan yang bersih
  beforeEach(() => {
    mockUse.mockClear();
    mockMount.mockClear();
    mockCreateApp.mockClear();
    mockCreatePinia.mockClear();
  });

  // Kasus uji: Pastikan aplikasi dibuat, Pinia dan Router digunakan, dan aplikasi di-mount
  test('seharusnya membuat aplikasi, menggunakan Pinia dan Router, dan me-mount aplikasi', async () => {
    // Impor main.js secara dinamis untuk menjalankan kodenya
    // Ini penting karena kode di main.js langsung berjalan saat diimpor
    await import('../src/main.js'); // Perbarui path main.js

    // Pastikan createApp dipanggil dengan komponen App
    expect(mockCreateApp).toHaveBeenCalledTimes(1);
    expect(mockCreateApp).toHaveBeenCalledWith(mockApp);

    // Pastikan createPinia dipanggil
    expect(mockCreatePinia).toHaveBeenCalledTimes(1);

    // Pastikan app.use dipanggil dua kali: sekali untuk Pinia dan sekali untuk Router
    expect(mockUse).toHaveBeenCalledTimes(2);
    expect(mockUse).toHaveBeenCalledWith(mockCreatePinia()); // Verifikasi Pinia digunakan
    expect(mockUse).toHaveBeenCalledWith(mockRouter); // Verifikasi Router digunakan

    // Pastikan app.mount dipanggil dengan ID yang benar
    expect(mockMount).toHaveBeenCalledTimes(1);
    expect(mockMount).toHaveBeenCalledWith('#app');
  });
});
