import { mount } from '@vue/test-utils';
import DashboardPage from '@/views/Dashboard/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { nextTick } from 'vue'; // Import nextTick

// Mock axios globally
vi.mock('axios');

// Mock Firebase globally (if authStore uses it)
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

// Mock router for tests
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: { template: '<div>Login</div>' } },
    { path: '/', name: 'Dashboard', component: DashboardPage },
  ]
});

describe('DashboardPage.vue', () => {
  let authStore;
  let pinia;

  beforeAll(async () => {
    await router.push('/');
    await router.isReady();
  });

  beforeEach(() => {
    // Clear all mocks and localStorage before each test to ensure isolation
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mocked-token');

    // Mock response for axios.get (e.g., for getProfile)
    axios.get.mockResolvedValue({ data: { username: 'TestUser', fullName: 'Test Full Name' } });

    // Initialize Pinia for each test with createSpy
    pinia = createTestingPinia({
      createSpy: vi.fn,
    });
    authStore = useAuthStore(pinia); // Get the mocked store instance

    // Set initial store state for each test
    authStore.isAuthenticated = true;
    authStore.user = { username: 'TestUser', fullName: 'Test Full Name' };
    authStore.token = 'mocked-token';

    // Mock the logout function in the store
    // This allows us to control its behavior and verify its calls.
    authStore.logout = vi.fn(async () => {
      authStore.isAuthenticated = false;
      authStore.user = null;
      authStore.token = null;
      localStorage.removeItem('token');
      await router.push('/login');
      await router.isReady(); 
    });

    // Mock checkAuth and getProfile to prevent real calls
    authStore.checkAuth = vi.fn(() => {
        authStore.isAuthenticated = true; 
    });
    authStore.getProfile = vi.fn(() => Promise.resolve({ success: true }));
  });

  it('renders welcome message with user\'s full name', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [pinia, router],
      }
    });

    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toMatch(/Selamat Datang, Test Full Name!/);
  });

  it('renders balance, transactions, points, bills, and transaction history', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [pinia, router],
      }
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Saldo Rekening Anda');
    expect(wrapper.text()).toContain('Transaksi Terakhir');
    expect(wrapper.text()).toContain('Poin Reward');
    expect(wrapper.text()).toContain('Tagihan Jatuh Tempo');
    expect(wrapper.text()).toContain('Riwayat Transaksi Terbaru');
  });

  it('logout redirects to login and clears token', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [pinia, router],
      }
    });

    await wrapper.vm.$nextTick();

    const logoutBtn = wrapper.find('[data-test="logout-button"]');
    expect(logoutBtn.exists()).toBe(true);

    await logoutBtn.trigger('click');

    await new Promise(resolve => {
        const checkRoute = () => {
            if (router.currentRoute.value.path === '/login') {
                resolve();
            } else {
                nextTick(checkRoute); 
            }
        };
        checkRoute();
    });
    
    expect(authStore.logout).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('token')).toBe(null);
    expect(router.currentRoute.value.path).toBe('/login'); 
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBe(null);
    expect(authStore.token).toBe(null);
  });
});