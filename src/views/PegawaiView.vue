<template>
  <div>
    <!-- Modern Segmented Tab Bar -->
    <div class="pppk-tabs-wrapper">
      <div class="pppk-segmented-tabs">
        <router-link
          v-for="tab in tabs"
          :key="tab.key"
          :to="`/data-pegawai/${tab.key}`"
          class="tab-pill"
          :class="{ active: activeTab === tab.key }"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <span class="tab-pill-badge">{{ tabCounts[tab.key] }}</span>
        </router-link>
      </div>
    </div>

    <!-- Tab: Aktif, Akan Pensiun, Sudah Pensiun -->
    <div v-if="activeTab !== 'diberhentikan'">
      <PegawaiTable
        :key="activeTab"
        :allowBatchDelete="true"
        :allowBatchDownload="true"
        :customData="filteredData"
        :isBupTab="['akan-pensiun', 'sudah-pensiun'].includes(activeTab)"
        :hideStatusPppkFilter="['aktif', 'akan-pensiun', 'sudah-pensiun'].includes(activeTab)"
        :hideStatusKontrakFilter="['akan-pensiun', 'sudah-pensiun'].includes(activeTab)"
        :hidePerpanjanganFilter="['akan-pensiun', 'sudah-pensiun'].includes(activeTab)"
        @view="handleView"
        @edit="handleEdit"
        @print="handlePrint"
        @delete="handleDelete"
        @add="handleAdd"
        @export="handleExport"
        @show-import="pegawaiStore.showImportModal = true"
        @batch-delete="handleBatchDelete"
        @download="handleDownload"
        @batch-download="handleBatchDownload"
      />
    </div>

    <!-- Tab: Diberhentikan -->
    <div v-else class="table-container-card">
      <div class="table-responsive">
        <table class="table modern-data-table">
          <thead>
            <tr>
              <th>NAMA PEGAWAI</th>
              <th>NIP BARU</th>
              <th>JENIS PPPK</th>
              <th>AKHIR KONTRAK</th>
              <th>KETERANGAN DIBERHENTIKAN</th>
              <th width="120" style="text-align: center;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="6" class="text-center table-empty-cell">
                <i class="fa-solid fa-folder-open text-muted" style="font-size: 1.5rem; display: block; margin-bottom: 6px;"></i>
                <span>Tidak ada pegawai yang diberhentikan.</span>
              </td>
            </tr>
            <tr v-for="item in filteredData" :key="item['NIP BARU']">
              <td><strong>{{ item['NAMA'] }}</strong></td>
              <td class="cell-nip">{{ item['NIP BARU'] }}</td>
              <td>
                <span :class="item['JENIS PPPK'] === 'PPPK Paruh Waktu' ? 'badge-paruh-inline' : ''">
                  {{ item['JENIS PPPK'] || '-' }}
                </span>
              </td>
              <td class="cell-date">{{ calculateContractPeriod(item).endDateStr }}</td>
              <td>
                <div v-if="editingKeteranganNip !== item['NIP BARU']" style="display: flex; align-items: center; gap: 8px;">
                  <span :style="{ color: getKeteranganDiberhentikan(item) ? 'inherit' : 'var(--text-light)', fontStyle: getKeteranganDiberhentikan(item) ? 'normal' : 'italic' }">
                    {{ getKeteranganDiberhentikan(item) || 'Belum ada keterangan' }}
                  </span>
                  <button class="btn btn-sm btn-outline btn-table-icon" @click="startEditKeterangan(item)" title="Edit Keterangan">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                </div>
                <div v-else style="display: flex; align-items: center; gap: 8px;">
                  <input
                    type="text"
                    v-model="keteranganInput"
                    class="form-control form-control-sm"
                    style="padding: 4px 10px; font-size: 0.85rem;"
                    placeholder="Tulis alasan..."
                    @keyup.enter="saveKeterangan(item)"
                    @keyup.esc="cancelEditKeterangan"
                    ref="keteranganInputRef"
                  >
                  <button class="btn btn-success btn-sm btn-table-icon" @click="saveKeterangan(item)" title="Simpan">
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button class="btn btn-outline btn-sm btn-table-icon" @click="cancelEditKeterangan" title="Batal">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </td>
              <td>
                <div class="table-actions-group">
                  <button class="btn btn-sm btn-outline btn-table-icon" @click="handleView(item)" title="Detail Profil">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-primary btn-table-icon" v-if="getStatusPppk(item) === 'Aktif'" @click="handleDownload(item)" title="Unduh Kontrak">
                    <i class="fa-solid fa-download"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <DetailModal
    v-if="showDetail"
    :isOpen="showDetail"
    :item="selectedItem"
    @close="showDetail = false"
    @print="handlePrint"
    @save="handleSaveDetail"
  />

  <ImportModal
    v-if="pegawaiStore.showImportModal"
    :show="pegawaiStore.showImportModal"
    @close="pegawaiStore.showImportModal = false"
    @imported="handleImportSuccess"
  />
  <PasswordPromptModal
    :isOpen="showPasswordModal"
    :description="passwordPromptDesc"
    @close="showPasswordModal = false"
    @success="handlePasswordSuccess"
  />
  <DownloadContractModal
    :isOpen="showDownloadModal"
    :items="downloadItems"
    @close="showDownloadModal = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { usePegawaiStore } from '../stores/pegawaiStore'
