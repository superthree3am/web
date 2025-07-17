<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-down
                hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out relative">

      <!-- Tombol panah kiri -->
      <div class="absolute top-4 left-4">
        <button @click="goToLogin" class="flex items-center text-gray-600 hover:text-indigo-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="text-sm font-medium"></span>
        </button>
      </div>

      <!-- Logo -->
      <div class="flex justify-center mb-6 mt-4">
        <img class="h-28 w-auto" src="@/assets/BNI.webp" alt="Logo BNI" />
      </div>

      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-6">
        OTP Verification
      </h1>

      <div v-if="errorMessage" class="bg-red-100 border border-red-500 text-red-700 p-3 rounded mb-6">
        <span class="font-semibold">ERROR: </span>{{ errorMessage }}
      </div>
      <div v-if="successMessage" class="bg-green-100 border border-green-500 text-green-700 p-3 rounded mb-6">
        <span class="font-semibold">SUCCESS: </span>{{ successMessage }}
      </div>

      <p class="text-center text-gray-700 mb-6">
        Please enter the 6-digit code sent to your registered phone number.<br />
        <span v-if="phoneNumberDisplay" class="font-semibold">{{ phoneNumberDisplay }}</span>
      </p>

      <form class="space-y-6" @submit.prevent="handleOtpVerification">
        <!-- Input OTP -->
        <div class="flex justify-center space-x-2">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            v-model="otpDigits[index]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="w-12 h-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            @input="onOtpInput(index)"
            @keydown.backspace="onOtpBackspace(index, $event)"
          />
        </div>

        <!-- reCAPTCHA -->
        <div id="recaptcha-container" class="mt-4 flex justify-center"></div>

        <!-- Tombol verifikasi -->
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                   transition-all duration-300 ease-in-out"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
          >
            <span v-if="!isLoading">Verify OTP</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          </button>
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Didn't receive code?
        <button @click="resendOtp" :disabled="isResending || isLoading" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
          Resend OTP
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'OtpPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const otpDigits = ref(['', '', '', '', '', '']);
    const isLoading = ref(false);
    const isResending = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const phoneNumberDisplay = ref('');

    const otpCode = computed(() => otpDigits.value.join(''));

    const onOtpInput = (index) => {
      const val = otpDigits.value[index];
      if (val.length > 1) otpDigits.value[index] = val.slice(-1);
      if (val && index < 5) focusNextInput(index + 1);
    };

    const onOtpBackspace = (index, event) => {
      if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        focusNextInput(index - 1);
      }
    };

    const focusNextInput = (index) => {
      const inputs = document.querySelectorAll('input[type="text"]');
      if (inputs[index]) inputs[index].focus();
    };

    onMounted(async () => {
      const phoneNumber = authStore.currentPhoneNumber;
      if (!phoneNumber) {
        errorMessage.value = 'Phone number not found. Please log in again.';
        router.push('/login');
        return;
      }
      phoneNumberDisplay.value = phoneNumber;

      const result = await authStore.sendOtpFirebase('recaptcha-container');
      if (result.success) {
        successMessage.value = result.message;
      } else {
        errorMessage.value = result.message;
      }
    });

    const handleOtpVerification = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      if (otpCode.value.length !== 6) {
        errorMessage.value = 'OTP must be 6 digits long.';
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.verifyOtpAndLoginWithFirebase(otpCode.value);
        if (result.success) {
          successMessage.value = result.message;
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          errorMessage.value = result.message;
        }
      } catch (error) {
        errorMessage.value = 'An unexpected error occurred during OTP verification.';
      } finally {
        isLoading.value = false;
      }
    };

    const resendOtp = async () => {
      const phoneNumber = authStore.currentPhoneNumber;
      if (!phoneNumber) {
        errorMessage.value = 'Phone number not found for resending OTP.';
        return;
      }

      isResending.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const result = await authStore.sendOtpFirebase('recaptcha-container');
        if (result.success) {
          successMessage.value = 'OTP has been re-sent.';
        } else {
          errorMessage.value = result.message || 'Failed to resend OTP.';
        }
      } catch (error) {
        errorMessage.value = 'Failed to resend OTP due to an error.';
      } finally {
        isResending.value = false;
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    return {
      otpDigits,
      isLoading,
      isResending,
      errorMessage,
      successMessage,
      phoneNumberDisplay,
      handleOtpVerification,
      resendOtp,
      onOtpInput,
      onOtpBackspace,
      goToLogin,
      router,
    };
  },
};
</script>
