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
        <div class="form-group" style="margin-bottom: 0;">
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
          {{ items.length > 1 ? 'Unduh ZIP' : 'Unduh Dokumen' }}
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
const isGenerating = ref(false)
const errorMsg = ref('')
const progress = ref(0)

const progressPct = computed(() => props.items.length > 0 ? Math.round((progress.value / props.items.length) * 100) : 0)

watch(() => props.isOpen, (v) => {
  if (v) {
    errorMsg.value = ''
    progress.value = 0
    isGenerating.value = false
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

const handleDownload = async () => {
  isGenerating.value = true
  errorMsg.value = ''
  progress.value = 0
  try {
    if (props.items.length === 1) {
      await downloadSingleContract(props.items[0], selectedPaper.value)
    } else {
      await downloadBatchContracts(props.items, selectedPaper.value, (done, total) => {
        progress.value = done
      })
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
</style>
