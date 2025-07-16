import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth-alt', () => { // Mengubah nama store menjadi 'auth-alt'
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoadingAuth = ref(false); // Mengubah nama untuk loading state terkait otentikasi
  const baseURL = process.env.VUE_APP_SERVICE_API;
  const router = useRouter();

  // Fungsi login
  const login = async (credentials) => {
    isLoadingAuth.value = true; // Menggunakan isLoadingAuth
    try {
      // --- Logika Dummy untuk OTP ---
      if (credentials.username === 'otptest') {
        // Cek password dummy khusus untuk 'otptest'
        if (credentials.password === 'otp123') { // <--- Password khusus untuk dummy OTP
          user.value = { username: credentials.username };
          isAuthenticated.value = true;
          // Tidak perlu token di localStorage untuk dummy ini jika tidak ada backend
          router.push('/otp');
          return {
            success: true,
            message: 'Login successful, OTP required (Dummy).', // Changed
            mfaRequired: true,
          };
        } else {
          // Password salah untuk dummy user 'otptest'
          return {
            success: false,
            message: 'Incorrect password for dummy OTP user.', // Changed
          };
        }
      }
      // --- Akhir Logika Dummy untuk OTP ---

      // --- Logika Asli untuk Login Backend ---
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

        if (data.mfaRequired) { // Cek mfaRequired dari respons backend
          router.push('/otp');
          return {
            success: true,
            message: data.message || 'Login successful, OTP required.', // Changed
            mfaRequired: true,
          };
        } else {
          router.push('/dashboard');
          return {
            success: true,
            message: data.message || 'Login successful.', // Changed
            mfaRequired: false,
          };
        }
      } else {
        return {
          success: false,
          message: data.message || 'Login failed.', // Changed
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.', // Changed
        error: error.message,
      };
    } finally {
      isLoadingAuth.value = false;
    }
  };

  // Fungsi untuk register (registrasi)
  const register = async (userData) => {
    isLoadingAuth.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: userData.fullName,
          email: userData.email,
          username: userData.username,
          phone: userData.phone,
          password: userData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Registration successful.', // Changed
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed.', // Changed
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'An error occurred during registration. Please try again.', // Changed
        error: error.message,
      };
    } finally {
      isLoadingAuth.value = false;
    }
  };

  // Fungsi verifikasi OTP (Dummy)
  const verifyOtp = async (otpCode) => {
    isLoadingAuth.value = true;
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otpCode === '123456') { // OTP dummy yang benar
      isAuthenticated.value = true;
      router.push('/dashboard'); // Langsung arahkan ke dashboard setelah verifikasi dummy
      return {
        success: true,
        message: 'OTP verification successful! (Dummy)', // Changed
      };
    } else {
      return {
        success: false,
        message: 'Incorrect OTP Code!', // Changed - already in English, just confirming
      };
    }
  };

  // Fungsi resend OTP (Dummy)
  const resendOtp = async () => {
    isLoadingAuth.value = true;
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      message: 'A new OTP has been sent to your mobile number! (Dummy)', // Changed
    };
  };

  // Fungsi logout
  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('auth_token');
    router.push('/login');
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
    isLoadingAuth,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    checkAuth,
  };
});