<template>
  <div>
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
            <tr v-else-if="pegawaiStore.extensionHistory.length === 0">
              <td colspan="7" class="text-center">Belum ada riwayat perpanjangan kontrak.</td>
            </tr>
            <tr v-else v-for="(history, index) in pegawaiStore.extensionHistory" :key="index">
              <td v-if="authStore?.user">
                <input type="checkbox" :value="history" v-model="selectedItems">
              </td>
              <td>{{ formatDate(history.tglDiperpanjang) }}</td>
              <td><strong>{{ history.nama }}</strong></td>
              <td>{{ history.nip }}</td>
              <td>{{ history.kontrakLama || '-' }}</td>
              <td>{{ history.tmtBaru || '-' }}</td>
              <td v-if="authStore?.user">
                <button class="btn btn-danger btn-sm" @click="confirmSingleCancel(history, index)" title="Batalkan Perpanjangan">
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
import { ref, onMounted, computed } from 'vue'
import { usePegawaiStore } from '../stores/pegawaiStore'
import { useAuthStore } from '../stores/authStore'
import { customSwal } from '../utils/swal'
import PasswordPromptModal from '../components/auth/PasswordPromptModal.vue'

const pegawaiStore = usePegawaiStore()
const authStore = useAuthStore()

const selectedItems = ref([])

const selectAll = computed({
  get: () => {
    return pegawaiStore.extensionHistory.length > 0 && selectedItems.value.length === pegawaiStore.extensionHistory.length
  },
  set: (val) => {
    if (val) {
      selectedItems.value = [...pegawaiStore.extensionHistory]
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

const confirmSingleCancel = (history, index) => {
  pendingAction = { type: 'single', data: { history, index } }
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
    await processSingleCancel(pendingAction.data.history, pendingAction.data.index)
  } else if (pendingAction.type === 'batch') {
    await processBatchCancel(pendingAction.data)
  }
  pendingAction = null
}

const processSingleCancel = async (history, index) => {
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
      
      await pegawaiStore.cancelExtension(history, index)
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: 'Perpanjangan dibatalkan.' })
      
      selectedItems.value = selectedItems.value.filter(item => item.nip !== history.nip)
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
