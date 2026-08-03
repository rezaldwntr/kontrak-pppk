<template>
  <div class="app-container">
    <Sidebar />
    
    <div class="main-content">
      <Header />
      <router-view />
    </div>

    <LoginModal />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import LoginModal from './components/auth/LoginModal.vue'

const authStore = useAuthStore()
const route = useRoute()

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
      alert("Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit. Silakan login kembali.");
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

// Initialize theme from local storage or default to dark
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.body.setAttribute('data-theme', savedTheme)
  
  // Attach activity listeners for auto-logout
  window.addEventListener('mousemove', handleUserActivity);
  window.addEventListener('keydown', handleUserActivity);
  window.addEventListener('click', handleUserActivity);
  window.addEventListener('scroll', handleUserActivity);
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleUserActivity);
  window.removeEventListener('keydown', handleUserActivity);
  window.removeEventListener('click', handleUserActivity);
  window.removeEventListener('scroll', handleUserActivity);
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
