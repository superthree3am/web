<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-down
                 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out">

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
import { useAuthStore } from '@/stores/auth';

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
        errorMessage.value = 'OTP harus berupa 6 digit angka.';
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.verifyOtp(otpCode);

        if (result.success) {
          router.push('/dashboard');
        } else {
          errorMessage.value = result.message || 'Verifikasi OTP gagal.';
        }
      } catch (error) {
        errorMessage.value = 'Terjadi kesalahan saat memverifikasi OTP. Silakan coba lagi.';
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
          alert(result.message || 'OTP baru telah dikirim ke nomor ponsel Anda!');
          otpDigits.value = ['', '', '', '', '', '']; // Bersihkan input OTP setelah resend
          // Opsional: Fokus kembali ke input pertama
          setTimeout(() => {
            if (otpInputs.value[0]) {
              otpInputs.value[0].focus();
            }
          }, 0);
        } else {
          errorMessage.value = result.message || 'Gagal mengirim ulang OTP. Silakan coba lagi.';
        }
      } catch (error) {
        errorMessage.value = 'Terjadi kesalahan jaringan saat mencoba mengirim ulang OTP.';
      } finally {
        isResending.value = false; // Matikan loading state resend
      }
    };

    return {
      otpDigits,
      isLoading,
      errorMessage,
      verifyOtp,
      handleOtpInput,
      handleBackspace,
      otpInputs,
      isResending,
      resendOtp: handleResendOtp, // Ubah nama fungsi yang dikembalikan menjadi handleResendOtp
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
</style>