<template>
  <div v-if="isOpen" class="modal-backdrop open" style="z-index: 2000;">
    <div class="modal-container responsive-modal">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="modal-header-icon" style="width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; background: rgba(245, 158, 11, 0.15); color: #d97706;">
            <i class="fa-solid fa-file-shield"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-dark);">
              Unduh Surat Keputusan (SK)
            </h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
              {{ items.length === 1 ? 'Generate dan unduh dokumen Surat Keputusan (SK) PPPK resmi' : `Generate SK serentak untuk ${items.length} pegawai terpilih` }}
            </p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="modal-body">
        <!-- Info Pegawai -->
        <div v-if="items.length === 1" style="background: var(--bg-secondary, rgba(0,0,0,0.05)); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <i class="fa-solid fa-user-circle" style="font-size: 1.8rem; color: #d97706; opacity: 0.85;"></i>
          <div>
            <div style="font-weight: bold; font-size: 1rem;">{{ getNamaLengkap(items[0], true) }}</div>
            <div class="text-muted" style="font-size: 0.85rem;">{{ items[0]['JABATAN NAMA'] || items[0]['JABATAN'] }} · {{ items[0]['NIP BARU'] || items[0]['NIP'] }}</div>
          </div>
        </div>
        <div v-else style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <i class="fa-solid fa-users" style="font-size: 1.5rem; color: #d97706;"></i>
          <div>
            <div style="font-weight: bold;">{{ items.length }} Pegawai Terpilih</div>
            <div class="text-muted" style="font-size: 0.85rem;">Dokumen SK akan diunduh dalam format <strong>.zip</strong></div>
          </div>
        </div>

        <!-- Opsi Barcode / QR Code SK -->
        <div class="form-group" style="margin-bottom: 18px;">
          <label style="font-weight: bold; margin-bottom: 10px; display: block;">
            <i class="fa-solid fa-qrcode" style="color: #d97706; margin-right: 6px;"></i>
            Isian Barcode / QR Code SK
          </label>
          <div class="options-container">
            <label class="paper-option" :class="{ active: qrMode === 'url' }" @click="qrMode = 'url'">
              <i class="fa-solid fa-link"></i>
              <span>URL Verifikasi Publik</span>
              <small class="text-muted" style="font-size:11px">Scan membuka sertifikat keaslian</small>
            </label>
            <label class="paper-option" :class="{ active: qrMode === 'nip' }" @click="qrMode = 'nip'">
              <i class="fa-solid fa-id-card"></i>
              <span>Nomor NIP Saja</span>
              <small class="text-muted" style="font-size:11px">Scan menampilkan nomor NIP</small>
            </label>
          </div>
          <div style="margin-top: 10px; font-size: 0.82rem; color: #92400e; background: rgba(245, 158, 11, 0.08); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.2);">
            <i class="fa-solid fa-circle-info"></i> SK berlaku untuk PPPK Penuh Waktu dan Paruh Waktu (klausul gaji/upah otomatis disesuaikan).
          </div>
        </div>

        <!-- Tanggal Penetapan SK -->
        <div class="form-group" style="margin-bottom: 18px;">
          <label style="font-weight: bold; margin-bottom: 8px; display: block;">
            <i class="fa-solid fa-calendar-day" style="color: #d97706; margin-right: 6px;"></i>
            Tanggal Penetapan SK
          </label>
          <input
            type="date"
            v-model="tanggalSkStr"
            class="form-control"
            style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid var(--border-color); font-size: 0.95rem; background: var(--bg-primary, #fff); color: var(--text-primary);"
          />
          <div v-if="tanggalSkStr" style="margin-top: 6px; font-size: 0.82rem; color: var(--text-muted);">
            <i class="fa-solid fa-circle-info"></i>
            Akan mengisi tanggal penetapan SK: <strong>{{ previewTanggalSk }}</strong>
          </div>
          <div v-else style="margin-top: 6px; font-size: 0.82rem; color: #f59e0b;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Tanggal belum dipilih — akan menggunakan tanggal default template SK (30 September 2026)
          </div>
        </div>

        <!-- Progress Bar Batch -->
        <div v-if="isGenerating" style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
            <span>Membuat dokumen SK...</span>
            <span>{{ progress }}/{{ items.length }}</span>
          </div>
          <div style="background: var(--border-color); border-radius: 999px; height: 8px; overflow: hidden;">
            <div style="height: 100%; background: #d97706; border-radius: 999px; transition: width 0.3s ease;" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>

        <div v-if="errorMsg" style="margin-top: 16px; color: #ef4444; background: rgba(239,68,68,0.1); padding: 10px 14px; border-radius: 8px; font-size: 13px; border: 1px solid rgba(239,68,68,0.3);">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ errorMsg }}
        </div>
      </div>

      <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
        <button class="btn btn-outline" @click="emit('close')" :disabled="isGenerating || isSavingToDrive">Batal</button>
        <button class="btn btn-primary" @click="handleDownload" :disabled="isGenerating || isSavingToDrive" style="background-color: #d97706; border-color: #d97706; color: white;">
          <i v-if="isGenerating" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-download"></i>
          {{ items.length > 1 ? 'Unduh SK (ZIP)' : 'Unduh SK Word' }}
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
import { downloadSingleSk, downloadBatchSk, generateSkDocxBlob } from '../../utils/skGenerator'
import { getNamaLengkap, formatIndoDate } from '../../utils/pppkLogic'
import { useDriveStore } from '../../stores/driveStore'
import { useGoogleDrive } from '../../composables/useGoogleDrive'
import { customSwal } from '../../utils/swal'

