import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth';

// 🧪 MOCK: Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => {
  const mockRecaptchaInstance = {
    render: vi.fn(() => Promise.resolve()),
    clear: vi.fn(),
  };

  return {
    getAuth: vi.fn(() => ({
      currentUser: {
        getIdToken: vi.fn(() => Promise.resolve('firebase-id-token')),
      },
    })),
    signInWithPhoneNumber: vi.fn(() =>
      Promise.resolve({
        confirm: vi.fn(() =>
          Promise.resolve({
            user: {
              getIdToken: () => Promise.resolve('verified-token'),
            },
          })
        ),
      })
    ),
    RecaptchaVerifier: vi.fn(() => mockRecaptchaInstance),
    __mockRecaptchaInstance: mockRecaptchaInstance, // optional access
  };
});

describe('auth store - real store with mocked Firebase', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAuthStore();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('logs in successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          token: 'mock-token',
          username: 'user1',
          user: { username: 'user1' },
        }),
      })
    );

    const result = await store.login({ username: 'user1', password: '1234' });
    expect(result.success).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('mock-token');
  });

  it('login with MFA required', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          phoneNumber: '+621234567890',
          username: 'mfauser',
        }),
      })
    );

    const result = await store.login({ username: 'mfauser', password: '1234' });
    expect(result.mfaRequired).toBe(true);
    expect(store.currentPhoneNumber).toBe('+621234567890');
  });

  it('fails login with invalid credentials', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ message: 'Login failed' }),
      })
    );

    const result = await store.login({ username: 'wrong', password: 'wrong' });
    expect(result.success).toBe(false);
    expect(store.isAuthenticated).toBe(false);
  });

  it('registers successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ message: 'Pendaftaran berhasil' }),
      })
    );

    const result = await store.register({
      fullName: 'Test User',
      email: 'test@example.com',
      username: 'tester',
      phone: '081234',
      password: 'password',
    });

    expect(result.success).toBe(true);
  });

  it('fails to send OTP without phone number', async () => {
    store.currentPhoneNumber = null;
    const result = await store.sendOtpFirebase();
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/phone number/i);
  });

  it('sends OTP successfully', async () => {
    store.currentPhoneNumber = '+628123456789';
    const result = await store.sendOtpFirebase();
    expect(result.success).toBe(true);
  });

  it('verifies OTP and logs in via Firebase', async () => {
    store.currentPhoneNumber = '+628123456789';

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          token: 'verified-token',
          username: 'firebaseuser',
        }),
      })
    );

    await store.sendOtpFirebase();
    const result = await store.verifyOtpAndLoginWithFirebase('000000');

    expect(result.success).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('verified-token');
  });

  it('fails OTP verification if confirmationResult is missing', async () => {
    const result = await store.verifyOtpAndLoginWithFirebase('123456');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/OTP flow not initiated/);
  });

  it('clears store on logout', () => {
    store.token = 'xxx';
    store.user = { username: 'test' };
    store.isAuthenticated = true;
    store.currentPhoneNumber = 'dummy';

    store.logout();

    expect(store.token).toBe(null);
    expect(store.user).toBe(null);
    expect(store.isAuthenticated).toBe(false);
    expect(store.currentPhoneNumber).toBe(null);
  });

  it('checkAuth sets auth state from localStorage', () => {
    localStorage.setItem('auth_token', 'stored-token');
    store.checkAuth();
    expect(store.isAuthenticated).toBe(true);
  });

  it('checkAuth sets auth state false if token not found', () => {
    store.checkAuth();
    expect(store.isAuthenticated).toBe(false);
  });
});
