// File: tests/Forgot.spec.js

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ForgotPasswordPage from '@/views/ForgotPassword/index.vue'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isLoading: false,
    error: null,
    resetPassword: vi.fn(),
  })),
}));

describe('ForgotPasswordPage.vue', () => {
  let wrapper;
  let authStore;
  let mockRouter;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRouter = {
      push: vi.fn(),
    };
    useRouter.mockReturnValue(mockRouter);
    
    authStore = useAuthStore();

    wrapper = mount(ForgotPasswordPage, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  });

  it('renders the form elements correctly', () => {
    expect(wrapper.find('h1').text()).toContain('Forgot your password?');
    expect(wrapper.find('p').text()).toContain('Enter your email address to receive a reset token.');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.text()).toContain('Reset Password');
  });

  it('renders a link to the login page', () => {
    const loginLink = wrapper.find('[to="/login"]');
    expect(loginLink.exists()).toBe(true);
    expect(loginLink.text()).toContain('Back to login');
  });
  
  it('does not display any error message initially', () => {
    expect(wrapper.find('.bg-red-100').exists()).toBe(false);
  });
});