import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/views/Login/LoginPage.vue';
import RegisterPage from '@/views/Register/index.vue';
import OtpPage from '@/views/Verifikasioke/OtpVerification.vue';
import Dashboard from '@/views/Dashboard/index.vue';


const routes = [
  { 
    path: '/', 
    name: 'login', 
    component: LoginPage,
    meta: { title: 'Login' } 
  },
  { 
    path: '/login', 
    name: 'login-page', 
    component: LoginPage,
    meta: { title: 'Login' } 
  },
  { 
    path: '/register', 
    name: 'register', 
    component: RegisterPage,
    meta: { title: 'Sign up' } 
  },
  {
    path: '/otp', 
    name: 'OTP',
    component: OtpPage,
    meta: { 
      requiresPhoneAuthInitiation: true,
      title: 'OTP Verification' // 
    }
  },
  { 
    path: '/dashboard', 
    name: 'dashboard', 
    component: Dashboard,
    meta: { title: 'Dashboard' } 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


const DEFAULT_TITLE = '3 A.M'; 

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || DEFAULT_TITLE;
  next();
});

export default router;