<template>
  <div class="app-container" :class="{ 'collapsed-sidebar': isSidebarCollapsed }">
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="isMobileMenuOpen = false"></div>
    <Sidebar :collapsed="isSidebarCollapsed" :mobileOpen="isMobileMenuOpen" @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed" @close-mobile="isMobileMenuOpen = false" />
    
    <div class="main-content">
      <Header @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen" />
      <router-view />
    </div>

    <LoginModal />
    <ImportNomorKontrakModal
      v-if="pegawaiStore.showImportNomorKontrakModal"
      :show="pegawaiStore.showImportNomorKontrakModal"
      @close="pegawaiStore.showImportNomorKontrakModal = false"
      @saved="pegawaiStore.showImportNomorKontrakModal = false"
    />

    <!-- Global Floating Sync Widget -->
    <transition name="fade">
      <div v-if="driveStore.isSyncingAll" class="global-sync-floating-card">
        <div class="sync-floating-header">
          <div class="sync-floating-title">
            <i class="fa-solid fa-rotate fa-spin sync-spinner-icon"></i>
            <span>Sync Google Drive</span>
          </div>
          <button
            class="sync-btn-cancel-pill"
            @click="driveStore.requestCancelSync()"
            title="Jeda / Hentikan Sinkronisasi"
          >
            <i class="fa-solid fa-pause"></i> Jeda
          </button>
        </div>

        <div class="sync-floating-body">
          <div class="sync-floating-name text-truncate" :title="driveStore.syncCurrentItemName">
            {{ driveStore.syncCurrentItemName || 'Memproses berkas...' }}
          </div>
          <div class="sync-floating-progress-bar">
            <div
              class="sync-floating-progress-fill"
              :style="{ width: `${driveStore.syncProgressPercent}%` }"
            ></div>
          </div>
          <div class="sync-floating-meta">
            <span>{{ driveStore.syncProgressText }} Pegawai ({{ driveStore.syncProgressPercent }}%)</span>
            <span class="sync-meta-counts">
              <span class="sync-badge-ok">✓ {{ driveStore.syncDoneCount }}</span>
              <span v-if="driveStore.syncFailCount > 0" class="sync-badge-err">✕ {{ driveStore.syncFailCount }}</span>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { usePegawaiStore } from './stores/pegawaiStore'
import { useDriveStore } from './stores/driveStore'
import { useDriveSync } from './composables/useDriveSync'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import LoginModal from './components/auth/LoginModal.vue'
import ImportNomorKontrakModal from './components/pegawai/ImportNomorKontrakModal.vue'
import { customSwal } from './utils/swal'

const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()
const driveStore = useDriveStore()
const { resumeBulkSync } = useDriveSync()
const route = useRoute()
const router = useRouter()
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

const isAuthenticated = computed(() => !!authStore.user)

// --- Absolute Idle Timeout Logic (Cross-tab & App Close aware) ---
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 menit
let checkInterval = null;

const checkIdleStatus = () => {
  if (!authStore.user) return;
  
  const lastActivityStr = localStorage.getItem('lastActivity');
  if (lastActivityStr) {
    const lastActivity = parseInt(lastActivityStr, 10);
    const now = Date.now();
    
    // Jika waktu sekarang melebihi 30 menit sejak aktivitas terakhir
    if (now - lastActivity > IDLE_TIMEOUT_MS) {
      authStore.logout();
      localStorage.removeItem('lastActivity');
      
      // Cek apakah di hari yang sama
      const lastDate = new Date(lastActivity).toDateString();
      const nowDate = new Date(now).toDateString();
      
      if (lastDate === nowDate) {
        customSwal.fire({
          icon: 'info',
          title: 'Sesi Berakhir',
          text: 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit. Silakan login kembali.',
          confirmButtonText: 'OK'
        }).then(() => {
          if (route.meta.requiresAuth) {
            router.push('/')
            authStore.showLoginModal = true
          }
        });
      } else {
        if (route.meta.requiresAuth) {
          router.push('/')
        }
      }
    }
  }
};

// Throttle update localStorage to avoid hitting storage API too often on every mousemove
let throttleTimer = null;
const handleUserActivity = () => {
  if (authStore.user) {
    if (!throttleTimer) {
      localStorage.setItem('lastActivity', Date.now().toString());
      throttleTimer = setTimeout(() => { throttleTimer = null; }, 1000); // 1 second throttle
    }
  }
};

