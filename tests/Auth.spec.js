import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Deklarasikan variabel untuk menyimpan referensi ke mock functions
let mockInitializeApp;
let mockSignInWithPhoneNumber;
let mockRecaptchaVerifierRender;
let mockRecaptchaVerifierClear;
let mockRecaptchaVerifierClass;
let mockSignOut;
let firebaseAuthInstance;
let useAuthStore;

// Implementasi mock localStorage kustom yang akan kita gunakan
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: vi.fn(function(key) {
      return store[key] || null;
    }),
    setItem: vi.fn(function(key, value) {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(function(key) {
      delete store[key];
    }),
    clear: vi.fn(function() {
      store = {};
    })
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock Firebase harus dilakukan sebelum impor store
vi.doMock('firebase/app', () => {
  mockInitializeApp = vi.fn(() => ({}));
  return {
    initializeApp: mockInitializeApp,
  };
});

vi.doMock('firebase/auth', async () => {
  const createMockFirebaseAuth = () => {
    return {
      currentUser: null,
    };
  };

  mockSignInWithPhoneNumber = vi.fn(() => Promise.resolve({
    verificationId: 'mock-verification-id',
    confirm: vi.fn((code) => {
      if (code === '123456') {
        return Promise.resolve({ user: { getIdToken: vi.fn(() => 'mock-firebase-id-token') } });
      }
      return Promise.reject({ code: 'auth/invalid-verification-code', message: 'The verification code is invalid.' });
    }),
  }));

  mockRecaptchaVerifierRender = vi.fn(() => Promise.resolve());
  mockRecaptchaVerifierClear = vi.fn();
  mockRecaptchaVerifierClass = vi.fn(() => ({
    render: mockRecaptchaVerifierRender,
    clear: mockRecaptchaVerifierClear,
  }));

  mockSignOut = vi.fn(() => {
    if (firebaseAuthInstance) {
      firebaseAuthInstance.currentUser = null;
    }
    return Promise.resolve();
  });

  return {
    getAuth: vi.fn(() => {
      if (!firebaseAuthInstance) {
        firebaseAuthInstance = createMockFirebaseAuth();
      }
      return firebaseAuthInstance;
    }),
    signInWithPhoneNumber: mockSignInWithPhoneNumber,
    RecaptchaVerifier: mockRecaptchaVerifierClass,
    signOut: mockSignOut,
  };
});

describe('auth store - real store with mocked Firebase', () => {
  let store;
  let fetchSpy;

  beforeEach(async () => {
    firebaseAuthInstance = null;
    setActivePinia(createPinia());
    
    const module = await import('../src/stores/auth');
    useAuthStore = module.useAuthStore;
    store = useAuthStore();
    
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(global, 'fetch');
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    firebaseAuthInstance = null;
  });

  it('logs in successfully', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'mock-token', username: 'user1', user: { username: 'user1' } }),
    });

    const result = await store.login({ username: 'user1', password: 'password123' });

    expect(result.success).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('mock-token');
    expect(store.user).toEqual({ username: 'user1' });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify({ username: 'user1' }));
    expect(localStorageMock.getItem('auth_token')).toBe('mock-token');
    expect(localStorageMock.getItem('user_data')).toBe(JSON.stringify({ username: 'user1' }));
  });

  it('logs in with MFA required', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ phoneNumber: '+1234567890', message: 'MFA required', username: 'user1' }),
    });

    const result = await store.login({ username: 'user1', password: 'password123' });

    expect(result.success).toBe(true);
    expect(result.mfaRequired).toBe(true);
    expect(store.currentPhoneNumber).toBe('+1234567890');
    expect(store.isAuthenticated).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('current_phone_number', '+1234567890');
    expect(localStorageMock.getItem('current_phone_number')).toBe('+1234567890');
  });

  it('fails login with invalid credentials', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    });

    const result = await store.login({ username: 'wrong', password: 'wrong' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
    expect(store.isAuthenticated).toBe(false);
  });

  it('fails login due to network error', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network connection lost'));

    const result = await store.login({ username: 'user1', password: 'password123' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network error or server unavailable.');
    expect(store.isAuthenticated).toBe(false);
  });

  it('registers successfully', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Registration successful' }),
    });

    const result = await store.register({
      fullName: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      phone: '1234567890',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Registration successful');
  });

  it('fails registration due to backend error', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Username already taken' }),
    });

    const result = await store.register({
      fullName: 'Test User',
      email: 'test@example.com',
      username: 'existinguser',
      phone: '1234567890',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Username already taken');
  });

  it('fails registration due to network error', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Registration network error'));

    const result = await store.register({
      fullName: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      phone: '1234567890',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('An error occurred during registration. Please try again.');
  });
  
  it('fails to send OTP without phone number', async () => {
    store.currentPhoneNumber = null;

    const result = await store.sendOtpFirebase();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Phone number not available to send OTP.');
    expect(mockRecaptchaVerifierClass).not.toHaveBeenCalled();
    expect(mockSignInWithPhoneNumber).not.toHaveBeenCalled();
  });

  it('sends OTP successfully and renders recaptcha', async () => {
    store.currentPhoneNumber = '+1234567890';

    const result = await store.sendOtpFirebase('test-recaptcha-container');

    expect(result.success).toBe(true);
    expect(result.message).toBe('OTP sent!');
    expect(mockRecaptchaVerifierClass).toHaveBeenCalledWith(
      expect.any(Object),
      'test-recaptcha-container',
      expect.any(Object)
    );
    expect(mockRecaptchaVerifierRender).toHaveBeenCalled();
    expect(mockSignInWithPhoneNumber).toHaveBeenCalledWith(
      expect.any(Object),
      '+1234567890',
      expect.any(Object)
    );
    expect(store.confirmationResult).toBeDefined();
    expect(store.confirmationResult.verificationId).toBe('mock-verification-id');
  });

  it('fails to send OTP if recaptcha fails to render', async () => {
    store.currentPhoneNumber = '+1234567890';
    mockRecaptchaVerifierRender.mockRejectedValueOnce(new Error('Recaptcha render failed'));
    
    const result = await store.sendOtpFirebase('test-recaptcha-container');
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Recaptcha render failed');
    expect(mockSignInWithPhoneNumber).not.toHaveBeenCalled();
    expect(mockRecaptchaVerifierClear).toHaveBeenCalled();
    expect(store.confirmationResult).toBeNull();
  });

  it('fails to send OTP due to Firebase error', async () => {
    store.currentPhoneNumber = '+1234567890';
    mockSignInWithPhoneNumber.mockRejectedValueOnce(new Error('Firebase OTP error'));

    const result = await store.sendOtpFirebase();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Firebase OTP error');
    expect(mockRecaptchaVerifierClear).toHaveBeenCalled();
    expect(store.confirmationResult).toBeNull();
  });

  it('verifies OTP and logs in via Firebase', async () => {
    store.currentPhoneNumber = '+1234567890';
    await store.sendOtpFirebase();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'backend-verified-token', user: { username: 'firebaseuser' } }),
    });

    const result = await store.verifyOtpAndLoginWithFirebase('123456');

    expect(result.success).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('backend-verified-token');
    expect(store.user).toEqual({ username: 'firebaseuser' });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'backend-verified-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify({ username: 'firebaseuser' }));
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_phone_number');
    expect(store.currentPhoneNumber).toBeNull();
    expect(store.confirmationResult).toBeNull();
    expect(mockRecaptchaVerifierClear).toHaveBeenCalled();
  });

  it('fails OTP verification if confirmationResult is missing', async () => {
    store.confirmationResult = null;

    const result = await store.verifyOtpAndLoginWithFirebase('123456');

    expect(result.success).toBe(false);
    expect(result.message).toBe('OTP flow not initiated. Please try again.');
  });

  it('fails OTP verification with incorrect OTP', async () => {
    store.currentPhoneNumber = '+1234567890';
    await store.sendOtpFirebase();

    const result = await store.verifyOtpAndLoginWithFirebase('000000');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Incorrect OTP code!');
    expect(store.isAuthenticated).toBe(false);
    expect(store.confirmationResult).toBeNull();
    expect(store.currentPhoneNumber).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_phone_number');
  });

  it('fails OTP verification if backend API call fails', async () => {
    store.currentPhoneNumber = '+1234567890';
    await store.sendOtpFirebase();

    localStorageMock.setItem('auth_token', 'token-sebelumnya');
    localStorageMock.setItem('user_data', JSON.stringify({ oldUser: 'data' }));

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Backend verification failed' }),
    });

    const result = await store.verifyOtpAndLoginWithFirebase('123456');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Backend verification failed');
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_phone_number');
    
    expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3); 
    
    expect(store.currentPhoneNumber).toBeNull();
    expect(store.confirmationResult).toBeNull();
  });

  it('handles logout failure gracefully', async () => {
    store.token = 'some-token';
    store.user = { some: 'result' };
    store.isAuthenticated = true;

    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    auth.currentUser = { uid: 'firebase-user-id' };

    fetchSpy.mockRejectedValueOnce(new Error('Logout API failed'));

    await store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    
    expect(mockSignOut).toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
  });

  it('clears store on logout', async () => {
    store.token = 'some-token';
    store.user = { some: 'result' };
    store.isAuthenticated = true;
    store.currentPhoneNumber = '+1234567890';
    store.confirmationResult = { some: 'result' };
    
    localStorageMock.setItem('auth_token', 'some-token');
    localStorageMock.setItem('user_data', JSON.stringify({ some: 'result' }));
    localStorageMock.setItem('current_phone_number', '+1234567890');

    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    auth.currentUser = { uid: 'firebase-user-id' };

    fetchSpy.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    await store.logout();

    expect(mockSignOut).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/logout'), expect.any(Object));
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.currentPhoneNumber).toBeNull();
    expect(store.confirmationResult).toBeNull();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_phone_number');
    
    expect(localStorageMock.getItem('auth_token')).toBeNull();
    expect(localStorageMock.getItem('user_data')).toBeNull();
    expect(localStorageMock.getItem('current_phone_number')).toBeNull();
  });

  it('checkAuth sets auth state from localStorage', () => {
    localStorageMock.setItem('auth_token', 'stored-token');
    localStorageMock.setItem('user_data', JSON.stringify({ username: 'storedUser' }));
    localStorageMock.setItem('current_phone_number', '+1122334455');
    
    store.checkAuth();

    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('stored-token');
    expect(store.user).toEqual({ username: 'storedUser' });
    expect(store.currentPhoneNumber).toBe('+1122334455');
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user_data');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('current_phone_number');
  });

  it('checkAuth sets auth state false if token not found', () => {
    localStorageMock.clear();
    localStorageMock.setItem('user_data', JSON.stringify({ some: 'data' }));
    localStorageMock.setItem('current_phone_number', '+12345');
    
    store.checkAuth();

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.currentPhoneNumber).toBeNull();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_phone_number');
    expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3); 
  });

  it('checkAuth handles invalid user_data in localStorage', () => {
    localStorageMock.setItem('auth_token', 'stored-token');
    localStorageMock.setItem('user_data', 'invalid json');
    localStorageMock.setItem('current_phone_number', '+1122334455');

    store.checkAuth();

    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('stored-token');
    expect(store.user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    expect(store.currentPhoneNumber).toBe('+1122334455');
  });

});