import { mount, flushPromises } from '@vue/test-utils';
import RegisterPage from '@/views/Register/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Login</div>' } }],
});

describe('RegisterPage.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('shows error on invalid email', async () => {
    const wrapper = mount(RegisterPage, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    // Isi input dengan email yang tidak valid
    await wrapper.find('#fullName').setValue('John Doe');
    await wrapper.find('#email').setValue('invalid-email');
    await wrapper.find('#phone').setValue('08123456789');
    await wrapper.find('#username').setValue('johndoe');
    await wrapper.find('#password').setValue('Password123');
    await wrapper.find('#confirmPassword').setValue('Password123');

    // Trigger submit
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    // Cek error muncul
    expect(wrapper.text()).toContain('The email format is invalid');
  });
});