watch(() => authStore.user, (user) => {
  if (user) {
    // Saat user login (atau auto-login via firebase), cek apakah sudah expired di localStorage
    checkIdleStatus();
    
    // Jika ternyata belum expired (atau login baru), inisiasi lastActivity dan mulai interval
    if (authStore.user) {
      if (!localStorage.getItem('lastActivity')) {
         localStorage.setItem('lastActivity', Date.now().toString());
      }
      if (checkInterval) clearInterval(checkInterval);
      checkInterval = setInterval(checkIdleStatus, 10000); // Cek tiap 10 detik
    }
  } else {
    if (checkInterval) clearInterval(checkInterval);
    localStorage.removeItem('lastActivity');
  }
});

// Peringatan sebelum tab/browser ditutup saat sinkronisasi masih berlangsung
const handleBeforeUnload = (e) => {
  if (driveStore.isSyncingAll) {
    e.preventDefault()
    e.returnValue = 'Sinkronisasi Google Drive sedang berjalan di latar belakang. Yakin ingin meninggalkan halaman ini?'
    return e.returnValue
  }
}

// Deteksi sesi sinkronisasi yang belum selesai (misal tab tertutup atau restart)
const checkAndResumeSync = async () => {
  const saved = driveStore.getSavedSession()
  if (!saved || !Array.isArray(saved.remainingIds) || saved.remainingIds.length === 0) return
  if (driveStore.isSyncingAll) return

  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
    const startTime = Date.now()
    while (pegawaiStore.isLoading && Date.now() - startTime < 8000) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  if (pegawaiStore.pppkData.length > 0) {
    await driveStore.loadSettings()
    if (driveStore.isConnected && driveStore.settings.folderId) {
      customSwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `Melanjutkan sync Google Drive (${saved.remainingIds.length} sisa pegawai)...`,
        showConfirmButton: false,
        timer: 3500,
      })
      resumeBulkSync(pegawaiStore.pppkData)
    }
  }
}

// Initialize theme from local storage or default to dark
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.body.setAttribute('data-theme', savedTheme)
  
  // Attach activity listeners for auto-logout
  window.addEventListener('mousemove', handleUserActivity);
  window.addEventListener('keydown', handleUserActivity);
  window.addEventListener('click', handleUserActivity);
  window.addEventListener('scroll', handleUserActivity);

  // Tab unload guard & auto-resume sync
  window.addEventListener('beforeunload', handleBeforeUnload);
  checkAndResumeSync();
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleUserActivity);
  window.removeEventListener('keydown', handleUserActivity);
  window.removeEventListener('click', handleUserActivity);
  window.removeEventListener('scroll', handleUserActivity);
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (checkInterval) clearInterval(checkInterval);
})
</script>

<style>
/* We are using the legacy styles.css globally via main.js, 
   but specific app-level tweaks can go here */
#app-container {
  display: flex;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-light);
}
.main-content.auth-mode {
  justify-content: center;
  align-items: center;
}
</style>

<style>
.mobile-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9998;
}

/* Global Floating Sync Card */
.global-sync-floating-card {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 330px;
  max-width: calc(100vw - 32px);
  background: var(--bg-card, #1e293b);
  border: 1px solid var(--border-color, rgba(255,255,255,0.12));
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  padding: 14px 16px;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: slideUpSync 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpSync {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sync-floating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sync-floating-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-primary, #f8fafc);
}

.sync-spinner-icon {
  color: #3b82f6;
  font-size: 0.95rem;
}

.sync-btn-cancel-pill {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.sync-btn-cancel-pill:hover {
  background: #ef4444;
  color: white;
}

.sync-floating-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sync-floating-name {
  font-size: 0.82rem;
  color: var(--text-primary, #cbd5e1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sync-floating-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(125, 125, 125, 0.2);
  border-radius: 999px;
  overflow: hidden;
}

.sync-floating-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.sync-floating-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.76rem;
  color: var(--text-secondary, #94a3b8);
}

.sync-meta-counts {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sync-badge-ok {
  color: #10b981;
  font-weight: 600;
}

.sync-badge-err {
  color: #ef4444;
  font-weight: 600;
}
</style>
