<template>
  <div class="modal-backdrop open" v-if="show" @click.self="close">
    <div class="modal-container" style="max-width: 560px;">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="modal-header-icon" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(45, 122, 241, 0.12); color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 1.15rem;">
            <i class="fa-solid fa-file-import"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-dark);">Impor Data Pegawai</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Unggah berkas profil PPPK format CSV atau Excel (.xlsx/.xls)</p>
          </div>
        </div>
        <button class="close-btn" @click="close" aria-label="Tutup">&times;</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="padding: 20px 24px; max-height: 75vh; overflow-y: auto;">
        <!-- 1. Dropzone -->
        <div 
          class="import-dropzone" 
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :style="{
            border: isDragging ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
            backgroundColor: isDragging ? 'rgba(45, 122, 241, 0.05)' : 'var(--bg-secondary)',
            padding: '1.6rem 1rem',
            textAlign: 'center',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }"
        >
          <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2.2rem; color: var(--primary-color); margin-bottom: 8px; display: inline-block;"></i>
          <p style="margin: 0; font-weight: 600; font-size: 0.9rem; color: var(--text-dark);">Tarik file kemari atau klik untuk memilih</p>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-top: 4px;">Mendukung berkas format .xlsx, .xls, atau .csv</span>
          <input type="file" ref="fileInput" accept=".csv,.xlsx,.xls" style="display: none;" @change="handleFileSelect">
        </div>

        <!-- File selected pill -->
        <div v-if="selectedFile" class="file-details" style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding: 10px 14px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-file-excel" style="color: #27ae60; font-size: 1.6rem;"></i>
            <div>
              <strong style="display: block; font-size: 13px; color: var(--text-dark);">{{ selectedFile.name }}</strong>
              <span style="font-size: 11px; color: var(--text-muted);">{{ formatBytes(selectedFile.size) }}</span>
            </div>
          </div>
          <button @click="clearFile" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 12px;" title="Ganti Berkas">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- 2. Jenis PPPK Options -->
        <div class="form-group" style="margin-top: 18px; margin-bottom: 16px;">
          <label style="font-weight: 700; margin-bottom: 8px; display: block; font-size: 0.85rem; color: var(--text-dark);">
            <i class="fa-solid fa-tag" style="color: var(--primary-color); margin-right: 6px;"></i>
            Jenis PPPK yang Diimpor:
          </label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div 
              class="import-type-card" 
              :class="{ active: jenisPppk === 'PPPK' }" 
              @click="jenisPppk = 'PPPK'"
            >
              <div class="card-radio-icon"><i class="fa-solid fa-user-tie"></i></div>
              <div class="card-radio-info">
                <strong>PPPK (Reguler)</strong>
                <span>Masa kontrak 5 tahun</span>
              </div>
            </div>

            <div 
              class="import-type-card" 
              :class="{ active: jenisPppk === 'PPPK Paruh Waktu' }" 
              @click="jenisPppk = 'PPPK Paruh Waktu'"
            >
              <div class="card-radio-icon"><i class="fa-solid fa-user-clock"></i></div>
              <div class="card-radio-info">
                <strong>Paruh Waktu</strong>
                <span>Masa kontrak 1 tahun</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Metode Impor Options -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-weight: 700; margin-bottom: 8px; display: block; font-size: 0.85rem; color: var(--text-dark);">
            <i class="fa-solid fa-sliders" style="color: var(--primary-color); margin-right: 6px;"></i>
            Metode Penggabungan Data:
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div 
              class="import-method-card" 
              :class="{ active: importMode === 'append' }" 
              @click="importMode = 'append'"
            >
              <div class="method-icon"><i class="fa-solid fa-object-group"></i></div>
              <div class="method-info">
                <strong>Tambah & Gabungkan Data (Disarankan)</strong>
                <p>NIP yang cocok akan diperbarui datanya, sedangkan NIP baru akan ditambahkan ke database tanpa menghapus pegawai yang sudah ada.</p>
              </div>
            </div>

            <div 
              class="import-method-card" 
              :class="{ active: importMode === 'overwrite' }" 
              @click="importMode = 'overwrite'"
            >
              <div class="method-icon danger-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <div class="method-info">
                <strong>Tulis Ulang & Timpa Seluruh Data</strong>
                <p>Menghapus seluruh data pegawai yang ada di database saat ini dan menggantinya dengan data baru dari file Excel.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Alerts -->
        <div v-if="errorMsg" class="alert alert-danger" style="font-size: 12px; margin-top: 14px; padding: 10px; border-radius: 6px; background-color: #f8d7da; color: #721c24;">
          <i class="fa-solid fa-circle-exclamation" style="margin-right: 4px;"></i> {{ errorMsg }}
        </div>
        
        <div v-if="successMsg" class="alert alert-success" style="font-size: 12px; margin-top: 14px; padding: 10px; border-radius: 6px; background-color: #d4edda; color: #155724;">
          <i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> {{ successMsg }}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px;">
        <button class="btn btn-outline" @click="close" :disabled="isProcessing">Batal</button>
        <button 
          class="btn btn-primary" 
          @click="handleImport" 
          :disabled="!selectedFile || isProcessing"
        >
          <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i>
          <i v-else class="fa-solid fa-cloud-arrow-up" style="margin-right: 6px;"></i>
          <span>{{ isProcessing ? 'Memproses Berkas...' : 'Proses Impor Data' }}</span>
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
    
    successMsg.value = `Berhasil mengimpor ${parsedData.length} data pegawai ke database!`
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
.import-type-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.import-type-card:hover {
  border-color: var(--primary-color);
  background: rgba(45, 122, 241, 0.04);
}
.import-type-card.active {
  border-color: var(--primary-color);
  background: rgba(45, 122, 241, 0.08);
}
.card-radio-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 0.95rem;
}
.card-radio-info strong {
  display: block;
  font-size: 0.82rem;
  color: var(--text-dark);
}
.card-radio-info span {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.import-method-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.import-method-card:hover {
  border-color: var(--primary-color);
  background: rgba(45, 122, 241, 0.04);
}
.import-method-card.active {
  border-color: var(--primary-color);
  background: rgba(45, 122, 241, 0.08);
}
.method-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 0.95rem;
  margin-top: 2px;
}
.method-icon.danger-icon {
  color: #f59e0b;
}
.method-info strong {
  display: block;
  font-size: 0.82rem;
  color: var(--text-dark);
}
.method-info p {
  margin: 2px 0 0 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
