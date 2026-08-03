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

// --- Idle Timeout Logic ---
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 menit
let idleTimer = null;

const resetIdleTimer = () => {
  if (idleTimer) clearTimeout(idleTimer);
  if (authStore.user) {
    idleTimer = setTimeout(() => {
      authStore.logout();
      alert("Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit. Silakan login kembali.");
    }, IDLE_TIMEOUT_MS);
  }
};

const handleUserActivity = () => {
  if (authStore.user) {
    resetIdleTimer();
  }
};

watch(() => authStore.user, (user) => {
  if (user) {
    resetIdleTimer();
  } else {
    if (idleTimer) clearTimeout(idleTimer);
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
  if (idleTimer) clearTimeout(idleTimer);
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
