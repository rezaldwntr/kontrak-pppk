<template>
  <div class="riwayat-view-wrapper">
    <!-- Filter Card Toolbar -->
    <div class="filter-panel-card">
      <div class="filter-tier-main">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama atau NIP pegawai..."
            class="form-control table-search-input"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="btn-clear-search"
            @click="searchQuery = ''"
            title="Bersihkan pencarian"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="filter-tmt-select-wrap">
          <i class="fa-solid fa-calendar-check select-icon"></i>
          <select v-model="filterTmtBaru" class="form-control filter-select">
            <option value="all">Semua TMT Baru</option>
            <option v-for="tmt in uniqueTmtBaru" :key="tmt" :value="tmt">{{ formatIndoDate(tmt) }}</option>
          </select>
        </div>

        <div class="filter-tier-actions">
          <span class="total-records-pill">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span><strong>{{ filteredHistory.length }}</strong> Riwayat</span>
          </span>
          <button
            class="btn btn-success btn-sm btn-action-labeled"
            @click="exportHistory"
            :disabled="filteredHistory.length === 0"
            title="Ekspor Seluruh Riwayat ke Excel"
          >
            <i class="fa-solid fa-file-excel"></i>
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="selectedIds.length > 0" class="batch-action-bar-danger">
      <div class="batch-selected-info">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span><strong>{{ selectedIds.length }}</strong> riwayat perpanjangan terpilih</span>
      </div>
      <div>
        <button class="btn btn-danger btn-sm btn-batch" @click="confirmBatchCancel" title="Batalkan perpanjangan terpilih">
          <i class="fa-solid fa-rotate-left"></i>
          <span>Batalkan Terpilih ({{ selectedIds.length }})</span>
        </button>
      </div>
    </div>

    <!-- Modern Table Container -->
    <div class="table-container-card">
      <div class="table-responsive">
        <table class="table modern-data-table">
          <thead>
            <tr>
              <th width="44" style="text-align: center;" v-if="authStore?.user">
                <input type="checkbox" v-model="selectAll" class="custom-checkbox" title="Pilih Semua">
              </th>
              <th>TANGGAL DIPERPANJANG</th>
              <th>NAMA PEGAWAI</th>
              <th>NIP BARU</th>
              <th>TMT LAMA</th>
              <th>TMT BARU</th>
              <th width="100" style="text-align: center;" v-if="authStore?.user">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pegawaiStore.isLoading">
              <td :colspan="authStore?.user ? 7 : 6" class="text-center table-loading-cell">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Memuat riwayat perpanjangan...</span>
              </td>
            </tr>
            <tr v-else-if="paginatedHistory.length === 0">
              <td :colspan="authStore?.user ? 7 : 6" class="text-center table-empty-cell">
                <i class="fa-solid fa-clock-rotate-left text-muted" style="font-size: 1.5rem; display: block; margin-bottom: 6px;"></i>
                <span>Belum ada riwayat perpanjangan kontrak.</span>
              </td>
            </tr>
            <tr
              v-else
              v-for="history in paginatedHistory"
              :key="history.nip + history.tglDiperpanjang"
              :class="{ 'row-selected': selectedIds.includes(history.nip) }"
            >
              <td style="text-align: center;" v-if="authStore?.user">
                <input type="checkbox" :value="history" v-model="selectedItems" class="custom-checkbox">
              </td>
              <td class="cell-timestamp">
                <i class="fa-regular fa-clock text-muted" style="margin-right: 6px; font-size: 0.8rem;"></i>
                {{ formatDate(history.tglDiperpanjang) }}
              </td>
              <td class="cell-nama"><strong>{{ history.nama }}</strong></td>
              <td class="cell-nip">{{ history.nip }}</td>
              <td class="cell-date text-muted">{{ history.kontrakLama ? formatIndoDate(history.kontrakLama) : '-' }}</td>
              <td class="cell-date">
                <span class="badge-tmt-baru">
                  <i class="fa-solid fa-arrow-right-long" style="margin-right: 4px; font-size: 0.75rem;"></i>
                  {{ history.tmtBaru ? formatIndoDate(history.tmtBaru) : '-' }}
                </span>
              </td>
              <td style="text-align: center;" v-if="authStore?.user">
                <div class="table-actions-group">
                  <button
                    class="btn btn-outline-danger btn-sm btn-table-icon"
                    @click="confirmSingleCancel(history)"
                    title="Batalkan Perpanjangan Ini"
                  >
                    <i class="fa-solid fa-rotate-left"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modern Pagination Bar -->
      <div class="pagination-bar-modern">
        <div class="pagination-count-info">
          Menampilkan <strong>{{ filteredHistory.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</strong> - <strong>{{ Math.min(currentPage * itemsPerPage, filteredHistory.length) }}</strong> dari <strong>{{ filteredHistory.length }}</strong> Riwayat
        </div>
        <div class="pagination-controls">
          <button
            type="button"
            class="btn btn-outline btn-sm btn-page-nav"
            :disabled="currentPage === 1"
            @click="currentPage--"
            title="Halaman Sebelumnya"
          >
            <i class="fa-solid fa-chevron-left"></i>
            <span>Sebelumnya</span>
          </button>
          <span class="pagination-page-indicator">
            Halaman <strong>{{ currentPage }}</strong> / {{ totalPages || 1 }}
          </span>
          <button
            type="button"
            class="btn btn-outline btn-sm btn-page-nav"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage++"
            title="Halaman Selanjutnya"
          >
            <span>Selanjutnya</span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <PasswordPromptModal 
      :isOpen="showPasswordModal" 
      :description="passwordPromptDesc"
      @close="showPasswordModal = false"
      @success="handlePasswordSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { usePegawaiStore } from '../stores/pegawaiStore'
import { useAuthStore } from '../stores/authStore'
import { customSwal } from '../utils/swal'
import PasswordPromptModal from '../components/auth/PasswordPromptModal.vue'
import { exportToExcel } from '../utils/exportImport'

const pegawaiStore = usePegawaiStore()
const authStore = useAuthStore()

const selectedItems = ref([])
const filterTmtBaru = ref('all')
const searchQuery = ref('')

const uniqueTmtBaru = computed(() => {
  const tmts = pegawaiStore.extensionHistory
    .map(h => h.tmtBaru)
    .filter(Boolean)
  return [...new Set(tmts)].sort((a, b) => new Date(b) - new Date(a))
})

const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredHistory = computed(() => {
  let result = pegawaiStore.extensionHistory

  if (filterTmtBaru.value !== 'all') {
    result = result.filter(h => h.tmtBaru === filterTmtBaru.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(h => 
      (h.nama && h.nama.toLowerCase().includes(q)) || 
      (h.nip && h.nip.toLowerCase().includes(q))
    )
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredHistory.value.length / itemsPerPage.value))

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + Number(itemsPerPage.value)
  return filteredHistory.value.slice(start, end)
})

// Hapus pilihan jika filter diubah
watch([filterTmtBaru, searchQuery], () => {
  currentPage.value = 1
  selectedItems.value = []
})

const selectAll = computed({
  get: () => {
    return filteredHistory.value.length > 0 && selectedItems.value.length === filteredHistory.value.length
  },
  set: (val) => {
    if (val) {
      selectedItems.value = [...filteredHistory.value]
    } else {
      selectedItems.value = []
    }
  }
})

const selectedIds = computed(() => selectedItems.value.map(item => item.nip))

const showPasswordModal = ref(false)
const passwordPromptDesc = ref('')
let pendingAction = null // { type: 'single' | 'batch', data: any }

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData() // also loads history
  }
})

