import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import DummyPageView from '../views/DummyPageView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
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
    path: '/perpanjangan',
    name: 'perpanjangan',
    component: () => import('../views/PerpanjanganView.vue'),
    meta: { requiresAuth: true, title: 'Proses Perpanjangan Kontrak PPPK', subtitle: 'Manajemen masa kontrak dan BUP' }
  },
  {
    path: '/riwayat',
    name: 'riwayat',
    component: () => import('../views/RiwayatView.vue'),
    meta: { requiresAuth: true, title: 'Riwayat Perpanjangan', subtitle: 'Catatan arsip kontrak sebelumnya' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true, title: 'Pengaturan Sistem', subtitle: 'Konfigurasi akun dan preferensi aplikasi' }
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
    authStore.showLoginModal = true
    next({ path: '/', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
