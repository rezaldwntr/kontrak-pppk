<template>
  <header class="main-header">
    <div class="header-title" style="display: flex; align-items: center; gap: 15px;">
      <button class="btn btn-icon-only mobile-menu-toggle" id="btn-mobile-menu" style="display: none;" @click="$emit('toggle-mobile-menu')">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div>
        <h1 id="page-title">{{ route.meta.title || 'E-Kontrak PPPK' }}</h1>
        <p id="page-subtitle" class="text-muted">{{ route.meta.subtitle || '' }}</p>
      </div>
    </div>
    
    <div class="header-actions">

      <button class="btn btn-primary btn-icon-only" id="btn-login-modal" v-if="!authStore.user" @click="authStore.showLoginModal = true" title="Login">
        <i class="fa-solid fa-right-to-bracket"></i>
      </button>

      <button class="btn btn-primary btn-icon-only" id="btn-import-trigger" v-if="authStore.user && route.name === 'pegawai'" @click="pegawaiStore.showImportModal = true" title="Impor Data">
        <i class="fa-solid fa-file-import"></i>
      </button>
      <button class="btn btn-secondary btn-icon-only" id="btn-export" v-if="authStore.user && route.name === 'pegawai'" @click="handleExport" title="Ekspor CSV">
        <i class="fa-solid fa-file-export"></i>
      </button>
      <button class="btn btn-danger btn-icon-only" id="btn-clear-all" v-if="authStore.user && route.name === 'pegawai'" style="background-color: var(--danger-color); color: #ffffff;" @click="handleClearAll" title="Hapus Semua">
        <i class="fa-solid fa-trash-can"></i>
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
import { customSwal } from '../../utils/swal'

const emit = defineEmits(['toggle-mobile-menu'])
const route = useRoute()
const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()

const handleExport = () => {
  try {
    exportToExcel(pegawaiStore.pppkData)
  } catch(e) {
    customSwal.fire({
      icon: 'error',
      title: 'Gagal',
      text: e.message
    })
  }
}

const handleClearAll = async () => {
  const result = await customSwal.fire({
    title: 'Hapus Semua Data?',
    text: 'Apakah Anda yakin ingin menghapus SEMUA data pegawai? Tindakan ini tidak dapat dibatalkan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-trash"></i> Ya, Hapus Semua',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444'
  })
  
  if (result.isConfirmed) {
    try {
      await pegawaiStore.deleteAllPegawai()
      customSwal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Semua data berhasil dihapus.'
      })
    } catch(e) {
      customSwal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menghapus data: ' + e.message
      })
    }
  }
}
</script>
