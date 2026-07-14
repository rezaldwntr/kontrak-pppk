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

      <button class="btn btn-primary" id="btn-import-trigger" v-if="authStore.user && route.name === 'pegawai'" @click="pegawaiStore.showImportModal = true">
        <i class="fa-solid fa-file-import"></i> Impor Data
      </button>
      <button class="btn btn-secondary" id="btn-export" v-if="authStore.user && route.name === 'pegawai'" @click="handleExport">
        <i class="fa-solid fa-file-export"></i> Ekspor CSV
      </button>
      <button class="btn btn-danger" id="btn-clear-all" v-if="authStore.user && route.name === 'pegawai'" style="background-color: var(--danger-color); color: #ffffff;" @click="handleClearAll">
        <i class="fa-solid fa-trash-can"></i> Hapus Semua
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { usePegawaiStore } from '../../stores/pegawaiStore'
import { exportToExcel } from '../../utils/exportImport'

const route = useRoute()
const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()

const handleExport = () => {
  try {
    exportToExcel(pegawaiStore.pppkData)
  } catch(e) {
    alert(e.message)
  }
}

const handleClearAll = async () => {
  if (confirm('Apakah Anda yakin ingin menghapus SEMUA data pegawai? Tindakan ini tidak dapat dibatalkan.')) {
    try {
      await pegawaiStore.deleteAllPegawai()
      alert('Semua data berhasil dihapus.')
    } catch(e) {
      alert('Gagal menghapus data: ' + e.message)
    }
  }
}
</script>
