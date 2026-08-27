<template>
  <div>
    <!-- Tab Bar -->
    <div class="pppk-tabs" style="display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid var(--border-color);">
      <router-link
        v-for="tab in tabs"
        :key="tab.key"
        :to="`/data-pegawai/${tab.key}`"
        class="pppk-tab-item"
        :class="{ active: activeTab === tab.key }"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
        <span class="tab-badge">{{ tabCounts[tab.key] }}</span>
      </router-link>
    </div>

    <!-- Tab: Aktif, Akan Pensiun, Sudah Pensiun -->
    <div v-if="activeTab !== 'tidak-diperpanjang'" class="card" style="padding: 1.5rem;">
      <PegawaiTable
        :allowBatchDelete="true"
        :allowBatchDownload="true"
        :customData="filteredData"
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

    <!-- Tab: Tidak Diperpanjang -->
    <div v-else class="card" style="padding: 1.5rem;">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>NAMA PEGAWAI</th>
              <th>NIP BARU</th>
              <th>JENIS PPPK</th>
              <th>AKHIR KONTRAK</th>
              <th>ALASAN TIDAK DIPERPANJANG</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="6" class="text-center">Tidak ada pegawai yang tidak diperpanjang.</td>
            </tr>
            <tr v-for="item in filteredData" :key="item['NIP BARU']">
              <td><strong>{{ item['NAMA'] }}</strong></td>
              <td>{{ item['NIP BARU'] }}</td>
              <td>{{ item['JENIS PPPK'] || '-' }}</td>
              <td>{{ calculateContractPeriod(item).endDateStr }}</td>
              <td>
                <div v-if="editingKeteranganNip !== item['NIP BARU']" style="display:flex; align-items:center; gap:8px;">
                  <span :style="{ color: item['ALASAN_TIDAK_DIPERPANJANG'] ? 'inherit' : 'var(--text-muted)', fontStyle: item['ALASAN_TIDAK_DIPERPANJANG'] ? 'normal' : 'italic' }">
                    {{ item['ALASAN_TIDAK_DIPERPANJANG'] || 'Belum ada keterangan' }}
                  </span>
                  <button class="btn btn-outline btn-sm" @click="startEditKeterangan(item)" title="Edit Keterangan" style="padding: 2px 8px;">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                </div>
                <div v-else style="display:flex; align-items:center; gap:8px;">
                  <input
                    type="text"
                    v-model="keteranganInput"
                    class="form-control"
                    style="padding: 4px 8px; font-size: 0.9rem;"
                    placeholder="Tulis alasan..."
                    @keyup.enter="saveKeterangan(item)"
                    @keyup.esc="cancelEditKeterangan"
                    ref="keteranganInputRef"
                  >
                  <button class="btn btn-success btn-sm" @click="saveKeterangan(item)" title="Simpan">
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button class="btn btn-outline btn-sm" @click="cancelEditKeterangan" title="Batal">
                    <i class="fa-solid fa-times"></i>
                  </button>
                </div>
              </td>
              <td style="display: flex; gap: 6px;">
                <button class="btn btn-outline btn-sm" @click="handleView(item)" title="Detail">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-outline btn-sm" @click="handleDownload(item)" title="Unduh Kontrak">
                  <i class="fa-solid fa-download"></i>
                </button>
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

  <PrintPreviewModal
    v-if="showPrintOptions"
    :show="showPrintOptions"
    :pegawai="selectedItem"
    @close="showPrintOptions = false"
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
import PrintPreviewModal from '../components/pegawai/PrintPreviewModal.vue'
import ImportModal from '../components/pegawai/ImportModal.vue'
import PasswordPromptModal from '../components/auth/PasswordPromptModal.vue'
import DownloadContractModal from '../components/pegawai/DownloadContractModal.vue'
import { exportToExcel } from '../utils/exportImport'
import { customSwal } from '../utils/swal'
import { calculateContractPeriod, getStatusPppk, getPegawaiCategory } from '../utils/pppkLogic'

const pegawaiStore = usePegawaiStore()
const route = useRoute()

const showDetail = ref(false)
const showPrintOptions = ref(false)
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
  { key: 'tidak-diperpanjang', label: 'Tidak Diperpanjang', icon: 'fa-solid fa-user-xmark' },
]

const activeTab = computed(() => route.params.kategori || 'aktif')

const tabCounts = computed(() => {
  const counts = { 'aktif': 0, 'akan-pensiun': 0, 'sudah-pensiun': 0, 'tidak-diperpanjang': 0 }
  pegawaiStore.pppkData.forEach(item => {
    const cat = getPegawaiCategory(item)
    if (counts[cat] !== undefined) counts[cat]++
  })
  return counts
})

const filteredData = computed(() => {
  return pegawaiStore.pppkData.filter(item => getPegawaiCategory(item) === activeTab.value)
})

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})

const startEditKeterangan = async (item) => {
  editingKeteranganNip.value = item['NIP BARU']
  keteranganInput.value = item['ALASAN_TIDAK_DIPERPANJANG'] || ''
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
  const updatedItem = { ...item, 'ALASAN_TIDAK_DIPERPANJANG': keteranganInput.value.trim() }
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
  } catch (error) {
    customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat menyimpan data.' })
  }
}

const handleEdit = (item) => { console.log('Edit:', item) }

const handlePrint = (item) => {
  selectedItem.value = item
  showPrintOptions.value = true
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
.pppk-tabs {
  overflow-x: auto;
  white-space: nowrap;
}
.pppk-tab-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
}
.pppk-tab-item:hover {
  color: var(--primary-color);
  background: rgba(45, 122, 241, 0.05);
}
.pppk-tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}
.tab-badge {
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 12px;
  min-width: 22px;
  text-align: center;
}
.pppk-tab-item.active .tab-badge {
  background: rgba(45, 122, 241, 0.15);
  color: var(--primary-color);
}
</style>

