<template>
  <div class="card" style="padding: 1.5rem;">
    <PegawaiTable 
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
  />

  <PrintPreviewModal
    v-if="showPrintOptions"
    :show="showPrintOptions"
    :pegawai="selectedItem"
    @close="showPrintOptions = false"
  />

  <ImportModal
    v-if="showImportOptions"
    :show="showImportOptions"
    @close="showImportOptions = false"
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
const handleEdit = (item) => {
  console.log("Edit item:", item)
}
const handlePrint = (item) => {
  selectedItem.value = item
  showPrintOptions.value = true
}
const handleDelete = async (item) => {
  if (confirm(`Apakah Anda yakin ingin menghapus data pegawai ${item['NAMA']}?`)) {
    try {
      await pegawaiStore.deletePegawai(item['NIP BARU'])
      alert("Data berhasil dihapus.")
    } catch (e) {
      alert("Gagal menghapus data: " + e.message)
    }
  }
}
const handleBatchDelete = async (selectedIds) => {
  if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data pegawai terpilih? Data yang dihapus tidak dapat dikembalikan.`)) {
    try {
      await pegawaiStore.batchDelete(selectedIds)
      alert(`${selectedIds.length} data pegawai berhasil dihapus.`)
    } catch (e) {
      alert("Gagal menghapus data: " + e.message)
    }
  }
}
const handleAdd = () => {
  console.log("Add new data")
}
const handleExport = () => {
  try {
    exportToExcel(pegawaiStore.pppkData)
  } catch(e) {
    alert(e.message)
  }
}
const handleImportSuccess = () => {
  // Data is already updated in the store, we can show a toast or alert if needed
}
</script>
