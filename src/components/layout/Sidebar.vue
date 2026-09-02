<template>
  <aside class="sidebar" :class="{ collapsed: collapsed, open: mobileOpen }">
    <div class="sidebar-brand" :class="{ 'clickable-brand': collapsed }" @click="collapsed ? $emit('toggle-collapse') : null">
      <div class="brand-icon">
        <i class="fa-solid fa-file-signature original-icon"></i>
        <i class="fa-solid fa-chevron-right hover-icon" style="display: none;"></i>
      </div>
      <div class="brand-name">
        <h3>E-Kontrak</h3>
        <span>PPPK Manager</span>
      </div>
      <button v-if="!collapsed" class="btn-collapse-inline" @click.stop="$emit('toggle-collapse')" title="Kecilkan Sidebar">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    </div>
    
    <nav class="sidebar-menu" @click="$emit('close-mobile')">
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
      <button class="btn btn-secondary btn-logout btn-icon-only" style="margin-top: 15px;" v-if="authStore.user" @click="handleLogout" title="Logout">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const props = defineProps({ collapsed: Boolean, mobileOpen: Boolean })
const emit = defineEmits(['toggle-collapse', 'close-mobile'])

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
/* Inline collapse button (expanded state) */
.btn-collapse-inline {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  margin-left: auto;
  font-size: 1.1rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-collapse-inline:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}
@media (max-width: 768px) {
  .btn-collapse-inline {
    display: none !important;
  }
}

/* Collapsed brand hover behavior */
.sidebar-brand.clickable-brand {
  cursor: pointer;
  transition: all 0.2s;
}
.sidebar-brand.clickable-brand:hover .brand-icon {
  background: var(--primary-color);
  transform: scale(1.05);
}
.sidebar-brand.clickable-brand:hover .original-icon {
  display: none !important;
}
.sidebar-brand.clickable-brand:hover .hover-icon {
  display: block !important;
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
