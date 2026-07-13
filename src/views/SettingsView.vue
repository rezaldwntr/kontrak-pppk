<template>
  <div>
    <header class="header">
      <div class="page-title">
        <h2>Pengaturan Sistem</h2>
        <p>Konfigurasi template cetak Perjanjian Kerja dan preferensi aplikasi lainnya.</p>
      </div>
    </header>

    <div class="card" style="padding: 1.5rem;">
      <h3 style="margin-bottom: 20px; font-size: 1.2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <i class="fa-solid fa-file-word"></i> Template Perjanjian Kerja (DOCX)
      </h3>
      
      <div class="alert alert-info" style="margin-bottom: 20px; font-size: 13px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 12px; color: #2563eb; border-radius: var(--border-radius);">
        <i class="fa-solid fa-circle-info"></i> Unggah file <strong>.docx</strong> untuk dijadikan template cetak. Pastikan dokumen Anda memiliki tag seperti <code>{NAMA}</code>, <code>{NIP BARU}</code>, <code>{JABATAN NAMA}</code>.
      </div>

      <div class="settings-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <!-- Template PPPK Penuh Waktu F4 -->
        <div class="template-card">
          <h4>Template PPPK (Kertas F4)</h4>
          <p class="text-muted">Digunakan saat mencetak Perjanjian Kerja PPPK Penuh Waktu dengan ukuran kertas F4/Legal.</p>
          <div class="upload-wrapper">
            <input type="file" accept=".docx" @change="(e) => handleUpload(e, 'template_f4')" id="upload-f4" hidden>
            <label for="upload-f4" class="btn btn-outline" style="width: 100%; text-align: center; display: block; cursor: pointer;">
              <i class="fa-solid fa-upload"></i> Pilih File .docx
            </label>
          </div>
          <div v-if="uploadStatus.template_f4" class="status-text success"><i class="fa-solid fa-check"></i> Tersimpan</div>
        </div>

        <!-- Template PPPK Penuh Waktu A4 -->
        <div class="template-card">
          <h4>Template PPPK (Kertas A4)</h4>
          <p class="text-muted">Digunakan saat mencetak Perjanjian Kerja PPPK Penuh Waktu dengan ukuran kertas A4.</p>
          <div class="upload-wrapper">
            <input type="file" accept=".docx" @change="(e) => handleUpload(e, 'template_a4')" id="upload-a4" hidden>
            <label for="upload-a4" class="btn btn-outline" style="width: 100%; text-align: center; display: block; cursor: pointer;">
              <i class="fa-solid fa-upload"></i> Pilih File .docx
            </label>
          </div>
          <div v-if="uploadStatus.template_a4" class="status-text success"><i class="fa-solid fa-check"></i> Tersimpan</div>
        </div>
        
        <!-- Template PPPK Paruh Waktu F4 -->
        <div class="template-card">
          <h4>Template Paruh Waktu (F4)</h4>
          <p class="text-muted">Digunakan khusus untuk PPPK Paruh Waktu (F4).</p>
          <div class="upload-wrapper">
            <input type="file" accept=".docx" @change="(e) => handleUpload(e, 'template_paruh_f4')" id="upload-pf4" hidden>
            <label for="upload-pf4" class="btn btn-outline" style="width: 100%; text-align: center; display: block; cursor: pointer;">
              <i class="fa-solid fa-upload"></i> Pilih File .docx
            </label>
          </div>
          <div v-if="uploadStatus.template_paruh_f4" class="status-text success"><i class="fa-solid fa-check"></i> Tersimpan</div>
        </div>

        <!-- Template PPPK Paruh Waktu A4 -->
        <div class="template-card">
          <h4>Template Paruh Waktu (A4)</h4>
          <p class="text-muted">Digunakan khusus untuk PPPK Paruh Waktu (A4).</p>
          <div class="upload-wrapper">
            <input type="file" accept=".docx" @change="(e) => handleUpload(e, 'template_paruh_a4')" id="upload-pa4" hidden>
            <label for="upload-pa4" class="btn btn-outline" style="width: 100%; text-align: center; display: block; cursor: pointer;">
              <i class="fa-solid fa-upload"></i> Pilih File .docx
            </label>
          </div>
          <div v-if="uploadStatus.template_paruh_a4" class="status-text success"><i class="fa-solid fa-check"></i> Tersimpan</div>
        </div>
      </div>
      
      <div v-if="isUploading" style="margin-top: 20px; text-align: center; color: var(--primary-color);">
        <i class="fa-solid fa-spinner fa-spin"></i> Sedang mengunggah template ke server...
      </div>
      <div v-if="errorMsg" class="alert alert-danger" style="margin-top: 20px; font-size: 13px;">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { db } from '../services/firebase'
import { doc, setDoc } from 'firebase/firestore'

const isUploading = ref(false)
const errorMsg = ref('')
const uploadStatus = reactive({
  template_f4: false,
  template_a4: false,
  template_paruh_f4: false,
  template_paruh_a4: false
})

const handleUpload = (event, typeKey) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.name.endsWith('.docx')) {
    errorMsg.value = 'Hanya file berformat .docx yang diizinkan.'
    return
  }

  errorMsg.value = ''
  isUploading.value = true
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const base64String = e.target.result
      
      // Save to config collection in Firestore
      const configRef = doc(db, 'config', 'templates')
      await setDoc(configRef, {
        [typeKey]: base64String,
        lastUpdated: new Date().toISOString()
      }, { merge: true })
      
      uploadStatus[typeKey] = true
      setTimeout(() => uploadStatus[typeKey] = false, 3000)
    } catch (error) {
      console.error("Upload error:", error)
      errorMsg.value = "Gagal mengunggah template: " + error.message
    } finally {
      isUploading.value = false
    }
  }
  
  reader.onerror = () => {
    isUploading.value = false
    errorMsg.value = 'Gagal membaca file.'
  }
  
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.template-card {
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  background: var(--bg-primary);
}

.template-card h4 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
}

.template-card p {
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  min-height: 40px;
}

.status-text {
  margin-top: 10px;
  font-size: 0.85rem;
  text-align: center;
}

.status-text.success {
  color: #10b981;
}
</style>
