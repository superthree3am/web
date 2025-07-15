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

      <div v-if="errorMessage" class="bg-red-100 border border-red-500 text-red-700 p-3 rounded mb-6 text-sm flex items-center justify-between">
        <span class="font-semibold text-red-700 mr-2">ERROR:</span> {{ errorMessage }}
        <button @click="errorMessage = ''" class="text-red-700 hover:text-red-900 focus:outline-none">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p class="text-center text-gray-600 mb-8">
        Enter the OTP code that has been sent to your registered mobile number.
      </p>

      <p class="text-center text-gray-700 font-semibold mb-4">OTP Code (6 Digits)</p>
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
          :class="{ 'border-red-500 focus:border-red-500': errorMessage, 'text-red-500': errorMessage }"
        />
      </div>

      <p class="mt-2 text-center text-sm text-gray-500 mb-6">
        <span v-if="resendTimer > 0">Resend code in 00:{{ formattedResendTimer }}</span>
        <button v-else @click="handleResendOtp" :disabled="isResending || isLoading" class="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200 ease-in-out">
          <span v-if="!isResending">Resend OTP</span>
          <span v-else>Resending...</span>
        </button>
      </p>
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

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Perhatikan bahwa Anda mengimpor 'auth', bukan 'auth-alt'

export default {
  name: 'OtpVerification',
  setup() {
    const router = useRouter();
    // Pastikan Anda mengimpor store yang benar jika namanya auth-alt
    // import { useAuthStore } from '@/stores/auth-alt'; // Jika nama file store Anda adalah auth-alt.js
    const authStore = useAuthStore();
    const otpDigits = ref(['', '', '', '', '', '']);
    const isLoading = ref(false);
    const errorMessage = ref('');
    const otpInputs = ref([]);
    const isResending = ref(false);
    const resendTimer = ref(60);
    let timerInterval = null;

    const formattedResendTimer = computed(() => {
      const minutes = Math.floor(resendTimer.value / 60);
      const seconds = resendTimer.value % 60;
      return String(seconds).padStart(2, '0');
    });

    const startResendTimer = () => {
      resendTimer.value = 60;
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      timerInterval = setInterval(() => {
        if (resendTimer.value > 0) {
          resendTimer.value--;
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }, 1000);
    };

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

    const handleBackspace = (index, event) => {
      if (event.key === 'Backspace' && otpDigits.value[index] === '' && index > 0) {
        otpInputs.value[index - 1].focus();
      }
    };

    onMounted(() => {
      setTimeout(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus();
        }
      }, 0);
      startResendTimer();
    });

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    });

    const verifyOtp = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      const otpCode = otpDigits.value.join('');

      if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
        errorMessage.value = 'Incorrect OTP Code!'; // Already English
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.verifyOtp(otpCode);

        if (result.success) {
          // If router.push is handled in the store, no need to do it here
        } else {
          errorMessage.value = result.message || 'Incorrect OTP Code!'; // Already English
        }
      } catch (error) {
        errorMessage.value = 'An error occurred while verifying the OTP. Please try again.'; // Changed
      } finally {
        isLoading.value = false;
      }
    };

    const handleResendOtp = async () => {
      isResending.value = true;
      errorMessage.value = '';

      try {
        const result = await authStore.resendOtp();
        if (result.success) {
          otpDigits.value = ['', '', '', '', '', ''];
          setTimeout(() => {
            if (otpInputs.value[0]) {
              otpInputs.value[0].focus();
            }
          }, 0);
          startResendTimer();
        } else {
          errorMessage.value = result.message || 'Failed to resend OTP. Please try again.'; // Changed
        }
      } catch (error) {
        errorMessage.value = 'A network error occurred while trying to resend the OTP.'; // Changed
      } finally {
        isResending.value = false;
      }
    };

    const goBackToLogin = () => {
      router.push('/login');
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
      resendOtp: handleResendOtp,
      goBackToLogin,
      resendTimer,
      formattedResendTimer,
      startResendTimer,
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

.min-h-screen.flex.items-center.justify-center.p-4.bg-gray-50 > div {
    position: relative;
}
</style>