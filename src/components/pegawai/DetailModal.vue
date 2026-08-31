<template>
  <div class="modal-backdrop open" v-if="isOpen" @click.self="emit('close')">
    <div class="modal-container" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <h3><i class="fa-solid fa-address-card"></i> Detail Data PPPK</h3>
        <button class="close-btn" @click="emit('close')" aria-label="Tutup">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="modal-tabs" style="margin-bottom: 24px;">
          <div class="tab-btn" :class="{ active: activeTab === 'personal' }" @click="activeTab = 'personal'">Personal</div>
          <div class="tab-btn" :class="{ active: activeTab === 'kepegawaian' }" @click="activeTab = 'kepegawaian'">Kepegawaian</div>
          <div class="tab-btn" :class="{ active: activeTab === 'jabatan' }" @click="activeTab = 'jabatan'">Jabatan & Kerja</div>
          <div class="tab-btn" :class="{ active: activeTab === 'kontrak' }" @click="activeTab = 'kontrak'">Kontrak & Gaji PPPK</div>
        </div>

        <!-- TAB 1: PERSONAL -->
        <div class="tab-content" v-show="activeTab === 'personal'" :class="{ active: activeTab === 'personal' }">
          <div class="form-grid">
            <div class="form-group" style="grid-column: span 2;">
              <label>Nama Lengkap (Tanpa Gelar)</label>
              <input type="text" v-model="editForm['NAMA']" class="form-control">
            </div>
            <div class="form-group">
              <label>Gelar Depan</label>
              <input type="text" v-model="editForm['GELAR DEPAN']" class="form-control">
            </div>
            <div class="form-group">
              <label>Gelar Belakang</label>
              <input type="text" v-model="editForm['GELAR BELAKANG']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>NIK (No. KTP)</label>
              <input type="text" v-model="editForm['NIK']" class="form-control">
            </div>
            <div class="form-group">
              <label>Tempat Lahir</label>
              <input type="text" v-model="editForm['TEMPAT LAHIR NAMA']" class="form-control">
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input type="date" v-model="editForm['TANGGAL LAHIR']" class="form-control">
            </div>
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select v-model="editForm['JENIS KELAMIN']" class="form-control">
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Agama</label>
              <input type="text" v-model="editForm['AGAMA NAMA']" class="form-control">
            </div>
            <div class="form-group">
              <label>Status Pernikahan</label>
              <select v-model="editForm['STATUS PERNIKAHAN']" class="form-control">
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Menikah">Menikah</option>
              </select>
            </div>
            <div class="form-group">
              <label>No. HP</label>
              <input type="text" v-model="editForm['NO HP']" class="form-control">
            </div>
            <div class="form-group">
              <label>Email Pribadi</label>
              <input type="email" v-model="editForm['EMAIL PRIBADI']" class="form-control">
            </div>
            <div class="form-group">
              <label>Email Pemerintah (Gov)</label>
              <input type="email" v-model="editForm['EMAIL PEMERINTAH']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Alamat Lengkap</label>
              <input type="text" v-model="editForm['ALAMAT LENGKAP']" class="form-control">
            </div>
          </div>
        </div>

        <!-- TAB 2: KEPEGAWAIAN -->
        <div class="tab-content" v-show="activeTab === 'kepegawaian'" :class="{ active: activeTab === 'kepegawaian' }">
          <div class="form-grid">
            <div class="form-group">
              <label>NIP Baru</label>
              <input type="text" v-model="editForm['NIP BARU']" class="form-control">
            </div>
            <div class="form-group">
              <label>NIP Lama</label>
              <input type="text" v-model="editForm['NIP LAMA']" class="form-control">
            </div>
            <div class="form-group">
              <label>Jenis Pegawai</label>
              <input type="text" v-model="editForm['JENIS PEGAWAI']" class="form-control">
            </div>
            <div class="form-group">
              <label>TMT CPNS (Awal PPPK)</label>
              <input type="date" v-model="editForm['TMT CPNS']" class="form-control">
            </div>
            <div class="form-group">
              <label>Nomor SK CPNS (Awal)</label>
              <input type="text" v-model="editForm['NOMOR SK CPNS']" class="form-control">
            </div>
            <div class="form-group">
              <label>Tanggal SK CPNS</label>
              <input type="date" v-model="editForm['TANGGAL SK CPNS']" class="form-control">
            </div>
            <div class="form-group">
              <label>Kedudukan Hukum</label>
              <input type="text" v-model="editForm['KEDUDUKAN HUKUM']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Status Keaktifan PPPK</label>
              <select v-model="editForm['STATUS KEAKTIFAN PPPK']" class="form-control">
                <option value="Aktif">Aktif</option>
                <option value="Diberhentikan">Diberhentikan</option>
                <option value="Pensiun">Pensiun</option>
              </select>
              <div v-if="editForm['STATUS KEAKTIFAN PPPK'] === 'Diberhentikan'" style="margin-top: 10px;">
                <label>Keterangan Diberhentikan</label>
                <select v-model="editForm['KETERANGAN DIBERHENTIKAN']" class="form-control">
                  <option value="Kontrak Tidak Diperpanjang">Kontrak Tidak Diperpanjang</option>
                  <option value="Meninggal">Meninggal</option>
                  <option value="Mengundurkan Diri">Mengundurkan Diri</option>
                </select>
              </div>
              <div v-if="editForm['STATUS KEAKTIFAN PPPK'] === 'Aktif' && isContractExpired" style="margin-top: 8px; font-size: 0.85rem; color: #ff9800; background: rgba(255,152,0,0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,152,0,0.3);">
                <i class="fa-solid fa-triangle-exclamation"></i> Peringatan: Masa kontrak telah habis. Pegawai ini harus segera di non-aktifkan (Pensiun/Diberhentikan) atau perbarui data kontrak barunya.
              </div>
            </div>
            <div class="form-group">
              <label>MKG / Masa Kerja (Tahun) <span style="font-size:0.75rem; color: #1eaa6e; font-weight:600;">(Otomatis)</span></label>
              <input type="text" :value="editForm['MASA KERJA TAHUN'] !== undefined && editForm['MASA KERJA TAHUN'] !== null ? editForm['MASA KERJA TAHUN'] : '0'" class="form-control" disabled>
            </div>
            <div class="form-group">
              <label>MKG / Masa Kerja (Bulan) <span style="font-size:0.75rem; color: #1eaa6e; font-weight:600;">(Otomatis)</span></label>
              <input type="text" :value="editForm['MASA KERJA BULAN'] !== undefined && editForm['MASA KERJA BULAN'] !== null ? editForm['MASA KERJA BULAN'] : '0'" class="form-control" disabled>
            </div>
          </div>
        </div>

        <!-- TAB 3: JABATAN & KERJA -->
        <div class="tab-content" v-show="activeTab === 'jabatan'" :class="{ active: activeTab === 'jabatan' }">
          <div class="form-grid">
            <div class="form-group" style="grid-column: span 2;">
              <label>Nama Jabatan</label>
              <input type="text" v-model="editForm['JABATAN NAMA']" class="form-control">
            </div>
            <div class="form-group">
              <label>Jenis Jabatan</label>
              <input type="text" v-model="editForm['JENIS JABATAN']" class="form-control">
            </div>
            <div class="form-group">
              <label>TMT Jabatan</label>
              <input type="date" v-model="editForm['TMT JABATAN']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Golongan</label>
              <input type="text" v-model="editForm['GOLONGAN']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Unit Organisasi (UNOR)</label>
              <input type="text" v-model="editForm['UNOR NAMA']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Instansi Induk</label>
              <input type="text" v-model="editForm['INSTANSI INDUK']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Instansi Kerja</label>
              <input type="text" v-model="editForm['INSTANSI KERJA NAMA']" class="form-control">
            </div>
            <div class="form-group">
              <label>Tingkat Pendidikan</label>
              <input type="text" v-model="editForm['TINGKAT PENDIDIKAN']" class="form-control">
            </div>
            <div class="form-group">
              <label>Pendidikan Terakhir</label>
              <input type="text" v-model="editForm['PENDIDIKAN TERAKHIR']" class="form-control">
            </div>
            <div class="form-group">
              <label>Tahun Lulus</label>
              <input type="text" v-model="editForm['TAHUN LULUS']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Lokasi Kerja</label>
              <input type="text" v-model="editForm['LOKASI KERJA']" class="form-control">
            </div>
          </div>
        </div>
        
        <!-- TAB 4: KONTRAK & GAJI PPPK -->
        <div class="tab-content" v-show="activeTab === 'kontrak'" :class="{ active: activeTab === 'kontrak' }">
          <div class="info-banner" style="background: rgba(43, 115, 187, 0.1); border: 1px solid rgba(43, 115, 187, 0.3); border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: #6cb2eb;">
            <i class="fa-solid fa-circle-info" style="font-size: 1.2rem;"></i>
            <p style="margin: 0; font-size: 0.9rem;">Awal dan Akhir kontrak PPPK saat ini dihitung otomatis berdurasi 5 tahun (Reguler) atau 1 tahun (Paruh Waktu) per siklus kontrak terhitung sejak tanggal TMT CPNS/PPPK.</p>
          </div>
          
          <div class="form-grid">
            <div class="form-group" style="grid-column: span 2;">
              <label>Nomor Kontrak Aktif <span class="badge" style="background: rgba(30,170,110,0.2); color: #1eaa6e; padding: 2px 6px; font-size: 0.7rem; border-radius: 4px; margin-left: 4px;">Baru</span></label>
              <input type="text" v-model="editForm['NOMOR KONTRAK AKTIF']" class="form-control">
            </div>
            <div class="form-group">
              <label>Awal Kontrak Aktif / TMT</label>
              <input type="date" v-model="editForm['AWAL KONTRAK AKTIF']" class="form-control" disabled>
            </div>
            <div class="form-group">
              <label>Akhir Kontrak Aktif</label>
              <input type="date" v-model="editForm['AKHIR KONTRAK AKTIF']" class="form-control" disabled>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Gaji Pokok Saat Ini (Rp)</label>
              <input type="text" v-model="editForm['GAJI POKOK SAAT INI']" class="form-control" disabled>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-outline" @click="emit('close')">Batal</button>
        <button class="btn btn-primary" style="background-color: #1eaa6e; border-color: #1eaa6e; color: white;" @click="handleSave">
          Simpan Perubahan
        </button>
        <button class="btn btn-primary" v-if="authStore.user" @click="emit('print', editForm)">
          <i class="fa-solid fa-print"></i> Cetak / Unduh Kontrak
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { calculateContractPeriod, parseDate } from '../../utils/pppkLogic'
import { calculateGajiFromItem, calculateMkg, normalizeGolongan, formatRupiah } from '../../utils/gajiTable'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})
const emit = defineEmits(['close', 'print', 'save'])