const exportHistory = () => {
  if (filteredHistory.value.length === 0) return
  
  const dataToExport = filteredHistory.value.map(h => ({
    'NAMA PEGAWAI': h.nama,
    'NIP BARU': h.nip,
    'TANGGAL DIPERPANJANG': formatDate(h.tglDiperpanjang),
    'TMT LAMA': h.kontrakLama ? formatIndoDate(h.kontrakLama) : '-',
    'TMT BARU': h.tmtBaru ? formatIndoDate(h.tmtBaru) : '-',
    'KETERANGAN': h.keterangan || '-'
  }))

  const fileName = filterTmtBaru.value === 'all' 
    ? 'Riwayat_Perpanjangan_Semua.xlsx' 
    : `Riwayat_Perpanjangan_TMT_${filterTmtBaru.value}.xlsx`
    
  exportToExcel(dataToExport, fileName)
}

const confirmSingleCancel = (history) => {
  pendingAction = { type: 'single', data: { history } }
  passwordPromptDesc.value = `Masukkan password Anda untuk membatalkan perpanjangan pegawai ${history.nama}.`
  showPasswordModal.value = true
}

const confirmBatchCancel = () => {
  pendingAction = { type: 'batch', data: selectedItems.value }
  passwordPromptDesc.value = `Masukkan password Anda untuk membatalkan perpanjangan ${selectedItems.value.length} pegawai secara massal.`
  showPasswordModal.value = true
}

const handlePasswordSuccess = async () => {
  if (pendingAction.type === 'single') {
    await processSingleCancel(pendingAction.data.history)
  } else if (pendingAction.type === 'batch') {
    await processBatchCancel(pendingAction.data)
  }
  pendingAction = null
}

