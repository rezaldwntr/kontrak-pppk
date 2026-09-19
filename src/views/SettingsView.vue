<template>
  <div class="settings-view-wrapper">
    <!-- Segmented Tab Navigation -->
    <div class="pppk-tabs-wrapper">
      <div class="pppk-segmented-tabs">
        <button
          type="button"
          class="tab-pill"
          :class="{ active: activeTab === 'pihak-pertama' }"
          @click="activeTab = 'pihak-pertama'"
        >
          <i class="fa-solid fa-user-tie"></i>
          <span>Pihak Pertama</span>
        </button>
        <button
          type="button"
          class="tab-pill"
          :class="{ active: activeTab === 'templates' }"
          @click="activeTab = 'templates'"
        >
          <i class="fa-solid fa-file-word"></i>
          <span>Template Master Dokumen</span>
        </button>
        <button
          type="button"
          class="tab-pill"
          :class="{ active: activeTab === 'security' }"
          @click="activeTab = 'security'"
        >
          <i class="fa-solid fa-shield-halved"></i>
          <span>Keamanan & Akun</span>
        </button>
      </div>
    </div>

    <!-- Tab 1: Pihak Pertama -->
    <div v-show="activeTab === 'pihak-pertama'" class="settings-tab-pane">
      <div class="settings-section-card">
        <div class="section-card-header">
          <div class="header-icon-title">
            <i class="fa-solid fa-user-tie"></i>
            <div>
              <h3>Pengaturan Pihak Pertama</h3>
              <p class="text-muted">Data penandatangan perjanjian kerja PPPK (Bupati / Pj. Bupati).</p>
            </div>
          </div>
        </div>

        <div class="settings-form-body" style="max-width: 640px;">
          <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label">Nama Lengkap Pihak Pertama</label>
            <input
              type="text"
              class="form-control"
              v-model="pihakPertama.nama"
              placeholder="Contoh: H. SAHRUJANI"
            />
            <span class="form-hint text-muted">Akan dicetak pada pembuka dan penutup kontrak perjanjian kerja.</span>
          </div>

          <div class="form-group" style="margin-bottom: 24px;">
            <label class="form-label">Jabatan Pihak Pertama</label>
            <input
              type="text"
              class="form-control"
              v-model="pihakPertama.jabatan"
              placeholder="Contoh: Pj. Bupati Hulu Sungai Utara"
            />
            <span class="form-hint text-muted">Contoh: Pj. Bupati Hulu Sungai Utara / Bupati Hulu Sungai Utara.</span>
          </div>

          <div class="form-actions">
            <button
              class="btn btn-primary btn-save-action"
              @click="savePihakPertama"
              :disabled="isSavingPihakPertama"
            >
              <i v-if="isSavingPihakPertama" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-floppy-disk"></i>
              <span>{{ isSavingPihakPertama ? 'Menyimpan Perubahan...' : 'Simpan Pihak Pertama' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Template Dokumen DOCX -->
    <div v-show="activeTab === 'templates'" class="settings-tab-pane">
      <div class="settings-section-card">
        <div class="section-card-header">
          <div class="header-icon-title">
            <i class="fa-solid fa-file-word"></i>
            <div>
              <h3>Template Perjanjian Kerja (DOCX)</h3>
              <p class="text-muted">Master dokumen Word ukuran kertas F4 (33×21.5 cm) yang digunakan untuk mencetak kontrak PPPK.</p>
            </div>
          </div>
        </div>

        <!-- Grid 2 Template Master -->
        <div class="settings-grid">
          <!-- Card 1: PPPK Penuh Waktu -->
          <div class="template-card">
            <div class="template-badge-wrap">
              <span class="badge-status-penuh">PPPK Penuh Waktu</span>
            </div>
            <h4><i class="fa-regular fa-file-word text-success"></i> Template Kontrak (Penuh Waktu)</h4>
            <p class="text-muted">Master dokumen Word (.docx) ukuran F4 untuk seluruh pembuatan dokumen kontrak pegawai penuh waktu.</p>
            
            <div v-if="availableTemplates.template_f4" class="template-uploaded-alert">
              <div class="uploaded-indicator">
                <i class="fa-solid fa-circle-check"></i>
                <span>Template Terpasang & Aktif</span>
              </div>
              <button
                class="btn btn-outline-danger btn-sm btn-table-icon"
                @click="handleDeleteTemplate('template_f4')"
                title="Hapus Master Template"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>

            <div class="upload-wrapper">
              <input type="file" accept=".docx" @change="(e) => handleUpload(e, 'template_f4')" id="upload-f4" hidden>
              <label for="upload-f4" class="btn btn-outline upload-btn-label">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>{{ availableTemplates.template_f4 ? 'Ganti Template .docx' : 'Unggah File .docx' }}</span>
              </label>
            </div>
            <div v-if="uploadStatus.template_f4" class="status-text success">
              <i class="fa-solid fa-circle-check"></i> Template Berhasil Diperbarui
            </div>
          </div>

          <!-- Card 2: PPPK Paruh Waktu -->
          <div class="template-card">
            <div class="template-badge-wrap">
              <span class="badge-status-paruh">PPPK Paruh Waktu</span>
            </div>
            <h4><i class="fa-regular fa-file-word text-warning"></i> Template Kontrak (Paruh Waktu)</h4>
            <p class="text-muted">Master dokumen Word (.docx) ukuran F4 untuk seluruh pembuatan dokumen kontrak pegawai paruh waktu.</p>
            
            <div v-if="availableTemplates.template_paruh_f4" class="template-uploaded-alert">
              <div class="uploaded-indicator">
                <i class="fa-solid fa-circle-check"></i>
                <span>Template Terpasang & Aktif</span>
              </div>
              <button
                class="btn btn-outline-danger btn-sm btn-table-icon"
                @click="handleDeleteTemplate('template_paruh_f4')"
                title="Hapus Master Template"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>

            <div class="upload-wrapper">
              <input type="file" accept=".docx" @change="(e) => handleUpload(e, 'template_paruh_f4')" id="upload-pf4" hidden>
              <label for="upload-pf4" class="btn btn-outline upload-btn-label">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>{{ availableTemplates.template_paruh_f4 ? 'Ganti Template .docx' : 'Unggah File .docx' }}</span>
              </label>
            </div>
            <div v-if="uploadStatus.template_paruh_f4" class="status-text success">
              <i class="fa-solid fa-circle-check"></i> Template Berhasil Diperbarui
            </div>
          </div>
        </div>

        <div v-if="isUploading" class="upload-loading-banner">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>Sedang memproses dan menyimpan template dokumen ke server...</span>
        </div>
        <div v-if="errorMsg" class="alert alert-danger" style="margin-top: 16px;">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ errorMsg }}
        </div>

        <!-- Tag Reference Section with Search Filter & Copy to Clipboard -->
        <div class="tag-reference-section">
          <div class="tag-header-row">
            <div>
              <h4 class="tag-section-title">
                <i class="fa-solid fa-tags"></i>
                <span>Daftar Tag Template Kontrak</span>
              </h4>
              <p class="tag-section-desc text-muted">
                Salin tag berikut ke dalam dokumen Word (.docx). Klik tombol salin di samping tag untuk menyalin langsung.
              </p>
            </div>
            <div class="tag-search-input-wrap">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                v-model="searchTagQuery"
                placeholder="Cari tag template..."
                class="form-control form-control-sm tag-search-input"
              />
              <button
                v-if="searchTagQuery"
                type="button"
                class="btn-clear-search"
                @click="searchTagQuery = ''"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <div class="table-responsive tag-table-wrap">
            <table class="table modern-data-table tag-table">
              <thead>
                <tr>
                  <th width="150">KATEGORI</th>
                  <th width="260">TAG DOKUMEN</th>
                  <th>KETERANGAN & PENGGUNAAN</th>
                  <th width="80" style="text-align: center;">SALIN</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredTags.length === 0">
                  <td colspan="4" class="text-center table-empty-cell">
                    <span>Tidak ada tag yang cocok dengan "{{ searchTagQuery }}".</span>
                  </td>
                </tr>
                <tr v-for="item in filteredTags" :key="item.tag">
                  <td>
                    <span class="tag-category-badge">{{ item.category }}</span>
                  </td>
                  <td>
                    <code class="tag-code">{{ item.tag }}</code>
                  </td>
                  <td class="tag-desc-cell">{{ item.desc }}</td>
                  <td style="text-align: center;">
                    <button
                      type="button"
                      class="btn btn-outline btn-sm btn-table-icon"
                      @click="copyTag(item.tag)"
                      title="Salin Tag ke Clipboard"
                    >
                      <i class="fa-regular fa-copy"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Keamanan & Akun -->
    <div v-show="activeTab === 'security'" class="settings-tab-pane">
      <div class="settings-section-card">
        <div class="section-card-header">
          <div class="header-icon-title">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <h3>Keamanan & Akun Pengguna</h3>
              <p class="text-muted">Kelola kredensial akses masuk administrator untuk aplikasi E-Kontrak.</p>
            </div>
          </div>
        </div>

        <div class="security-grid">
          <div class="security-card">
            <div class="security-card-icon">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <h4>Perbarui Alamat Email</h4>
            <p class="text-muted">Ganti alamat email login yang saat ini terdaftar pada sistem autentikasi.</p>
            <button class="btn btn-outline btn-security-action" @click="handleChangeEmail">
              <i class="fa-solid fa-envelope"></i>
              <span>Ubah Email Akun</span>
            </button>
          </div>

          <div class="security-card">
            <div class="security-card-icon">
              <i class="fa-solid fa-key"></i>
            </div>
            <h4>Perbarui Kata Sandi</h4>
            <p class="text-muted">Ubah kata sandi secara berkala untuk mencegah akses tanpa izin.</p>
            <button class="btn btn-outline btn-security-action" @click="handleChangePassword">
              <i class="fa-solid fa-key"></i>
              <span>Ubah Kata Sandi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { db } from '../services/firebase'
import { doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore'
import { useAuthStore } from '../stores/authStore'
import { customSwal } from '../utils/swal'

const authStore = useAuthStore()

// --- Sub-Tab State ---
const activeTab = ref('pihak-pertama')
const searchTagQuery = ref('')

// --- Reference Template Tags ---
const templateTags = [
  { category: 'Pihak Pertama', tag: '{{NAMA_BUPATI}}', desc: 'Nama Pihak Pertama — otomatis HURUF BESAR' },
  { category: 'Pihak Pertama', tag: '{{JABATAN_BUPATI}}', desc: 'Jabatan Pihak Pertama' },
  { category: 'Data Kontrak', tag: '{{NO_KONTRAK_BARU}}', desc: 'Nomor Perjanjian Kontrak Aktif' },
  { category: 'Data Pegawai', tag: '{{NAMA_PEGAWAI}}', desc: 'Nama Lengkap PPPK (tanpa gelar)' },
  { category: 'Data Pegawai', tag: '{{NIP_BARU}}', desc: 'NIP Baru PPPK' },
  { category: 'Data Pegawai', tag: '{{ALAMAT}}', desc: 'Alamat tempat tinggal pegawai' },
  { category: 'Data Pegawai', tag: '{{JABATAN}}', desc: 'Nama Jabatan Kerja PPPK' },
  { category: 'Data Pegawai', tag: '{{UNOR_NAMA}}', desc: 'Nama Unit Organisasi / OPD (sumber: kolom UNOR NAMA)' },
  { category: 'Data Pegawai', tag: '{{UNIT_KERJA}}', desc: 'Nama Unit Kerja Operasional (sumber: kolom UNIT KERJA)' },
  { category: 'Data Pegawai', tag: '{{KELOMPOK_PEGAWAI}}', desc: 'Kelompok Kerja — otomatis: Tenaga Guru / Tenaga Kesehatan / Tenaga Teknis' },
  { category: 'Data Pegawai', tag: '{{FUNGSI_PEGAWAI}}', desc: 'Fungsi PPPK — otomatis (contoh: PPPK Fungsional Guru)' },
  { category: 'Data Pegawai', tag: '{{SASARAN_PELAYANAN}}', desc: 'Sasaran Pelayanan — otomatis (contoh: Anak Didik, Pasien, Masyarakat)' },
  { category: 'Data Pegawai', tag: '{{GOLONGAN}}', desc: 'Golongan PPPK (Akhir)' },
  { category: 'Data Pegawai', tag: '{{TEMPAT_TGL_LAHIR}}', desc: 'Tempat dan Tanggal Lahir (Format: Kota, DD Bulan YYYY)' },
  { category: 'Data Pegawai', tag: '{{PENDIDIKAN_LULUS}}', desc: 'Pendidikan Terakhir dan Tahun Lulus (Format: Nama Pendidikan, Tahun : YYYY)' },
  { category: 'TMT Kontrak Aktif', tag: '{{TMT_AWAL_AKTIF}}', desc: 'Tanggal Mulai Kontrak Aktif (Format: DD Bulan YYYY)' },
  { category: 'TMT Kontrak Aktif', tag: '{{TMT_AKHIR_AKTIF}}', desc: 'Tanggal Selesai Kontrak Aktif (Format: DD Bulan YYYY)' },
  { category: 'Gaji Pokok', tag: '{{GAJI_BARU}}', desc: 'Gaji Pokok — format Rupiah lengkap (contoh: Rp 3.200.000)' },
  { category: 'Gaji Pokok', tag: '{{GAJI_TERBILANG}}', desc: 'Gaji Pokok dalam kata-kata (contoh: Tiga Juta Dua Ratus Ribu Rupiah)' },
  { category: 'Tanggal Penandatanganan Kontrak', tag: '{{KONTRAK_HARI}}', desc: 'Hari penandatanganan kontrak (contoh: SENIN)' },
  { category: 'Tanggal Penandatanganan Kontrak', tag: '{{KONTRAK_TANGGAL_TERBILANG}}', desc: 'Tanggal penandatanganan — terbilang huruf besar (contoh: DUA PULUH LIMA)' },
  { category: 'Tanggal Penandatanganan Kontrak', tag: '{{KONTRAK_BULAN}}', desc: 'Bulan penandatanganan kontrak (contoh: AGUSTUS)' },
  { category: 'Tanggal Penandatanganan Kontrak', tag: '{{KONTRAK_TAHUN_TERBILANG}}', desc: 'Tahun penandatanganan — terbilang huruf besar (contoh: DUA RIBU DUA PULUH ENAM)' },
  { category: 'Pemisahan Halaman', tag: '{{#perjanjian}} ... {{/perjanjian}}', desc: 'Bungkus Halaman Isi Perjanjian dengan tag ini (khusus mode unduh Pisah)' },
  { category: 'Pemisahan Halaman', tag: '{{#tandatangan}} ... {{/tandatangan}}', desc: 'Bungkus Halaman Tanda Tangan dengan tag ini (khusus mode unduh Pisah)' }
]

const filteredTags = computed(() => {
  if (!searchTagQuery.value.trim()) return templateTags
  const q = searchTagQuery.value.trim().toLowerCase()
  return templateTags.filter(item =>
    item.tag.toLowerCase().includes(q) ||
    item.desc.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  )
})

const copyTag = async (tagText) => {
  try {
    await navigator.clipboard.writeText(tagText)
    const Toast = customSwal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    })
    Toast.fire({ icon: 'success', title: `Tag disalin: ${tagText}` })
  } catch (err) {
    console.error('Copy tag failed:', err)
  }
}

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

