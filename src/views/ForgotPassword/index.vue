<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-6">
        Forgot your password?
      </h1>
      <p class="text-center text-gray-600 mb-6">
        Enter your email address to receive a reset token.
      </p>

      <div v-if="authStore.error.value" class="bg-red-100 border border-red-500 text-red-700 p-3 rounded mb-6">
        <span class="font-semibold">ERROR: </span>{{ authStore.error.value }}
      </div>

      <form class="space-y-6" @submit.prevent="handleResetPassword">
        <div class="space-y-2">
          <label for="userEmail" class="block text-sm font-medium text-gray-700">Email address</label>
          <input
            id="userEmail"
            type="text"
            v-model="emailOrUsername"
            placeholder="Enter your email address"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading.value" class="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
          >
            <span v-if="!authStore.isLoading.value">Reset Password</span> <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memuat...
            </span>
          </button>
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Remembered your password ?
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Back to login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Pinia store untuk autentikasi

export default {
  name: 'ForgotPasswordPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore(); // Dapatkan instance Pinia store

    const emailOrUsername = ref('');
    // isLoading dan errorMessage sekarang akan diambil langsung dari authStore
    // const isLoading = ref(false); // Dihapus, karena state ini dikelola di store
    // const errorMessage = ref(''); // Dihapus, karena state ini dikelola di store

    const handleResetPassword = async () => {
      // Tidak perlu mengatur isLoading.value = true atau false di sini.
      // Store yang akan mengelola state loading dan error.
      // errorMessage.value = ''; // Tidak perlu mereset error secara manual di sini jika store yang mengelola

      try {
        // Panggil aksi resetPassword dari store
        const result = await authStore.resetPassword({ emailOrUsername: emailOrUsername.value });

        if (result.success) {
          router.push('/login'); // Redirect setelah sukses
        } else {
          // Jika store mengembalikan pesan error secara eksplisit:
          if (result.message) {
             authStore.error.value = result.message; // Store the specific error message
          }
          // Jika store tidak mengembalikan pesan spesifik, store.error.value sudah diatur oleh store
          // Atau, Anda bisa menetapkan pesan default di sini jika store tidak mengaturnya:
          // if (!authStore.error.value) { authStore.error.value = 'Failed to reset password.'; }
        }
      } catch (error) {
        // Tangani kesalahan tak terduga (misalnya, masalah jaringan)
        authStore.error.value = 'Terjadi kesalahan, coba lagi.';
      }
      // Tidak ada finally block lagi di sini karena store yang mengelola isLoading
    };

    return {
      // Data yang akan tersedia di template
      emailOrUsername,
      authStore, // Ekspos seluruh authStore agar bisa diakses di template (e.g., authStore.isLoading.value)
      handleResetPassword
    };
  }
};
</script>

<style scoped>
.bg-gradient-to-br {
  background-image: linear-gradient(135deg, #7f8ce3, #9d4edd);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

input:focus {
  outline: none;
  border-color: #4f46e5;
}
</style>