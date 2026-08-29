<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <i class="fa-solid fa-file-signature"></i>
      </div>
      <div class="brand-name">
        <h3>E-Kontrak</h3>
        <span>PPPK Manager</span>
      </div>
    </div>
    
    <button class="btn-collapse" @click="$emit('toggle-collapse')" title="Toggle Sidebar">
      <i class="fa-solid" :class="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
    </button>
    
    <nav class="sidebar-menu">
      <router-link to="/" class="menu-item" active-class="active" title="Dashboard">
        <i class="fa-solid fa-chart-pie"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/data-pegawai" class="menu-item" active-class="active" v-if="authStore.user" title="Data PPPK">
        <i class="fa-solid fa-users"></i>
        <span>Data PPPK</span>
      </router-link>
      <router-link to="/perpanjangan" class="menu-item" active-class="active" v-if="authStore.user" title="Perpanjangan Kontrak">
        <i class="fa-solid fa-file-signature"></i>
        <span>Perpanjangan Kontrak</span>
      </router-link>
      <router-link to="/riwayat" class="menu-item" active-class="active" v-if="authStore.user" title="Riwayat Perpanjangan">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>Riwayat Perpanjangan</span>
      </router-link>
      <router-link to="/settings" class="menu-item" active-class="active" v-if="authStore.user" title="Pengaturan">
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
      <button class="btn btn-secondary btn-logout" style="width: 100%; justify-content: center; margin-top: 15px;" v-if="authStore.user" @click="handleLogout" title="Logout">
        <i class="fa-solid fa-right-from-bracket"></i> <span class="logout-text">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const props = defineProps({ collapsed: Boolean })
const emit = defineEmits(['toggle-collapse'])

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
/* Collapse button styles */
.btn-collapse {
  position: absolute;
  right: -12px;
  top: 45px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  transform: scale(1);
}
.btn-collapse:hover {
  background: var(--primary-hover);
  transform: scale(1.1);
}
@media (max-width: 768px) {
  .btn-collapse {
    display: none !important;
  }
}

/* Collapsed state adjustments */
.sidebar {
  transition: all 0.3s ease;
}
.sidebar.collapsed {
  padding: 30px 10px;
}
.sidebar.collapsed .brand-name,
.sidebar.collapsed .menu-item span,
.sidebar.collapsed .user-info,
.sidebar.collapsed .logout-text,
.sidebar.collapsed .fa-sun,
.sidebar.collapsed .fa-moon {
  display: none;
}
.sidebar.collapsed .sidebar-brand {
  justify-content: center;
}
.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 14px 0;
}
.sidebar.collapsed .menu-item i {
  font-size: 1.2rem;
  margin: 0;
}
.sidebar.collapsed .theme-switch-wrapper {
  justify-content: center;
  padding: 10px 0;
}
.sidebar.collapsed .user-profile-summary {
  justify-content: center;
  padding: 10px 0;
}
.sidebar.collapsed .avatar {
  margin: 0;
}
.sidebar.collapsed .btn-logout {
  padding-left: 0;
  padding-right: 0;
}
</style>
