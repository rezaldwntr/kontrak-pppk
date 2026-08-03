<template>
  <div>
    <div class="card" style="padding: 1.5rem;">
      <div class="alert alert-warning" style="margin-bottom: 20px; font-size: 14px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; color: #d97706; border-radius: var(--border-radius);">
        <i class="fa-solid fa-circle-info"></i> 
        <strong>Petunjuk:</strong> Tabel di bawah secara otomatis hanya menampilkan pegawai yang membutuhkan perpanjangan. Centang kotak di sebelah kiri nama pegawai yang ingin diperpanjang, lalu klik tombol <strong>"Perpanjang Massal"</strong> yang muncul di atas tabel.
      </div>

      <PegawaiTable 
        :allowBatchExtend="true"
        :onlyNeedExtension="true"
        @batch-extend="handleBatchExtend"
        @view="handleView"
        @print="handlePrint"
      />
    </div>

    <!-- Modals -->
    <DetailModal 
      v-if="showDetail" 
      :isOpen="showDetail" 
      :item="selectedItem" 
      @close="showDetail = false" 
      @print="handlePrint"
    />

    <ExtendModal
      v-if="showExtendModal"
      :isOpen="showExtendModal"
      :selectedIds="extendIds"
      @close="showExtendModal = false"
      @submit="submitBatchExtend"
    />

    <PrintPreviewModal
      v-if="showPrintOptions"
      :show="showPrintOptions"
      :pegawai="selectedItem"
      @close="showPrintOptions = false"
    />
    
    <PasswordPromptModal 
      :isOpen="showPasswordModal" 
      :description="passwordPromptDesc"
      @close="showPasswordModal = false"
      @success="executeBatchExtend"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePegawaiStore } from '../stores/pegawaiStore'
import PegawaiTable from '../components/pegawai/PegawaiTable.vue'
import DetailModal from '../components/pegawai/DetailModal.vue'
import PrintPreviewModal from '../components/pegawai/PrintPreviewModal.vue'
import ExtendModal from '../components/pegawai/ExtendModal.vue'
import PasswordPromptModal from '../components/auth/PasswordPromptModal.vue'
import { customSwal } from '../utils/swal'

const pegawaiStore = usePegawaiStore()
const showDetail = ref(false)
const showPrintOptions = ref(false)
const showExtendModal = ref(false)
const selectedItem = ref(null)
const extendIds = ref([])

const showPasswordModal = ref(false)
const passwordPromptDesc = ref('')
let pendingExtendData = null

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})

const handleView = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const handlePrint = (item) => {
  selectedItem.value = item
  showPrintOptions.value = true
}

const handleBatchExtend = (selectedIds) => {
  extendIds.value = selectedIds
  showExtendModal.value = true
}

const submitBatchExtend = async (extendData) => {
  showExtendModal.value = false
  pendingExtendData = extendData
  passwordPromptDesc.value = `Masukkan password Anda untuk memproses perpanjangan kontrak bagi ${extendIds.value.length} pegawai.`
  showPasswordModal.value = true
}

const executeBatchExtend = async () => {
  if (!pendingExtendData) return
  
  try {
    customSwal.fire({
      title: 'Memproses...',
      html: 'Sedang memperpanjang kontrak. Mohon tunggu...',
      allowOutsideClick: false,
      didOpen: () => { customSwal.showLoading() }
    })
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const res = await pegawaiStore.batchExtend(extendIds.value, pendingExtendData)
    customSwal.fire({ icon: 'success', title: 'Berhasil', text: `Berhasil memperpanjang ${res.count} kontrak pegawai!` })
  } catch (e) {
    customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memperpanjang kontrak: ' + e.message })
  } finally {
    pendingExtendData = null
  }
}
</script>
