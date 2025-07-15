<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-24 w-auto" src="@/assets/3AM.png" alt="3AM Logo" />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Buat Kata Sandi Baru
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 max-w">
        Masukkan token reset dan kata sandi baru Anda.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10
                  hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ease-in-out
                  animate-fade-in-down">
        <AlertMessage
          :message="alertMessage"
          :type="alertType"
          :isVisible="showAlert"
        />

        <form class="space-y-6" @submit.prevent="handleSetNewPassword">
          <BaseInput
            id="resetToken"
            label="Token Reset"
            type="text"
            placeholder="Masukkan token reset Anda"
            required
            v-model="resetToken"
            @input="validateForm"
            :error="tokenError"
          />

          <BaseInput
            id="password"
            label="Kata Sandi Baru"
            type="password"
            placeholder="Minimal 8 karakter"
            required
            v-model="newPassword"
            @input="validateForm"
            :error="passwordError"
          />

          <BaseInput
            id="confirmPassword"
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            placeholder="Ketik ulang kata sandi baru Anda"
            required
            v-model="confirmPassword"
            @input="validateForm"
            :error="confirmPasswordError"
          />

          <div>
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     transition-all duration-300 ease-in-out"
              :class="{ 'opacity-50 cursor-not-allowed': isLoading || !isFormValid }"
            >
              <span v-if="!isLoading">Setel Kata Sandi</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memuat...
              </span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Kembali ke
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out">
              Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseInput from '@/components/BaseInput.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'SetNewPassword',
  components: {
    BaseInput,
    AlertMessage,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const newPassword = ref('');
    const confirmPassword = ref('');
    const isLoading = ref(false);
    const showAlert = ref(false);
    const alertMessage = ref('');
    const alertType = ref('info');
    const passwordError = ref('');
    const confirmPasswordError = ref('');
    const resetToken = ref('');
    const tokenError = ref('');

    const validateForm = () => {
      tokenError.value = '';
      passwordError.value = '';
      confirmPasswordError.value = '';

      if (!resetToken.value.trim()) {
        tokenError.value = 'Token reset diperlukan.';
      }

      if (newPassword.value.length < 8) {
        passwordError.value = 'Kata sandi minimal 8 karakter.';
      }

      if (newPassword.value !== confirmPassword.value) {
        confirmPasswordError.value = 'Kata sandi tidak cocok.';
      }
    };

    const isFormValid = computed(() => {
      return (
        resetToken.value.trim() !== '' &&
        newPassword.value.length >= 8 &&
        newPassword.value === confirmPassword.value
      );
    });

    const displayAlert = (message, type, duration = 3000) => {
      alertMessage.value = message;
      alertType.value = type;
      showAlert.value = true;
      if (duration > 0) {
        setTimeout(() => {
          showAlert.value = false;
          alertMessage.value = '';
        }, duration);
      }
    };

    const resetAlert = () => {
      showAlert.value = false;
      alertMessage.value = '';
      alertType.value = 'info';
    };

    const handleSetNewPassword = async () => {
      resetAlert();
      validateForm();

      if (!isFormValid.value) {
        displayAlert('Harap perbaiki kesalahan input Anda.', 'error');
        return;
      }

      isLoading.value = true;

      const result = await authStore.setNewPassword({
        token: resetToken.value,
        password: newPassword.value,
      });

      if (result.success) {
        displayAlert('Kata sandi berhasil diubah! Silakan masuk dengan kata sandi baru Anda.', 'success', 5000);
        resetToken.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        displayAlert(result.message || 'Reset gagal. Coba lagi.', 'error');
      }

      isLoading.value = false;
    };

    onMounted(() => {
      displayAlert('Harap masukkan token reset Anda secara manual.', 'info', 0);
    });

    return {
      resetToken,
      newPassword,
      confirmPassword,
      isLoading,
      showAlert,
      alertMessage,
      alertType,
      tokenError,
      passwordError,
      confirmPasswordError,
      isFormValid,
      handleSetNewPassword,
      displayAlert,
      resetAlert,
      validateForm,
    };
  },
};
</script>

<style scoped>
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}
</style>
