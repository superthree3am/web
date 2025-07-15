<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-down
                 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out">

      <div class="absolute top-4 left-4">
        <button @click="goBackToLogin" class="text-gray-600 hover:text-gray-800 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>
      <div class="flex justify-center mb-6">
        <img class="h-24 w-auto" src="@/assets/BNI.webp" alt="Logo BNI" />
      </div>

      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-4">
        Authentication Verification
      </h1>
      <p class="text-center text-gray-600 mb-8">
        Enter the OTP code that has been sent to your registered mobile number.
      </p>

      <div v-if="errorMessage" class="bg-red-100 border border-red-500 text-red-700 p-3 rounded mb-6 text-sm">
        <span class="font-semibold">ERROR: </span>{{ errorMessage }}
      </div>

      <div class="flex justify-center space-x-2 mb-6">
        <input
          v-for="(digit, index) in otpDigits"
          :key="index"
          v-model="otpDigits[index]"
          @input="handleOtpInput(index, $event)"
          @keydown.backspace="handleBackspace(index, $event)"
          maxlength="1"
          ref="otpInputs"
          type="text"
          inputmode="numeric"
          pattern="[0-9]"
          class="w-12 h-12 text-center text-2xl font-bold border border-gray-300 rounded-md shadow-sm
                 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
          :class="{ 'border-red-500 focus:border-red-500': errorMessage }"
        />
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          @click="verifyOtp"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                 bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700
                 transition-all duration-300 ease-in-out"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
        >
          <span v-if="!isLoading">OTP Verification</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        </button>
      </div>

      <p class="mt-6 text-center text-sm text-gray-500">
        Didn't receive the code?
        <button @click="handleResendOtp" :disabled="isResending || isLoading" class="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200 ease-in-out">
          <span v-if="!isResending">Resend OTP</span>
          <span v-else>Resending...</span>
        </button>
      </p>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Asumsi Anda menggunakan `auth-alt` atau telah mengganti nama file auth.js Anda
import { useAuthStore } from '@/stores/auth'; // Atau '@/stores/auth-alt' jika Anda menamakannya begitu

export default {
  name: 'OtpVerification',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const otpDigits = ref(['', '', '', '', '', '']); // Array untuk OTP
    const isLoading = ref(false); // Untuk tombol verifikasi OTP
    const errorMessage = ref('');
    const otpInputs = ref([]); // Ref untuk elemen input
    const isResending = ref(false); // State terpisah untuk tombol resend

    // Fungsi untuk fokus otomatis ke input berikutnya
    const handleOtpInput = (index, event) => {
      const value = event.target.value;
      if (!/^\d*$/.test(value)) {
        otpDigits.value[index] = '';
        return;
      }
      otpDigits.value[index] = value.charAt(0);

      if (value && index < otpDigits.value.length - 1) {
        otpInputs.value[index + 1].focus();
      } else if (index === otpDigits.value.length - 1 && value) {
        event.target.blur();
      }
    };

    // Fungsi untuk menghapus dan kembali ke input sebelumnya saat backspace
    const handleBackspace = (index, event) => {
      if (event.key === 'Backspace' && otpDigits.value[index] === '' && index > 0) {
        otpInputs.value[index - 1].focus();
      }
    };

    // Fokus ke input pertama saat komponen dimuat
    onMounted(() => {
      setTimeout(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus();
        }
      }, 0);
    });

    const verifyOtp = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      const otpCode = otpDigits.value.join('');

      if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
        errorMessage.value = 'The OTP must be a 6-digit number.';
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.verifyOtp(otpCode);

        // Perubahan jika authStore.verifyOtp sekarang mengarahkan langsung
        if (result.success) {
          // Jika router.push sudah dilakukan di store, tidak perlu lagi di sini
          // router.push('/dashboard'); // Hapus baris ini jika sudah di handle di store
        } else {
          errorMessage.value = result.message || 'OTP verification failed.';
        }
      } catch (error) {
        errorMessage.value = 'An error occurred while verifying the OTP. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    // Fungsi untuk mengirim ulang OTP (memanggil store auth)
    const handleResendOtp = async () => {
      isResending.value = true; // Aktifkan loading state untuk resend
      errorMessage.value = ''; // Hapus pesan error sebelumnya

      try {
        const result = await authStore.resendOtp(); // Panggil fungsi resendOtp dari store
        if (result.success) {
          alert(result.message || 'A new OTP has been sent to your mobile number!');
          otpDigits.value = ['', '', '', '', '', '']; // Bersihkan input OTP setelah resend
          // Opsional: Fokus kembali ke input pertama
          setTimeout(() => {
            if (otpInputs.value[0]) {
              otpInputs.value[0].focus();
            }
          }, 0);
        } else {
          errorMessage.value = result.message || 'Failed to resend OTP. Please try again.';
        }
      } catch (error) {
        errorMessage.value = 'A network error occurred while trying to resend the OTP.';
      } finally {
        isResending.value = false; // Matikan loading state resend
      }
    };

    // NEW: Fungsi untuk kembali ke halaman login
    const goBackToLogin = () => {
      router.push('/login');
    };
    // END NEW

    return {
      otpDigits,
      isLoading,
      errorMessage,
      verifyOtp,
      handleOtpInput,
      handleBackspace,
      otpInputs,
      isResending,
      resendOtp: handleResendOtp,
      goBackToLogin, // NEW: Kembalikan fungsi goBackToLogin
    };
  },
};
</script>

<style scoped>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}

/* NEW: Pastikan parent container untuk elemen utama (div.bg-white) memiliki position: relative */
/* Anda mungkin perlu menambahkan ini ke div yang berisi card login Anda jika belum ada */
.min-h-screen.flex.items-center.justify-center.p-4.bg-gray-50 > div { /* Targetkan div putih */
    position: relative; /* Penting untuk positioning absolute tombol back */
}
</style>