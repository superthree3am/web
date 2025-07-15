import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { vi } from 'vitest';

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}));

// Mock global fetch
global.fetch = vi.fn();

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('logs in successfully with correct credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { username: 'user@example.com' },
        token: 'fake-token',
        mfaRequired: false
      })
    });

    const store = useAuthStore();
    const result = await store.login({ username: 'user@example.com', password: 'password123' });

    expect(result.success).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('fake-token');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('handles login with MFA required', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { username: 'user@example.com' },
        token: 'mfa-token',
        mfaRequired: true
      })
    });

    const store = useAuthStore();
    const result = await store.login({ username: 'user@example.com', password: 'password123' });

    expect(result.success).toBe(true);
    expect(mockPush).toHaveBeenCalledWith('/otp');
  });

  it('fails login with incorrect credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Login gagal' })
    });

    const store = useAuthStore();
    const result = await store.login({ username: 'wrong', password: 'wrong' });

    expect(result.success).toBe(false);
    expect(store.isAuthenticated).toBe(false);
  });

  it('handles error during login', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const store = useAuthStore();
    const result = await store.login({ username: 'x', password: 'y' });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/kesalahan/i);
  });

  it('registers successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Pendaftaran berhasil' })
    });

    const store = useAuthStore();
    const result = await store.register({ username: 'test', password: '123' });

    expect(result.success).toBe(true);
  });

  it('register fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Pendaftaran gagal' })
    });

    const store = useAuthStore();
    const result = await store.register({ username: 'fail', password: 'fail' });

    expect(result.success).toBe(false);
  });

  it('handles error during registration', async () => {
    fetch.mockRejectedValueOnce(new Error('Error reg'));

    const store = useAuthStore();
    const result = await store.register({ username: 'x' });

    expect(result.success).toBe(false);
  });

  it('verifies OTP successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Verifikasi berhasil' })
    });

    const store = useAuthStore();
    const result = await store.verifyOtp('123456');

    expect(result.success).toBe(true);
  });

  it('fails OTP verification', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Verifikasi gagal' })
    });

    const store = useAuthStore();
    const result = await store.verifyOtp('000000');

    expect(result.success).toBe(false);
  });

  it('handles error during OTP verification', async () => {
    fetch.mockRejectedValueOnce(new Error('OTP error'));

    const store = useAuthStore();
    const result = await store.verifyOtp('123');

    expect(result.success).toBe(false);
  });

  it('logs out properly', async () => {
    const store = useAuthStore();
    store.isAuthenticated = true;
    store.user = { username: 'test' };
    localStorage.setItem('auth_token', 'token');

    await store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBe(null);
    expect(localStorage.getItem('auth_token')).toBe(null);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('checkAuth sets isAuthenticated based on token', () => {
    localStorage.setItem('auth_token', 'abc');
    const store = useAuthStore();
    store.checkAuth();

    expect(store.isAuthenticated).toBe(true);
  });
});