import PegawaiTable from '../components/pegawai/PegawaiTable.vue'
import DetailModal from '../components/pegawai/DetailModal.vue'
import ImportModal from '../components/pegawai/ImportModal.vue'
import PasswordPromptModal from '../components/auth/PasswordPromptModal.vue'
import DownloadContractModal from '../components/pegawai/DownloadContractModal.vue'
import { exportToExcel } from '../utils/exportImport'
import { customSwal } from '../utils/swal'
import { calculateContractPeriod, getStatusPppk, getPegawaiCategory, getKeteranganDiberhentikan } from '../utils/pppkLogic'
import { useDriveStore } from '../stores/driveStore'
import { useDriveSync } from '../composables/useDriveSync'

const pegawaiStore = usePegawaiStore()
const driveStore = useDriveStore()
const route = useRoute()

const showDetail = ref(false)
const selectedItem = ref(null)
const showPasswordModal = ref(false)
const passwordPromptDesc = ref('')
let pendingAction = null
const showDownloadModal = ref(false)
const downloadItems = ref([])

// Keterangan inline edit
const editingKeteranganNip = ref(null)
const keteranganInput = ref('')
const keteranganInputRef = ref(null)

const tabs = [
  { key: 'aktif', label: 'PPPK Aktif', icon: 'fa-solid fa-users' },
  { key: 'akan-pensiun', label: 'Akan Pensiun (BUP)', icon: 'fa-solid fa-hourglass-half' },
  { key: 'sudah-pensiun', label: 'Sudah Pensiun', icon: 'fa-solid fa-medal' },
  { key: 'diberhentikan', label: 'Diberhentikan', icon: 'fa-solid fa-user-xmark' },
]

const activeTab = computed(() => route.params.kategori || 'aktif')

const tabCounts = computed(() => {
  const counts = { 'aktif': 0, 'akan-pensiun': 0, 'sudah-pensiun': 0, 'diberhentikan': 0 }
  pegawaiStore.pppkData.forEach(item => {
    const cat = getPegawaiCategory(item)
    if (counts[cat] !== undefined) counts[cat]++
    if (cat === 'akan-pensiun') counts['aktif']++
  })
  return counts
})

const filteredData = computed(() => {
  let data = pegawaiStore.pppkData.filter(item => {
    const cat = getPegawaiCategory(item)
    if (activeTab.value === 'aktif') {
      return cat === 'aktif' || cat === 'akan-pensiun'
    }
    return cat === activeTab.value
  })

    if (activeTab.value === 'akan-pensiun' || activeTab.value === 'sudah-pensiun') {
      data.sort((a, b) => {
        const pA = calculateContractPeriod(a)
        const pB = calculateContractPeriod(b)
        const tA = pA.rawDate ? pA.rawDate.getTime() : Infinity
        const tB = pB.rawDate ? pB.rawDate.getTime() : Infinity
        if (activeTab.value === 'sudah-pensiun') return tB - tA;
        return tA - tB
      })
    }

  return data
})

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})

const startEditKeterangan = async (item) => {
  editingKeteranganNip.value = item['NIP BARU']
  keteranganInput.value = getKeteranganDiberhentikan(item) || ''
  await nextTick()
  if (keteranganInputRef.value) {
    const el = Array.isArray(keteranganInputRef.value) ? keteranganInputRef.value[0] : keteranganInputRef.value
    el?.focus()
  }
}

const cancelEditKeterangan = () => {
  editingKeteranganNip.value = null
  keteranganInput.value = ''
}

const saveKeterangan = async (item) => {
  const updatedItem = { ...item, 'KETERANGAN DIBERHENTIKAN': keteranganInput.value.trim() }
  try {
    await pegawaiStore.updatePegawai(updatedItem)
    editingKeteranganNip.value = null
    keteranganInput.value = ''
  } catch (e) {
    customSwal.fire({ icon: 'error', title: 'Gagal menyimpan', text: e.message })
  }
}

const handleDownload = (item) => {
  downloadItems.value = [item]
  showDownloadModal.value = true
}

const handleBatchDownload = (items) => {
  downloadItems.value = items
  showDownloadModal.value = true
}

