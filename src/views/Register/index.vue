<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-down
                 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ease-in-out">
      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-6">
        Register your account
      </h1>
      <p class="text-center text-gray-600 mb-8">
        Welcome! Please complete your personal data.
      </p>

      <AlertMessage
        :message="alertMessage"
        :type="alertType"
        :isVisible="showAlert"
        :duration="alertDuration" 
        @update:isVisible="showAlert = $event; resetAlertState()" 
      />

      <form class="space-y-6" @submit.prevent="handleRegister">
        <BaseInput
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          autocomplete="name"
          required
          v-model="fullName"
          :errorMessage="formErrors.fullName"
        />
        <BaseInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          autocomplete="email"
          required
          v-model="email"
          :errorMessage="formErrors.email"
        />

        <BaseInput
          id="phone"
          label="Phone Number"
          type="tel" placeholder="Enter your phone number"
          autocomplete="tel" required
          v-model="phone"
          :errorMessage="formErrors.phone"
        />        

        <BaseInput
          id="username"
          label="Username"
          type="text"
          placeholder="Enter your username"
          autocomplete="username"
          required
          v-model="username"
          :errorMessage="formErrors.username"
        />
        <BaseInput
          id="password"
          label="Password"
          type="password"
          placeholder="Create New Password"
          autocomplete="new-password"
          required
          v-model="password"
          :errorMessage="formErrors.password"
          :isPasswordToggle="true" />
        <BaseInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          autocomplete="new-password"
          required
          v-model="confirmPassword"
          :errorMessage="formErrors.confirmPassword"
          /> <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
                                   transition-all duration-300 ease-in-out"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.isLoading }"
          >
            <span v-if="!authStore.isLoading">Register Now</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          </button>
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Already have an account?
        <router-link to="/" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out">
          Back to login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/BaseInput.vue';
import AlertMessage from '@/components/AlertMessage.vue';

export default {
  name: 'RegisterPage',
  components: {
    BaseInput,
    AlertMessage,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    // Form fields
    const fullName = ref('');
    const email = ref('');
    const phone = ref('');
    const username = ref('');
    const password = ref('');
    const confirmPassword = ref('');

    // Error messages for each field
    const formErrors = reactive({
      fullName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
    });

    // Alert state (for general registration status, not individual field errors)
    const showAlert = ref(false);
    const alertMessage = ref('');
    const alertType = ref('info');
    const alertDuration = ref(3000); 

    const displayAlert = (message, type, duration = 3000) => {
      alertMessage.value = message;
      alertType.value = type;
      alertDuration.value = duration;
      showAlert.value = true;
    };

    const resetAlertState = () => {
      showAlert.value = false;
      alertMessage.value = '';
      alertType.value = 'info';
      alertDuration.value = 3000;
    };

    const resetForm = () => {
      fullName.value = '';
      phone.value = '';
      email.value = '';
      username.value = '';
      password.value = '';
      confirmPassword.value = '';
      resetFormErrors(); // Clear all form errors on successful submission
    };

    const resetFormErrors = () => {
      for (const key in formErrors) {
        formErrors[key] = '';
      }
    };

    // Watchers to clear error messages when the input changes
    watch(fullName, () => { formErrors.fullName = ''; });
    watch(email, () => { formErrors.email = ''; });
    watch(phone, () => { formErrors.phone = ''; });
    watch(username, () => { formErrors.username = ''; });
    watch(password, () => { formErrors.password = ''; });
    watch(confirmPassword, () => { formErrors.confirmPassword = ''; });


    const handleRegister = async () => {
      resetFormErrors(); // Clear all previous field errors
      resetAlertState(); // Reset general alert before starting

      let hasError = false;

      // Full Name validation
      if (!fullName.value.trim()) {
        formErrors.fullName = 'Full name is required.';
        hasError = true;
      }

      // Email validation
      if (!email.value.trim()) {
        formErrors.email = 'Email address is required.';
        hasError = true;
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.value)) {
          formErrors.email = 'The email format is invalid.';
          hasError = true;
        }
      }

      // Phone Number validation
      if (!phone.value.trim()) {
        formErrors.phone = 'Phone number is required.';
        hasError = true;
      } else {
        const phoneRegex = /^[0-9]{10,12}$/;
        if (!phoneRegex.test(phone.value)) {
          formErrors.phone = 'Invalid phone number.';
          hasError = true;
        }
      }

      // Username validation
      if (!username.value.trim()) {
        formErrors.username = 'Username is required.';
        hasError = true;
      }

      // Password validation
      if (password.value !== confirmPassword.value) {
        formErrors.confirmPassword = 'Password confirmation does not match.';
        hasError = true;
      }

      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!strongPasswordRegex.test(password.value)) {
        formErrors.password = 'Password must be at least 8 characters long and contain uppercase letters, lowercase letters, and numbers.';
        hasError = true;
      }

      if (hasError) {
        return; // Stop if there are any validation errors
      }

      try {
        const result = await authStore.register({
          fullName: fullName.value,
          email: email.value,
          phone: phone.value,
          username: username.value,
          password: password.value
        });

        if (result.success) {
          // Changed the success message to English
          displayAlert('Registration successful! Redirecting to login...', 'success', 6000);
          resetForm();
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else {
          // Keep the existing error message from result.message, or a fallback in English
          displayAlert(result.message || 'Registration failed, please try again.', 'error', 0);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        displayAlert('An unexpected error happened while registering.', 'error', 0);
      }
    };

    return {
      fullName,
      email,
      phone,
      username,
      password,
      confirmPassword,
      showAlert,
      alertMessage,
      alertType,
      alertDuration,
      authStore,
      formErrors,
      handleRegister,
      resetAlertState,
    };
  },
};
</script>

<style scoped>
/* Anda dapat menambahkan gaya kustom di sini jika diperlukan */
/* Misalnya, jika animate-fade-in-down tidak didefinisikan secara global */
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