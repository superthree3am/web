// tests/unit/auth.spec.js
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { vi } from 'vitest';

// Mock router.push
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

// Mock fetch
global.fetch = vi.fn();

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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
  });

  it('fails login with incorrect credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Login gagal' })
    });

    const store = useAuthStore();
    const result = await store.login({ username: 'wrong@example.com', password: 'wrong' });
    expect(result.success).toBe(false);
    expect(store.isAuthenticated).toBe(false);
  });

  it('logs out properly', () => {
    const store = useAuthStore();
    store.isAuthenticated = true;
    store.user = { username: 'test' };
    store.logout();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBe(null);
  });
});
