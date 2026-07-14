<template>
  <div>
    <header class="header">
      <div class="page-title">
        <h2>Perpanjangan Kontrak Massal</h2>
        <p>Filter pegawai yang masa kontraknya habis, lalu centang dan perpanjang secara massal.</p>
      </div>
    </header>
    
    <div class="card" style="padding: 1.5rem;">
      <div class="alert alert-warning" style="margin-bottom: 20px; font-size: 14px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; color: #d97706; border-radius: var(--border-radius);">
        <i class="fa-solid fa-circle-info"></i> 
        <strong>Petunjuk:</strong> Pilih filter <strong>"Kontrak Habis"</strong> atau <strong>"Kontrak Hampir Habis"</strong> pada tabel di bawah. Centang kotak di sebelah kiri nama pegawai yang ingin diperpanjang, lalu klik tombol <strong>"Perpanjang Massal"</strong> yang akan muncul.
      </div>

      <PegawaiTable 
        @batchExtend="handleBatchExtend"
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

    <PrintPreviewModal
      v-if="showPrintOptions"
      :show="showPrintOptions"
      :pegawai="selectedItem"
      @close="showPrintOptions = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePegawaiStore } from '../stores/pegawaiStore'
import PegawaiTable from '../components/pegawai/PegawaiTable.vue'
import DetailModal from '../components/pegawai/DetailModal.vue'
import PrintPreviewModal from '../components/pegawai/PrintPreviewModal.vue'

const pegawaiStore = usePegawaiStore()
const showDetail = ref(false)
const showPrintOptions = ref(false)
const selectedItem = ref(null)

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

import { customSwal } from '../utils/swal'

const handleBatchExtend = async (selectedIds) => {
  const result = await customSwal.fire({
    title: 'Perpanjang Kontrak?',
    text: `Apakah Anda yakin ingin memperpanjang kontrak ${selectedIds.length} pegawai yang dipilih secara otomatis selama 5 tahun?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Perpanjang',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10b981'
  })
  
  if (result.isConfirmed) {
    try {
      const res = await pegawaiStore.batchExtend(selectedIds)
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: `Berhasil memperpanjang ${res.count} kontrak pegawai! Silakan cek Riwayat.` })
    } catch (e) {
      customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memperpanjang kontrak: ' + e.message })
    }
  }
}
</script>
