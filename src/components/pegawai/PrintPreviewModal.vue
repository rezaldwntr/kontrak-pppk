<template>
  <div class="modal-backdrop open" v-if="show" @click.self="close">
    <div class="modal-container" style="max-width: 540px;">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="modal-header-icon" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(45, 122, 241, 0.12); color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 1.15rem;">
            <i class="fa-solid fa-print"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-dark);">Cetak Perjanjian Kerja</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Pilih bagian dokumen dan tanggal penandatanganan</p>
          </div>
        </div>
        <button class="close-btn" @click="close" aria-label="Tutup">&times;</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="padding: 20px 24px;">
        <!-- Employee Mini Profile Card -->
        <div v-if="pegawai" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(30, 170, 110, 0.12); color: #1eaa6e; display: flex; align-items: center; justify-content: center; font-size: 1rem;">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <div>
              <strong style="display: block; font-size: 0.9rem; color: var(--text-dark);">{{ pegawai['NAMA'] }}</strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">NIP: {{ pegawai['NIP BARU'] }}</span>
            </div>
          </div>
          <span class="badge" style="background: rgba(45, 122, 241, 0.1); color: var(--primary-color); padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 600;">
            {{ pegawai['JABATAN NAMA'] || 'PPPK' }}
          </span>
        </div>

        <!-- 1. Bagian Dokumen (Selectable Cards) -->
        <div class="form-group" style="margin-bottom: 18px;">
          <label style="font-weight: 700; margin-bottom: 8px; display: block; font-size: 0.85rem; color: var(--text-dark);">
            <i class="fa-solid fa-layer-group" style="color: var(--primary-color); margin-right: 6px;"></i>
            1. Bagian Dokumen yang Dicetak:
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div 
              class="print-scope-card" 
              :class="{ active: printScope === 'all' }" 
              @click="printScope = 'all'"
            >
              <div class="scope-icon"><i class="fa-solid fa-file-contract"></i></div>
              <div class="scope-info">
                <strong>Seluruh Halaman (Lengkap)</strong>
                <p>Mencetak seluruh isi pasal perjanjian hingga lembar tanda tangan penutup.</p>
              </div>
              <div class="scope-check"><i class="fa-solid fa-circle-check"></i></div>
            </div>

            <div 
              class="print-scope-card" 
              :class="{ active: printScope === 'perjanjian' }" 
              @click="printScope = 'perjanjian'"
            >
              <div class="scope-icon"><i class="fa-solid fa-file-lines"></i></div>
              <div class="scope-info">
                <strong>Hanya Isi Perjanjian</strong>
                <p>Hanya halaman pasal-pasal perjanjian kerja (tanpa lembar tanda tangan).</p>
              </div>
              <div class="scope-check"><i class="fa-solid fa-circle-check"></i></div>
            </div>

            <div 
              class="print-scope-card" 
              :class="{ active: printScope === 'tandatangan' }" 
              @click="printScope = 'tandatangan'"
            >
              <div class="scope-icon"><i class="fa-solid fa-signature"></i></div>
              <div class="scope-info">
                <strong>Hanya Lembar Tanda Tangan</strong>
                <p>Hanya mencetak halaman penutup yang memuat tanda tangan para pihak.</p>
              </div>
              <div class="scope-check"><i class="fa-solid fa-circle-check"></i></div>
            </div>
          </div>
        </div>

        <!-- 2. Tanggal Pembuatan Kontrak -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-weight: 700; margin-bottom: 6px; display: block; font-size: 0.85rem; color: var(--text-dark);">
            <i class="fa-solid fa-calendar-day" style="color: var(--primary-color); margin-right: 6px;"></i>
            2. Tanggal Penandatanganan Kontrak:
          </label>
          <input 
            type="date" 
            v-model="tglKontrak" 
            class="form-control" 
            style="font-size: 0.92rem; padding: 9px 12px;"
          >
          <small class="text-muted" style="display: block; margin-top: 5px; font-size: 0.78rem;">
            Tanggal ini akan mengisi teks hari, tanggal terbilang, bulan, dan tahun pada dokumen Word.
          </small>
        </div>
        
        <!-- Info Template Reminder -->
        <div v-if="printScope !== 'all'" style="font-size: 0.78rem; padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.25); background-color: rgba(59, 130, 246, 0.08); color: #1d4ed8; display: flex; gap: 8px; align-items: flex-start; margin-bottom: 14px;">
          <i class="fa-solid fa-circle-info" style="margin-top: 2px;"></i>
          <span v-pre>Pastikan template Word Anda telah memuat tag <code>{{#perjanjian}}...{{/perjanjian}}</code> untuk isi dan <code>{{#tandatangan}}...{{/tandatangan}}</code> untuk tanda tangan.</span>
        </div>
        
        <!-- Error Alert -->
        <div v-if="errorMsg" class="alert alert-danger" style="font-size: 12px; padding: 10px; border-radius: 6px; background-color: #f8d7da; color: #721c24;">
          <i class="fa-solid fa-circle-exclamation" style="margin-right: 4px;"></i> {{ errorMsg }}
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px;">
        <button class="btn btn-outline" @click="close" :disabled="isProcessing">
          Batal
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleDownload" 
          :disabled="isProcessing" 
          style="background-color: #2b579a; border-color: #2b579a; color: white;"
        >
          <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i>
          <i v-else class="fa-solid fa-file-word" style="margin-right: 6px;"></i>
          <span>{{ isProcessing ? 'Membuat Dokumen...' : 'Unduh Berkas Word (.docx)' }}</span>
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
.print-scope-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.print-scope-card:hover {
  border-color: var(--primary-color);
  background: rgba(45, 122, 241, 0.04);
}
.print-scope-card.active {
  border-color: var(--primary-color);
  background: rgba(45, 122, 241, 0.08);
}
.scope-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1rem;
}
.scope-info {
  flex: 1;
}
.scope-info strong {
  display: block;
  font-size: 0.85rem;
  color: var(--text-dark);
}
.scope-info p {
  margin: 2px 0 0 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.scope-check {
  font-size: 1.1rem;
  color: transparent;
  transition: all 0.2s ease;
}
.print-scope-card.active .scope-check {
  color: var(--primary-color);
}
</style>
