import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App.vue', () => {
  it('renders the app container with router-view', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: ['router-view'] // ⛔ supaya tidak render seluruh halaman
      }
    });

    // Mengecek ID dan elemen utama
    expect(wrapper.find('#app').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'router-view' }).exists()).toBe(true);
  });
});
