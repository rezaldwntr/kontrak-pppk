<template>
  <header class="main-header">
    <div class="header-title" style="display: flex; align-items: center; gap: 15px;">
      <button class="btn btn-icon-only mobile-menu-toggle" id="btn-mobile-menu" style="display: none;">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div>
        <h1 id="page-title">{{ route.meta.title || 'E-Kontrak PPPK' }}</h1>
        <p id="page-subtitle" class="text-muted">{{ route.meta.subtitle || '' }}</p>
      </div>
    </div>
    
    <div class="header-actions">
      <div class="search-box" v-if="authStore.user && route.name === 'pegawai'">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="global-search" placeholder="Cari Nama atau NIP PPPK..." v-model="pegawaiStore.globalSearchQuery" autocomplete="off" spellcheck="false">
      </div>
      <router-link to="/login" class="btn btn-primary" id="btn-login-modal" v-if="!authStore.user && route.name !== 'login'">
        <i class="fa-solid fa-right-to-bracket"></i> Login
      </router-link>

      <button class="btn btn-primary" id="btn-import-trigger" v-if="authStore.user && route.name === 'pegawai'">
        <i class="fa-solid fa-file-import"></i> Impor Data
      </button>
      <button class="btn btn-secondary" id="btn-export" v-if="authStore.user && route.name === 'pegawai'" @click="handleExport">
        <i class="fa-solid fa-file-export"></i> Ekspor CSV
      </button>
      <button class="btn btn-danger" id="btn-clear-all" v-if="authStore.user && route.name === 'pegawai'" style="background-color: var(--danger-color); color: #ffffff;">
        <i class="fa-solid fa-trash-can"></i> Hapus Semua
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore'
import { usePegawaiStore } from '../../stores/pegawaiStore'
import { useRoute } from 'vue-router'
import { exportToExcel } from '../../utils/excel'

const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()
const route = useRoute()

const handleExport = () => {
  exportToExcel(pegawaiStore.pppkData)
}
</script>
