import { mount } from '@vue/test-utils';
import RegisterPage from '@/views/Register/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

// Setup dummy router
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
});

// Mock store
const mockRegister = vi.fn(() =>
  Promise.resolve({ success: false, message: 'Invalid email format.' })
);

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    register: mockRegister
  })
}));

describe('RegisterPage.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('shows error on invalid email', async () => {
    const wrapper = mount(RegisterPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });

    // Isi field dengan email tidak valid
    await baseInputs[0].find('input').setValue('invalid'); // email
    await baseInputs[1].find('input').setValue('validpass123'); // password
    await baseInputs[2].find('input').setValue('validpass123'); // confirm

    await wrapper.find('form').trigger('submit.prevent');

    // Tunggu proses async selesai
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Invalid email format.');
  });
});
