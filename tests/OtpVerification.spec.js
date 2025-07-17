import { mount, flushPromises } from '@vue/test-utils'
import OtpVerification from '@/views/Verifikasioke/OtpVerification.vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { vi } from 'vitest'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
  ]
})

// Mock auth store
const mockVerifyOtp = vi.fn(() => Promise.resolve({ success: true, message: 'OTP verified' }))
const mockSendOtp = vi.fn(() => Promise.resolve({ success: true, message: 'OTP sent' }))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    currentPhoneNumber: '+628123456789',
    verifyOtpAndLoginWithFirebase: mockVerifyOtp,
    sendOtpFirebase: mockSendOtp
  })
}))

describe('OtpVerification.vue', () => {
  beforeAll(async () => {
    router.push('/')
    await router.isReady()
  })

  it('renders OTP verification instructions and input', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Please enter the 6-digit code sent to your registered phone number.')
    expect(wrapper.findAll('input[type="text"]').length).toBe(6)
  })

  it('shows error if OTP is incomplete', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('1') // only 1 digit filled

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.vm.errorMessage).toBe('OTP must be 6 digits long.')
  })

  it('calls verifyOtp if OTP is complete', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })

    const digits = ['0', '1', '2', '3', '4', '5']
    const inputs = wrapper.findAll('input')

    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(digits[i])
    }

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockVerifyOtp).toHaveBeenCalledWith('012345')
    expect(wrapper.vm.errorMessage).toBe('')
  })
})
