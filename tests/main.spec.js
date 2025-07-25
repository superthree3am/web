// main.test.js

import { vi } from 'vitest';

const mockUse = vi.fn();
const mockMount = vi.fn();
const mockCreateApp = vi.fn(() => ({
  use: mockUse,
  mount: mockMount,
}));

// Mock fungsi createPinia
const mockCreatePinia = vi.fn(() => ({})); 

// Mock import router
const mockRouter = {}; 

const mockApp = {};

vi.mock('../src/assets/css/main.css', () => ({})); 

vi.mock('vue', () => ({
  createApp: mockCreateApp,
}));

vi.mock('pinia', () => ({
  createPinia: mockCreatePinia,
}));

vi.mock('../src/router', () => ({ 
  default: mockRouter,
}));

vi.mock('../src/App.vue', () => ({ 
  default: mockApp,
}));


describe('main.js', () => {
  
  beforeEach(() => {
    mockUse.mockClear();
    mockMount.mockClear();
    mockCreateApp.mockClear();
    mockCreatePinia.mockClear();
  });

  
  test('seharusnya membuat aplikasi, menggunakan Pinia dan Router, dan me-mount aplikasi', async () => {
   
    await import('../src/main.js'); // Perbarui path main.js

    expect(mockCreateApp).toHaveBeenCalledTimes(1);
    expect(mockCreateApp).toHaveBeenCalledWith(mockApp);

    expect(mockCreatePinia).toHaveBeenCalledTimes(1);

    expect(mockUse).toHaveBeenCalledTimes(2);
    expect(mockUse).toHaveBeenCalledWith(mockCreatePinia()); 
    expect(mockUse).toHaveBeenCalledWith(mockRouter); 

    expect(mockMount).toHaveBeenCalledTimes(1);
    expect(mockMount).toHaveBeenCalledWith('#app');
  });
});
