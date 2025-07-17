import router from '@/router/index.js';
import { describe, it, expect } from 'vitest';

describe('Router Configuration', () => {
  it('should contain all required routes', () => {
    const routeNames = router.getRoutes().map((route) => route.name);
    
    expect(routeNames).toContain('login');
    expect(routeNames).toContain('login-page');
    expect(routeNames).toContain('register');
    expect(routeNames).toContain('OTP');
    expect(routeNames).toContain('dashboard');
  });

  it('should resolve path "/" to LoginPage', () => {
    const route = router.resolve('/');
    expect(route.name).toBe('login');
  });

  it('should resolve path "/dashboard" correctly', () => {
    const route = router.resolve('/dashboard');
    expect(route.name).toBe('dashboard');
  });
});