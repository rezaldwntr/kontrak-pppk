<template>
  <header class="header">
    <div class="page-title">
      <h2>Data PPPK</h2>
      <p>Manajemen data profil dan masa kontrak PPPK</p>
    </div>
  </header>
  
  <div class="card" style="padding: 1.5rem;">
    <PegawaiTable 
      @view="handleView"
      @edit="handleEdit"
      @print="handlePrint"
      @delete="handleDelete"
      @add="handleAdd"
      @export="handleExport"
    />
  </div>

  <DetailModal 
    v-if="showDetail" 
    :isOpen="showDetail" 
    :item="selectedItem" 
    @close="showDetail = false" 
    @print="handlePrint"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePegawaiStore } from '../stores/pegawaiStore'
import PegawaiTable from '../components/pegawai/PegawaiTable.vue'
import DetailModal from '../components/pegawai/DetailModal.vue'
import { exportToExcel } from '../utils/excel'
import { printDocx } from '../utils/docx'

const pegawaiStore = usePegawaiStore()
const showDetail = ref(false)
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
  console.log("Print item:", item)
  printDocx(item)
}
const handleDelete = (item) => {
  console.log("Delete item:", item)
}
const handleAdd = () => {
  console.log("Add new data")
}
const handleExport = () => {
  exportToExcel(pegawaiStore.pppkData)
}
</script>
