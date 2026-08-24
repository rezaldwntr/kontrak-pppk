<template>
  <div v-if="isOpen" class="modal-backdrop open" style="z-index: 2000;">
    <div class="modal-container" style="max-width: 520px;">
      <div class="modal-header">
        <h3><i class="fa-solid fa-file-word" style="color: #2563eb;"></i> Unduh Perjanjian Kerja</h3>
        <button class="close-btn" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <!-- Info pegawai -->
        <div v-if="items.length === 1" style="background: var(--bg-secondary, rgba(0,0,0,0.05)); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <i class="fa-solid fa-user-circle" style="font-size: 1.8rem; color: var(--primary-color); opacity: 0.7;"></i>
          <div>
            <div style="font-weight: bold; font-size: 1rem;">{{ getNamaLengkap(items[0]) }}</div>
            <div class="text-muted" style="font-size: 0.85rem;">{{ items[0]['JABATAN NAMA'] }} · {{ items[0]['NIP BARU'] }}</div>
          </div>
        </div>
        <div v-else style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 10px; padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <i class="fa-solid fa-users" style="font-size: 1.5rem; color: #2563eb;"></i>
          <div>
            <div style="font-weight: bold;">{{ items.length }} Pegawai Terpilih</div>
            <div class="text-muted" style="font-size: 0.85rem;">Dokumen akan diunduh dalam format <strong>.zip</strong></div>
          </div>
        </div>

        <!-- Pilih ukuran kertas -->
        <div class="form-group" style="margin-bottom: 18px;">
          <label style="font-weight: bold; margin-bottom: 10px; display: block;">Ukuran Kertas</label>
          <div style="display: flex; gap: 12px;">
            <label class="paper-option" :class="{ active: selectedPaper === 'f4' }" @click="selectedPaper = 'f4'">
              <i class="fa-solid fa-file-alt"></i>
              <span>F4 / Legal</span>
              <small class="text-muted">33 × 21.5 cm</small>
            </label>
            <label class="paper-option" :class="{ active: selectedPaper === 'a4' }" @click="selectedPaper = 'a4'">
              <i class="fa-solid fa-file"></i>
              <span>A4</span>
              <small class="text-muted">29.7 × 21 cm</small>
            </label>
          </div>
        </div>

        <!-- Mode Ekspor (Hanya untuk lebih dari 1 pegawai) -->
        <div v-if="items.length > 1" class="form-group" style="margin-bottom: 18px;">
          <label style="font-weight: bold; margin-bottom: 10px; display: block;">Format Output (Batch)</label>
          <div style="display: flex; gap: 12px;">
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
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <label class="paper-option small-opt" :class="{ active: documentPart === 'full' }" @click="documentPart = 'full'">
              <span>Kontrak Utuh</span>
              <small class="text-muted">Semua Halaman</small>
            </label>
            <label class="paper-option small-opt" :class="{ active: documentPart === 'perjanjian' }" @click="documentPart = 'perjanjian'">
              <span>Isi Perjanjian</span>
              <small class="text-muted">Hanya teks kontrak</small>
            </label>
            <label class="paper-option small-opt" :class="{ active: documentPart === 'tandatangan' }" @click="documentPart = 'tandatangan'">
              <span>Tanda Tangan</span>
              <small class="text-muted">Hanya hlmn penutup</small>
            </label>
            <label class="paper-option small-opt" :class="{ active: documentPart === 'pisah' }" @click="documentPart = 'pisah'">
              <span>Pisah 2 File</span>
              <small class="text-muted">Isi & TTD terpisah</small>
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
      <div class="modal-footer">
        <button class="btn btn-outline" @click="emit('close')" :disabled="isGenerating">Batal</button>
        <button class="btn btn-primary" @click="handleDownload" :disabled="isGenerating" style="background-color: #2563eb;">
          <i v-if="isGenerating" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-download"></i>
          {{ exportFormat === 'zip' || documentPart === 'pisah' ? 'Unduh ZIP' : 'Unduh Dokumen' }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { downloadSingleContract, downloadBatchContracts } from '../../utils/docxGenerator'

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

function getNamaLengkap(item) {
  const gelarDepan = (item['GELAR DEPAN'] || '').trim()
  const nama = (item['NAMA'] || '').trim()
  const gelarBelakang = (item['GELAR BELAKANG'] || '').trim()
  let full = nama
  if (gelarDepan) full = gelarDepan + ' ' + full
  if (gelarBelakang) full = full + ', ' + gelarBelakang
  return full
}

/**
 * Konversi string YYYY-MM-DD dari input date menjadi Date object lokal
 */
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

  const tanggalKontrak = parseDateInput(tanggalKontrakStr.value)

  try {
    if (props.items.length === 1) {
      await downloadSingleContract(props.items[0], selectedPaper.value, tanggalKontrak, documentPart.value)
    } else {
      await downloadBatchContracts(props.items, selectedPaper.value, (done, total) => {
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
</script>


<style scoped>
.paper-option {
  flex: 1;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  text-align: center;
  user-select: none;
}
.paper-option i {
  font-size: 1.6rem;
  color: var(--text-muted);
  transition: color 0.2s ease;
}
.paper-option span {
  font-weight: 600;
  font-size: 0.95rem;
}
.paper-option.active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.07);
}
.paper-option.active i {
  color: #2563eb;
}
.paper-option:hover:not(.active) {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.04);
}
.paper-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}
.paper-option.small-opt {
  padding: 10px;
}
.paper-option.small-opt i {
  display: none;
}
.paper-option.small-opt span {
  font-size: 0.9rem;
}
.paper-option.small-opt small {
  font-size: 0.75rem;
}
</style>
