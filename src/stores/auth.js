import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const baseURL = import.meta.env.VITE_API_BASE_URL || process.env.VUE_APP_SERVICE_API || 'http://localhost:3000';

  const login = async (credentials) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        user.value = data.user || { username: credentials.username };
        isAuthenticated.value = true;

        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // ⛔ router harus dipanggil DI SINI
        const { useRouter } = await import('vue-router');
        const router = useRouter();

        if (data.mfaRequired) {
          router.push('/otp');
        } else {
          router.push('/dashboard');
        }

        return {
          success: true,
          message: data.message || 'Login berhasil',
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login gagal',
          data: data,
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
        error: error.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Pendaftaran berhasil' : 'Pendaftaran gagal'),
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat pendaftaran.',
        error: error.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const verifyOtp = async (otpCode) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otpCode }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Verifikasi berhasil' : 'Verifikasi gagal'),
      };
    } catch (error) {
      console.error('OTP Verification error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat verifikasi OTP.',
        error: error.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('auth_token');

    // ⛔ router harus dipanggil DI SINI juga
    const { useRouter } = await import('vue-router');
    const router = useRouter();
    router.push('/login');
  };

  const checkAuth = () => {
    isAuthenticated.value = !!localStorage.getItem('auth_token');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyOtp,
    logout,
    checkAuth,
  };
});
