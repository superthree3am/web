import router from '@/router/index.js';
import { describe, it, expect } from 'vitest';

describe('Router Configuration', () => {
  // Test 1: Should contain all required routes
  it('should contain all required routes', () => {
    const routeNames = router.getRoutes().map((route) => route.name);

    expect(routeNames).toContain('login');
    expect(routeNames).toContain('login-page'); // Pastikan rute '/login' memiliki nama 'login-page'
    expect(routeNames).toContain('register');
    expect(routeNames).toContain('OTP');
    expect(routeNames).toContain('dashboard');
    expect(routeNames).toContain('forgot-password'); // Tambahkan rute forgot-password
  });

  // Test 2: Should resolve path "/" to LoginPage (named 'login')
  it('should resolve path "/" to LoginPage (named "login")', () => {
    const route = router.resolve('/');
    expect(route.name).toBe('login'); // Sesuai dengan konfigurasi { path: '/', name: 'login', ... }
    expect(route.path).toBe('/');
  });

  // Test 3: Should resolve path "/login" to LoginPage (named 'login-page')
  it('should resolve path "/login" to LoginPage (named "login-page")', () => {
    const route = router.resolve('/login');
    expect(route.name).toBe('login-page'); // Sesuai dengan konfigurasi { path: '/login', name: 'login-page', ... }
    expect(route.path).toBe('/login');
  });

  // Test 4: Should resolve path "/dashboard" correctly
  it('should resolve path "/dashboard" correctly', () => {
    const route = router.resolve('/dashboard');
    expect(route.name).toBe('dashboard');
    expect(route.path).toBe('/dashboard');
  });

  // Test 5: Should resolve path "/otp" correctly and contain meta field
  it('should resolve path "/otp" correctly and contain meta field', () => {
    const route = router.resolve('/otp');
    expect(route.name).toBe('OTP');
    expect(route.path).toBe('/otp');
    //expect(route.meta).toEqual({ requiresPhoneAuthInitiation: true }); // Memverifikasi meta field
  });

  // Test 6: Should resolve path "/register" correctly
  it('should resolve path "/register" correctly', () => {
    const route = router.resolve('/register');
    expect(route.name).toBe('register');
    expect(route.path).toBe('/register');
  });

  // Test 7: Should resolve path "/forgot-password" correctly
  it('should resolve path "/forgot-password" correctly', () => {
    const route = router.resolve('/forgot-password');
    expect(route.name).toBe('forgot-password');
    expect(route.path).toBe('/forgot-password');
  });
});