const authStore = useAuthStore()
const activeTab = ref('personal')
const editForm = ref({})
const gajiInfo = ref({ golongan: '', mkg: 0, gaji: null })

const formatDateToInput = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.item) {
    editForm.value = JSON.parse(JSON.stringify(props.item)) // Deep copy
    
    // Map legacy manual status
    const legacyStatus = editForm.value['STATUS KEAKTIFAN PPPK'];
    if (['Meninggal', 'Mengundurkan Diri', 'Tidak Diperpanjang'].includes(legacyStatus)) {
        editForm.value['STATUS KEAKTIFAN PPPK'] = 'Diberhentikan';
        if (!editForm.value['KETERANGAN DIBERHENTIKAN']) {
            editForm.value['KETERANGAN DIBERHENTIKAN'] = legacyStatus === 'Tidak Diperpanjang' ? 'Kontrak Tidak Diperpanjang' : legacyStatus;
        }
    }

    // Auto-correct JENIS KELAMIN using NIP (15th digit: 1=Laki, 2=Perempuan)
    const nip = String(editForm.value['NIP BARU'] || '').replace(/\D/g, '');
    if (nip.length === 18) {
      const jkChar = nip.charAt(14);
      if (jkChar === '1') {
          editForm.value['JENIS KELAMIN'] = 'L';
      } else if (jkChar === '2') {
          editForm.value['JENIS KELAMIN'] = 'P';
      }
    } else {
      // Fallback normalization if NIP is invalid
      let jk = editForm.value['JENIS KELAMIN'];
      if (jk) {
        jk = String(jk).toUpperCase();
        if (jk.startsWith('L') || jk === 'PRIA' || jk === '1') editForm.value['JENIS KELAMIN'] = 'L';
        else if (jk.startsWith('P') || jk === 'WANITA' || jk === '2' || jk === 'PEREMPUAN') editForm.value['JENIS KELAMIN'] = 'P';
      }
    }

    // Format TMT CPNS & TANGGAL LAHIR if raw format is DD/MM/YYYY or ISO
    const tmtDate = parseDate(editForm.value['TMT CPNS'])
    if (tmtDate) {
      const yyyymmdd = formatDateToInput(tmtDate)
      editForm.value['TMT CPNS'] = yyyymmdd
    }
    const birthDate = parseDate(editForm.value['TANGGAL LAHIR'])
    if (birthDate) {
      editForm.value['TANGGAL LAHIR'] = formatDateToInput(birthDate)
    }

    // Default mapped values based on existing structure if missing
    if (editForm.value['JENIS KELAMIN'] !== 'L' && editForm.value['JENIS KELAMIN'] !== 'P') {
      editForm.value['JENIS KELAMIN'] = 'P'
    }
    if (!editForm.value['EMAIL PRIBADI']) editForm.value['EMAIL PRIBADI'] = editForm.value['EMAIL'] || ''
    if (!editForm.value['EMAIL PEMERINTAH']) editForm.value['EMAIL PEMERINTAH'] = editForm.value['EMAIL GOV'] || ''
    if (!editForm.value['NO HP']) editForm.value['NO HP'] = editForm.value['NOMOR HP'] || ''
    if (!editForm.value['STATUS PERNIKAHAN']) editForm.value['STATUS PERNIKAHAN'] = editForm.value['JENIS KAWIN NAMA'] || ''
    if (!editForm.value['ALAMAT LENGKAP']) editForm.value['ALAMAT LENGKAP'] = editForm.value['ALAMAT'] || ''
    if (!editForm.value['NIP LAMA']) editForm.value['NIP LAMA'] = '-'
    if (!editForm.value['JENIS PEGAWAI']) editForm.value['JENIS PEGAWAI'] = 'PNS Daerah Kab./Kota yang bekerja pada Kab./Kota'
    if (!editForm.value['KEDUDUKAN HUKUM']) editForm.value['KEDUDUKAN HUKUM'] = editForm.value['STATUS KEDUDUKAN'] || 'PPPK Aktif'
    if (!editForm.value['STATUS KEAKTIFAN PPPK']) editForm.value['STATUS KEAKTIFAN PPPK'] = 'Aktif'
    
    if (!editForm.value['JENIS JABATAN']) editForm.value['JENIS JABATAN'] = 'Jabatan Fungsional'
    if (!editForm.value['TMT JABATAN']) editForm.value['TMT JABATAN'] = ''
    if (!editForm.value['GOLONGAN']) editForm.value['GOLONGAN'] = editForm.value['GOL AKHIR NAMA'] || editForm.value['GOL RUANG'] || ''
    if (!editForm.value['INSTANSI INDUK']) editForm.value['INSTANSI INDUK'] = 'Pemerintah Kab. Hulu Sungai Utara'
    if (!editForm.value['TINGKAT PENDIDIKAN']) editForm.value['TINGKAT PENDIDIKAN'] = editForm.value['TINGKAT PENDIDIKAN NAMA'] || ''
    if (!editForm.value['PENDIDIKAN TERAKHIR']) editForm.value['PENDIDIKAN TERAKHIR'] = editForm.value['PENDIDIKAN NAMA'] || ''
    if (!editForm.value['TAHUN LULUS']) editForm.value['TAHUN LULUS'] = ''
    if (!editForm.value['LOKASI KERJA']) editForm.value['LOKASI KERJA'] = editForm.value['LOKASI KERJA NAMA'] || ''
    if (!editForm.value['NOMOR KONTRAK AKTIF']) editForm.value['NOMOR KONTRAK AKTIF'] = ''
    
    // Hanya set AWAL KONTRAK AKTIF dari TMT CPNS jika belum ada (belum pernah diperpanjang)
    if (!editForm.value['AWAL KONTRAK AKTIF'] && tmtDate) {
      editForm.value['AWAL KONTRAK AKTIF'] = formatDateToInput(tmtDate)
    } else if (editForm.value['AWAL KONTRAK AKTIF']) {
      // Format AWAL KONTRAK AKTIF yang sudah ada ke format input
      const awalDate = parseDate(editForm.value['AWAL KONTRAK AKTIF'])
      if (awalDate) editForm.value['AWAL KONTRAK AKTIF'] = formatDateToInput(awalDate)
    }

    // Auto-calculate MKG, Gaji & Akhir Kontrak setelah semua field terisi
    nextTick(() => {
      recalculateMkgAndGaji()
    })

    if (!editForm.value['NOMOR KONTRAK BARU']) editForm.value['NOMOR KONTRAK BARU'] = ''
    if (!editForm.value['NOMOR SK PERPANJANGAN']) editForm.value['NOMOR SK PERPANJANGAN'] = ''
    if (!editForm.value['TANGGAL SK PERPANJANGAN']) editForm.value['TANGGAL SK PERPANJANGAN'] = ''
    if (!editForm.value['TMT KONTRAK BARU']) editForm.value['TMT KONTRAK BARU'] = ''

    activeTab.value = 'personal'
  }
}, { immediate: true })

