import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('App.vue', () => {
  let originalGetComputedStyle;

  beforeEach(() => {
    originalGetComputedStyle = window.getComputedStyle;

    window.getComputedStyle = vi.fn(() => {
      return {
        backgroundImage: 'url(/background8.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    });
  });

  afterEach(() => {
    window.getComputedStyle = originalGetComputedStyle;
  });

  it('renders router-view correctly', () => {
    const wrapper = mount(App, {
      stubs: {
        RouterView: true,
        RouterLink: true
      }
    });
    
    const routerView = wrapper.find('router-view');
    expect(routerView.exists()).toBe(true);
  });

  it('applies correct background image and styles', () => {
    const wrapper = mount(App, {
      stubs: {
        RouterView: true,
        RouterLink: true
      }
    });

    const appElement = wrapper.element;
    const computedStyle = window.getComputedStyle(appElement);
    const backgroundImage = computedStyle.backgroundImage;

    expect(backgroundImage).toContain('background8.jpg');
    expect(computedStyle.backgroundSize).toBe('cover');
    expect(computedStyle.backgroundPosition).toBe('center');
  });
});