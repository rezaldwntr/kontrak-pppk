<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <i class="fa-solid fa-file-signature"></i>
      </div>
      <div class="brand-name">
        <h3>E-Kontrak</h3>
        <span>PPPK Manager</span>
      </div>
    </div>
    
    <nav class="sidebar-menu">
      <router-link to="/" class="menu-item" active-class="active">
        <i class="fa-solid fa-chart-pie"></i>
        <span>Dashboard</span>
      </router-link>

      <!-- Data PPPK Accordion -->
      <div v-if="authStore.user" class="menu-group">
        <div
          class="menu-item menu-group-header"
          :class="{ active: isPegawaiRoute }"
          @click="togglePegawaiMenu"
        >
          <i class="fa-solid fa-users"></i>
          <span>Data PPPK</span>
          <i class="fa-solid chevron-icon" :class="pegawaiMenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'" style="margin-left: auto; font-size: 0.75rem; opacity: 0.7;"></i>
        </div>
        <div v-if="pegawaiMenuOpen" class="sub-menu">
          <router-link to="/data-pegawai/aktif" class="menu-item sub-menu-item" active-class="active">
            <i class="fa-solid fa-users"></i>
            <span>PPPK Aktif</span>
          </router-link>
          <router-link to="/data-pegawai/akan-pensiun" class="menu-item sub-menu-item" active-class="active">
            <i class="fa-solid fa-hourglass-half"></i>
            <span>Akan Pensiun (BUP)</span>
          </router-link>
          <router-link to="/data-pegawai/sudah-pensiun" class="menu-item sub-menu-item" active-class="active">
            <i class="fa-solid fa-medal"></i>
            <span>Sudah Pensiun</span>
          </router-link>
          <router-link to="/data-pegawai/tidak-diperpanjang" class="menu-item sub-menu-item" active-class="active">
            <i class="fa-solid fa-user-xmark"></i>
            <span>Tidak Diperpanjang</span>
          </router-link>
        </div>
      </div>

      <router-link to="/perpanjangan" class="menu-item" active-class="active" v-if="authStore.user">
        <i class="fa-solid fa-file-signature"></i>
        <span>Perpanjangan Kontrak</span>
      </router-link>
      <router-link to="/riwayat" class="menu-item" active-class="active" v-if="authStore.user">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>Riwayat Perpanjangan</span>
      </router-link>
      <router-link to="/settings" class="menu-item" active-class="active" v-if="authStore.user">
        <i class="fa-solid fa-gear"></i>
        <span>Pengaturan</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <div class="theme-switch-wrapper">
        <i class="fa-solid fa-sun"></i>
        <label class="theme-switch" for="checkbox">
          <input type="checkbox" id="checkbox" @change="toggleTheme" :checked="isDarkTheme" />
          <div class="slider round"></div>
        </label>
        <i class="fa-solid fa-moon"></i>
      </div>
      <div class="user-profile-summary" v-if="authStore.user">
        <div class="avatar">ADM</div>
        <div class="user-info">
          <h4>Administrator</h4>
          <p>Kepegawaian</p>
        </div>
      </div>
      <button class="btn btn-secondary" style="width: 100%; justify-content: center; margin-top: 15px;" v-if="authStore.user" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isDarkTheme = ref(true)

// Accordion state
const pegawaiMenuOpen = ref(false)
const isPegawaiRoute = computed(() => route.path.startsWith('/data-pegawai'))

// Auto-expand saat berada di rute data-pegawai
watch(isPegawaiRoute, (val) => {
  if (val) pegawaiMenuOpen.value = true
}, { immediate: true })

const togglePegawaiMenu = () => {
  pegawaiMenuOpen.value = !pegawaiMenuOpen.value
  if (pegawaiMenuOpen.value) {
    // Navigasi ke sub-rute default jika baru dibuka
    if (!isPegawaiRoute.value) {
      router.push('/data-pegawai/aktif')
    }
  }
}

onMounted(() => {
  isDarkTheme.value = document.body.getAttribute('data-theme') !== 'light'
})

const toggleTheme = (e) => {
  const theme = e.target.checked ? 'dark' : 'light'
  isDarkTheme.value = e.target.checked
  document.body.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
/* Inherits from styles.css */
.menu-group-header {
  cursor: pointer;
  user-select: none;
}
.sub-menu {
  padding-left: 12px;
  border-left: 2px solid var(--border-color);
  margin-left: 16px;
  margin-bottom: 4px;
}
.sub-menu-item {
  font-size: 0.88rem;
  padding: 7px 12px;
  opacity: 0.85;
}
.sub-menu-item.active {
  opacity: 1;
}
</style>
