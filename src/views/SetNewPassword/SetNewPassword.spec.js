import { mount, flushPromises } from '@vue/test-utils';
import SetNewPassword from '@/views/SetNewPassword/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/login', component: { template: '<div>Login</div>' } }],
});

const mockSetNewPassword = vi.fn(() => Promise.resolve({ success: true }));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    setNewPassword: mockSetNewPassword
  })
}));

describe('SetNewPassword.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('shows new password form', () => {
    const wrapper = mount(SetNewPassword, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    expect(wrapper.text()).toContain('Buat Kata Sandi Baru');
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('shows error if passwords do not match', async () => {
    const wrapper = mount(SetNewPassword, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await wrapper.find('#resetToken').setValue('DUMMY_RESET_TOKEN_123');
    await wrapper.find('#password').setValue('Password123');
    await wrapper.find('#confirmPassword').setValue('Different123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.confirmPasswordError).toBe('Kata sandi tidak cocok.');
  });

  it('calls store method when passwords match', async () => {
    const wrapper = mount(SetNewPassword, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await wrapper.find('#resetToken').setValue('DUMMY_RESET_TOKEN_123');
    await wrapper.find('#password').setValue('Password123');
    await wrapper.find('#confirmPassword').setValue('Password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockSetNewPassword).toHaveBeenCalled();
    expect(wrapper.vm.alertType).toBe('success');
  });
});