const processSingleCancel = async (history) => {
  const result = await customSwal.fire({
    title: 'Batalkan Perpanjangan?',
    text: `TMT pegawai ${history.nama} akan dikembalikan ke ${history.kontrakLama ? formatIndoDate(history.kontrakLama) : 'semula'}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-rotate-left"></i> Ya, Batalkan',
    cancelButtonText: 'Tutup',
    confirmButtonColor: '#ef4444'
  })
  if (result.isConfirmed) {
    try {
      customSwal.fire({ title: 'Membatalkan...', allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
      await new Promise(r => setTimeout(r, 100))
      
      const index = pegawaiStore.extensionHistory.findIndex(h => h.nip === history.nip && h.tglDiperpanjang === history.tglDiperpanjang)
      if (index !== -1) {
        await pegawaiStore.cancelExtension(history, index)
        customSwal.fire({ icon: 'success', title: 'Berhasil', text: 'Perpanjangan dibatalkan.' })
        selectedItems.value = selectedItems.value.filter(item => item.nip !== history.nip)
      } else {
        throw new Error('Data riwayat tidak ditemukan.')
      }
    } catch (e) {
      customSwal.fire({ icon: 'error', title: 'Gagal', text: e.message })
    }
  }
}

const processBatchCancel = async (itemsToCancel) => {
  const result = await customSwal.fire({
    title: 'Batal Massal?',
    text: `Apakah Anda yakin ingin membatalkan perpanjangan ${itemsToCancel.length} pegawai terpilih? TMT mereka akan dikembalikan ke tanggal semula.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-rotate-left"></i> Ya, Batalkan',
    cancelButtonText: 'Tutup',
    confirmButtonColor: '#ef4444'
  })
  if (result.isConfirmed) {
    try {
      customSwal.fire({ title: 'Membatalkan Massal...', allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
      await new Promise(r => setTimeout(r, 100))
      
      for (const item of itemsToCancel) {
        const index = pegawaiStore.extensionHistory.findIndex(h => h.nip === item.nip && h.tglDiperpanjang === item.tglDiperpanjang)
        if (index !== -1) {
          await pegawaiStore.cancelExtension(item, index)
        }
      }
      
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: `${itemsToCancel.length} perpanjangan berhasil dibatalkan.` })
      selectedItems.value = []
    } catch (e) {
      customSwal.fire({ icon: 'error', title: 'Gagal', text: e.message })
    }
  }
}

const formatIndoDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

const formatDate = (isoString) => {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
.riwayat-view-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* Filter Card */
.filter-panel-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  transition: border-color var(--transition-fast, 0.2s);
}

.filter-tier-main {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  font-size: 0.9rem;
  pointer-events: none;
}

.table-search-input {
  width: 100%;
  padding: 10px 38px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  transition: all var(--transition-fast, 0.2s);
}

.table-search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: var(--bg-secondary);
}

.btn-clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
}

.btn-clear-search:hover {
  color: var(--danger-color);
}

.filter-tmt-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
}

.select-icon {
  position: absolute;
  left: 12px;
  color: var(--text-light);
  font-size: 0.85rem;
  pointer-events: none;
}

.filter-select {
  width: 100%;
  padding: 9px 12px 9px 34px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
  color: var(--text-primary);
  font-size: 0.86rem;
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s);
}

.filter-select:focus {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.filter-tier-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.total-records-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--primary-light);
  color: var(--primary-color);
  font-size: 0.82rem;
  white-space: nowrap;
}

.btn-action-labeled {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  font-size: 0.84rem;
  font-weight: 500;
  border-radius: var(--radius-md, 8px);
  white-space: nowrap;
  transition: all var(--transition-fast, 0.2s);
}

/* Batch Cancel Bar */
.batch-action-bar-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.15);
  animation: slideDownFade 0.25s ease-out;
}

@keyframes slideDownFade {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.batch-selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--danger-color);
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-batch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.84rem;
  font-weight: 500;
  border-radius: var(--radius-sm, 6px);
}

/* Table Card */
.table-container-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
}

.modern-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.modern-data-table thead th {
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  vertical-align: middle;
}

.modern-data-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  background: transparent;
  transition: background-color 0.15s;
}

.modern-data-table tbody tr:hover td {
  background: var(--primary-light);
}

.modern-data-table tbody tr.row-selected td {
  background: rgba(239, 68, 68, 0.08);
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.cell-timestamp {
  font-size: 0.83rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cell-nama {
  color: var(--text-primary);
}

.cell-nip {
  font-family: var(--font-secondary, monospace);
  font-size: 0.82rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cell-date {
  font-size: 0.83rem;
  white-space: nowrap;
}

.badge-tmt-baru {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.82rem;
}

.table-actions-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-table-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm, 6px);
  font-size: 0.85rem;
  transition: all 0.15s;
}

.btn-table-icon:hover {
  transform: translateY(-1px);
}

.table-loading-cell,
.table-empty-cell {
  padding: 40px 20px !important;
  color: var(--text-light);
  font-size: 0.9rem;
}

.table-loading-cell i {
  margin-right: 8px;
  color: var(--primary-color);
}

/* Pagination Bar */
.pagination-bar-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.pagination-count-info {
  font-size: 0.83rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-page-nav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.82rem;
  border-radius: var(--radius-sm, 6px);
}

.btn-page-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-page-indicator {
  font-size: 0.83rem;
  color: var(--text-secondary);
  padding: 0 4px;
}

@media (max-width: 768px) {
  .filter-tier-main {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-tier-actions {
    margin-left: 0;
    justify-content: space-between;
  }
  .pagination-bar-modern {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
