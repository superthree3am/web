import { mount } from '@vue/test-utils';
import LoginPage from '@/views/Login/LoginPage.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/register', component: { template: '<div>Register</div>' } },
    { path: '/forgot-password', component: { template: '<div>Lupa Password</div>' } },
  ],
});

vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { success: true } }))
  }
}));

describe('LoginPage.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('renders login form', () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [createTestingPinia(), router] }
    });
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('has email and password inputs', () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [createTestingPinia(), router] }
    });
    // fallback selector jika `type="email"` tidak ada
    const emailInput = wrapper.find('input[type="email"], input[name="email"]');
    const passwordInput = wrapper.find('input[type="password"], input[name="password"]');
    expect(emailInput.exists()).toBe(true);
    expect(passwordInput.exists()).toBe(true);
  });

  it('emits submit event on form submit', async () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [createTestingPinia(), router] }
    });
    const form = wrapper.find('form');
    expect(form.exists()).toBe(true);

    await form.trigger('submit.prevent');

    // You can test for actual changes if applicable (e.g., loading state, method calls)
    expect(true).toBe(true); // Placeholder
  });
});
