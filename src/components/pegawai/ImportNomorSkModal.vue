<template>
  <div class="modal-backdrop open" v-if="show" @click.self="close">
    <div class="modal-container" style="max-width: 680px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="modal-header-icon" style="width: 36px; height: 36px; border-radius: 8px; background: rgba(245, 158, 11, 0.15); color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            <i class="fa-solid fa-file-shield"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700;">Impor Nomor SK Massal</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Perbarui nomor Surat Keputusan (SK) dan tanggal penetapan secara kolektif via berkas Excel</p>
          </div>
        </div>
        <button class="close-btn" @click="close" aria-label="Tutup">&times;</button>
      </div>

      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 20px;">
        <!-- Target Periode SK Selection -->
        <div class="target-period-card" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 16px; margin-bottom: 18px;">
          <label style="font-weight: 700; font-size: 0.88rem; display: block; margin-bottom: 8px; color: var(--text-dark);">
            <i class="fa-solid fa-bullseye" style="color: #d97706; margin-right: 6px;"></i>
            Pilih Target Periode SK:
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label class="radio-label" :class="{ 'radio-selected': targetMode === 'auto' }">
              <input type="radio" v-model="targetMode" value="auto" @change="reparseIfFileLoaded">
              <div>
                <strong>Otomatis Sesuai Status Aktif Pegawai (Rekomendasi)</strong>
                <p class="text-muted" style="margin: 2px 0 0 0; font-size: 0.78rem;">
                  Sistem mengecek data masing-masing pegawai: jika belum diperpanjang masuk SK Pertama, jika sudah diperpanjang masuk periode aktifnya.
                </p>
              </div>
            </label>

            <label class="radio-label" :class="{ 'radio-selected': targetMode === 'initial' }">
              <input type="radio" v-model="targetMode" value="initial" @change="reparseIfFileLoaded">
              <div>
                <strong>Khusus SK Pertama (Awal)</strong>
                <p class="text-muted" style="margin: 2px 0 0 0; font-size: 0.78rem;">
                  Mengisi nomor SK awal yang masih kosong di database (TMT CPNS/PPPK pertama).
                </p>
              </div>
            </label>

            <label class="radio-label" :class="{ 'radio-selected': targetMode === 'extension' }">
              <input type="radio" v-model="targetMode" value="extension" @change="reparseIfFileLoaded">
              <div>
                <strong>Khusus SK Perpanjangan Baru</strong>
                <p class="text-muted" style="margin: 2px 0 0 0; font-size: 0.78rem;">
                  Mengisi nomor SK baru untuk pegawai yang baru saja diproses perpanjangannya.
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Notice Format Baku -->
        <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #d97706; padding: 9px 13px; border-radius: 6px; font-size: 0.8rem; color: var(--text-dark); margin-bottom: 14px;">
          <div style="font-weight: 700; color: #b45309; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <i class="fa-solid fa-circle-info"></i> Format Nomor SK: 800.1.2.5/[Nomor]/BKPSDM
          </div>
          <p style="margin: 0; font-size: 0.76rem; color: var(--text-muted); line-height: 1.4;">
            Pada berkas Excel cukup masukkan <strong>nomor intinya saja</strong> (misal: <code>19</code> atau <code>27</code>), atau format lengkap. Sistem akan otomatis menyelaraskannya pada dokumen SK dan halaman verifikasi.
          </p>
        </div>

        <!-- Template Download Banner -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #2563eb;">
            <i class="fa-solid fa-circle-question"></i>
            <span>Butuh contoh format berkas Excel?</span>
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
            border: isDragging ? '2px dashed #d97706' : '2px dashed var(--border-color)',
            backgroundColor: isDragging ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-secondary)',
            padding: '1.6rem 1rem',
            textAlign: 'center',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }"
        >
          <input 
            type="file" 
            ref="fileInputRef" 
            accept=".xlsx, .xls, .csv" 
            style="display: none" 
            @change="handleFileSelected"
          >
          <div style="color: #d97706; font-size: 2.2rem; margin-bottom: 8px;">
            <i class="fa-solid fa-file-excel"></i>
          </div>
          <p style="margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-dark);">
            {{ selectedFile ? selectedFile.name : 'Pilih atau seret berkas Excel di sini' }}
          </p>
          <p class="text-muted" style="margin: 4px 0 0 0; font-size: 0.78rem;">
            Mendukung format .xlsx, .xls, atau .csv (kolom wajib: NIP dan NOMOR SK)
          </p>
        </div>

        <!-- Parsing Status / Loading -->
        <div v-if="isParsing" style="text-align: center; padding: 20px 0;">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #d97706;"></i>
          <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);">Membaca dan mencocokkan data NIP...</p>
        </div>

        <!-- Parse Result Summary -->
        <div v-if="parseResult && !isParsing" style="margin-top: 18px;">
          <!-- Statistik Ringkas -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
            <div style="background: var(--bg-secondary); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--text-dark);">{{ parseResult.totalRows }}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Total Baris Excel</div>
            </div>
            <div style="background: rgba(30, 170, 110, 0.1); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid rgba(30, 170, 110, 0.3);">
              <div style="font-size: 1.3rem; font-weight: 700; color: #1eaa6e;">{{ parseResult.matchedCount }}</div>
              <div style="font-size: 0.75rem; color: #1eaa6e; font-weight: 600;">Cocok di Database</div>
            </div>
            <div style="background: rgba(239, 68, 68, 0.08); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.25);">
              <div style="font-size: 1.3rem; font-weight: 700; color: #ef4444;">{{ parseResult.unmatchedCount }}</div>
              <div style="font-size: 0.75rem; color: #ef4444; font-weight: 600;">Tidak Ditemukan</div>
            </div>
          </div>

          <!-- Pratinjau Baris yang Cocok -->
          <div v-if="parseResult.previewRows.length > 0" style="margin-bottom: 14px;">
            <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-dark);">
              <i class="fa-solid fa-eye" style="margin-right: 5px; color: #d97706;"></i>
              Pratinjau Data yang Akan Diperbarui (5 Baris Pertama):
            </div>
            <div class="table-responsive" style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px;">
              <table class="table" style="font-size: 0.78rem; margin: 0;">
                <thead style="background: var(--bg-secondary); position: sticky; top: 0;">
                  <tr>
                    <th>NIP</th>
                    <th>Nama Pegawai</th>
                    <th>Target Periode</th>
                    <th>Nomor SK Baru</th>
                    <th>Tanggal SK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in parseResult.previewRows" :key="r.nip">
                    <td><code>{{ r.nip }}</code></td>
                    <td>{{ r.nama }}</td>
                    <td><span class="badge" style="background: rgba(59, 130, 246, 0.1); color: #2563eb; font-size: 0.72rem;">{{ r.periode }}</span></td>
                    <td><strong style="color: #b45309;">800.1.2.5/{{ r.nomorSk }}/BKPSDM</strong></td>
                    <td>{{ r.tanggalSk }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Peringatan NIP tidak ditemukan -->
          <div v-if="parseResult.unmatchedCount > 0" style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; font-size: 0.78rem;">
            <div style="font-weight: 600; color: #dc2626; margin-bottom: 4px;">
              <i class="fa-solid fa-triangle-exclamation"></i>
              {{ parseResult.unmatchedCount }} NIP pada berkas tidak ditemukan di database dan akan dilewati:
            </div>
            <div style="color: var(--text-muted); line-height: 1.4;">
              {{ parseResult.unmatchedList.map(u => u.nip).join(', ') }}
              <span v-if="parseResult.unmatchedCount > parseResult.unmatchedList.length">, dan lainnya...</span>
            </div>
          </div>
        </div>

        <!-- Alert Error -->
        <div v-if="errorMsg" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 6px; padding: 10px 14px; color: #dc2626; font-size: 0.83rem; margin-top: 14px;">
          <i class="fa-solid fa-circle-exclamation" style="margin-right: 6px;"></i>
          {{ errorMsg }}
        </div>

        <!-- Alert Success -->
        <div v-if="successMsg" style="background: rgba(30, 170, 110, 0.1); border: 1px solid #1eaa6e; border-radius: 6px; padding: 10px 14px; color: #1eaa6e; font-size: 0.83rem; margin-top: 14px;">
          <i class="fa-solid fa-circle-check" style="margin-right: 6px;"></i>
          {{ successMsg }}
        </div>
      </div>

      <div class="modal-footer" style="padding: 14px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-outline" @click="close" :disabled="isSaving">
          Batal
        </button>
        <button 
          type="button" 
          class="btn btn-primary" 
          style="background-color: #d97706; border-color: #d97706; color: white;"
          @click="handleSave"
          :disabled="!parseResult || parseResult.matchedCount === 0 || isSaving || isParsing"
        >
          <i v-if="isSaving" class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i>
          <i v-else class="fa-solid fa-floppy-disk" style="margin-right: 6px;"></i>
          <span>{{ isSaving ? 'Menyimpan ke Database...' : `Simpan ${parseResult ? parseResult.matchedCount : ''} Nomor SK` }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePegawaiStore } from '../../stores/pegawaiStore'
import { processImportNomorSk, downloadTemplateNomorSk } from '../../utils/exportImport'
import { customSwal } from '../../utils/swal'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'saved'])

