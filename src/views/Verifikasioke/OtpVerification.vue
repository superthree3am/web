<template>
  <div class="min-h-screen flex items-center justify-center p-4">

    <TooManyRequestsModal
      v-model:isVisible="showTooManyRequestsModal"
      @backToLogin="goBackToLogin"
    />

    <TooManyAttemptsModal
      v-model:isVisible="showTooManyAttemptsModal"
      @backToLogin="goBackToLogin"
    />

    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-down hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out">

      <div class="flex justify-start mb-4">
        <button @click="goBack" data-test="go-back-button" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      <div class="flex justify-center mb-6">
        <img class="h-28 w-auto" src="@/assets/BNI.webp" alt="Logo BNI" />
      </div>

      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-6">
        Authentication Verification
      </h1>

      <div v-if="errorMessage" class="bg-red-100 border border-red-500 text-red-700 p-3 rounded mb-6">
        <span class="font-semibold">ERROR: </span>{{ errorMessage }}
      </div>
      <div v-if="successMessage" class="bg-green-100 border border-green-500 text-green-700 p-3 rounded mb-6">
        <span class="font-semibold">SUCCESS: </span>{{ successMessage }}
      </div>

      <p class="text-center text-gray-700 mb-6">
        Enter the OTP code that has been sent to your registered phone number.
        <br />
        <span v-if="phoneNumberDisplay" class="font-semibold">{{ phoneNumberDisplay }}</span>
      </p>

      <div v-if="showRecaptchaContainer" id="recaptcha-container" class="mt-4 flex justify-center"></div>

      <form v-if="!isRecaptchaLoading" class="space-y-6" @submit.prevent="handleOtpVerification">
        <p class="text-center text-gray-800 font-medium text-base">
          OTP Code (6 Digits)
        </p>
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
            :ref="(el) => otpInputs[index] = el" />
        </div>

        <p v-if="failedAttempts > 0 && failedAttempts < maxAttempts" class="mt-4 text-center text-sm text-red-500">
          Failed attempts: {{ failedAttempts }} from {{ maxAttempts }}
        </p>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
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

      <p v-if="!isRecaptchaLoading" class="mt-6 text-center text-sm text-gray-500">
        Didn't receive code?
        <button
          @click="resendOtp"
          data-test="resend-otp-button"
          :disabled="isResending || isLoading || isBlocked || resendCountdown > 0"
          class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="resendCountdown > 0">Resend in {{ resendCountdownFormatted }}</span>
          <span v-else>Resend OTP</span>
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import TooManyRequestsModal from '@/components/ModalTooMany.vue';
import TooManyAttemptsModal from '@/components/TooManyAttemptsModal.vue'; 

