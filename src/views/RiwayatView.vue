<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; align-items: center; gap: 10px; background: var(--bg-primary); padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <i class="fa-solid fa-filter text-muted"></i>
        <label style="font-weight: 600; margin: 0; font-size: 0.95rem;">Filter TMT Baru:</label>
        <select v-model="filterTmtBaru" class="form-control" style="width: auto; min-width: 180px; padding: 6px 12px; border: none; background: var(--bg-secondary); outline: none; border-radius: 6px;">
          <option value="all">Semua TMT Baru</option>
          <option v-for="tmt in uniqueTmtBaru" :key="tmt" :value="tmt">{{ tmt }}</option>
        </select>
      </div>

      <button class="btn btn-success" @click="exportHistory" :disabled="filteredHistory.length === 0">
        <i class="fa-solid fa-file-excel"></i> Ekspor Data
      </button>
    </div>

    <div v-if="selectedIds.length > 0" class="batch-action-bar" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-weight: bold; color: #ef4444;">
        <i class="fa-solid fa-check-circle"></i> {{ selectedIds.length }} Riwayat Terpilih
      </div>
      <div>
        <button class="btn btn-danger" @click="confirmBatchCancel">
          <i class="fa-solid fa-rotate-left"></i> Batal Massal
        </button>
      </div>
    </div>

    <div class="card" style="padding: 1.5rem;">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th width="40" v-if="authStore?.user"><input type="checkbox" v-model="selectAll"></th>
              <th>TANGGAL DIPERPANJANG</th>
              <th>NAMA PEGAWAI</th>
              <th>NIP BARU</th>
              <th>TMT LAMA</th>
              <th>TMT BARU</th>
              <th v-if="authStore?.user">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pegawaiStore.isLoading">
              <td colspan="7" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Memuat Riwayat...</td>
            </tr>
            <tr v-else-if="filteredHistory.length === 0">
              <td colspan="7" class="text-center">Belum ada riwayat perpanjangan kontrak.</td>
            </tr>
            <tr v-else v-for="(history, index) in filteredHistory" :key="history.nip + history.tglDiperpanjang">
              <td v-if="authStore?.user">
                <input type="checkbox" :value="history" v-model="selectedItems">
              </td>
              <td>{{ formatDate(history.tglDiperpanjang) }}</td>
              <td><strong>{{ history.nama }}</strong></td>
              <td>{{ history.nip }}</td>
              <td>{{ history.kontrakLama || '-' }}</td>
              <td>{{ history.tmtBaru || '-' }}</td>
              <td v-if="authStore?.user">
                <button class="btn btn-danger btn-sm" @click="confirmSingleCancel(history)" title="Batalkan Perpanjangan">
                  <i class="fa-solid fa-rotate-left"></i> Batal
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

const uniqueTmtBaru = computed(() => {
  const tmts = pegawaiStore.extensionHistory
    .map(h => h.tmtBaru)
    .filter(Boolean)
  return [...new Set(tmts)].sort((a, b) => new Date(b) - new Date(a))
})

const filteredHistory = computed(() => {
  if (filterTmtBaru.value === 'all') {
    return pegawaiStore.extensionHistory
  }
  return pegawaiStore.extensionHistory.filter(h => h.tmtBaru === filterTmtBaru.value)
})

// Hapus pilihan jika filter diubah
watch(filterTmtBaru, () => {
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
    'TMT LAMA': h.kontrakLama || '-',
    'TMT BARU': h.tmtBaru || '-',
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
    text: `TMT pegawai ${history.nama} akan dikembalikan ke ${history.kontrakLama || 'semula'}.`,
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
.badge-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
</style>
