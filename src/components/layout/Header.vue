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
      <button class="btn btn-primary btn-header-action" id="btn-login-modal" v-if="!authStore.user" @click="authStore.showLoginModal = true" title="Masuk ke aplikasi">
        <i class="fa-solid fa-right-to-bracket"></i>
        <span>Masuk</span>
      </button>

      <template v-if="authStore.user && (route.name === 'pegawai' || route.name === 'perpanjangan')">
        <button v-if="route.name === 'pegawai'" class="btn btn-primary btn-header-action" id="btn-import-trigger" @click="pegawaiStore.showImportModal = true" title="Impor data profil dari berkas Excel/CSV">
          <i class="fa-solid fa-file-import"></i>
          <span>Impor Data</span>
        </button>
        <button class="btn btn-outline btn-header-action" id="btn-import-nomor-kontrak" @click="pegawaiStore.showImportNomorKontrakModal = true" title="Impor nomor kontrak secara massal via Excel">
          <i class="fa-solid fa-file-contract"></i>
          <span>Impor No. Kontrak</span>
        </button>
        <button v-if="route.name === 'pegawai'" class="btn btn-outline btn-header-action" id="btn-export" @click="handleExport" title="Ekspor seluruh data ke format Excel">
          <i class="fa-solid fa-file-export"></i>
          <span>Ekspor</span>
        </button>
        <div v-if="route.name === 'pegawai'" class="header-action-divider"></div>
        <button v-if="route.name === 'pegawai'" class="btn btn-outline btn-header-action btn-header-danger" id="btn-clear-all" @click="handleClearAll" title="Hapus seluruh data pegawai">
          <i class="fa-solid fa-trash-can"></i>
          <span>Hapus Semua</span>
        </button>
      </template>
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

<style scoped>
.btn-header-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.header-action-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 4px;
}

.btn-header-danger {
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
}

.btn-header-danger:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
}

@media (max-width: 768px) {
  .btn-header-action span {
    display: none;
  }
  .btn-header-action {
    padding: 8px 11px;
  }
}
</style>
