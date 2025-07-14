<template>
  <div>
    <h2>Authentication Verification</h2>
    <p>Enter the OTP code that has been sent to your registered mobile number.</p>

    <div v-if="errorMessage">{{ errorMessage }}</div>

    <input v-for="(digit, index) in otpDigits" :key="index" v-model="otpDigits[index]" maxlength="1" />

    <button :disabled="isLoading" @click="verifyOtp">OTP Verification</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';  // Pastikan mengimpor useRouter
import { useAuthStore } from '@/stores/auth';  // Mengimpor store Pinia

export default {
  setup() {
    const router = useRouter(); // Mendapatkan instance router
    const authStore = useAuthStore();
    const otpDigits = ref(['', '', '', '', '', '']); // Array untuk OTP
    const isLoading = ref(false);
    const errorMessage = ref('');

    const verifyOtp = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      const otpCode = otpDigits.value.join('');

      if (otpCode.length !== 6) {
        errorMessage.value = 'OTP must contain 6 digits..';
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.verifyOtp(otpCode);

        if (result.success) {
          router.push('/dashboard'); // Arahkan ke dashboard setelah OTP berhasil diverifikasi
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