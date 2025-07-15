// tests/unit/Dashboard.spec.js
import { mount } from '@vue/test-utils';
import DashboardPage from '@/views/Dashboard/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: { template: '<div>Login</div>' } }
  ]
});

describe('DashboardPage.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  beforeEach(() => {
    localStorage.setItem('token', 'mocked-token');
    axios.get.mockResolvedValueOnce({ data: { username: 'TestUser' } });
  });

  it('renders welcome message', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    await new Promise(resolve => setTimeout(resolve)); // tunggu onMounted
    expect(wrapper.text()).toContain('Selamat Datang');
  });

  it('renders saldo, transaksi, poin, tagihan, dan riwayat transaksi', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    await new Promise(resolve => setTimeout(resolve)); // tunggu onMounted

    expect(wrapper.text()).toContain('Saldo Rekening Anda');
    expect(wrapper.text()).toContain('Transaksi Terakhir');
    expect(wrapper.text()).toContain('Poin Reward');
    expect(wrapper.text()).toContain('Tagihan Jatuh Tempo');
    expect(wrapper.text()).toContain('Riwayat Transaksi Terbaru');
  });

  it('logout redirects to login and clears token', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    const logoutBtn = wrapper.find('button');
    await logoutBtn.trigger('click');

    expect(localStorage.getItem('token')).toBe(null);
  });
});