// Watch perubahan GOLONGAN atau TMT CPNS → recalculate
// Menggunakan debounce via setTimeout agar GOLONGAN dan TMT CPNS keduanya sudah ready
let recalcTimer = null
watch([() => editForm.value['GOLONGAN'], () => editForm.value['TMT CPNS']], ([newGol, newTmt]) => {
  // Hanya recalculate jika keduanya ada nilai
  if (!newGol || !newTmt) return
  clearTimeout(recalcTimer)
  recalcTimer = setTimeout(() => {
    recalculateMkgAndGaji()
  }, 50)
})

const isContractExpired = computed(() => {
  if (!editForm.value['AKHIR KONTRAK AKTIF']) return false
  const endDate = parseDate(editForm.value['AKHIR KONTRAK AKTIF'])
  if (!endDate || isNaN(endDate.getTime())) return false
  const today = new Date()
  return new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
})

// Hitung ulang MKG, Akhir Kontrak, dan Gaji Pokok
const recalculateMkgAndGaji = () => {
  const result = calculateGajiFromItem(editForm.value)
  gajiInfo.value = result

  const tmtDate = parseDate(editForm.value['TMT CPNS'] || editForm.value['AWAL KONTRAK AKTIF'])

  if (result.mkg !== undefined) {
    if (tmtDate && !isNaN(tmtDate.getTime())) {
      // Tampilkan TOTAL TAHUN dan BULAN KERJA AKTUAL dari TMT CPNS ke hari ini
      // (MKG digunakan internal untuk lookup gaji, tapi bukan yang ditampilkan)
      const today = new Date()
      const totalMonths = (today.getFullYear() - tmtDate.getFullYear()) * 12 + (today.getMonth() - tmtDate.getMonth())
      const totalTahun = Math.floor(totalMonths / 12)
      const sisaBulan = totalMonths % 12
      editForm.value['MASA KERJA TAHUN'] = Math.max(0, totalTahun).toString()
      editForm.value['MASA KERJA BULAN'] = Math.max(0, sisaBulan).toString()
    } else {
      editForm.value['MASA KERJA TAHUN'] = '0'
      editForm.value['MASA KERJA BULAN'] = '0'
    }
  } else {
    editForm.value['MASA KERJA TAHUN'] = editForm.value['MK TAHUN'] || '0'
    editForm.value['MASA KERJA BULAN'] = editForm.value['MK BULAN'] || '0'
  }

  // Hitung Akhir Kontrak Aktif
  const period = calculateContractPeriod(editForm.value)
  if (period && period.rawDate && !isNaN(period.rawDate.getTime())) {
    editForm.value['AKHIR KONTRAK AKTIF'] = formatDateToInput(period.rawDate)
    
    if (!editForm.value['FORCE_AKTIF'] && !['Diberhentikan', 'Meninggal', 'Mengundurkan Diri', 'Tidak Diperpanjang', 'Pensiun'].includes(editForm.value['STATUS KEAKTIFAN PPPK'])) {
      const today = new Date()
      const isExpired = period.rawDate.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
      if (isExpired) {
        editForm.value['STATUS KEAKTIFAN PPPK'] = period.isBup ? 'Pensiun' : 'Diberhentikan'
      } else {
        editForm.value['STATUS KEAKTIFAN PPPK'] = 'Aktif'
      }
    }
  } else {
    editForm.value['AKHIR KONTRAK AKTIF'] = ''
  }

  // Auto-fill Gaji Pokok Saat Ini dari tabel Perpres 11/2024
  if (result.gaji) {
    editForm.value['GAJI POKOK SAAT INI'] = formatRupiahDisplay(result.gaji)
  }
}

// Format rupiah untuk ditampilkan di template
const formatRupiahDisplay = (amount) => {
  if (!amount) return '-'
  return Number(amount).toLocaleString('id-ID')
}

const handleSave = () => {
  recalculateMkgAndGaji()
  emit('save', { ...editForm.value })
  emit('close')
}
</script>

<style scoped>
/* Scoped overrides if needed, relies on styles.css */
</style>
