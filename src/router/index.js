import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/views/Login/LoginPage.vue';
import RegisterPage from '@/views/Register/index.vue';
import OtpPage from '@/views/Verifikasioke/OtpVerification.vue';
import Dashboard from '@/views/Dashboard/index.vue';
import ForgotPassword from '@/views/ForgotPassword/index.vue';

const routes = [
  { 
    path: '/', 
    name: 'login', 
    component: LoginPage,
    meta: { title: 'Login' } // <--- Tambahkan meta title
  },
  { 
    path: '/login', 
    name: 'login-page', 
    component: LoginPage,
    meta: { title: 'Login' } // <--- Tambahkan meta title
  },
  { 
    path: '/register', 
    name: 'register', 
    component: RegisterPage,
    meta: { title: 'Sign up' } // <--- Tambahkan meta title
  },
  {
    path: '/otp', 
    name: 'OTP',
    component: OtpPage,
    meta: { 
      requiresPhoneAuthInitiation: true,
      title: 'OTP Verification' // <--- Tambahkan meta title
    }
  },
  { 
    path: '/dashboard', 
    name: 'dashboard', 
    component: Dashboard,
    meta: { title: 'Dashboard' } // <--- Tambahkan meta title
  },
  { 
    path: '/forgot-password', 
    name: 'forgot-password', 
    component: ForgotPassword,
    meta: { title: 'Lupa Password' } // <--- Tambahkan meta title
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Tambahkan Navigation Guard di sini
const DEFAULT_TITLE = 'Aplikasi Saya'; // Judul default untuk route yang tidak ada title

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || DEFAULT_TITLE;
  next();
});

export default router;