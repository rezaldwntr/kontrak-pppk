<template>
  <div>
    <div class="card" style="padding: 1.5rem; margin-bottom: 20px;">
      <h3 style="margin-bottom: 20px; font-size: 1.2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div><i class="fa-solid fa-user-tie"></i> Pengaturan Pihak Pertama (Bupati)</div>
      </h3>
      
      <div class="alert alert-info" style="margin-bottom: 20px; font-size: 13px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 12px; color: #2563eb; border-radius: var(--border-radius);">
        <i class="fa-solid fa-circle-info"></i> Atur identitas Pihak Pertama (Bupati / Pj. Bupati) yang akan menandatangani dokumen kontrak.
      </div>

      <div style="max-width: 600px;">
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="font-weight: bold; margin-bottom: 8px; display: block; color: var(--text-primary);">Nama Lengkap Bupati / Pj. Bupati</label>
          <input type="text" class="form-control" v-model="pihakPertama.nama" placeholder="Contoh: H. SAHRUJANI">
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label style="font-weight: bold; margin-bottom: 8px; display: block; color: var(--text-primary);">Jabatan Pihak Pertama</label>
          <select class="form-control" v-model="pihakPertama.jabatan">
            <option value="Bupati">Bupati</option>
            <option value="Pj. Bupati">Pj. Bupati</option>
          </select>
        </div>
        
        <button class="btn btn-primary" @click="savePihakPertama" :disabled="isSavingPihakPertama" style="background-color: var(--primary-color);">
          <i v-if="isSavingPihakPertama" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-save"></i> 
          Simpan Pengaturan
        </button>
      </div>
    </div>

    <div class="card" style="padding: 1.5rem; margin-bottom: 20px;">
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

    <div class="card" style="padding: 1.5rem; margin-bottom: 20px;">
      <h3 style="margin-bottom: 20px; font-size: 1.2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <i class="fa-solid fa-shield-halved"></i> Keamanan & Akun
      </h3>

      <div class="settings-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <div class="template-card">
          <h4><i class="fa-solid fa-envelope"></i> Ganti Email</h4>
          <p class="text-muted">Perbarui alamat email yang digunakan untuk masuk ke aplikasi.</p>
          <button class="btn btn-outline" style="width: 100%; display: block;" @click="handleChangeEmail">
            Ubah Email
          </button>
        </div>

        <div class="template-card">
          <h4><i class="fa-solid fa-key"></i> Ganti Password</h4>
          <p class="text-muted">Perbarui kata sandi untuk mengamankan akun Anda.</p>
          <button class="btn btn-outline" style="width: 100%; display: block;" @click="handleChangePassword">
            Ubah Password
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { db } from '../services/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/authStore'
import { customSwal } from '../utils/swal'

const authStore = useAuthStore()

// --- State Pihak Pertama ---
const pihakPertama = reactive({
  nama: '',
  jabatan: 'Bupati'
})
const isSavingPihakPertama = ref(false)

const loadPihakPertama = async () => {
  try {
    const docRef = doc(db, 'config', 'pihak_pertama')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      pihakPertama.nama = data.nama || ''
      pihakPertama.jabatan = data.jabatan || 'Bupati'
    }
  } catch (error) {
    console.error("Failed to load pihak_pertama", error)
  }
}

const savePihakPertama = async () => {
  isSavingPihakPertama.value = true
  try {
    const docRef = doc(db, 'config', 'pihak_pertama')
    await setDoc(docRef, {
      nama: pihakPertama.nama,
      jabatan: pihakPertama.jabatan,
      lastUpdated: new Date().toISOString()
    }, { merge: true })
    
    const Toast = customSwal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    })
    Toast.fire({ icon: 'success', title: 'Tersimpan!' })
  } catch (error) {
    console.error("Failed to save pihak_pertama", error)
    customSwal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: error.message })
  } finally {
    isSavingPihakPertama.value = false
  }
}

onMounted(() => {
  loadPihakPertama()
})

// --- State Upload Template ---
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

// --- Keamanan & Akun ---
const handleChangeEmail = async () => {
  const { value: formValues } = await customSwal.fire({
    title: 'Ganti Email',
    html:
      '<input id="swal-old-pwd" type="password" class="swal2-input" placeholder="Password Saat Ini" style="width: 80%">' +
      '<input id="swal-new-email" type="email" class="swal2-input" placeholder="Email Baru" style="width: 80%">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Simpan Email',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const pwd = document.getElementById('swal-old-pwd').value
      const email = document.getElementById('swal-new-email').value
      if (!pwd || !email) {
        customSwal.showValidationMessage('Semua kolom harus diisi')
        return false
      }
      return { pwd, email }
    }
  })

  if (formValues) {
    try {
      customSwal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
      await authStore.changeEmail(formValues.pwd, formValues.email)
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: 'Email berhasil diperbarui.' })
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Password saat ini salah.' })
      } else {
        customSwal.fire({ icon: 'error', title: 'Gagal', text: e.message })
      }
    }
  }
}

const handleChangePassword = async () => {
  const { value: formValues } = await customSwal.fire({
    title: 'Ganti Password',
    html:
      '<input id="swal-old-pwd" type="password" class="swal2-input" placeholder="Password Lama" style="width: 80%">' +
      '<input id="swal-new-pwd" type="password" class="swal2-input" placeholder="Password Baru" style="width: 80%">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Simpan Password',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const oldPwd = document.getElementById('swal-old-pwd').value
      const newPwd = document.getElementById('swal-new-pwd').value
      if (!oldPwd || !newPwd) {
        customSwal.showValidationMessage('Semua kolom harus diisi')
        return false
      }
      if (newPwd.length < 6) {
        customSwal.showValidationMessage('Password baru minimal 6 karakter')
        return false
      }
      return { oldPwd, newPwd }
    }
  })

  if (formValues) {
    try {
      customSwal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
      await authStore.changePassword(formValues.oldPwd, formValues.newPwd)
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: 'Password berhasil diperbarui.' })
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Password lama salah.' })
      } else {
        customSwal.fire({ icon: 'error', title: 'Gagal', text: e.message })
      }
    }
  }
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
