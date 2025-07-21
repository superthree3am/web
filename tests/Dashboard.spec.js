import { mount } from '@vue/test-utils';
import DashboardPage from '@/views/Dashboard/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

// Mock router untuk tes
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/', component: DashboardPage }, // Halaman dashboard
  ]
});

describe('index.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  beforeEach(() => {
    localStorage.setItem('token', 'mocked-token');
    axios.get.mockResolvedValueOnce({ data: { username: 'TestUser' } });

    // Mock Firebase configuration
    vi.mock('firebase/app', () => ({
      initializeApp: vi.fn(),
    }));

    vi.mock('firebase/auth', () => ({
      getAuth: vi.fn(() => ({
        currentUser: {
          getIdToken: vi.fn(() => Promise.resolve('mocked-id-token')),
        },
      })),
      signOut: vi.fn(() => Promise.resolve()),
    }));
  });

  it('renders welcome message', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [createTestingPinia(), router],
      }
    });

    await new Promise(resolve => setTimeout(resolve)); // tunggu onMounted
    expect(wrapper.text()).toContain('Selamat Datang');
  });

  it('renders saldo, transaksi, poin, tagihan, dan riwayat transaksi', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [createTestingPinia(), router],
      }
    });

    await new Promise(resolve => setTimeout(resolve)); // tunggu onMounted

    expect(wrapper.text()).toContain('Saldo Rekening Anda');
    expect(wrapper.text()).toContain('Transaksi Terakhir');
    expect(wrapper.text()).toContain('Poin Reward');
    expect(wrapper.text()).toContain('Tagihan Jatuh Tempo');
    expect(wrapper.text()).toContain('Riwayat Transaksi Terbaru');
  });

  // Skip test logout
  it.skip('logout redirects to login and clears token', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [createTestingPinia(), router],
      }
    });

    // Temukan tombol logout dan trigger klik
    const logoutBtn = wrapper.find('button'); // pastikan ini tombol yang benar
    await logoutBtn.trigger('click'); // Trigger event click

    // Tunggu sebentar untuk memastikan perubahan status
    await new Promise(resolve => setTimeout(resolve, 100));

    // Pastikan localStorage sudah dibersihkan
    expect(localStorage.getItem('token')).toBe(null);

    // Periksa apakah rute sekarang berada di halaman login
    expect(router.currentRoute.value.path).toBe('/login');
    
    // Pastikan state store direset
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBe(null);
    expect(store.token).toBe(null);
  });
});
