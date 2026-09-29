<template>
  <div v-if="isOpen" class="modal-backdrop open" style="z-index: 2000;">
    <div class="modal-container responsive-modal">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="modal-header-icon" style="width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; background: rgba(37, 99, 235, 0.12); color: #2563eb;">
            <i class="fa-solid fa-file-contract"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-dark);">
              Unduh Perjanjian Kerja
            </h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
              {{ items.length === 1 ? 'Generate dan unduh dokumen perjanjian kerja PPPK' : `Generate dokumen serentak untuk ${items.length} pegawai terpilih` }}
            </p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <!-- Info pegawai -->
        <div v-if="items.length === 1" style="background: var(--bg-secondary, rgba(0,0,0,0.05)); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <i class="fa-solid fa-user-circle" style="font-size: 1.8rem; color: var(--primary-color); opacity: 0.7;"></i>
          <div>
            <div style="font-weight: bold; font-size: 1rem;">{{ getNamaLengkap(items[0], true) }}</div>
            <div class="text-muted" style="font-size: 0.85rem;">{{ items[0]['JABATAN NAMA'] }} · {{ items[0]['NIP BARU'] }}</div>
          </div>
        </div>
        <div v-else style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 10px; padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <i class="fa-solid fa-users" style="font-size: 1.5rem; color: #2563eb;"></i>
          <div>
            <div style="font-weight: bold;">{{ items.length }} Pegawai Terpilih</div>
            <div class="text-muted" style="font-size: 0.85rem;">Dokumen akan diunduh dalam format <strong>.zip</strong> atau <strong>.docx</strong> gabungan</div>
          </div>
        </div>

        <!-- Mode Ekspor (Hanya untuk lebih dari 1 pegawai) -->
        <div v-if="items.length > 1" class="form-group" style="margin-bottom: 18px;">
          <label style="font-weight: bold; margin-bottom: 10px; display: block;">Format Output (Batch)</label>
          <div class="options-container">
            <label class="paper-option" :class="{ active: exportFormat === 'merged', disabled: documentPart === 'pisah' }" @click="documentPart !== 'pisah' && (exportFormat = 'merged')">
              <i class="fa-solid fa-file-word"></i>
              <span>1 File Gabungan</span>
              <small class="text-muted" style="font-size:11px">Semua pegawai dalam 1 docx</small>
            </label>
            <label class="paper-option" :class="{ active: exportFormat === 'zip' }" @click="exportFormat = 'zip'">
              <i class="fa-solid fa-file-zipper"></i>
              <span>File Terpisah (ZIP)</span>
              <small class="text-muted" style="font-size:11px">Tiap pegawai 1 docx terpisah</small>
            </label>
          </div>
        </div>

        <!-- Bagian Dokumen yang Diunduh -->
        <div class="form-group" style="margin-bottom: 18px;">
          <label style="font-weight: bold; margin-bottom: 10px; display: block;">Bagian Dokumen (Isi)</label>
          
          <div class="grid-options">
            <label class="paper-option small-opt" :class="{ active: documentPart === 'full' }" @click="documentPart = 'full'">
              <i class="fa-solid fa-file-contract"></i>
              <div class="opt-text">
                <span>Kontrak Utuh</span>
                <small class="text-muted">Semua Halaman</small>
              </div>
            </label>
            <label class="paper-option small-opt" :class="{ active: documentPart === 'perjanjian' }" @click="documentPart = 'perjanjian'">
              <i class="fa-solid fa-file-lines"></i>
              <div class="opt-text">
                <span>Isi Perjanjian</span>
                <small class="text-muted">Hanya teks kontrak</small>
              </div>
            </label>
            <label class="paper-option small-opt" :class="{ active: documentPart === 'tandatangan' }" @click="documentPart = 'tandatangan'">
              <i class="fa-solid fa-signature"></i>
              <div class="opt-text">
                <span>Tanda Tangan</span>
                <small class="text-muted">Hanya hlmn penutup</small>
              </div>
            </label>
            <label class="paper-option small-opt" :class="{ active: documentPart === 'pisah' }" @click="documentPart = 'pisah'">
              <i class="fa-solid fa-file-export"></i>
              <div class="opt-text">
                <span>Pisah 2 File</span>
                <small class="text-muted">Isi & TTD terpisah</small>
              </div>
            </label>
          </div>

          <div v-if="documentPart !== 'full'" style="margin-top: 8px; font-size: 0.82rem; color: #2563eb; background: rgba(37,99,235,0.08); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(37,99,235,0.2);">
            <i class="fa-solid fa-circle-info"></i> Pastikan template sudah diisi tag <strong v-pre>{{#perjanjian}}</strong> & <strong v-pre>{{#tandatangan}}</strong>.
          </div>
        </div>

        <!-- Tanggal Penandatanganan Kontrak -->
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-weight: bold; margin-bottom: 8px; display: block;">
            <i class="fa-solid fa-calendar-day" style="color: #2563eb; margin-right: 6px;"></i>
            Tanggal Penandatanganan Kontrak
          </label>

          <input
            type="date"
            v-model="tanggalKontrakStr"
            class="form-control"
            style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid var(--border-color); font-size: 0.95rem; background: var(--bg-primary, #fff); color: var(--text-primary);"
          />
          <div v-if="tanggalKontrakStr" style="margin-top: 6px; font-size: 0.82rem; color: var(--text-muted);">
            <i class="fa-solid fa-circle-info"></i>
            Akan mengisi: <strong>{{KONTRAK_HARI}}</strong>, <strong>{{KONTRAK_TANGGAL_TERBILANG}}</strong>
            <strong>{{KONTRAK_BULAN}}</strong> <strong>{{KONTRAK_TAHUN_TERBILANG}}</strong> di dokumen
          </div>
          <div v-else style="margin-top: 6px; font-size: 0.82rem; color: #f59e0b;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Tanggal belum dipilih — kolom tanggal kontrak di dokumen akan kosong
          </div>
        </div>

        <!-- Progress -->
        <div v-if="isGenerating" style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
            <span>Membuat dokumen...</span>
            <span>{{ progress }}/{{ items.length }}</span>
          </div>
          <div style="background: var(--border-color); border-radius: 999px; height: 8px; overflow: hidden;">
            <div style="height: 100%; background: var(--primary-color); border-radius: 999px; transition: width 0.3s ease;" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>

        <div v-if="errorMsg" style="margin-top: 16px; color: #ef4444; background: rgba(239,68,68,0.1); padding: 10px 14px; border-radius: 8px; font-size: 13px; border: 1px solid rgba(239,68,68,0.3);">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ errorMsg }}
        </div>
      </div>
      <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
        <button class="btn btn-outline" @click="emit('close')" :disabled="isGenerating || isSavingToDrive">Batal</button>
        <button class="btn btn-primary" @click="handleDownload" :disabled="isGenerating || isSavingToDrive" style="background-color: #2563eb;">
          <i v-if="isGenerating" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-download"></i>
          {{ (items.length > 1 && exportFormat === 'zip') || documentPart === 'pisah' ? 'Unduh ZIP' : 'Unduh Word' }}
        </button>

        <button
          v-if="driveStore.isConnected"
          class="btn btn-primary"
          @click="handleSaveToDrive"
          :disabled="isGenerating || isSavingToDrive"
          style="background-color: #1eaa6e; border-color: #1eaa6e; color: white;"
          title="Simpan langsung ke Google Drive"
        >
          <i v-if="isSavingToDrive" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-brands fa-google-drive"></i>
          {{ isSavingToDrive ? `Menyimpan ${progress}/${items.length}...` : 'Simpan ke Drive' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { downloadSingleContract, downloadBatchContracts } from '../../utils/docxGenerator'
import { getNamaLengkap } from '../../utils/pppkLogic'
import { useDriveStore } from '../../stores/driveStore'
import { useGoogleDrive } from '../../composables/useGoogleDrive'
import { useDriveSync } from '../../composables/useDriveSync'
import { customSwal } from '../../utils/swal'

const driveStore = useDriveStore()
const { getTargetFolder, upsertFile } = useGoogleDrive()
const { getFileName, getUnorInduk } = useDriveSync()
const isSavingToDrive = ref(false)

onMounted(async () => {
  if (driveStore.isConnected && !driveStore.settings.folderId) {
    await driveStore.loadSettings()
  }
})

const props = defineProps({
  isOpen: Boolean,
  items: { type: Array, default: () => [] }
})
const emit = defineEmits(['close', 'success'])

const selectedPaper = ref('f4')
const exportFormat = ref('merged') // 'merged' | 'zip'
const documentPart = ref('full') // 'full' | 'perjanjian' | 'tandatangan' | 'pisah'

const isGenerating = ref(false)
const errorMsg = ref('')
const progress = ref(0)
const tanggalKontrakStr = ref('') // format YYYY-MM-DD dari input type="date"

const progressPct = computed(() => props.items.length > 0 ? Math.round((progress.value / props.items.length) * 100) : 0)

watch(documentPart, (newVal) => {
  if (newVal === 'pisah') {
    exportFormat.value = 'zip'
  }
})

watch(() => props.isOpen, (v) => {
  if (v) {
    errorMsg.value = ''
    progress.value = 0
    isGenerating.value = false
    if (props.items.length === 1 && exportFormat.value === 'merged') {
      exportFormat.value = 'zip'
    } else if (props.items.length > 1 && documentPart.value !== 'pisah') {
      exportFormat.value = 'merged'
    }
  }
})

function parseDateInput(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const handleDownload = async () => {
  isGenerating.value = true
  errorMsg.value = ''
  progress.value = 0

  try {
    const tanggalKontrak = parseDateInput(tanggalKontrakStr.value)
    if (props.items.length === 1) {
      await downloadSingleContract(props.items[0], selectedPaper.value, tanggalKontrak, documentPart.value)
    } else {
      await downloadBatchContracts(props.items, selectedPaper.value, (done) => {
        progress.value = done
      }, tanggalKontrak, exportFormat.value, documentPart.value)
    }
    emit('success')
    emit('close')
  } catch (e) {
    console.error('Download error:', e)
    errorMsg.value = e.message || 'Gagal membuat dokumen. Pastikan template sudah diunggah di menu Pengaturan.'
  } finally {
    isGenerating.value = false
  }
}

const handleSaveToDrive = async () => {
  isSavingToDrive.value = true
  errorMsg.value = ''
  progress.value = 0
  const tanggalKontrak = parseDateInput(tanggalKontrakStr.value)

  try {
    for (let i = 0; i < props.items.length; i++) {
      const item = props.items[i]
      progress.value = i + 1
      const unorInduk = getUnorInduk(item)

      const result = await downloadSingleContract(item, selectedPaper.value, tanggalKontrak, documentPart.value, { returnBlob: true })
      if (documentPart.value === 'pisah') {
        const pFolder = await getTargetFolder('perjanjian', unorInduk, 'individual')
        const tFolder = await getTargetFolder('tandatangan', unorInduk, 'individual')
        await upsertFile(result.perjanjianBlob, getFileName(item, '_perjanjian'), pFolder)
        await upsertFile(result.tandatanganBlob, getFileName(item, '_tandatangan'), tFolder)
      } else {
        const targetFolder = await getTargetFolder(documentPart.value, unorInduk, 'individual')
        const blobToUpload = documentPart.value === 'perjanjian' ? result.perjanjianBlob :
                             documentPart.value === 'tandatangan' ? result.tandatanganBlob :
                             result.fullBlob
        await upsertFile(blobToUpload, getFileName(item), targetFolder)
      }
    }
    customSwal.fire({
      icon: 'success',
      title: 'Tersimpan ke Drive!',
      text: `${props.items.length} dokumen berhasil disimpan ke Google Drive.`,
      timer: 2000,
      showConfirmButton: false
    })
    emit('success')
    emit('close')
  } catch (e) {
    console.error('Drive save error:', e)
    errorMsg.value = e.message || 'Gagal menyimpan ke Google Drive.'
  } finally {
    isSavingToDrive.value = false
  }
}

const KONTRAK_HARI = computed(() => {
  const d = parseDateInput(tanggalKontrakStr.value)
  if (!d) return ''
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  return days[d.getDay()]
})

const KONTRAK_TANGGAL_TERBILANG = computed(() => {
  const d = parseDateInput(tanggalKontrakStr.value)
  if (!d) return ''
  return angkaKeTerbilang(d.getDate()).toUpperCase()
})

const KONTRAK_BULAN = computed(() => {
  const d = parseDateInput(tanggalKontrakStr.value)
  if (!d) return ''
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
                  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER']
  return months[d.getMonth()]
})

const KONTRAK_TAHUN_TERBILANG = computed(() => {
  const d = parseDateInput(tanggalKontrakStr.value)
  if (!d) return ''
  return angkaKeTerbilang(d.getFullYear()).toUpperCase()
})

function angkaKeTerbilang(nilai) {
  const bilangan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']
  nilai = Math.floor(Math.abs(nilai))
  if (nilai < 12) return bilangan[nilai]
  if (nilai < 20) return angkaKeTerbilang(nilai - 10) + ' belas'
  if (nilai < 100) return angkaKeTerbilang(Math.floor(nilai / 10)) + ' puluh' + (nilai % 10 !== 0 ? ' ' + bilangan[nilai % 10] : '')
  if (nilai < 200) return 'seratus' + (nilai % 100 !== 0 ? ' ' + angkaKeTerbilang(nilai % 100) : '')
  if (nilai < 1000) return angkaKeTerbilang(Math.floor(nilai / 100)) + ' ratus' + (nilai % 100 !== 0 ? ' ' + angkaKeTerbilang(nilai % 100) : '')
  if (nilai < 2000) return 'seribu' + (nilai % 1000 !== 0 ? ' ' + angkaKeTerbilang(nilai % 1000) : '')
  if (nilai < 1000000) return angkaKeTerbilang(Math.floor(nilai / 1000)) + ' ribu' + (nilai % 1000 !== 0 ? ' ' + angkaKeTerbilang(nilai % 1000) : '')
  if (nilai < 1000000000) return angkaKeTerbilang(Math.floor(nilai / 1000000)) + ' juta' + (nilai % 1000000 !== 0 ? ' ' + angkaKeTerbilang(nilai % 1000000) : '')
  return String(nilai)
}
</script>

<style scoped>
.responsive-modal {
  max-width: 580px;
  width: 95%;
}

.options-container {
  display: flex;
  gap: 12px;
}

.paper-option {
  flex: 1;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  background: var(--bg-primary, #fff);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.paper-option i {
  font-size: 1.35rem;
  color: var(--text-muted);
  transition: all 0.2s;
}

.paper-option span {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.paper-option:hover:not(.disabled) {
  border-color: var(--primary-color);
  background: rgba(16, 185, 129, 0.04);
}

.paper-option.active {
  border-color: var(--primary-color);
  background: rgba(16, 185, 129, 0.08);
}

.paper-option.active i {
  color: var(--primary-color);
}

.paper-option.active span {
  color: var(--primary-color);
}

.paper-option.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: var(--bg-secondary);
}

.grid-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.paper-option.small-opt {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 14px;
  gap: 12px;
  text-align: left;
}

.paper-option.small-opt i {
  font-size: 1.2rem;
}

.opt-text {
  display: flex;
  flex-direction: column;
}

.opt-text span {
  font-size: 0.85rem;
  line-height: 1.2;
}

.opt-text small {
  font-size: 0.72rem;
  margin-top: 2px;
}
</style>
