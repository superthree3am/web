<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
      <h2 class="text-2xl font-bold text-center mb-4">Authentication Verification</h2>
      <p class="text-center text-gray-600 mb-6">
        Enter the OTP code that has been sent to your registered mobile number.
      </p>

      <p v-if="errorMessage" class="text-red-600 text-sm mt-2">{{ errorMessage }}</p>


      <form @submit.prevent="verifyOtp" class="space-y-4">
        <div class="flex justify-center space-x-2">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            v-model="otpDigits[index]"
            maxlength="1"
            class="w-10 h-10 text-center border border-gray-300 rounded"
            type="text"
            :data-testid="'otp-' + index"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full mt-6 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded disabled:opacity-50"
        >
          {{ isLoading ? 'Verifying...' : 'Verify OTP' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const otpDigits = ref(['', '', '', '', '', '']);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const verifyOtp = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      const otpCode = otpDigits.value.join('');

      if (otpCode.length !== 6) {
        errorMessage.value = 'OTP must contain 6 digits.';
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
        errorMessage.value = 'There was an error verifying the OTP.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      otpDigits,
      isLoading,
      errorMessage,
      verifyOtp,
    };
  },
};
</script>
