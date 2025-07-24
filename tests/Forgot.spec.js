import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue'; // <--- PASTIKAN INI ADA
import ForgotPasswordPage from '../src/views/ForgotPassword/index.vue';

import { useRouter } from 'vue-router';

// --- MOCKING UNTUK VUE-ROUTER ---
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

// Mock global untuk <router-link>
const mockRouterLink = {
  name: 'router-link',
  template: '<a><slot /></a>',
  props: ['to']
};

// --- MOCKING UNTUK FIREBASE ---
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}));

// --- INI ADALAH MOCK UNTUK STORE KITA ---
// Deklarasikan variabel yang akan menampung mock store.
// Properti state (isLoading, error) sekarang menggunakan ref untuk reaktivitas.
let mockAuthStore = {
  resetPassword: vi.fn(),
  isLoading: ref(false), // <--- Menggunakan ref()
  error: ref(null),     // <--- Menggunakan ref()
};

// Mock modul store '@/stores/auth'.
// Setiap kali useAuthStore dipanggil, ia akan mengembalikan objek mockAuthStore.
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}));


describe('ForgotPasswordPage', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = vi.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });

    // --- RESET MOCK STORE STATE DAN SPY UNTUK SETIAP TES ---
    // Karena mockAuthStore adalah objek yang sama untuk semua tes, kita reset di sini.
    mockAuthStore.resetPassword.mockReset(); // Reset spy
    mockAuthStore.isLoading.value = false; // <--- Mengakses .value
    mockAuthStore.error.value = null;     // <--- Mengakses .value
  });

  // Test Case 1: Memastikan komponen dirender dengan benar dan elemen awal terlihat
  it('renders correctly and displays initial elements', () => {
    const wrapper = mount(ForgotPasswordPage, {
      global: {
        components: {
          'router-link': mockRouterLink,
        }
      },
    });

    expect(wrapper.find('h1').text()).toBe('Forgot your password?');
    expect(wrapper.find('p').text()).toContain('Enter your email address to receive a reset token.');
    expect(wrapper.find('#userEmail').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Reset Password');
    expect(wrapper.find('.bg-red-100').exists()).toBe(false);
    expect(wrapper.find('a').text()).toBe('Back to login');
  });

  // Test Case 2: Memastikan model emailOrUsername diperbarui saat input berubah
  it('updates emailOrUsername model on input', async () => {
    const wrapper = mount(ForgotPasswordPage, {
      global: {
        components: { 'router-link': mockRouterLink }
      },
    });

    const emailInput = wrapper.find('#userEmail');
    await emailInput.setValue('test@example.com');
    expect(emailInput.element.value).toBe('test@example.com');
  });

  // Test Case 3: Memastikan pesan error ditampilkan saat reset password gagal
  it('displays error message on failed password reset attempt', async () => {
    // Mengatur perilaku mock untuk aksi resetPassword hanya untuk test ini
    mockAuthStore.resetPassword.mockResolvedValue({ success: false, message: 'Terjadi kesalahan, coba lagi.' });
    // Juga set state error pada mock store (mengakses .value)
    mockAuthStore.error.value = 'Terjadi kesalahan, coba lagi.'; // <--- Mengakses .value

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        components: { 'router-link': mockRouterLink }
      },
    });

    await wrapper.find('#userEmail').setValue('nonexistent@example.com');
    await wrapper.find('form').trigger('submit');

    await wrapper.vm.$nextTick();
    expect(mockAuthStore.resetPassword).toHaveBeenCalledWith({ emailOrUsername: 'nonexistent@example.com' }); // Verifikasi pemanggilan
    expect(wrapper.find('.bg-red-100').exists()).toBe(true);
    expect(wrapper.find('.bg-red-100').text()).toContain('ERROR: Terjadi kesalahan, coba lagi.');
    expect(wrapper.find('button[type="submit"]').text()).toBe('Reset Password');
  });

  // Test Case 4: Memastikan status loading ditampilkan selama proses reset password
  it('shows loading state during password reset attempt', async () => {
    // Mengatur perilaku mock untuk aksi resetPassword agar tetap pending
    mockAuthStore.resetPassword.mockReturnValue(new Promise(() => {}));
    // Atur state isLoading pada mock store (mengakses .value)
    mockAuthStore.isLoading.value = true; // <--- Mengakses .value

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        components: { 'router-link': mockRouterLink }
      },
    });

    await wrapper.find('#userEmail').setValue('test@example.com');
    await wrapper.find('form').trigger('submit');

    await wrapper.vm.$nextTick();
    expect(mockAuthStore.resetPassword).toHaveBeenCalledWith({ emailOrUsername: 'test@example.com' }); // Verifikasi pemanggilan
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('button[type="submit"]').text()).toContain('Memuat...');
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true);
  });

  // Test Case 5: Memastikan pengalihan ke halaman login setelah reset password sukses
  it('redirects to login page on successful password reset', async () => {
    // Mengatur perilaku mock untuk aksi resetPassword agar sukses
    mockAuthStore.resetPassword.mockResolvedValue({ success: true });
    mockAuthStore.isLoading.value = false; // Pastikan loading false setelah sukses
    mockAuthStore.error.value = null;     // Pastikan error null setelah sukses

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        components: { 'router-link': mockRouterLink }
      },
    });

    await wrapper.find('#userEmail').setValue('user@example.com');
    await wrapper.find('form').trigger('submit');

    await wrapper.vm.$nextTick();
    expect(mockAuthStore.resetPassword).toHaveBeenCalledWith({ emailOrUsername: 'user@example.com' }); // Verifikasi pemanggilan
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(wrapper.find('.bg-red-100').exists()).toBe(false);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Reset Password');
  });

  // Test Case 6: Memastikan pesan error generik ditampilkan pada kesalahan jaringan atau tidak terduga
  it('displays generic error message on network or unexpected error', async () => {
    // Mengatur perilaku mock untuk aksi resetPassword agar me-reject promise
    mockAuthStore.resetPassword.mockRejectedValue(new Error('Network error'));
    mockAuthStore.error.value = 'Terjadi kesalahan, coba lagi.'; // Asumsi pesan error generik dari komponen
    mockAuthStore.isLoading.value = false;

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        components: { 'router-link': mockRouterLink }
      },
    });

    await wrapper.find('#userEmail').setValue('test@example.com');
    await wrapper.find('form').trigger('submit');

    await wrapper.vm.$nextTick();
    expect(mockAuthStore.resetPassword).toHaveBeenCalledWith({ emailOrUsername: 'test@example.com' }); // Verifikasi pemanggilan
    expect(wrapper.find('.bg-red-100').exists()).toBe(true);
    expect(wrapper.find('.bg-red-100').text()).toContain('ERROR: Terjadi kesalahan, coba lagi.');
    expect(wrapper.find('button[type="submit"]').text()).toBe('Reset Password');
  });

  // Test Case 7: Memastikan tombol dinonaktifkan ketika isLoading is true
  it('disables the button when isLoading is true', async () => {
    // Untuk test ini, kita tidak perlu memanggil mockAuthStore.resetPassword
    // Cukup set isLoading secara langsung pada mockAuthStore
    mockAuthStore.isLoading.value = true; // <--- Mengakses .value

    const wrapper = mount(ForgotPasswordPage, {
      global: {
        components: { 'router-link': mockRouterLink }
      },
    });

    await wrapper.vm.$nextTick(); // Biarkan Vue merender ulang berdasarkan perubahan di store
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    // Tambahan, pastikan teks tombol juga berubah jika ada indikator loading
    expect(wrapper.find('button[type="submit"]').text()).toContain('Memuat...');
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true);
  });
});