<template>
  <div class="modal-backdrop open" v-if="show" @click.self="close">
    <div class="modal-container" style="max-width: 680px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="modal-header-icon" style="width: 36px; height: 36px; border-radius: 8px; background: rgba(30, 170, 110, 0.12); color: #1eaa6e; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid fa-file-contract"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700;">Impor Nomor Kontrak Massal</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Perbarui nomor kontrak pegawai secara kolektif via berkas Excel</p>
          </div>
        </div>
        <button class="close-btn" @click="close" aria-label="Tutup">&times;</button>
      </div>

      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 20px;">
        <!-- Target Periode Kontrak Selection -->
        <div class="target-period-card" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 16px; margin-bottom: 18px;">
          <label style="font-weight: 700; font-size: 0.88rem; display: block; margin-bottom: 8px; color: var(--text-dark);">
            <i class="fa-solid fa-bullseye" style="color: var(--primary-color); margin-right: 6px;"></i>
            Pilih Target Periode Kontrak:
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label class="radio-label" :class="{ 'radio-selected': targetMode === 'auto' }">
              <input type="radio" v-model="targetMode" value="auto" @change="reparseIfFileLoaded">
              <div>
                <strong>Otomatis Sesuai Status Aktif Pegawai (Rekomendasi)</strong>
                <p class="text-muted" style="margin: 2px 0 0 0; font-size: 0.78rem;">
                  Sistem mengecek data masing-masing pegawai: jika belum diperpanjang masuk Kontrak Pertama, jika sudah diperpanjang masuk periode aktifnya.
                </p>
              </div>
            </label>

            <label class="radio-label" :class="{ 'radio-selected': targetMode === 'initial' }">
              <input type="radio" v-model="targetMode" value="initial" @change="reparseIfFileLoaded">
              <div>
                <strong>Khusus Kontrak Pertama (Awal)</strong>
                <p class="text-muted" style="margin: 2px 0 0 0; font-size: 0.78rem;">
                  Mengisi nomor kontrak awal yang masih kosong di database (TMT CPNS/PPPK pertama).
                </p>
              </div>
            </label>

            <label class="radio-label" :class="{ 'radio-selected': targetMode === 'extension' }">
              <input type="radio" v-model="targetMode" value="extension" @change="reparseIfFileLoaded">
              <div>
                <strong>Khusus Perpanjangan Kontrak Baru</strong>
                <p class="text-muted" style="margin: 2px 0 0 0; font-size: 0.78rem;">
                  Mengisi nomor kontrak baru untuk pegawai yang baru saja diproses perpanjangannya.
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Template Download Banner -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #2563eb;">
            <i class="fa-solid fa-circle-question"></i>
            <span>Butuh contoh format file Excel?</span>
          </div>
          <button 
            type="button" 
            class="btn btn-outline btn-sm" 
            style="padding: 4px 10px; font-size: 0.8rem; background: #fff; border-color: #93c5fd; color: #1d4ed8;"
            @click="handleDownloadTemplate"
          >
            <i class="fa-solid fa-file-arrow-down" style="margin-right: 4px;"></i>
            Unduh Format Contoh
          </button>
        </div>

        <!-- Dropzone -->
        <div 
          class="import-dropzone" 
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :style="{
            border: isDragging ? '2px dashed #1eaa6e' : '2px dashed var(--border-color)',
            backgroundColor: isDragging ? 'rgba(30, 170, 110, 0.06)' : 'var(--bg-secondary)',
            padding: '1.6rem 1rem',
            textAlign: 'center',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }"
        >
          <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2.2rem; color: #1eaa6e; margin-bottom: 8px; display: inline-block;"></i>
          <p style="margin: 0; font-weight: 600; font-size: 0.9rem; color: var(--text-dark);">Tarik file Excel/CSV kemari atau klik untuk memilih</p>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-top: 4px;">Mendukung format .xlsx, .xls, dan .csv (minimal kolom NIP dan NOMOR KONTRAK)</span>
          <input type="file" ref="fileInput" accept=".csv,.xlsx,.xls" style="display: none;" @change="handleFileSelect">
        </div>

        <!-- File selected box -->
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

        <!-- Parsing Status Spinner -->
        <div v-if="isParsing" style="text-align: center; padding: 20px 0; color: var(--text-muted); font-size: 0.88rem;">
          <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px; color: #1eaa6e;"></i>
          Memeriksa dan mencocokkan NIP dengan data database...
        </div>

        <!-- Parsing Results Preview -->
        <div v-if="parseResult && !isParsing" style="margin-top: 18px;">
          <!-- Metrics -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
            <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; text-align: center;">
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">TOTAL BARIS</span>
              <strong style="font-size: 1.2rem; color: var(--text-dark);">{{ parseResult.totalRows }}</strong>
            </div>
            <div style="background: rgba(30, 170, 110, 0.08); border: 1px solid rgba(30, 170, 110, 0.3); border-radius: 6px; padding: 10px; text-align: center;">
              <span style="font-size: 0.72rem; color: #1eaa6e; font-weight: 600; display: block;">NIP COCOK</span>
              <strong style="font-size: 1.2rem; color: #1eaa6e;">{{ parseResult.matchedCount }}</strong>
            </div>
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 10px; text-align: center;">
              <span style="font-size: 0.72rem; color: #ef4444; font-weight: 600; display: block;">TIDAK COCOK</span>
              <strong style="font-size: 1.2rem; color: #ef4444;">{{ parseResult.unmatchedCount }}</strong>
            </div>
          </div>

          <!-- Unmatched warning -->
          <div v-if="parseResult.unmatchedCount > 0" style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 4px; font-size: 0.78rem; color: #b45309; margin-bottom: 12px;">
            <i class="fa-solid fa-triangle-exclamation" style="margin-right: 4px;"></i>
            <strong>{{ parseResult.unmatchedCount }} NIP</strong> pada berkas tidak ditemukan dalam database saat ini dan akan dilewati.
            <span v-if="parseResult.unmatchedList.length > 0">
              Contoh: {{ parseResult.unmatchedList.slice(0, 3).map(u => u.nip).join(', ') }}
            </span>
          </div>

          <!-- Preview Table -->
          <div v-if="parseResult.previewRows.length > 0">
            <span style="font-weight: 600; font-size: 0.8rem; color: var(--text-dark); display: block; margin-bottom: 6px;">
              Contoh Pratinjau Pembaruan ({{ parseResult.previewRows.length }} Baris Pertama):
            </span>
            <div style="border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.76rem; text-align: left;">
                <thead style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                  <tr>
                    <th style="padding: 6px 10px; font-weight: 700;">NIP</th>
                    <th style="padding: 6px 10px; font-weight: 700;">NAMA PEGAWAI</th>
                    <th style="padding: 6px 10px; font-weight: 700;">PERIODE TARGET</th>
                    <th style="padding: 6px 10px; font-weight: 700;">NOMOR KONTRAK BARU</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(pRow, idx) in parseResult.previewRows" :key="idx" style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 6px 10px; font-family: monospace;">{{ pRow.nip }}</td>
                    <td style="padding: 6px 10px; font-weight: 600;">{{ pRow.nama }}</td>
                    <td style="padding: 6px 10px;">
                      <span style="background: rgba(45, 122, 241, 0.1); color: var(--primary-color); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
                        {{ pRow.periode }}
                      </span>
                    </td>
                    <td style="padding: 6px 10px; color: #1eaa6e; font-weight: 600;">{{ pRow.nomorKontrak }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Alert Error / Success -->
        <div v-if="errorMsg" class="alert alert-danger" style="font-size: 12px; margin-top: 14px; padding: 10px; border-radius: 4px; background-color: #f8d7da; color: #721c24;">
          <i class="fa-solid fa-circle-exclamation" style="margin-right: 4px;"></i> {{ errorMsg }}
        </div>
        
        <div v-if="successMsg" class="alert alert-success" style="font-size: 12px; margin-top: 14px; padding: 10px; border-radius: 4px; background-color: #d4edda; color: #155724;">
          <i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> {{ successMsg }}
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px;">
        <button class="btn btn-outline" @click="close" :disabled="isSaving">Batal</button>
        <button 
          class="btn btn-primary" 
          style="background-color: #1eaa6e; border-color: #1eaa6e; color: white;" 
          @click="handleApply" 
          :disabled="!parseResult || parseResult.matchedCount === 0 || isSaving"
        >
          <i v-if="isSaving" class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i>
          <i v-else class="fa-solid fa-floppy-disk" style="margin-right: 6px;"></i>
          {{ isSaving ? 'Menyimpan ke Cloud...' : `Terapkan (${parseResult?.matchedCount || 0} Pegawai)` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePegawaiStore } from '../../stores/pegawaiStore'
import { processImportNomorKontrak, downloadTemplateNomorKontrak } from '../../utils/exportImport'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'saved'])

