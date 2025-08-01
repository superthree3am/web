<template>
  <teleport to="body">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      <!-- Modal panel -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in-scale">
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
              <!-- Warning icon -->
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">
                Too Many OTP Requests
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                You have made too many OTP requests. Please try again later to avoid security restrictions.
              </p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div class="flex justify-center">
            <button 
              @click="handleBackToLogin"
              type="button" 
              class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Back To Login Page
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: 'TooManyRequestsModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:isVisible', 'backToLogin'],
  setup(props, { emit }) {
    const handleBackToLogin = () => {
      emit('update:isVisible', false);
      emit('backToLogin');
    };

    return {
      handleBackToLogin
    };
  }
};
</script>

<style scoped>
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fade-in-scale {
  animation: fadeInScale 0.2s ease-out forwards;
}
</style>