export default {
  name: 'OtpPage',
  components: {
    TooManyRequestsModal,
    TooManyAttemptsModal 
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const otpDigits = ref(['', '', '', '', '', '']);
    const isLoading = ref(false);
    const isResending = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const phoneNumberDisplay = ref('');
    const isRecaptchaLoading = ref(true);
    const showRecaptchaContainer = ref(true);
    const isBlocked = ref(false);
    const resendCountdown = ref(0);

    // State untuk mengontrol dua modal berbeda
    const showTooManyRequestsModal = ref(false);
    const showTooManyAttemptsModal = ref(false);

    // State lokal untuk menghitung percobaan gagal
    const failedAttempts = ref(0);
    const maxAttempts = 3; 

    let countdownInterval = null;

    const otpCode = computed(() => otpDigits.value.join(''));
    const otpInputs = ref([]);

    const resendCountdownFormatted = computed(() => {
      const minutes = Math.floor(resendCountdown.value / 60);
      const seconds = resendCountdown.value % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    });

    const onOtpInput = (index) => {
      let val = otpDigits.value[index];
      val = val.replace(/\D/g, '');
      if (val.length > 1) {
        val = val.charAt(0);
      }
      otpDigits.value[index] = val;

      if (val && index < otpDigits.value.length - 1) {
        nextTick(() => {
          if (otpInputs.value[index + 1]) {
            otpInputs.value[index + 1].focus();
          }
        });
      }
    };

    const onOtpBackspace = (index, event) => {
      if (event.key === 'Backspace') {
        if (!otpDigits.value[index] && index > 0) {
          otpDigits.value[index - 1] = '';
          nextTick(() => {
            if (otpInputs.value[index - 1]) {
              otpInputs.value[index - 1].focus();
            }
          });
        } else if (otpDigits.value[index]) {
          otpDigits.value[index] = '';
        }
      }
    };

    const focusFirstInput = () => {
      nextTick(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus();
        }
      });
    };

    const goBack = () => {
      router.push('/login');
    };

    const goBackToLogin = () => {
      showTooManyRequestsModal.value = false;
      showTooManyAttemptsModal.value = false; // Pastikan semua modal tertutup
      router.push('/login');
    };

    const startResendCountdown = (duration = 60) => {
      resendCountdown.value = duration;
      countdownInterval && clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        resendCountdown.value--;
        if (resendCountdown.value <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    };

    const initializeRecaptcha = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      isRecaptchaLoading.value = true;
      showRecaptchaContainer.value = true;
      otpDigits.value = ['', '', '', '', '', ''];
      failedAttempts.value = 0; // Reset percobaan saat reCAPTCHA baru diinisialisasi

      const recaptchaEl = document.getElementById('recaptcha-container');
      if (recaptchaEl) {
        recaptchaEl.innerHTML = '';
      }

      await nextTick();

      const phoneNumber = authStore.currentPhoneNumber;
      if (!phoneNumber) {
        errorMessage.value = 'Phone number not found. Please log in again.';
        router.push('/login');
        isRecaptchaLoading.value = false;
        showRecaptchaContainer.value = false;
        return;
      }

      try {
        const result = await authStore.sendOtpFirebase('recaptcha-container');

        if (result.success) {
          successMessage.value = result.message;
          isRecaptchaLoading.value = false;
          showRecaptchaContainer.value = false;
          focusFirstInput();
          startResendCountdown();
        } else {
          errorMessage.value = result.message || 'Failed to send OTP.';
          isRecaptchaLoading.value = false;

          if (result.message?.includes('Too many OTP requests')) {
            isBlocked.value = true;
            // Gunakan modal TooManyRequestsModal di sini
            showTooManyRequestsModal.value = true;
          }
        }
      } catch (error) {
        console.error("Error during reCAPTCHA initialization or sending OTP:", error);
        errorMessage.value = 'Failed to initialize reCAPTCHA or send OTP. Please try again.';
        isRecaptchaLoading.value = false;
      }
    };

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
          failedAttempts.value = 0; // Reset jika berhasil
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          errorMessage.value = result.message || 'OTP verification failed.';
          
          if (errorMessage.value.includes('Incorrect OTP code')) {
            failedAttempts.value++;
            if (failedAttempts.value >= maxAttempts) {
              isBlocked.value = true;
              // Gunakan modal TooManyAttemptsModal di sini
              showTooManyAttemptsModal.value = true;
            }
          }
        }
      } catch (error) {
        console.error("Error during OTP verification:", error);
        errorMessage.value = 'Incorrect OTP code!';
        failedAttempts.value++; 
        if (failedAttempts.value >= maxAttempts) {
          isBlocked.value = true;
          // Gunakan modal TooManyAttemptsModal di sini
          showTooManyAttemptsModal.value = true;
        }
      } finally {
        isLoading.value = false;
      }
    };

    const resendOtp = async () => {
      if (isBlocked.value || resendCountdown.value > 0) return;

      isResending.value = true;
      isLoading.value = true;
      
      failedAttempts.value = 0; 

      await initializeRecaptcha();

      startResendCountdown();

      isResending.value = false;
      isLoading.value = false;
    };

    onMounted(async () => {
      const phoneNumber = authStore.currentPhoneNumber;
      if (!phoneNumber) {
        errorMessage.value = 'Phone number not found. Please log in again.';
        router.push('/login');
        return;
      }
      phoneNumberDisplay.value = phoneNumber;

      await nextTick();
      otpInputs.value = otpInputs.value.filter(Boolean);

      await initializeRecaptcha();
    });

    return {
      otpDigits,
      isLoading,
      isResending,
      errorMessage,
      successMessage,
      phoneNumberDisplay,
      isRecaptchaLoading,
      showRecaptchaContainer,
      isBlocked,
      resendCountdown,
      resendCountdownFormatted,
      showTooManyRequestsModal,
      showTooManyAttemptsModal, // Tambahkan state modal baru
      handleOtpVerification,
      resendOtp,
      onOtpInput,
      onOtpBackspace,
      goBack,
      goBackToLogin,
      otpInputs,
      failedAttempts, 
      maxAttempts, 
    };
  },
};
</script>