const isUploading = ref(false)
const errorMsg = ref('')
const uploadStatus = reactive({
  template_f4: false,
  template_paruh_f4: false
})
const availableTemplates = reactive({
  template_f4: false,
  template_paruh_f4: false
})

const loadTemplatesStatus = async () => {
  try {
    const docRef = doc(db, 'config', 'templates')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      availableTemplates.template_f4 = !!(data.template_f4 || data.template_reguler || data.template)
      availableTemplates.template_paruh_f4 = !!(data.template_paruh_f4 || data.template_paruh)
    }
  } catch (error) {
    console.error("Failed to load templates status", error)
  }
}

onMounted(() => {
  loadPihakPertama()
  loadTemplatesStatus()
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
      availableTemplates[typeKey] = true
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

const handleDeleteTemplate = async (typeKey) => {
  const result = await customSwal.fire({
    title: 'Hapus Template?',
    text: "Template ini akan dihapus dari sistem.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!'
  })
  
  if (result.isConfirmed) {
    try {
      const configRef = doc(db, 'config', 'templates')
      await updateDoc(configRef, {
        [typeKey]: deleteField(),
        lastUpdated: new Date().toISOString()
      })
      availableTemplates[typeKey] = false
      customSwal.fire('Terhapus!', 'Template berhasil dihapus.', 'success')
    } catch (error) {
      console.error("Delete template error:", error)
      customSwal.fire('Error', 'Gagal menghapus template.', 'error')
    }
  }
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
.settings-view-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* Sub-Tab Navigation */
.pppk-tabs-wrapper {
  margin-bottom: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.pppk-segmented-tabs {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  white-space: nowrap;
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md, 8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.tab-pill:hover {
  color: var(--text-primary);
  background: var(--bg-primary);
}

.tab-pill.active {
  color: #ffffff;
  background: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* Card Styles */
.settings-section-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  padding: 24px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
}

.section-card-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-icon-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-title > i {
  font-size: 1.6rem;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 12px;
  border-radius: var(--radius-md, 8px);
}

.header-icon-title h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.header-icon-title p {
  font-size: 0.84rem;
  margin: 0;
}

/* Form Styles */
.form-label {
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--text-primary);
  display: block;
  margin-bottom: 6px;
}

.form-hint {
  display: block;
  font-size: 0.78rem;
  margin-top: 5px;
}

.btn-save-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-weight: 600;
  border-radius: var(--radius-md, 8px);
  font-size: 0.9rem;
}

/* Template Grid & Cards */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.template-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
  padding: 20px;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.template-badge-wrap {
  display: flex;
  align-items: center;
}

.badge-status-penuh {
  background: rgba(16, 185, 129, 0.15);
  color: var(--primary-color);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 700;
}

.badge-status-paruh {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 700;
}

.template-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-card p {
  font-size: 0.84rem;
  line-height: 1.45;
  margin: 0;
}

.template-uploaded-alert {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 10px 14px;
  border-radius: var(--radius-sm, 6px);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.uploaded-indicator {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.84rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn-label {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  cursor: pointer;
  border-radius: var(--radius-sm, 6px);
  font-size: 0.86rem;
  font-weight: 500;
  transition: all 0.2s;
}

.upload-loading-banner {
  margin: 16px 0;
  padding: 12px;
  border-radius: var(--radius-sm, 6px);
  background: var(--primary-light);
  color: var(--primary-color);
  text-align: center;
  font-size: 0.88rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-text {
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px;
  border-radius: 4px;
  text-align: center;
}

.status-text.success {
  color: var(--primary-color);
  background: rgba(16, 185, 129, 0.1);
}

/* Tag Reference Section */
.tag-reference-section {
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
  margin-top: 16px;
}

.tag-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 16px;
}

.tag-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-section-desc {
  font-size: 0.82rem;
  margin: 0;
}

.tag-search-input-wrap {
  position: relative;
  min-width: 240px;
}

.tag-search-input-wrap .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  font-size: 0.85rem;
  pointer-events: none;
}

.tag-search-input {
  padding-left: 34px;
  padding-right: 32px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm, 6px);
  color: var(--text-primary);
  font-size: 0.84rem;
}

.tag-search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.tag-search-input-wrap .btn-clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 2px 4px;
}

.tag-table-wrap {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}

.tag-table thead th {
  background: var(--bg-primary);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.tag-table tbody td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.84rem;
  vertical-align: middle;
}

.tag-category-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.tag-code {
  font-family: var(--font-secondary, monospace);
  font-size: 0.82rem;
  background: var(--bg-primary);
  padding: 3px 7px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  color: var(--primary-color);
  font-weight: 600;
}

.tag-desc-cell {
  color: var(--text-secondary);
}

.btn-table-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm, 6px);
  font-size: 0.85rem;
  transition: all 0.15s;
}

.btn-table-icon:hover {
  transform: translateY(-1px);
}

/* Security Grid & Cards */
.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.security-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
  padding: 24px;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.security-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.security-card-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md, 8px);
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.security-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.security-card p {
  font-size: 0.84rem;
  line-height: 1.45;
  margin: 0;
  min-height: 40px;
}

.btn-security-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 0.86rem;
  font-weight: 500;
  border-radius: var(--radius-sm, 6px);
  width: 100%;
}

@media (max-width: 768px) {
  .tag-header-row {
    flex-direction: column;
    align-items: stretch;
  }
  .tag-search-input-wrap {
    min-width: 100%;
  }
}
</style>
