// test/unit/ApiDataComponent.spec.js
import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ApiDataComponent from '../src/components/ApiDataComponent.vue' 
import axios from 'axios'

vi.mock('axios')

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
