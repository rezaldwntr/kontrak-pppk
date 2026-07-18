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
            <div class="form-group">
              <label>Status Keaktifan PPPK</label>
              <select v-model="editForm['STATUS KEAKTIFAN PPPK']" class="form-control">
                <option value="Aktif">Aktif</option>
                <option value="Tidak Diperpanjang">Tidak Diperpanjang</option>
                <option value="Meninggal">Meninggal</option>
                <option value="Pensiun">Pensiun</option>
              </select>
            </div>
            <div class="form-group">
              <label>Masa Kerja (Tahun)</label>
              <input type="number" v-model="editForm['MASA KERJA TAHUN']" class="form-control">
            </div>
            <div class="form-group">
              <label>Masa Kerja (Bulan)</label>
              <input type="number" v-model="editForm['MASA KERJA BULAN']" class="form-control">
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
              <label>Awal Kontrak Aktif</label>
              <input type="date" v-model="editForm['AWAL KONTRAK AKTIF']" class="form-control">
            </div>
            <div class="form-group">
              <label>Akhir Kontrak Aktif</label>
              <input type="date" v-model="editForm['AKHIR KONTRAK AKTIF']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Gaji Pokok Saat Ini (Rp) <span class="badge" style="background: rgba(30,170,110,0.2); color: #1eaa6e; padding: 2px 6px; font-size: 0.7rem; border-radius: 4px; margin-left: 4px;">Baru</span></label>
              <input type="text" v-model="editForm['GAJI POKOK SAAT INI']" class="form-control" placeholder="Contoh: 3500000">
            </div>
          </div>
          
          <hr style="border-color: rgba(255,255,255,0.05); margin: 24px 0; border-style: dashed;">
          
          <h4 style="margin-bottom: 16px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-file-contract"></i> Proses Perpanjangan Kontrak
          </h4>
          
          <div class="form-grid">
            <div class="form-group" style="grid-column: span 2;">
              <label>Nomor Kontrak Baru (Perpanjangan)</label>
              <input type="text" v-model="editForm['NOMOR KONTRAK BARU']" class="form-control">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Nomor SK Perpanjangan</label>
              <input type="text" v-model="editForm['NOMOR SK PERPANJANGAN']" class="form-control" placeholder="Contoh: SK/PPPK/1023/2026">
            </div>
            <div class="form-group">
              <label>Tanggal SK Perpanjangan</label>
              <input type="date" v-model="editForm['TANGGAL SK PERPANJANGAN']" class="form-control">
            </div>
            <div class="form-group">
              <label>TMT Kontrak Baru (Mulai)</label>
              <input type="date" v-model="editForm['TMT KONTRAK BARU']" class="form-control">
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
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})
const emit = defineEmits(['close', 'print', 'save'])

