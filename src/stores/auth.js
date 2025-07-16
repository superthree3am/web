// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const baseURL = process.env.VUE_APP_SERVICE_API || 'http://localhost:8080';

  // --- Firebase Client SDK initialization ---
  const firebaseConfig = {
    apiKey: "AIzaSyDexM23IlaX_UGOnVu-XqGCWm2MsTYhzIo",
    authDomain: "p3am-165d0.firebaseapp.com",
    projectId: "p3am-165d0",
    storageBucket: "p3am-165d0.firebasestorage.app",
    messagingSenderId: "259915858128",
    appId: "1:259915858128:web:8e1cad616206101cdcded5",
    measurementId: "G-VKY3VP8KKE"
  };
  const firebaseApp = initializeApp(firebaseConfig);
  const firebaseAuth = getAuth(firebaseApp);
  // --- End Firebase Client SDK initialization ---

  let confirmationResult = null;
  const currentPhoneNumber = ref(null); // Tambahkan ini untuk menyimpan nomor telepon

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
        if (data.phoneNumber) {
          currentPhoneNumber.value = data.phoneNumber; // Simpan nomor telepon di store
          return {
            success: true,
            mfaRequired: true,
            message: data.message || 'OTP verification initiated.',
            // phoneNumber: data.phoneNumber, // Tidak perlu lagi dikembalikan secara eksplisit
            username: data.username,
          };
        } else if (data.token) {
          token.value = data.token;
          user.value = data.user || { username: data.username };
          isAuthenticated.value = true;
          localStorage.setItem('auth_token', data.token);
          return {
            success: true,
            mfaRequired: false,
            message: data.message || 'Login successful.',
          };
        } else {
          return { success: false, message: data.message || 'Invalid server response.' };
        }
      } else {
        return { success: false, message: data.message || 'Login failed.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error or server unavailable.' };
    } finally {
      isLoading.value = false;
    }
  };

  const sendOtpFirebase = async (recaptchaContainerId = 'recaptcha-container') => { // Hapus phoneNumber dari parameter
    isLoading.value = true;
    if (!currentPhoneNumber.value) { // Gunakan dari store
      isLoading.value = false;
      return { success: false, message: 'Phone number not available to send OTP.' };
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
        'size': 'invisible',
        'expired-callback': () => { /* ... */ }
      });
      await window.recaptchaVerifier.render();

      confirmationResult = await signInWithPhoneNumber(firebaseAuth, currentPhoneNumber.value, window.recaptchaVerifier); // Gunakan dari store
      return { success: true, message: 'OTP sent!' };
    } catch (error) {
      console.error("Error sending OTP via Firebase:", error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      return { success: false, message: error.message || 'Failed to send OTP via Firebase.' };
    } finally {
      isLoading.value = false;
    }
  };

  const verifyOtpAndLoginWithFirebase = async (otpCode) => {
    isLoading.value = true;
    if (!confirmationResult) {
      isLoading.value = false;
      return { success: false, message: 'OTP flow not initiated. Please go back and try again.' };
    }
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const firebaseIdToken = await userCredential.user.getIdToken();

      const response = await fetch(`${baseURL}/api/v1/verify-firebase-id-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: firebaseIdToken }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        token.value = data.token;
        user.value = data.user || { username: data.username };
        isAuthenticated.value = true;
        localStorage.setItem('auth_token', data.token);
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
        currentPhoneNumber.value = null; // Bersihkan nomor telepon dari store setelah berhasil login
        return { success: true, message: data.message || 'Login successful via OTP.' };
      } else {
        return { success: false, message: data.message || 'Backend verification failed.' };
      }
    } catch (error) {
      console.error("Error verifying OTP or Firebase ID Token:", error);
      if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
      }
      return { success: false, message: error.message || 'OTP verification failed.' };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => { /* ... (kode register Anda tetap sama) ... */
    isLoading.value = true;
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

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    currentPhoneNumber.value = null; // Bersihkan juga nomor telepon saat logout
    localStorage.removeItem('auth_token');
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      token.value = storedToken;
      isAuthenticated.value = true;
    } else {
      isAuthenticated.value = false;
    }
  };

  return {
    user,
    token,
    currentPhoneNumber, // Sertakan ini agar bisa diakses dari komponen
    isAuthenticated,
    isLoading,
    login,
    sendOtpFirebase,
    verifyOtpAndLoginWithFirebase,
    register,
    logout,
    checkAuth,
  };
});