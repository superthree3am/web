import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false); // Global loading state untuk store
  const baseURL = process.env.VUE_APP_SERVICE_API;
  const router = useRouter();

  // Fungsi login
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

        // Cek jika MFA (OTP) diperlukan
        if (data.mfaRequired) {
          router.push('/otp'); // Arahkan ke halaman OTP jika MFA diperlukan
        } else {
          router.push('/dashboard'); // Jika tidak ada MFA, langsung menuju dashboard
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

  // Fungsi untuk register (registrasi)
  const register = async (userData) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: userData.fullName, // Menggunakan full_name sesuai permintaan sebelumnya
          email: userData.email,
          username: userData.username,
          phone: userData.phone, 
          password: userData.password
        })
      })

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Pendaftaran berhasil',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Pendaftaran gagal',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.',
        error: error.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Fungsi verifikasi OTP
  const verifyOtp = async (otpCode) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        isAuthenticated.value = true; // Asumsi authenticated setelah OTP diverifikasi
        return {
          success: true,
          message: data.message || 'Verifikasi OTP berhasil!',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Verifikasi OTP gagal.',
        };
      }
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

  // Fungsi untuk meminta pengiriman ulang OTP
  const resendOtp = async () => {
    isLoading.value = true; // Menggunakan isLoading global store
    try {
      const response = await fetch(`${baseURL}/api/v1/resend-otp`, { // Pastikan URL ini benar
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Jika backend memerlukan token atau data user untuk resend, tambahkan di sini.
          // Contoh: 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          // body: JSON.stringify({ username: user.value?.username || '' }), // Mengirim username jika tersedia
        },
        // Jika backend tidak memerlukan body untuk resend, bisa dikosongkan
        body: JSON.stringify({ /* data yang diperlukan backend untuk resend */ })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'OTP baru berhasil dikirim ulang!',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Gagal mengirim ulang OTP.',
        };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan jaringan saat mencoba mengirim ulang OTP.',
        error: error.message,
      };
    } finally {
      isLoading.value = false; // Set kembali ke false setelah selesai
    }
  };


  // Fungsi logout
  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('auth_token');
    router.push('/login');  // Arahkan ke halaman login setelah logout
  };

  // Fungsi untuk mengecek status autentikasi
  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      isAuthenticated.value = true;
    } else {
      isAuthenticated.value = false;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyOtp,
    resendOtp, 
    logout,
    checkAuth,
  };
});