const authStore = useAuthStore()
const activeTab = ref('personal')
const editForm = ref({})

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.item) {
    editForm.value = JSON.parse(JSON.stringify(props.item)) // Deep copy
    
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
    if (!editForm.value['MASA KERJA TAHUN']) editForm.value['MASA KERJA TAHUN'] = editForm.value['MK TAHUN'] || '0'
    if (!editForm.value['MASA KERJA BULAN']) editForm.value['MASA KERJA BULAN'] = editForm.value['MK BULAN'] || '0'
    if (!editForm.value['JENIS JABATAN']) editForm.value['JENIS JABATAN'] = 'Jabatan Fungsional'
    if (!editForm.value['TMT JABATAN']) editForm.value['TMT JABATAN'] = ''
    if (!editForm.value['GOLONGAN']) editForm.value['GOLONGAN'] = editForm.value['GOL AKHIR NAMA'] || editForm.value['GOL RUANG'] || ''
    if (!editForm.value['INSTANSI INDUK']) editForm.value['INSTANSI INDUK'] = 'Pemerintah Kab. Hulu Sungai Utara'
    if (!editForm.value['TINGKAT PENDIDIKAN']) editForm.value['TINGKAT PENDIDIKAN'] = editForm.value['TINGKAT PENDIDIKAN NAMA'] || ''
    if (!editForm.value['PENDIDIKAN TERAKHIR']) editForm.value['PENDIDIKAN TERAKHIR'] = editForm.value['PENDIDIKAN NAMA'] || ''
    if (!editForm.value['TAHUN LULUS']) editForm.value['TAHUN LULUS'] = ''
    if (!editForm.value['LOKASI KERJA']) editForm.value['LOKASI KERJA'] = editForm.value['LOKASI KERJA NAMA'] || ''
    if (!editForm.value['NOMOR KONTRAK AKTIF']) editForm.value['NOMOR KONTRAK AKTIF'] = ''
    if (!editForm.value['AWAL KONTRAK AKTIF']) editForm.value['AWAL KONTRAK AKTIF'] = editForm.value['TMT CPNS'] || ''
    
    if (!editForm.value['AKHIR KONTRAK AKTIF']) {
      if (editForm.value['AWAL KONTRAK AKTIF']) {
        const contractYears = editForm.value['JENIS PPPK'] === 'PPPK Paruh Waktu' ? 1 : 5
        let startDate = null
        const parts = String(editForm.value['AWAL KONTRAK AKTIF']).split(/[-/]/)
        if (parts.length === 3) {
            if (parts[0].length === 4) startDate = new Date(parts[0], parts[1]-1, parts[2])
            else if (parts[2].length === 4) startDate = new Date(parts[2], parts[1]-1, parts[0])
        }
        if (startDate && !isNaN(startDate.getTime())) {
          let standardEndDate = new Date(startDate)
          standardEndDate.setFullYear(standardEndDate.getFullYear() + contractYears)
          standardEndDate.setDate(standardEndDate.getDate() - 1)
          
          let finalEndDate = standardEndDate;
          
          if (editForm.value['TANGGAL LAHIR']) {
              let birthDate = null;
              const bParts = String(editForm.value['TANGGAL LAHIR']).split(/[-/]/);
              if (bParts.length === 3) {
                  if (bParts[0].length === 4) birthDate = new Date(bParts[0], bParts[1]-1, bParts[2]);
                  else if (bParts[2].length === 4) birthDate = new Date(bParts[2], bParts[1]-1, bParts[0]);
              }
              if (birthDate && !isNaN(birthDate.getTime())) {
                  const jabatan = (editForm.value['JABATAN NAMA'] || "").toLowerCase();
                  const bupAge = jabatan.includes("guru") ? 60 : 58;
                  
                  let bupEndDate = new Date(birthDate);
                  bupEndDate.setFullYear(bupEndDate.getFullYear() + bupAge);
                  bupEndDate.setMonth(bupEndDate.getMonth() + 1);
                  bupEndDate.setDate(0); 
                  
                  if (bupEndDate.getTime() < standardEndDate.getTime()) {
                      finalEndDate = bupEndDate;
                  }
              }
          }
          
          const y = finalEndDate.getFullYear()
          const mStr = String(finalEndDate.getMonth() + 1).padStart(2, '0')
          const d = String(finalEndDate.getDate()).padStart(2, '0')
          editForm.value['AKHIR KONTRAK AKTIF'] = `${y}-${mStr}-${d}`
        } else {
          editForm.value['AKHIR KONTRAK AKTIF'] = ''
        }
      } else {
        editForm.value['AKHIR KONTRAK AKTIF'] = ''
      }
    }
    if (!editForm.value['GAJI POKOK SAAT INI']) {
      const gajiRules = { 'I': '1938500', 'III': '2206500', 'V': '2511500', 'VII': '2858800', 'IX': '3203600', 'X': '3339100' }
      editForm.value['GAJI POKOK SAAT INI'] = gajiRules[editForm.value['GOLONGAN']] || ''
    }
    if (!editForm.value['NOMOR KONTRAK BARU']) editForm.value['NOMOR KONTRAK BARU'] = ''
    if (!editForm.value['NOMOR SK PERPANJANGAN']) editForm.value['NOMOR SK PERPANJANGAN'] = ''
    if (!editForm.value['TANGGAL SK PERPANJANGAN']) editForm.value['TANGGAL SK PERPANJANGAN'] = ''
    if (!editForm.value['TMT KONTRAK BARU']) editForm.value['TMT KONTRAK BARU'] = ''

    activeTab.value = 'personal'
  }
}, { immediate: true })

watch(() => editForm.value['GOLONGAN'], (newGol) => {
  const gajiRules = { 'I': '1938500', 'III': '2206500', 'V': '2511500', 'VII': '2858800', 'IX': '3203600', 'X': '3339100' }
  if (newGol && gajiRules[newGol]) {
    editForm.value['GAJI POKOK SAAT INI'] = gajiRules[newGol]
  }
})

const handleSave = () => {
  emit('save', editForm.value)
}
</script>

<style scoped>
/* Scoped overrides if needed, relies on styles.css */
</style>
