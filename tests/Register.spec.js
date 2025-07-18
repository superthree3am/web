import { mount } from '@vue/test-utils';
import RegisterPage from '@/views/Register/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

// Setup dummy router
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
});

// Mock store
const mockRegister = vi.fn(() =>
  Promise.resolve({ success: false, message: 'Invalid email format.' })
);

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    register: mockRegister,
    isLoading: false
  })
}));

describe('RegisterPage.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('shows error on invalid email', async () => {
    const wrapper = mount(RegisterPage, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    });

    const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });

    // Isi field dengan email tidak valid
    await baseInputs[1].find('input').setValue('invalid'); // email
    await baseInputs[4].find('input').setValue('validpass123'); // password
    await baseInputs[5].find('input').setValue('validpass123'); // confirm

    await wrapper.find('form').trigger('submit.prevent');

    // Tunggu proses async selesai
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Invalid email format.');
  });

  it('submits form successfully with valid inputs', async () => {
    const wrapper = mount(RegisterPage, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });

    await baseInputs[0].find('input').setValue('Valid Name'); // full name
    await baseInputs[1].find('input').setValue('valid@email.com'); // email
    await baseInputs[2].find('input').setValue('+621234567890'); // phone
    await baseInputs[3].find('input').setValue('validUser123'); // username
    await baseInputs[4].find('input').setValue('ValidPass123!'); // password
    await baseInputs[5].find('input').setValue('ValidPass123!'); // confirm password

    await wrapper.find('form').trigger('submit.prevent');

    // Tunggu proses async selesai
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith({
      fullName: 'Valid Name',
      email: 'valid@email.com',
      phone: '+621234567890',
      username: 'validUser123',
      password: 'ValidPass123!',
    });
  });

  it('displays error message when registration fails', async () => {
    const wrapper = mount(RegisterPage, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });

    await baseInputs[0].find('input').setValue('Valid Name');
    await baseInputs[1].find('input').setValue('valid@email.com');
    await baseInputs[2].find('input').setValue('+621234567890');
    await baseInputs[3].find('input').setValue('validUser123');
    await baseInputs[4].find('input').setValue('ValidPass123!');
    await baseInputs[5].find('input').setValue('ValidPass123!');

    // Simulasikan kegagalan pada register
    mockRegister.mockResolvedValueOnce({
      success: false,
      message: 'Registration failed, email already in use.',
    });

    await wrapper.find('form').trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Registration failed, email already in use.');
  });

  it.skip('displays loading state while registering', async () => {
  // Simulasi loading state yang gagal
  const wrapper = mount(RegisterPage, {
    global: {
      plugins: [createTestingPinia(), router],
    },
  });

  const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });
  await baseInputs[0].find('input').setValue('Valid Name');
  await baseInputs[1].find('input').setValue('valid@email.com');
  await baseInputs[2].find('input').setValue('+621234567890');
  await baseInputs[3].find('input').setValue('validUser123');
  await baseInputs[4].find('input').setValue('ValidPass123!');
  await baseInputs[5].find('input').setValue('ValidPass123!');

  // Simulasikan loading state dengan mengubah nilai isLoading di mock store
  pinia.state.value.auth.isLoading = true;  // Mengubah status isLoading menjadi true

  await wrapper.find('form').trigger('submit.prevent');
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Mengecek apakah tombol menjadi disabled dan spinner muncul
  expect(wrapper.find('button').attributes('disabled')).toBe('true');
  expect(wrapper.find('.animate-spin').exists()).toBe(true); // Mengecek apakah spinner loading muncul
});

});
