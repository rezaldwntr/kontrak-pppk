<template>
  <div v-if="isOpen" class="modal-backdrop open">
    <div class="modal-container" :style="{ maxWidth: selectedIds.length === 1 ? '700px' : '500px' }">
      <div class="modal-header">
        <h3>Proses Perpanjangan Kontrak</h3>
        <button class="close-btn" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-info" style="margin-bottom: 20px; font-size: 14px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 12px; color: #3b82f6; border-radius: var(--border-radius);">
          <i class="fa-solid fa-info-circle"></i>
          Anda akan memperpanjang kontrak untuk <strong>{{ selectedIds.length }}</strong> pegawai terpilih.
        </div>
        
        <template v-if="selectedIds.length === 1">
          <div class="form-grid">
            <div class="form-group">
              <label>Nomor Kontrak Baru (Perpanjangan)</label>
              <input type="text" v-model="nomorKontrakBaru" class="form-control" placeholder="Contoh: SPK/0/2021-Perpanjangan">
            </div>
            <div class="form-group">
              <label>Nomor SK Perpanjangan</label>
              <input type="text" v-model="nomorSk" class="form-control" placeholder="Contoh: SK/PPPK/1023/2026">
            </div>
            <div class="form-group">
              <label>Tanggal SK Perpanjangan</label>
              <input type="date" v-model="tanggalSk" class="form-control">
            </div>
            <div class="form-group">
              <label>TMT Kontrak Baru (Mulai)</label>
              <input type="date" v-model="newTmtDate" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Tanggal Akhir Kontrak Baru</label>
              <input type="date" v-model="tanggalAkhir" class="form-control">
            </div>
            <div class="form-group">
              <label>Gaji Pokok Baru (Rp)</label>
              <input type="text" v-model="gajiPokok" class="form-control" placeholder="Contoh: 3500000">
            </div>
          </div>
        </template>
        
        <template v-else>
          <div class="form-group">
            <label>TMT Kontrak Baru</label>
            <input type="date" v-model="newTmtDate" class="form-control" required>
            <small class="text-muted" style="display: block; margin-top: 5px;">
              Sistem secara otomatis memberikan rekomendasi tanggal TMT baru (1 hari setelah akhir kontrak lama). Anda dapat mengubahnya jika diperlukan.
            </small>
          </div>

          <div class="alert alert-warning" style="margin-top: 15px; font-size: 13px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 10px; color: #f59e0b; border-radius: var(--border-radius);">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <strong>Catatan:</strong> Nomor SK dan Nomor Kontrak akan dikosongkan secara otomatis dan dapat Anda lengkapi nanti pada menu Detail Data.
          </div>
        </template>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-outline" @click="emit('close')">Batal</button>
        <button class="btn btn-primary" style="background-color: #1eaa6e; border-color: #1eaa6e; color: white;" @click="handleSubmit" :disabled="!newTmtDate">
          <i class="fa-solid fa-file-signature"></i> Proses Perpanjangan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePegawaiStore } from '../../stores/pegawaiStore'
import { calculateContractPeriod } from '../../utils/pppkLogic'

const props = defineProps({
  isOpen: Boolean,
  selectedIds: Array
})

const emit = defineEmits(['close', 'submit'])
const pegawaiStore = usePegawaiStore()
const newTmtDate = ref('')
const nomorKontrakBaru = ref('')
const nomorSk = ref('')
const tanggalSk = ref('')
const tanggalAkhir = ref('')
const gajiPokok = ref('')

watch(() => props.isOpen, (newVal) => {
  nomorKontrakBaru.value = ''
  nomorSk.value = ''
  tanggalSk.value = ''
  tanggalAkhir.value = ''
  gajiPokok.value = ''
  
  if (newVal && props.selectedIds && props.selectedIds.length > 0) {
    // Cari data pegawai pertama untuk menentukan default TMT baru
    const firstPegawai = pegawaiStore.pppkData.find(p => p['PNS ID'] === props.selectedIds[0])
    if (firstPegawai) {
      const period = calculateContractPeriod(firstPegawai)
      if (period && period.rawDate && !isNaN(period.rawDate.getTime())) {
        const nextDate = new Date(period.rawDate)
        nextDate.setDate(nextDate.getDate() + 1) // 1 hari setelah akhir kontrak
        
        const y = nextDate.getFullYear()
        const m = String(nextDate.getMonth() + 1).padStart(2, '0')
        const d = String(nextDate.getDate()).padStart(2, '0')
        newTmtDate.value = `${y}-${m}-${d}`
      } else {
        const today = new Date()
        const y = today.getFullYear()
        const m = String(today.getMonth() + 1).padStart(2, '0')
        const d = String(today.getDate()).padStart(2, '0')
        newTmtDate.value = `${y}-${m}-${d}`
      }
    }
  } else {
    newTmtDate.value = ''
  }
}, { immediate: true })

const handleSubmit = () => {
  if (!newTmtDate.value) return
  emit('submit', {
    newTmtDate: newTmtDate.value,
    nomorKontrakBaru: nomorKontrakBaru.value,
    nomorSk: nomorSk.value,
    tanggalSk: tanggalSk.value,
    tanggalAkhir: tanggalAkhir.value,
    gajiPokok: gajiPokok.value
  })
}
</script>

<style scoped>
/* Mewarisi CSS modal-backdrop dan modal dari styles.css */
</style>