const pegawaiStore = usePegawaiStore()

const targetMode = ref('auto')
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const isParsing = ref(false)
const isSaving = ref(false)
const parseResult = ref(null)
const errorMsg = ref('')
const successMsg = ref('')

const close = () => {
  if (isSaving.value) return
  clearFile()
  errorMsg.value = ''
  successMsg.value = ''
  emit('close')
}

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) handleProcessFile(file)
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) handleProcessFile(file)
}

const handleDownloadTemplate = () => {
  downloadTemplateNomorKontrak()
}

const clearFile = () => {
  selectedFile.value = null
  parseResult.value = null
  errorMsg.value = ''
  successMsg.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const handleProcessFile = async (file) => {
  selectedFile.value = file
  errorMsg.value = ''
  successMsg.value = ''
  isParsing.value = true
  parseResult.value = null

  try {
    const result = await processImportNomorKontrak(file, targetMode.value, pegawaiStore.pppkData)
    parseResult.value = result
    if (result.matchedCount === 0) {
      errorMsg.value = 'Tidak ada NIP pada berkas yang cocok dengan data pegawai di database.'
    }
  } catch (err) {
    console.error('Error processing contract number file:', err)
    errorMsg.value = err.message || 'Gagal memproses berkas Excel. Pastikan format berkas valid.'
  } finally {
    isParsing.value = false
  }
}

const reparseIfFileLoaded = () => {
  if (selectedFile.value) {
    handleProcessFile(selectedFile.value)
  }
}

const handleApply = async () => {
  if (!parseResult.value || parseResult.value.matchedCount === 0) return

  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Terapkan data yang sudah diperbarui ke store
    pegawaiStore.pppkData = parseResult.value.updatedData
    
    // Simpan ke Firestore
    await pegawaiStore.saveAllPegawai()

    successMsg.value = `Berhasil memperbarui nomor kontrak untuk ${parseResult.value.matchedCount} pegawai!`
    setTimeout(() => {
      emit('saved')
      close()
    }, 1500)
  } catch (err) {
    console.error('Failed to save imported contract numbers:', err)
    errorMsg.value = 'Terjadi kesalahan saat menyimpan ke database: ' + (err.message || err)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.radio-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}
.radio-label:hover {
  background: var(--bg-secondary);
}
.radio-label.radio-selected {
  background: rgba(30, 170, 110, 0.08);
  border-color: rgba(30, 170, 110, 0.35);
}
.radio-label input[type="radio"] {
  margin-top: 3px;
  accent-color: #1eaa6e;
}
</style>