const driveStore = useDriveStore()
const { getTargetFolder, upsertFile } = useGoogleDrive()

const props = defineProps({
  isOpen: Boolean,
  items: { type: Array, default: () => [] }
})
const emit = defineEmits(['close', 'success'])

const qrMode = ref('url')
const tanggalSkStr = ref('')
const isGenerating = ref(false)
const isSavingToDrive = ref(false)
const errorMsg = ref('')
const progress = ref(0)

const progressPct = computed(() => props.items.length > 0 ? Math.round((progress.value / props.items.length) * 100) : 0)

const previewTanggalSk = computed(() => {
  const d = parseDateInput(tanggalSkStr.value)
  return d ? formatIndoDate(d) : ''
})

onMounted(async () => {
  if (driveStore.isConnected && !driveStore.settings.folderId) {
    await driveStore.loadSettings()
  }
})

watch(() => props.isOpen, (v) => {
  if (v) {
    errorMsg.value = ''
    progress.value = 0
    isGenerating.value = false
    qrMode.value = 'url'
    tanggalSkStr.value = ''
    if (props.items.length === 1) {
      const itemTgl = props.items[0]['TANGGAL SK'] || props.items[0]['TANGGAL_SK'] || ''
      if (itemTgl && typeof itemTgl === 'string' && itemTgl.includes('-')) {
        tanggalSkStr.value = itemTgl.trim()
      }
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
    const tanggalSk = parseDateInput(tanggalSkStr.value)
    if (props.items.length === 1) {
      await downloadSingleSk(props.items[0], qrMode.value, tanggalSk)
    } else {
      await downloadBatchSk(props.items, qrMode.value, tanggalSk, (done) => {
        progress.value = done
      })
    }
    emit('success')
    emit('close')
  } catch (e) {
    console.error('Download SK error:', e)
    errorMsg.value = e.message || 'Gagal membuat dokumen SK. Pastikan template SK sudah diunggah di menu Pengaturan.'
  } finally {
    isGenerating.value = false
  }
}

const handleSaveToDrive = async () => {
  isSavingToDrive.value = true
  errorMsg.value = ''
  progress.value = 0
  const tanggalSk = parseDateInput(tanggalSkStr.value)

  try {
    for (let i = 0; i < props.items.length; i++) {
      const item = props.items[i]
      progress.value = i + 1
      const unorNama = item['UNOR NAMA'] || ''
      const unorInduk = unorNama.split('/')[0]?.trim() || 'Umum'
      const skBlob = await generateSkDocxBlob(item, { qrMode: qrMode.value, tanggalSk })
      const targetFolder = await getTargetFolder('full', unorInduk, 'individual')
      const nip = String(item['NIP BARU'] || item['NIP'] || '').replace(/[^a-zA-Z0-9]/g, '')
      const nama = getNamaLengkap(item, true).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
      await upsertFile(skBlob, `SK_PPPK_${nip}_${nama}.docx`, targetFolder)
    }
    customSwal.fire({
      icon: 'success',
      title: 'Tersimpan ke Drive!',
      text: `${props.items.length} dokumen SK berhasil disimpan ke Google Drive.`,
      timer: 2000,
      showConfirmButton: false
    })
    emit('success')
    emit('close')
  } catch (e) {
    console.error('Drive save error:', e)
    errorMsg.value = e.message || 'Gagal menyimpan SK ke Google Drive.'
  } finally {
    isSavingToDrive.value = false
  }
}
</script>

<style scoped>
.responsive-modal {
  max-width: 540px;
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

.paper-option:hover {
  border-color: #d97706;
  background: rgba(245, 158, 11, 0.04);
}

.paper-option.active {
  border-color: #d97706;
  background: rgba(245, 158, 11, 0.08);
}

.paper-option.active i {
  color: #d97706;
}

.paper-option.active span {
  color: #d97706;
}
</style>
