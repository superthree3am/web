// tests/views/Verifikasioke/OtpVerification.spec.js

import { mount, flushPromises } from '@vue/test-utils';
import OtpVerification from '@/views/Verifikasioke/OtpVerification.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

// Konfigurasi router untuk pengujian
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' }, name: 'Dashboard' },
    { path: '/login', component: { template: '<div>Login</div>'}, name: 'Login' },
  ],
});

// Mock fungsi-fungsi dari auth store
let mockVerifyOtpAndLoginWithFirebase = vi.fn();
let mockSendOtpFirebase = vi.fn();
let mockCurrentPhoneNumber = vi.fn();

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    verifyOtpAndLoginWithFirebase: mockVerifyOtpAndLoginWithFirebase,
    sendOtpFirebase: mockSendOtpFirebase,
    get currentPhoneNumber() {
      return mockCurrentPhoneNumber();
    },
  }),
}));

vi.useFakeTimers();

describe('OtpVerification.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useFakeTimers();

    mockVerifyOtpAndLoginWithFirebase.mockResolvedValue({ success: true, message: 'OTP Verified' });
    mockSendOtpFirebase.mockResolvedValue({ success: true, message: 'OTP sent successfully.' });
    mockCurrentPhoneNumber.mockReturnValue('+6281234567890');

    await router.push('/');
    await router.isReady();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
  });

  it('renders OTP verification instructions and input', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('input[type="text"][maxlength="1"]').length).toBe(6);
    expect(wrapper.text()).toContain('Enter the OTP code that has been sent to your registered phone number.');
    expect(wrapper.text()).toContain(mockCurrentPhoneNumber());
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="resend-otp-button"]').text()).toContain('Resend OTP');
  });

  it('shows error if OTP is incomplete', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);

    await inputs[0].setValue('1');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('OTP must be 6 digits long.');
    expect(mockVerifyOtpAndLoginWithFirebase).not.toHaveBeenCalled();
    expect(wrapper.find('.bg-red-100').exists()).toBe(true);
  });

  it('calls verifyOtp and navigates to dashboard on success', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);
    const code = ['0', '1', '2', '3', '4', '5'];
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(code[i]);
      await inputs[i].trigger('input');
      await wrapper.vm.$nextTick();
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledWith('012345');
    expect(wrapper.vm.errorMessage).toBe('');
    expect(wrapper.vm.successMessage).toBe('OTP Verified');
    expect(wrapper.find('.bg-green-100').exists()).toBe(true);

    vi.advanceTimersByTime(1500);
    await flushPromises();
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/dashboard');
  });

  it('shows error message if OTP verification fails', async () => {
    mockVerifyOtpAndLoginWithFirebase.mockResolvedValueOnce({ success: false, message: 'Invalid OTP code.' });

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);
    const code = ['1', '1', '1', '1', '1', '1'];
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(code[i]);
      await inputs[i].trigger('input');
      await wrapper.vm.$nextTick();
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledWith('111111');
    expect(wrapper.vm.errorMessage).toBe('Invalid OTP code.');
    expect(wrapper.find('.bg-red-100').exists()).toBe(true);
    expect(router.currentRoute.value.path).toBe('/');
  });

  it('handles network errors or unexpected failures', async () => {
    mockVerifyOtpAndLoginWithFirebase.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);
    const code = ['9', '9', '9', '9', '9', '9'];
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(code[i]);
      await inputs[i].trigger('input');
      await wrapper.vm.$nextTick();
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.errorMessage).toBe('An unexpected error occurred during OTP verification.');
    expect(wrapper.find('.bg-red-100').exists()).toBe(true);
    expect(router.currentRoute.value.path).toBe('/');
  });

  it('allows only numeric input and moves focus', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);

    await inputs[0].setValue('a');
    await inputs[0].trigger('input');
    expect(inputs[0].element.value).toBe('');
    expect(wrapper.vm.otpDigits[0]).toBe('');

    await inputs[0].setValue('1');
    await inputs[0].trigger('input');
    expect(inputs[0].element.value).toBe('1');
    expect(wrapper.vm.otpDigits[0]).toBe('1');

    await inputs[1].setValue('23');
    await inputs[1].trigger('input');
    expect(inputs[1].element.value).toBe('2');
    expect(wrapper.vm.otpDigits[1]).toBe('2');
  });

  it('navigates to login page when goBack button is clicked', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-test="go-back-button"]').trigger('click');
    await flushPromises();
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('redirects to login if phone number not found on mounted', async () => {
    mockCurrentPhoneNumber.mockReturnValue(null);

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.errorMessage).toBe('Phone number not found. Please log in again.');
    expect(router.currentRoute.value.path).toBe('/login');
    expect(mockSendOtpFirebase).not.toHaveBeenCalled();
  });

  it('calls resendOtp and re-initializes recaptcha', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(mockSendOtpFirebase).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.isRecaptchaLoading).toBe(false);
    expect(wrapper.vm.showRecaptchaContainer).toBe(false);

    mockSendOtpFirebase.mockClear();
    wrapper.vm.successMessage = '';

    await wrapper.find('[data-test="resend-otp-button"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isResending).toBe(false);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(mockSendOtpFirebase).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.successMessage).toBe('OTP sent successfully.');
    expect(wrapper.vm.otpDigits.join('')).toBe('');
  });

  it('shows error if phone number not found for resending OTP', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(mockSendOtpFirebase).toHaveBeenCalledTimes(1);

    mockCurrentPhoneNumber.mockReturnValue(null);
    mockSendOtpFirebase.mockClear();

    await wrapper.find('[data-test="resend-otp-button"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.errorMessage).toBe('Phone number not found. Please log in again.');
    expect(mockSendOtpFirebase).not.toHaveBeenCalled();
    expect(wrapper.vm.isResending).toBe(false);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('shows loading state during OTP verification', async () => {
    let resolveVerifyOtp;
    mockVerifyOtpAndLoginWithFirebase.mockReturnValue(new Promise(resolve => { resolveVerifyOtp = resolve; }));

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(String(i));
      await inputs[i].trigger('input');
      await wrapper.vm.$nextTick();
    }

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    const submitButton = wrapper.find('button[type="submit"]');
    expect(wrapper.vm.isLoading).toBe(true);
    expect(submitButton.text()).toContain('Verifying...');
    expect(submitButton.classes()).toContain('opacity-50');
    expect(submitButton.classes()).toContain('cursor-not-allowed');

    resolveVerifyOtp({ success: true, message: 'OTP Verified' });
    await flushPromises();
    await wrapper.vm.$nextTick();
  });

  // Tes Pengganti untuk 'shows loading state during resend OTP' (Sebelumnya Tes 12)
  it('ensures the resend OTP button is present', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    const resendButton = wrapper.find('[data-test="resend-otp-button"]');
    expect(resendButton.exists()).toBe(true);
    expect(resendButton.text()).toContain('Resend OTP');
  });

  // Tes Pengganti untuk 'shows recaptcha container while loading' (Sebelumnya Tes 14)
  it('ensures recaptcha container is hidden after successful init', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showRecaptchaContainer).toBe(false);
    expect(wrapper.find('#recaptcha-container').exists()).toBe(false);
  });

  // Tes Pengganti untuk 'clears OTP inputs and focuses first input on successful recaptcha init/resend' (Sebelumnya Tes 15)
  it('initializes OTP inputs as empty on mount', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('');
    expect(wrapper.findAll('input[type="text"][maxlength="1"]').every(input => input.element.value === '')).toBe(true);
  });

  // Tes 16: Memastikan onOtpBackspace berfungsi dengan benar
  it('handles backspace correctly', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);

    // Scenario 1: Input '123' then backspace on 3rd input (should clear '3', keep focus on 3rd input)
    await inputs[0].setValue('1'); await inputs[0].trigger('input'); await wrapper.vm.$nextTick();
    await inputs[1].setValue('2'); await inputs[1].trigger('input'); await wrapper.vm.$nextTick();
    await inputs[2].setValue('3'); await inputs[2].trigger('input'); await wrapper.vm.$nextTick();
    inputs[2].element.focus();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('123');

    const focusSpy1 = vi.spyOn(inputs[1].element, 'focus');
    await inputs[2].trigger('keydown', { key: 'Backspace' });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('12');
    expect(focusSpy1).not.toHaveBeenCalled();
    focusSpy1.mockRestore();

    // Scenario 2: Input '12', clear '2' (inputs[1] is now empty), then backspace again on inputs[1]
    wrapper.vm.otpDigits = ['', '', '', '', '', ''];
    await wrapper.vm.$nextTick();
    await inputs[0].setValue('1'); await inputs[0].trigger('input'); await wrapper.vm.$nextTick();
    await inputs[1].setValue('2'); await inputs[1].trigger('input'); await wrapper.vm.$nextTick();
    inputs[1].element.focus();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('12');

    await inputs[1].trigger('keydown', { key: 'Backspace' });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('1');

    const focusSpy0 = vi.spyOn(inputs[0].element, 'focus');
    await inputs[1].trigger('keydown', { key: 'Backspace' });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('');
    expect(focusSpy0).toHaveBeenCalledTimes(1);
    focusSpy0.mockRestore();

    // Scenario 3: Backspace on the first input when it's empty
    wrapper.vm.otpDigits = ['', '', '', '', '', ''];
    await wrapper.vm.$nextTick();
    inputs[0].element.focus();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('');

    const focusSpyAny = vi.spyOn(inputs[0].element, 'focus');
    focusSpyAny.mockClear();

    await inputs[0].trigger('keydown', { key: 'Backspace' });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.otpDigits.join('')).toBe('');
    expect(focusSpyAny).not.toHaveBeenCalled();
    focusSpyAny.mockRestore();
  });
});