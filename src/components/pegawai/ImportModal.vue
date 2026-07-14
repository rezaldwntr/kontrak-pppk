<template>
  <div class="modal-backdrop open" v-if="show" @click.self="close">
    <div class="modal-container" style="max-width: 500px;">
      <div class="modal-header">
        <h2><i class="fa-solid fa-file-import"></i> Impor Data Pegawai</h2>
        <button class="close-btn" @click="close" aria-label="Tutup">&times;</button>
      </div>
      <div class="modal-body">
        <p class="text-muted" style="margin-bottom: 15px; font-size: 14px;">Pilih file CSV atau Excel (.xlsx/.xls) yang berisi data profil PPPK Anda.</p>
        
        <div 
          class="import-dropzone" 
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :style="{
            border: isDragging ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
            backgroundColor: isDragging ? 'rgba(45,122,241,0.05)' : 'transparent',
            padding: '2rem',
            textAlign: 'center',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }"
        >
          <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 10px;"></i>
          <p style="margin: 0; color: var(--text-dark);">Tarik file kemari atau klik untuk memilih</p>
          <input type="file" ref="fileInput" accept=".csv,.xlsx,.xls" style="display: none;" @change="handleFileSelect">
        </div>

        <div v-if="selectedFile" class="file-details" style="display: flex; align-items: center; justify-content: space-between; margin-top: 15px; padding: 10px 15px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-file-excel" style="color: #27ae60; font-size: 1.5rem;"></i>
            <div>
              <strong style="display: block; font-size: 14px; color: var(--text-dark);">{{ selectedFile.name }}</strong>
              <span style="font-size: 12px; color: var(--text-muted);">{{ formatBytes(selectedFile.size) }}</span>
            </div>
          </div>
          <button @click="clearFile" class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;"><i class="fa-solid fa-times"></i></button>
        </div>
        
        <div class="form-group" style="margin-top: 20px; margin-bottom: 10px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 13px;">Jenis PPPK yang Diimpor:</label>
          <div style="display: flex; gap: 20px; font-size: 13px; margin-bottom: 15px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="jenisPppk" value="PPPK">
              <span>PPPK</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="jenisPppk" value="PPPK Paruh Waktu">
              <span>PPPK Paruh Waktu</span>
            </label>
          </div>

          <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 13px;">Metode Impor:</label>
          <div style="display: flex; gap: 20px; font-size: 13px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="importMode" value="append">
              <span>Tambah & Gabungkan Data</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="importMode" value="overwrite">
              <span>Tulis Ulang & Timpa Data</span>
            </label>
          </div>
        </div>
        
        <div v-if="errorMsg" class="alert alert-danger" style="font-size: 12px; margin-top: 15px; padding: 10px; border-radius: 4px; background-color: #f8d7da; color: #721c24;">
          {{ errorMsg }}
        </div>
        
        <div v-if="successMsg" class="alert alert-success" style="font-size: 12px; margin-top: 15px; padding: 10px; border-radius: 4px; background-color: #d4edda; color: #155724;">
          {{ successMsg }}
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" @click="close">Batal</button>
        <button class="btn btn-primary" @click="handleImport" :disabled="!selectedFile || isProcessing">
          <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-upload"></i>
          {{ isProcessing ? 'Memproses...' : 'Proses Impor' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { processImportFile, saveImportedData } from '../../utils/exportImport'
import { usePegawaiStore } from '../../stores/pegawaiStore'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'imported'])
const pegawaiStore = usePegawaiStore()

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const importMode = ref('append')
const jenisPppk = ref('PPPK')
const isProcessing = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const close = () => {
  clearFile()
  errorMsg.value = ''
  successMsg.value = ''
  emit('close')
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    errorMsg.value = ''
    successMsg.value = ''
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
    errorMsg.value = ''
    successMsg.value = ''
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const handleImport = async () => {
  if (!selectedFile.value) return
  
  isProcessing.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const parsedData = await processImportFile(selectedFile.value, { mode: importMode.value, jenisPppk: jenisPppk.value })
    
    // Save to firebase
    const finalData = await saveImportedData(parsedData, importMode.value, pegawaiStore.pppkData)
    
    // Update local store
    pegawaiStore.pppkData = finalData
    
    successMsg.value = `Berhasil mengimpor ${parsedData.length} data pegawai.`
    setTimeout(() => {
      emit('imported')
      close()
    }, 1500)
    
  } catch (error) {
    console.error("Import error", error)
    errorMsg.value = error.message || 'Gagal memproses file. Pastikan format sudah benar.'
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
/* Inherited from styles.css */
</style>
