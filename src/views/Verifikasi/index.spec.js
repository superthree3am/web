import { mount, flushPromises } from '@vue/test-utils';
import OtpVerification from '@/views/Verifikasi/OtpVerification.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/dashboard', component: { template: '<div>Dashboard</div>' } }],
});

const mockVerifyOtp = vi.fn(() => Promise.resolve({ success: true }));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    verifyOtp: mockVerifyOtp,
  }),
}));

describe('OtpVerification.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('renders OTP verification instructions and input', () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    expect(wrapper.text()).toContain('Enter the OTP code');
    expect(wrapper.findAll('input').length).toBe(6);
  });

  it('shows error if OTP is incomplete', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await wrapper.findAll('input')[0].setValue('1');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('OTP must contain 6 digits.');
  });

  it('calls verifyOtp if OTP is complete', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    const inputs = wrapper.findAll('input');

    const code = ['0', '1', '2', '3', '4', '5'];
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(code[i]);
      await inputs[i].trigger('input'); // penting untuk update v-model
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockVerifyOtp).toHaveBeenCalledWith('012345');
    expect(wrapper.vm.errorMessage).toBe('');
  });
});