const pegawaiStore = usePegawaiStore()

const targetMode = ref('auto')
const selectedFile = ref(null)
const fileInputRef = ref(null)
const isDragging = ref(false)
const isParsing = ref(false)
const isSaving = ref(false)
const parseResult = ref(null)
const errorMsg = ref('')
const successMsg = ref('')

const close = () => {
  if (isSaving.value) return
  selectedFile.value = null
  parseResult.value = null
  errorMsg.value = ''
  successMsg.value = ''
  emit('close')
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

const handleFileSelected = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const handleDownloadTemplate = () => {
  downloadTemplateNomorSk()
}

const reparseIfFileLoaded = () => {
  if (selectedFile.value) {
    parseFile(selectedFile.value)
  }
}

const parseFile = async (file) => {
  isParsing.value = true
  errorMsg.value = ''
  successMsg.value = ''
  parseResult.value = null

  try {
    const result = await processImportNomorSk(file, targetMode.value, pegawaiStore.pppkData)
    parseResult.value = result

    if (result.matchedCount === 0) {
      errorMsg.value = `Tidak ada NIP pada berkas yang cocok dengan database (${result.totalRows} baris diperiksa). Pastikan NIP sesuai.`
    }
  } catch (err) {
    console.error('Error parsing Excel nomor SK:', err)
    errorMsg.value = err.message || 'Gagal membaca berkas Excel. Pastikan format kolom NIP dan NOMOR SK sudah benar.'
  } finally {
    isParsing.value = false
  }
}

const handleSave = async () => {
  if (!parseResult.value || parseResult.value.matchedCount === 0) return

  isSaving.value = true
  errorMsg.value = ''

  try {
    pegawaiStore.pppkData = parseResult.value.updatedData
    await pegawaiStore.saveAllPegawai()

    successMsg.value = `Berhasil memperbarui nomor SK untuk ${parseResult.value.matchedCount} pegawai!`
    setTimeout(() => {
      emit('saved')
      close()
    }, 1500)
  } catch (err) {
    console.error('Failed to save imported SK numbers:', err)
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
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.35);
}
.radio-label input[type="radio"] {
  margin-top: 3px;
  accent-color: #d97706;
}
</style>
