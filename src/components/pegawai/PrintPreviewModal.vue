<template>
  <div class="modal-backdrop" v-if="show" @click.self="close">
    <div class="modal-container" style="max-width: 500px;">
      <div class="modal-header">
        <h2><i class="fa-solid fa-print"></i> Opsi Cetak Perjanjian Kerja</h2>
        <button class="close-btn" @click="close" aria-label="Tutup">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 13px;">1. Pilih Ukuran Kertas / Template:</label>
          <div style="display: flex; gap: 20px; font-size: 13px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="paperSize" value="f4">
              <span>Template F4</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="paperSize" value="a4">
              <span>Template A4</span>
            </label>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 13px;">2. Bagian Dokumen yang Dicetak:</label>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="printScope" value="all">
              <span>Seluruh Halaman (Isi & Tanda Tangan)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="printScope" value="perjanjian">
              <span>Hanya Isi Perjanjian (Kecuali Lembar Terakhir)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" v-model="printScope" value="tandatangan">
              <span>Hanya Lembar Tanda Tangan (Lembar Terakhir)</span>
            </label>
          </div>
        </div>

        <div class="form-group" style="margin-top: 15px; margin-bottom: 15px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 13px;">3. Tanggal Pembuatan Kontrak (Tanggal Perjanjian):</label>
          <input type="date" v-model="tglKontrak" class="form-control" style="font-size: 13px; padding: 8px;">
        </div>
        
        <div class="alert alert-warning" style="font-size: 11px; margin-top: 15px; padding: 10px; border-radius: 4px; border: 1px solid #ffeeba; background-color: #fff3cd; color: #856404; display: flex; gap: 8px; align-items: flex-start;">
          <i class="fa-solid fa-circle-exclamation" style="margin-top: 2px;"></i>
          <span>Pastikan template Word Anda telah dibungkus dengan tag <code>{{#perjanjian}}...{{/perjanjian}}</code> untuk halaman isi, dan <code>{{#tandatangan}}...{{/tandatangan}}</code> untuk halaman tanda tangan terakhir.</span>
        </div>
        
        <div v-if="errorMsg" class="alert alert-danger" style="font-size: 12px; margin-top: 15px; padding: 10px; border-radius: 4px; background-color: #f8d7da; color: #721c24;">
          {{ errorMsg }}
        </div>
      </div>
      
      <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end;">
        <button class="btn btn-secondary" @click="close">Batal</button>
        <button class="btn btn-primary" @click="handleDownload" style="background-color: #2b579a;" :disabled="isProcessing">
          <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-file-word"></i> 
          {{ isProcessing ? 'Memproses...' : 'Unduh Word (.docx)' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { printDocx } from '../../utils/docxPrinter'

const props = defineProps({
  show: Boolean,
  pegawai: Object
})

const emit = defineEmits(['close'])

const paperSize = ref('f4')
const printScope = ref('all')
const tglKontrak = ref('')
const isProcessing = ref(false)
const errorMsg = ref('')

onMounted(() => {
  const today = new Date()
  tglKontrak.value = today.toISOString().split('T')[0]
})

const close = () => {
  errorMsg.value = ''
  emit('close')
}

const handleDownload = async () => {
  if (!props.pegawai) return
  
  isProcessing.value = true
  errorMsg.value = ''
  
  try {
    await printDocx(props.pegawai, {
      paperSize: paperSize.value,
      scope: printScope.value,
      tglKontrak: tglKontrak.value
    })
    close()
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
/* Modal classes inherited from global styles.css */
</style>
