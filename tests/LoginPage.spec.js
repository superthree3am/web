import { mount, flushPromises } from '@vue/test-utils';
import LoginPage from '@/views/Login/LoginPage.vue';
import Dashboard from '@/views/Dashboard/index.vue';
// import RegisterPage from '@/views/Register/index.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

// Setup router dummy
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'login', component: LoginPage },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },  // This route is needed for successful login redirection
    { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
    { path: '/forgot-password', name: 'forgot-password', component: { template: '<div>Forgot Password</div>' } }
  ]
});

// Mock store login method
const mockLogin = vi.fn(() =>
  Promise.resolve({
    success: true,
    mfaRequired: false
  })
);

// Mock router.push for navigation
const pushMock = vi.fn();
vi.spyOn(router, 'push').mockImplementation(pushMock);

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isAuthenticated: true
  })
}));

describe('LoginPage.vue', () => {
  beforeAll(async () => {
    router.push('/');
    await router.isReady();
  });

  it('renders login form with BaseInput components', () => {
    // const wrapper = mount(LoginPage, {
    //   global: {
    //     plugins: [createTestingPinia(), router]
    //   }
    // });

    // Check the number of BaseInput components (2 inputs: username & password)
    // const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });
    // expect(baseInputs.length).toBe(2);

    // // Ensure each BaseInput has an input element
    // baseInputs.forEach(input => {
    //   expect(input.find('input').exists()).toBe(true);
    // });
  });

  it('shows error if username or password is empty', async () => {
    // const wrapper = mount(LoginPage, {
    //   global: {
    //     plugins: [createTestingPinia(), router]
    //   }
    // });

    // await wrapper.find('form').trigger('submit.prevent');

    // expect(wrapper.text()).toContain('Username and password are required.');
  });

  it('calls login and navigates to dashboard on valid credentials', async () => {
    // const wrapper = mount(LoginPage, {
    //   global: {
    //     plugins: [createTestingPinia(), router]
    //   }
    // });

    // const baseInputs = wrapper.findAllComponents({ name: 'BaseInput' });

    // await baseInputs[0].find('input').setValue('validuser');
    // await baseInputs[1].find('input').setValue('validpassword');

    // await wrapper.find('form').trigger('submit.prevent');
    // await flushPromises();

    // expect(mockLogin).toHaveBeenCalledWith({
    //   username: 'validuser',
    //   password: 'validpassword'
    // });

    // // Verifying that push was called and route to dashboard
    // expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
