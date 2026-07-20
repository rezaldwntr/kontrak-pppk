<template>
  <div class="card" style="padding: 1.5rem;">
    <PegawaiTable 
      :allowBatchDelete="true"
      @view="handleView"
      @edit="handleEdit"
      @print="handlePrint"
      @delete="handleDelete"
      @add="handleAdd"
      @export="handleExport"
      @show-import="showImportOptions = true"
      @batch-delete="handleBatchDelete"
    />
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePegawaiStore } from '../stores/pegawaiStore'
import PegawaiTable from '../components/pegawai/PegawaiTable.vue'
import DetailModal from '../components/pegawai/DetailModal.vue'
import PrintPreviewModal from '../components/pegawai/PrintPreviewModal.vue'
import ImportModal from '../components/pegawai/ImportModal.vue'
import { exportToExcel } from '../utils/exportImport'
import { customSwal } from '../utils/swal'
import { calculateContractPeriod, getStatusPppk } from '../utils/pppkLogic'

const pegawaiStore = usePegawaiStore()
const showDetail = ref(false)
const showPrintOptions = ref(false)
const showImportOptions = ref(false)
const selectedItem = ref(null)

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})

// Handlers for table events
const handleView = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const handleSaveDetail = async (updatedItem) => {
  try {
    showDetail.value = false
    customSwal.fire({
      title: 'Menyimpan...',
      html: 'Sedang memproses perubahan. Mohon tunggu...',
      allowOutsideClick: false,
      didOpen: () => {
        customSwal.showLoading()
      }
    })
    
    // Memberikan jeda waktu agar browser dapat merender UI (SweetAlert & tutup modal) sebelum proses berat memblokir thread (Fix INP Issue)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    await pegawaiStore.updatePegawai(updatedItem)
    
    customSwal.fire({
      icon: 'success',
      title: 'Tersimpan!',
      text: 'Data Pegawai berhasil diperbarui.',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error) {
    customSwal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi kesalahan saat menyimpan data.',
    })
  }
}

const handleEdit = (item) => {
  console.log("Edit item:", item)
}
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
    try {
      customSwal.fire({
        title: 'Menghapus...',
        html: 'Sedang menghapus data. Mohon tunggu...',
        allowOutsideClick: false,
        didOpen: () => { customSwal.showLoading() }
      })
      await new Promise(resolve => setTimeout(resolve, 100))
      
      await pegawaiStore.deletePegawai(item['NIP BARU'])
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil dihapus.' })
    } catch (e) {
      customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data: ' + e.message })
    }
  }
}
const handleBatchDelete = async (selectedIds) => {
  const result = await customSwal.fire({
    title: 'Hapus Data Terpilih?',
    text: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data pegawai terpilih? Data yang dihapus tidak dapat dikembalikan.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-trash"></i> Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444'
  })
  
  if (result.isConfirmed) {
    try {
      customSwal.fire({
        title: 'Menghapus...',
        html: `Sedang menghapus ${selectedIds.length} data. Mohon tunggu...`,
        allowOutsideClick: false,
        didOpen: () => { customSwal.showLoading() }
      })
      await new Promise(resolve => setTimeout(resolve, 100))
      
      await pegawaiStore.batchDelete(selectedIds)
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: `${selectedIds.length} data pegawai berhasil dihapus.` })
    } catch (e) {
      customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data: ' + e.message })
    }
  }
}
const handleAdd = () => {
  console.log("Add new data")
}
const handleExport = () => {
  try {
    const dataToExport = pegawaiStore.pppkData.map(item => {
      const contractPeriod = calculateContractPeriod(item)
      return {
        ...item,
        'STATUS_KONTRAK_TERKINI': contractPeriod.statusText,
        'STATUS_PPPK_TERKINI': getStatusPppk(item)
      }
    })
    exportToExcel(dataToExport)
  } catch(e) {
    customSwal.fire({ icon: 'error', title: 'Gagal Ekspor', text: e.message })
  }
}
const handleImportSuccess = () => {
  // Data is already updated in the store, we can show a toast or alert if needed
}
</script>
