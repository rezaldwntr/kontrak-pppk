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
      <router-link to="/data-pegawai" class="menu-item" active-class="active" v-if="authStore.user">
        <i class="fa-solid fa-users"></i>
        <span>Data PPPK</span>
      </router-link>
      <a href="#" class="menu-item" v-if="authStore.user">
        <i class="fa-solid fa-file-signature"></i>
        <span>Perpanjangan Kontrak</span>
      </a>
      <a href="#" class="menu-item" v-if="authStore.user">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>Riwayat Perpanjangan</span>
      </a>
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
      <button class="logout-btn" v-if="authStore.user" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isDarkTheme = ref(true)

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
</style>
