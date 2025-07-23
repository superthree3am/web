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
    { path: '/dashboard' }
  ]
})
router.push = vi.fn()

// Mock auth store
const mockAuthStore = {
  login: vi.fn(),
  isAuthenticated: false
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('LoginPage', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginPage, {
      global: {
        plugins: [router, createPinia()],
        components: { BaseInput },
        stubs: { 'router-link': true }
      }
    })
    vi.clearAllMocks()
  })

  // 1. RENDERING TESTS
  it('renders all form elements', () => {
    expect(wrapper.find('h1').text()).toBe('Sign in to your account')
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="Logo BNI"]').exists()).toBe(true)
  })

  // 2. FORM VALIDATION TESTS
  it.skip('validates empty fields', async () => {
    wrapper.vm.username = ''
    wrapper.vm.password = ''
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Username required.')
  })


  it.skip('validates username format', async () => {
    await wrapper.find('#username').setValue('user@test')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Incorrect username or password.')
  })

  it.skip('validates password length', async () => {
    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#password').setValue('123')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Incorrect username or password.')
  })

  // 3. SUCCESSFUL LOGIN TESTS
  it('handles successful login without MFA', async () => {
    mockAuthStore.login.mockResolvedValue({ success: true, mfaRequired: false })
    mockAuthStore.isAuthenticated = true

    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Assertions here
  })

  it('handles successful login with MFA', async () => {
    mockAuthStore.login = vi.fn().mockResolvedValue({ success: true, mfaRequired: true })

    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#password').setValue('Password123!')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(router.push).toHaveBeenCalledWith({ name: 'OTP' })
  })

  // 4. ERROR HANDLING TESTS
  it.skip('clears previous errors on new submission', async () => {
    // First submission with empty inputs
    await wrapper.find('#username').setValue('')
    await wrapper.find('#password').setValue('')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Username required.')

    // Second submission with valid inputs
    mockAuthStore.login.mockResolvedValue({ success: true, mfaRequired: false })
    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#password').setValue('Password123!')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Username required.')
    expect(wrapper.text()).not.toContain('Password required.')
  })


  // 5. INPUT INTERACTION TESTS
  it('updates form data when typing', async () => {
    await wrapper.find('#username').setValue('newuser')
    await wrapper.find('#password').setValue('newpass123')

    expect(wrapper.vm.username).toBe('newuser')
    expect(wrapper.vm.password).toBe('newpass123')
  })

  // 7. COMPONENT PROPS TEST
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