const handleView = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const handleSaveDetail = async (updatedItem) => {
  try {
    showDetail.value = false
    customSwal.fire({ title: 'Menyimpan...', html: 'Mohon tunggu...', allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
    await new Promise(resolve => setTimeout(resolve, 100))
    await pegawaiStore.updatePegawai(updatedItem)
    customSwal.fire({ icon: 'success', title: 'Tersimpan!', text: 'Data pegawai berhasil diperbarui.', timer: 1500, showConfirmButton: false })

    // Auto-sync ke Google Drive jika diaktifkan dan memenuhi aturan sync
    try {
      if (driveStore.isEnabled && driveStore.isConnected) {
        const { shouldSync, syncEmployee, addToQueue } = useDriveSync()
        if (shouldSync(updatedItem)) {
          syncEmployee(updatedItem).catch(err => addToQueue(updatedItem, err))
        }
      }
    } catch (syncErr) {
      console.warn('Drive sync error on save:', syncErr)
    }
  } catch (error) {
    customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat menyimpan data.' })
  }
}

const handleEdit = (item) => { console.log('Edit:', item) }

const handlePrint = (item) => {
  selectedItem.value = item
  downloadItems.value = [item]
  showDownloadModal.value = true
}

const handleDelete = async (item) => {
  const result = await customSwal.fire({
    title: 'Hapus Data Pegawai?',
    text: `Apakah Anda yakin ingin menghapus data pegawai ${item['NAMA']}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444'
  })
  if (result.isConfirmed) {
    pendingAction = { type: 'delete', data: item }
    passwordPromptDesc.value = `Masukkan password Anda untuk menghapus data pegawai ${item['NAMA']}.`
    showPasswordModal.value = true
  }
}

const handleBatchDelete = async (selectedIds) => {
  const result = await customSwal.fire({
    title: 'Hapus Data Terpilih?',
    text: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data pegawai terpilih?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-trash"></i> Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444'
  })
  if (result.isConfirmed) {
    pendingAction = { type: 'batchDelete', data: selectedIds }
    passwordPromptDesc.value = `Masukkan password Anda untuk menghapus massal ${selectedIds.length} data pegawai.`
    showPasswordModal.value = true
  }
}

const handlePasswordSuccess = async () => {
  if (pendingAction.type === 'delete') await executeDelete(pendingAction.data)
  else if (pendingAction.type === 'batchDelete') await executeBatchDelete(pendingAction.data)
  pendingAction = null
}

const executeDelete = async (item) => {
  try {
    customSwal.fire({ title: 'Menghapus...', html: 'Mohon tunggu...', allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
    await new Promise(resolve => setTimeout(resolve, 100))
    await pegawaiStore.deletePegawai(item['NIP BARU'])
    customSwal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil dihapus.' })
  } catch (e) {
    customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data: ' + e.message })
  }
}

const executeBatchDelete = async (selectedIds) => {
  try {
    customSwal.fire({ title: 'Menghapus...', html: `Menghapus ${selectedIds.length} data...`, allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
    await new Promise(resolve => setTimeout(resolve, 100))
    await pegawaiStore.batchDelete(selectedIds)
    customSwal.fire({ icon: 'success', title: 'Berhasil', text: `${selectedIds.length} data pegawai berhasil dihapus.` })
  } catch (e) {
    customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data: ' + e.message })
  }
}

const handleAdd = () => { console.log('Add new data') }

const handleExport = () => {
  try {
    const dataToExport = filteredData.value.map(item => ({
      ...item,
      'STATUS_KONTRAK_TERKINI': calculateContractPeriod(item).statusText,
      'STATUS_PPPK_TERKINI': getStatusPppk(item)
    }))
    const tabLabel = tabs.find(t => t.key === activeTab.value)?.label || 'Data'
    exportToExcel(dataToExport, `PPPK_${tabLabel.replace(/\s+/g, '_')}.xlsx`)
  } catch (e) {
    customSwal.fire({ icon: 'error', title: 'Gagal Ekspor', text: e.message })
  }
}

const handleImportSuccess = () => {}
</script>

<style scoped>
.pppk-tabs-wrapper {
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.pppk-segmented-tabs {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  white-space: nowrap;
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md, 8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.tab-pill:hover {
  color: var(--text-primary);
  background: var(--bg-primary);
}

.tab-pill.active {
  color: #ffffff;
  background: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.tab-pill-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 7px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--bg-primary);
  color: var(--text-light);
  min-width: 20px;
  transition: all 0.2s;
}

.tab-pill.active .tab-pill-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Table Card for Diberhentikan */
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

.cell-nip {
  font-family: var(--font-secondary, monospace);
  font-size: 0.82rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cell-date {
  font-size: 0.83rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.badge-paruh-inline {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  vertical-align: middle;
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

.table-empty-cell {
  padding: 40px 20px !important;
  color: var(--text-light);
  font-size: 0.9rem;
}
</style>


