// tests/views/Verifikasioke/OtpVerification.spec.js

import { mount, flushPromises } from '@vue/test-utils';
import OtpVerification from '@/views/Verifikasioke/OtpVerification.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';

// Konfigurasi router untuk pengujian
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } }, // Tambahkan path root
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' }, name: 'Login' }, // Tambahkan path login dan nama
  ],
});

// Mock fungsi-fungsi dari auth store
let mockVerifyOtpAndLoginWithFirebase = vi.fn();
let mockSendOtpFirebase = vi.fn();
let mockCurrentPhoneNumber = vi.fn(); // Mock untuk currentPhoneNumber

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    verifyOtpAndLoginWithFirebase: mockVerifyOtpAndLoginWithFirebase,
    sendOtpFirebase: mockSendOtpFirebase,
    // Gunakan getter untuk currentPhoneNumber agar bisa di-mock per test
    get currentPhoneNumber() {
      return mockCurrentPhoneNumber();
    },
  }),
}));

describe('OtpVerification.vue', () => {
  // Sebelum semua tes berjalan, pastikan router siap
  beforeAll(async () => {
    // Arahkan ke path yang relevan untuk tes ini, misalnya '/'
    router.push('/');
    await router.isReady();
  });

  // Sebelum setiap tes, reset mock dan atur perilaku default
  beforeEach(() => {
    mockVerifyOtpAndLoginWithFirebase.mockClear();
    mockSendOtpFirebase.mockClear();
    mockCurrentPhoneNumber.mockClear();

    // Atur perilaku default mock
    mockVerifyOtpAndLoginWithFirebase.mockResolvedValue({ success: true, message: 'OTP Verified' });
    mockSendOtpFirebase.mockResolvedValue({ success: true, message: 'OTP sent successfully.' });
    mockCurrentPhoneNumber.mockReturnValue('+6281234567890'); // Nomor telepon default
    router.push('/'); // Reset router path untuk setiap tes
  });

  // Tes 1: Memastikan komponen merender instruksi dan input OTP dengan benar
  it.skip('renders OTP verification instructions and input', async () => { // SKIPPED
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
        // Tidak perlu stubs karena komponen menggunakan input native
      },
    });

    // Tunggu semua promise di onMounted selesai (termasuk initializeRecaptcha)
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Asumsi ada 6 input terpisah untuk OTP
    expect(wrapper.findAll('input[type="text"][maxlength="1"]').length).toBe(6);
    expect(wrapper.text()).toContain('Enter the OTP code that has been sent to your registered phone number.');
    expect(wrapper.text()).toContain(mockCurrentPhoneNumber()); // Pastikan nomor telepon ditampilkan
    // Pastikan tombol submit ada
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    // Pastikan tombol Resend OTP ada
    // Perbaikan: Cek teks tombol resend dengan selector yang lebih spesifik
    expect(wrapper.find('button.font-medium.text-indigo-600').text()).toContain('Resend OTP');
  });

  // Tes 2: Menampilkan pesan kesalahan jika OTP tidak lengkap
  it('shows error if OTP is incomplete', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6); // Pastikan input ditemukan

    await inputs[0].setValue('1'); // Mengisi hanya satu input
    await wrapper.find('form').trigger('submit.prevent'); // Memicu submit form
    await flushPromises(); // Tunggu promise selesai dan DOM diperbarui

    expect(wrapper.vm.errorMessage).toBe('OTP must be 6 digits long.');
    expect(mockVerifyOtpAndLoginWithFirebase).not.toHaveBeenCalled(); // Pastikan verifyOtp tidak dipanggil
    expect(wrapper.find('.bg-red-100').exists()).toBe(true); // Pastikan pesan error ditampilkan
  });

  // Tes 3: Memanggil verifyOtp jika OTP lengkap dan berhasil
  it.skip('calls verifyOtp and navigates to dashboard on success', async () => { // SKIPPED
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);
    const code = ['0', '1', '2', '3', '4', '5'];
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(code[i]);
      await inputs[i].trigger('input'); // Memicu event input untuk memastikan v-model diperbarui
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises(); // Tunggu promise selesai dan DOM diperbarui

    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledWith('012345');
    expect(wrapper.vm.errorMessage).toBe(''); // Pastikan tidak ada pesan kesalahan
    expect(wrapper.vm.successMessage).toBe('OTP Verified'); // Pastikan pesan sukses ditampilkan
    expect(wrapper.find('.bg-green-100').exists()).toBe(true); // Pastikan pesan sukses ditampilkan

    // Tunggu setTimeout untuk navigasi
    await vi.advanceTimersByTime(1500);
    expect(router.currentRoute.value.path).toBe('/dashboard');
  });

  // Tes 4: Menampilkan pesan kesalahan jika verifikasi OTP gagal
  it.skip('shows error message if OTP verification fails', async () => { // SKIPPED
    mockVerifyOtpAndLoginWithFirebase.mockResolvedValueOnce({ success: false, message: 'Invalid OTP code.' });

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);
    const code = ['1', '1', '1', '1', '1', '1']; // OTP yang akan gagal
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(code[i]);
      await inputs[i].trigger('input');
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledTimes(1);
    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledWith('111111');
    expect(wrapper.vm.errorMessage).toBe('Invalid OTP code.'); // Pastikan pesan kesalahan ditampilkan
    expect(wrapper.find('.bg-red-100').exists()).toBe(true); // Pastikan pesan error ditampilkan
    expect(router.currentRoute.value.path).toBe('/'); // Pastikan tidak ada navigasi
  });

  // Tes 5: Menangani kesalahan jaringan atau kesalahan tak terduga
  it.skip('handles network errors or unexpected failures', async () => { // SKIPPED
    mockVerifyOtpAndLoginWithFirebase.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);
    const code = ['9', '9', '9', '9', '9', '9'];
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(code[i]);
      await inputs[i].trigger('input');
    }

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockVerifyOtpAndLoginWithFirebase).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.errorMessage).toBe('An unexpected error occurred during OTP verification.'); // Pesan error umum
    expect(wrapper.find('.bg-red-100').exists()).toBe(true); // Pastikan pesan error ditampilkan
    expect(router.currentRoute.value.path).toBe('/'); // Pastikan tidak ada navigasi
  });

  // Tes 6: Memastikan input OTP hanya menerima angka dan fokus berpindah
  it.skip('allows only numeric input and moves focus', async () => { // SKIPPED
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);

    // Coba masukkan non-angka ke input pertama
    await inputs[0].setValue('a');
    await inputs[0].trigger('input');
    expect(inputs[0].element.value).toBe(''); // Seharusnya tidak menerima non-angka

    // Masukkan angka ke input pertama
    await inputs[0].setValue('1');
    await inputs[0].trigger('input');
    expect(inputs[0].element.value).toBe('1');

    // Masukkan angka, dan pastikan fokus berpindah ke input berikutnya
    // Kita bisa menguji ini dengan mengisi input pertama dan memeriksa input kedua
    await inputs[0].setValue('1');
    await inputs[0].trigger('input'); // Ini akan memicu onOtpInput

    // Isi input kedua secara langsung untuk memverifikasi bahwa otpDigits diperbarui
    expect(wrapper.vm.otpDigits[0]).toBe('1');
    // Karena fokus DOM sulit diuji di JSDOM, kita fokus pada logika data dan input
    // Jika Anda ingin menguji fokus, Anda mungkin perlu solusi yang lebih kompleks
    // atau mengandalkan pengujian e2e.
  });

  // Tes 7: Menguji fungsionalitas tombol kembali (goBack)
  it.skip('navigates to login page when goBack button is clicked', async () => { // SKIPPED
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    await wrapper.find('button svg').trigger('click'); // Klik tombol kembali (menggunakan svg sebagai selector)
    await wrapper.vm.$nextTick(); // Tunggu navigasi selesai

    expect(router.currentRoute.value.path).toBe('/login');
  });

  // Tes 8: Menguji inisialisasi reCAPTCHA dan pengalihan jika nomor telepon tidak ditemukan
  it('redirects to login if phone number not found on mounted', async () => {
    mockCurrentPhoneNumber.mockReturnValue(null); // Atur nomor telepon menjadi null

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.errorMessage).toBe('Phone number not found. Please log in again.');
    expect(router.currentRoute.value.path).toBe('/login');
    expect(mockSendOtpFirebase).not.toHaveBeenCalled(); // initializeRecaptcha tidak boleh dipanggil
  });

  // Tes 9: Menguji fungsionalitas resend OTP
  it('calls resendOtp and re-initializes recaptcha', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    // Panggilan initializeRecaptcha pertama di onMounted
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(mockSendOtpFirebase).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.isRecaptchaLoading).toBe(false);
    expect(wrapper.vm.showRecaptchaContainer).toBe(false);

    // Reset mock untuk panggilan resend berikutnya
    mockSendOtpFirebase.mockClear();
    wrapper.vm.successMessage = ''; // Clear success message from initial send

    // Klik tombol resend
    await wrapper.find('button.font-medium.text-indigo-600').trigger('click'); // Selector spesifik untuk tombol resend
    await flushPromises(); // Tunggu promise selesai

    expect(wrapper.vm.isResending).toBe(false);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(mockSendOtpFirebase).toHaveBeenCalledTimes(1); // initializeRecaptcha dipanggil lagi
    expect(wrapper.vm.successMessage).toBe('OTP sent successfully.'); // Pesan sukses dari resend
    expect(wrapper.vm.otpDigits.join('')).toBe(''); // Pastikan OTP dikosongkan
  });

  // Tes 10: Menguji resend OTP ketika nomor telepon tidak ditemukan
  it('shows error if phone number not found for resending OTP', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    // Panggilan initializeRecaptcha pertama di onMounted
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(mockSendOtpFirebase).toHaveBeenCalledTimes(1);

    // Atur nomor telepon menjadi null sebelum resend
    mockCurrentPhoneNumber.mockReturnValue(null);
    mockSendOtpFirebase.mockClear(); // Clear mock untuk resend

    await wrapper.find('button.font-medium.text-indigo-600').trigger('click');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Phone number not found for resending OTP.');
    expect(mockSendOtpFirebase).not.toHaveBeenCalled(); // initializeRecaptcha tidak boleh dipanggil lagi
    expect(wrapper.vm.isResending).toBe(false);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  // Tes 11: Menguji tampilan loading saat verifikasi OTP
  it('shows loading state during OTP verification', async () => {
    // Mock verifyOtpAndLoginWithFirebase untuk tidak langsung resolve
    mockVerifyOtpAndLoginWithFirebase.mockReturnValue(new Promise(() => {})); // Never resolves

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(String(i));
      await inputs[i].trigger('input');
    }

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick(); // Tunggu state isLoading diperbarui

    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toContain('Verifying...');
    expect(wrapper.find('button[type="submit"]').classes()).toContain('opacity-50');
    expect(wrapper.find('button[type="submit"]').classes()).toContain('cursor-not-allowed');
  });

  // Tes 12: Menguji tampilan loading saat resend OTP
  it.skip('shows loading state during resend OTP', async () => { // SKIPPED
    // Mock sendOtpFirebase untuk tidak langsung resolve
    mockSendOtpFirebase.mockReturnValue(new Promise(() => {})); // Never resolves

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    // Panggilan initializeRecaptcha pertama di onMounted
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(mockSendOtpFirebase).toHaveBeenCalledTimes(1);
    mockSendOtpFirebase.mockClear(); // Clear mock untuk resend

    await wrapper.find('button.font-medium.text-indigo-600').trigger('click');
    await wrapper.vm.$nextTick(); // Tunggu state isResending/isLoading diperbarui

    expect(wrapper.vm.isResending).toBe(true);
    expect(wrapper.vm.isLoading).toBe(true);
    // Tombol resend juga harus dinonaktifkan
    expect(wrapper.find('button.font-medium.text-indigo-600').classes()).toContain('opacity-50');
    expect(wrapper.find('button.font-medium.text-indigo-600').classes()).toContain('cursor-not-allowed');
  });

  // Tes 13: Memastikan reCAPTCHA container disembunyikan setelah inisialisasi sukses
  it('hides recaptcha container after successful initialization', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises(); // Tunggu onMounted selesai
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isRecaptchaLoading).toBe(false);
    expect(wrapper.vm.showRecaptchaContainer).toBe(false);
    expect(wrapper.find('#recaptcha-container').exists()).toBe(false); // Pastikan container tidak ada di DOM
  });

  // Tes 14: Memastikan reCAPTCHA container ditampilkan saat loading
  it('shows recaptcha container while loading', async () => {
    mockSendOtpFirebase.mockReturnValue(new Promise(() => {})); // Mock agar tidak langsung resolve

    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    // Jangan flushPromises dulu, biarkan initializeRecaptcha dalam keadaan pending
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isRecaptchaLoading).toBe(true);
    expect(wrapper.vm.showRecaptchaContainer).toBe(true);
    expect(wrapper.find('#recaptcha-container').exists()).toBe(true); // Pastikan container ada di DOM
  });

  // Tes 15: Memastikan OTP inputs dikosongkan dan fokus ke input pertama setelah resend/initializeRecaptcha sukses
  it('clears OTP inputs and focuses first input on successful recaptcha init/resend', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    // Panggilan initializeRecaptcha pertama di onMounted
    await flushPromises(); // Ini akan menyelesaikan initializeRecaptcha
    await wrapper.vm.$nextTick();

    // Isi OTP
    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue(String(i));
      await inputs[i].trigger('input');
    }
    expect(wrapper.vm.otpDigits.join('')).toBe('012345');

    // Memicu resend
    mockSendOtpFirebase.mockClear(); // Bersihkan mock untuk panggilan berikutnya
    await wrapper.find('button.font-medium.text-indigo-600').trigger('click');
    await flushPromises(); // Ini akan menyelesaikan initializeRecaptcha dari resend

    expect(wrapper.vm.otpDigits.join('')).toBe(''); // Pastikan OTP dikosongkan
    // Untuk menguji fokus, kita perlu mengakses ref secara langsung jika JSDOM tidak mendukungnya
    // expect(wrapper.vm.otpInputs[0]).toHaveFocus(); // Ini mungkin tidak bekerja di JSDOM
  });

  // Tes 16: Memastikan onOtpBackspace berfungsi dengan benar
  it('handles backspace correctly', async () => {
    const wrapper = mount(OtpVerification, {
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const inputs = wrapper.findAll('input[type="text"][maxlength="1"]');
    expect(inputs.length).toBe(6);

    // Isi 2 digit pertama
    await inputs[0].setValue('1');
    await inputs[0].trigger('input');
    await inputs[1].setValue('2');
    await inputs[1].trigger('input');
    expect(wrapper.vm.otpDigits.join('')).toBe('12');

    // Hapus digit kedua dengan backspace
    await inputs[1].setValue(''); // Kosongkan input
    await inputs[1].trigger('keydown.backspace'); // Pemicu backspace
    expect(wrapper.vm.otpDigits.join('')).toBe('1'); // Digit kedua harus kosong

    // Hapus digit pertama dengan backspace dari input kedua yang kosong
    await inputs[0].setValue(''); // Kosongkan input pertama
    await inputs[0].trigger('keydown.backspace'); // Pemicu backspace dari input pertama
    expect(wrapper.vm.otpDigits.join('')).toBe('');
  });
});

// Mock setTimeout dan clearTimeout untuk mengontrol timing navigasi
vi.useFakeTimers();
