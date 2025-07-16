import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false); // Global loading state for the store
  const baseURL = process.env.VUE_APP_SERVICE_API;
  const router = useRouter();

  // Login function
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

        // Check if MFA (OTP) is required
        if (data.mfaRequired) {
          router.push('/otp'); // Redirect to OTP page if MFA is required
        } else {
          router.push('/dashboard'); // If no MFA, proceed directly to dashboard
        }

        return {
          success: true,
          message: data.message || 'Login successful.', // Changed
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed.', // Changed
          data: data,
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
      isLoading.value = false;
    }
  };

  // Register function
  const register = async (userData) => {
    isLoading.value = true;
    try {
      const response = await fetch(`${baseURL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: userData.fullName, // Using full_name as requested previously
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
      isLoading.value = false;
    }
  };

  // OTP verification function
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
        isAuthenticated.value = true; // Assuming authenticated after OTP is verified
        return {
          success: true,
          message: data.message || 'OTP verification successful!', // Changed
        };
      } else {
        return {
          success: false,
          message: data.message || 'OTP verification failed.', // Changed
        };
      }
    } catch (error) {
      console.error('OTP Verification error:', error);
      return {
        success: false,
        message: 'An error occurred during OTP verification.', // Changed
        error: error.message,
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Function to request OTP resend
  const resendOtp = async () => {
    isLoading.value = true; // Using global store isLoading
    try {
      const response = await fetch(`${baseURL}/api/v1/resend-otp`, { // Ensure this URL is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If backend requires a token or user data for resend, add it here.
          // Example: 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          // body: JSON.stringify({ username: user.value?.username || '' }), // Send username if available
        },
        // If backend does not require a body for resend, it can be empty
        body: JSON.stringify({ /* data required by backend for resend */ })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'New OTP successfully resent!', // Changed
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to resend OTP.', // Changed
        };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        message: 'A network error occurred while trying to resend the OTP.', // Changed
        error: error.message,
      };
    } finally {
      isLoading.value = false; // Set back to false after completion
    }
  };


  // Logout function
  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('auth_token');
    router.push('/login');  // Redirect to login page after logout
  };

  // Function to check authentication status
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