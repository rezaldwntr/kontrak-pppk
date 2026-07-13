import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true, title: 'Login Administrator' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: false, title: 'Dashboard Analisis', subtitle: 'Ringkasan status perpanjangan kontrak kerja PPPK' }
  },
  {
    path: '/data-pegawai',
    name: 'pegawai',
    component: () => import('../views/PegawaiView.vue'),
    meta: { requiresAuth: true, title: 'Data Pegawai PPPK', subtitle: 'Manajemen profil lengkap kepegawaian, filter data, dan status keaktifan' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Ensure we know auth state before routing
  if (!authStore.isAuthReady) {
    await authStore.initAuth()
  }

  const isAuthenticated = !!authStore.user

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
