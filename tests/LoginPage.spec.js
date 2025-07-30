import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import LoginPage from '@/views/Login/LoginPage.vue'
import BaseInput from '@/components/BaseInput.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { name: 'OTP', path: '/otp' },
    { name: 'Dashboard', path: '/dashboard' }
  ]
})
router.push = vi.fn()

// Mock auth store
const mockAuthStore = {
  login: vi.fn(),
  isAuthenticated: false,
  clearError: vi.fn()
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('LoginPage', () => {
  let wrapper

  beforeEach(() => {
    mockAuthStore.login.mockReset()
    mockAuthStore.isAuthenticated = false
    mockAuthStore.clearError.mockReset()
    router.push.mockReset()

    wrapper = mount(LoginPage, {
      global: {
        plugins: [router, createPinia()],
        components: { BaseInput },
        stubs: { 'router-link': true }
      }
    })
  })

  it('renders all form elements', () => {
    expect(wrapper.find('h1').text()).toBe('Sign in to your account')
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="Logo BNI"]').exists()).toBe(true)
  })

  it('displays error on failed login', async () => {
    mockAuthStore.login.mockResolvedValue({
      success: false,
      message: 'Invalid credentials.'
    })

    await wrapper.find('#username').setValue('wronguser')
    await wrapper.find('#password').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    const errorBox = wrapper.find('.bg-red-100')
    expect(errorBox.exists()).toBe(true)
    expect(errorBox.text()).toContain('ERROR:')
    expect(errorBox.text()).toContain('Invalid credentials.')
  })

  it('navigates to dashboard on successful login without MFA', async () => {
    mockAuthStore.login.mockResolvedValue({
      success: true,
      mfaRequired: false
    })
    mockAuthStore.isAuthenticated = true

    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(mockAuthStore.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    })
    expect(router.push).toHaveBeenCalledWith('/dashboard')
  })

  it('navigates to OTP page on login with MFA required', async () => {
    mockAuthStore.login.mockResolvedValue({
      success: true,
      mfaRequired: true
    })

    await wrapper.find('#username').setValue('mfauser')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(router.push).toHaveBeenCalledWith({ name: 'OTP' })
  })

  it('clears previous error on new login attempt', async () => {
    mockAuthStore.login
      .mockResolvedValueOnce({ success: false, message: 'First error.' })
      .mockResolvedValueOnce({ success: true, mfaRequired: false })

    await wrapper.find('#username').setValue('firstuser')
    await wrapper.find('#password').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.bg-red-100').exists()).toBe(true)

    await wrapper.find('#username').setValue('correctuser')
    await wrapper.find('#password').setValue('correctpass')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.bg-red-100').exists()).toBe(false)
  })

  it('updates input values correctly', async () => {
    await wrapper.find('#username').setValue('myuser')
    await wrapper.find('#password').setValue('mypass123')

    expect(wrapper.vm.username).toBe('myuser')
    expect(wrapper.vm.password).toBe('mypass123')
  })

  it('passes correct props to BaseInput components', () => {
    const inputs = wrapper.findAllComponents(BaseInput)
    expect(inputs[0].props('id')).toBe('username')
    expect(inputs[0].props('type')).toBe('text')
    expect(inputs[0].props('required')).toBe(true)

    expect(inputs[1].props('id')).toBe('password')
    expect(inputs[1].props('type')).toBe('password')
    expect(inputs[1].props('isPasswordToggle')).toBe(true)
  })
})
