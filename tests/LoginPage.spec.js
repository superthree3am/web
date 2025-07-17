import { mount } from '@vue/test-utils';
import LoginPage from '@/views/Login/LoginPage.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

// Setup router dummy
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/register', component: { template: '<div>Register</div>' } },
    { path: '/forgot-password', component: { template: '<div>Lupa Password</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
  ]
});

// Mock store login method
const mockLogin = vi.fn(() =>
  Promise.resolve({
    success: true,
    mfaRequired: false
  })
);

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isAuthenticated: true
  })
}));

describe('LoginPage.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('renders login form with BaseInput components', () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    // Cek jumlah BaseInput (2 input: username & password)
    const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });
    expect(baseInputs.length).toBe(2);

    // Pastikan masing-masing BaseInput memiliki elemen input
    baseInputs.forEach(input => {
      expect(input.find('input').exists()).toBe(true);
    });
  });

  it('shows error if username or password is empty', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Username and password are required.');
  });

  it('calls login and navigates to dashboard on valid credentials', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });

    await baseInputs[0].find('input').setValue('validuser');
    await baseInputs[1].find('input').setValue('validpassword');

    await wrapper.find('form').trigger('submit.prevent');

    expect(mockLogin).toHaveBeenCalledWith({
      username: 'validuser',
      password: 'validpassword'
    });
  });
});
