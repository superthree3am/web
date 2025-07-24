import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AlertMessage from '../src/components/AlertMessage.vue'
import ApiDataComponent from '../src/components/ApiDataComponent.vue'
import axios from 'axios'

vi.mock('axios')

describe('AlertMessage.vue', () => {
  it('renders success alert when visible', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Success!',
        type: 'success',
        isVisible: true
      }
    })

    const alertBox = wrapper.find('.p-4')
    expect(alertBox.exists()).toBe(true)
    expect(alertBox.text()).toContain('Success!')
  })

  it('does not render when isVisible is false', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Hidden',
        type: 'info',
        isVisible: false
      }
    })

    expect(wrapper.find('.p-4').exists()).toBe(false)
  })

  it('renders info alert with correct classes and icon', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Info alert',
        type: 'info',
        isVisible: true
      }
    })
    const alertBox = wrapper.find('.p-4')
    expect(alertBox.classes()).toContain('bg-blue-100')
    expect(wrapper.find('svg[viewBox="0 0 20 20"]').exists()).toBe(true)
  })

  it('renders error alert with correct classes and icon', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Error alert',
        type: 'error',
        isVisible: true
      }
    })
    const alertBox = wrapper.find('.p-4')
    expect(alertBox.classes()).toContain('bg-red-100')
    expect(wrapper.find('svg[viewBox="0 0 20 20"]').exists()).toBe(true)
  })

  it('renders with default type (info) if none is provided', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Default alert',
        isVisible: true
      }
    })
    const alertBox = wrapper.find('.p-4')
    expect(alertBox.classes()).toContain('bg-blue-100')
    expect(wrapper.find('p').text()).toBe('Default alert')
  })

  it('renders with default type (gray) if an unknown type is provided', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Unknown type alert',
        type: 'unknown',
        isVisible: true
      }
    })
    const alertBox = wrapper.find('.p-4')
    expect(alertBox.classes()).toContain('bg-gray-100')
  })

  it('emits update:isVisible event when close button is clicked', async () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Close me',
        isVisible: true,
        duration: 0, // ensure button is visible
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:isVisible')).toEqual([[false]])
  })

  it('does not render close button when autoClose is true', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Auto-closing',
        isVisible: true,
        duration: 3000
      }
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('closes automatically after the specified duration', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Auto-closing alert',
        isVisible: true,
        duration: 1000
      }
    })

    expect(wrapper.emitted('update:isVisible')).toBeUndefined()
    vi.advanceTimersByTime(1000)
    expect(wrapper.emitted('update:isVisible')).toEqual([[false]])
    vi.useRealTimers()
  })

  it('resets the timer when isVisible becomes true again', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AlertMessage, {
      props: {
        message: 'Auto-closing',
        isVisible: false,
        duration: 1000
      }
    })

    // Simulate making the alert visible
    await wrapper.setProps({ isVisible: true })
    expect(wrapper.emitted('update:isVisible')).toBeUndefined()

    vi.advanceTimersByTime(500) // Advance halfway
    await wrapper.setProps({ isVisible: false })
    await wrapper.setProps({ isVisible: true }) // Make it visible again

    // The timer should have been reset. It should not close after 500ms
    vi.advanceTimersByTime(500)
    expect(wrapper.emitted('update:isVisible')).toBeUndefined()

    // It should close after a full 1000ms from the last time it became visible
    vi.advanceTimersByTime(500)
    expect(wrapper.emitted('update:isVisible')).toEqual([[false]])
    vi.useRealTimers()
  })

})

describe('ApiDataComponent.vue', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  it('menampilkan loading saat fetch dimulai', async () => {
    process.env.VUE_APP_SERVICE_API = 'http://example.com'
    let resolve
    axios.get.mockReturnValue(new Promise(res => (resolve = res)))

    const wrapper = mount(ApiDataComponent)
    expect(wrapper.text()).toContain('Memuat data...')

    resolve({ data: { message: 'OK' } })
    await flushPromises()
  })

  it('menampilkan data saat fetch berhasil', async () => {
    process.env.VUE_APP_SERVICE_API = 'http://example.com'
    axios.get.mockResolvedValue({ data: { message: 'Sukses' } })

    const wrapper = mount(ApiDataComponent)
    await flushPromises()

    expect(wrapper.text()).toContain('Sukses')
    expect(wrapper.find('.text-red-500').exists()).toBe(false)
  })

  it('menampilkan error jika VUE_APP_SERVICE_API tidak didefinisikan', async () => {
    delete process.env.VUE_APP_SERVICE_API

    const wrapper = mount(ApiDataComponent)
    await flushPromises()

    expect(wrapper.text()).toContain('API URL is not defined')
  })

  it('menampilkan error dari response jika fetch gagal dengan response', async () => {
    process.env.VUE_APP_SERVICE_API = 'http://example.com'
    axios.get.mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Server rusak' }
      }
    })

    const wrapper = mount(ApiDataComponent)
    await flushPromises()

    expect(wrapper.text()).toContain('Error: 500 - Server rusak')
  })

  it('menampilkan error jaringan jika fetch gagal tanpa response', async () => {
    process.env.VUE_APP_SERVICE_API = 'http://example.com'
    axios.get.mockRejectedValue({ request: {} })

    const wrapper = mount(ApiDataComponent)
    await flushPromises()

    expect(wrapper.text()).toContain('Network error')
  })

  it('menampilkan error umum jika fetch gagal tanpa response/request', async () => {
    process.env.VUE_APP_SERVICE_API = 'http://example.com'
    axios.get.mockRejectedValue(new Error('Unknown error'))

    const wrapper = mount(ApiDataComponent)
    await flushPromises()

    expect(wrapper.text()).toContain('unexpected error')
  })
})