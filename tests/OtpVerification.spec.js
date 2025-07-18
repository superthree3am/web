import { mount, flushPromises } from '@vue/test-utils';
import OtpVerification from '@/views/Verifikasioke/OtpVerification.vue';
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

    // Adjust the expected text to match the actual text rendered
    expect(wrapper.text()).toContain('Please enter the 6-digit code sent to your registered phone number.');
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

    // Update the expected error message to match the actual message
    expect(wrapper.vm.errorMessage).toBe('OTP must be 6 digits long.');
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
      await inputs[i].trigger('input'); // Important to update v-model
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockVerifyOtp).toHaveBeenCalledWith('012345');
    expect(wrapper.vm.errorMessage).toBe('');
  });
});
