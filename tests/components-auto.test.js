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
