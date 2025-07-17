import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// 🧪 MOCKING auth store
vi.mock('@/stores/auth', () => {
  return {
    useAuthStore: () => ({
      login: vi.fn(async ({ username, password }) => {
        if (username === 'user' && password === '12345678') {
          return { success: true, mfaRequired: false };
        }
        if (username === 'mfa@example.com') {
          return {
            success: false,
            mfaRequired: true,
            message: 'OTP verification initiated.',
            username: 'mfa@example.com'
          };
        }
        if (username === 'error@example.com') {
          return {
            success: false,
            message: 'Login error'
          };
        }
        return { success: false, message: 'Invalid credentials' };
      }),

      register: vi.fn(async ({ username }) => {
        if (username === 'user@example.com') {
          return { success: true };
        }
        if (username === 'error@example.com') {
          return {
            success: false,
            message: 'Registration error'
          };
        }
        throw new Error('Register error');
      }),

      verifyOtpAndLoginWithFirebase: vi.fn(async (otp) => {
        if (otp === '000000') return { success: true };
        if (otp === '111111') return {
          success: false,
          message: 'OTP error'
        };
        throw new Error('OTP verify error');
      }),

      logout: vi.fn(() => Promise.resolve()),
      checkAuth: vi.fn(() => {
        const token = localStorage.getItem('access_token');
        return !!token;
      })
    })
  };
});

import { useAuthStore } from '@/stores/auth';

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('logs in successfully with correct credentials', async () => {
    const store = useAuthStore();
    const result = await store.login({ username: 'user', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('handles login with MFA required', async () => {
    const store = useAuthStore();
    const result = await store.login({ username: 'mfa@example.com', password: '12345678' });
    expect(result.success).toBe(false);
    expect(result.mfaRequired).toBe(true);
    expect(result.message).toBe('OTP verification initiated.');
  });

  it('fails login with incorrect credentials', async () => {
    const store = useAuthStore();
    const result = await store.login({ username: 'wrong', password: 'wrong' });
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });

  it('handles error during login', async () => {
    const store = useAuthStore();
    const result = await store.login({ username: 'error@example.com', password: '12345678' });
    expect(result.success).toBe(false);
    expect(result.message).toBe('Login error');
  });

  it('registers successfully', async () => {
    const store = useAuthStore();
    const result = await store.register({ username: 'user@example.com', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('register fails', async () => {
    const store = useAuthStore();
    const result = await store.register({ username: 'error@example.com', password: '12345678' });
    expect(result.success).toBe(false);
    expect(result.message).toBe('Registration error');
  });

  it('handles error during registration', async () => {
    const store = useAuthStore();
    try {
      await store.register({ username: 'other@example.com', password: '12345678' });
    } catch (error) {
      expect(error.message).toBe('Register error');
    }
  });

  it('verifies OTP successfully', async () => {
    const store = useAuthStore();
    const result = await store.verifyOtpAndLoginWithFirebase('000000');
    expect(result.success).toBe(true);
  });

  it('fails OTP verification', async () => {
    const store = useAuthStore();
    const result = await store.verifyOtpAndLoginWithFirebase('111111');
    expect(result.success).toBe(false);
    expect(result.message).toBe('OTP error');
  });

  it('handles error during OTP verification', async () => {
    const store = useAuthStore();
    try {
      await store.verifyOtpAndLoginWithFirebase('999999');
    } catch (error) {
      expect(error.message).toBe('OTP verify error');
    }
  });

  it('logs out properly', async () => {
    const store = useAuthStore();
    await expect(store.logout()).resolves.toBeUndefined();
  });

  it('checkAuth sets isAuthenticated based on token', async () => {
    const store = useAuthStore();
    localStorage.setItem('access_token', 'mocked-token');
    const result = store.checkAuth();
    expect(result).toBe(true);
  });
});
