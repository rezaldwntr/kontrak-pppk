<template>
  <div class="verifikasi-page">
    <div class="verifikasi-container">
      <!-- Kop Surat / Header Instansi -->
      <div class="verifikasi-header">
        <img :src="garudaUrl" alt="Garuda Pancasila" class="garuda-logo" />
        <h2 class="instansi-title">PEMERINTAH KABUPATEN HULU SUNGAI UTARA</h2>
        <h3 class="dinas-title">BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA</h3>
        <p class="instansi-address">Layanan Publik Verifikasi &amp; Validasi Keaslian Dokumen Kepegawaian</p>
        <div class="header-divider"></div>
      </div>

      <!-- Input Pencarian NIP Manual -->
      <div class="search-box-card">
        <form @submit.prevent="handleSearch" class="search-form">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="inputNip"
            type="text"
            placeholder="Masukkan Nomor Induk Pegawai (NIP)..."
            class="search-input"
          />
          <button type="submit" class="search-btn">
            <i class="fa-solid fa-check"></i> Periksa NIP
          </button>
        </form>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="status-card loading-card">
        <i class="fa-solid fa-spinner fa-spin loading-icon"></i>
        <p>Memverifikasi data dokumen kepegawaian...</p>
      </div>

      <!-- Result: VALID -->
      <div v-else-if="pegawaiFound" class="status-card valid-card">
        <div class="badge-status-valid">
          <i class="fa-solid fa-circle-check"></i>
          <span>DOKUMEN VALID &amp; RESMI</span>
        </div>

        <h4 class="doc-title">
          SURAT KEPUTUSAN PENGANGKATAN PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA (PPPK) PARUH WAKTU
        </h4>

        <div class="detail-table-wrapper">
          <table class="detail-table">
            <tbody>
              <tr>
                <td class="td-label">Nomor Keputusan</td>
                <td class="td-val font-semibold">{{ nomorSkDisplay }}</td>
              </tr>
              <tr>
                <td class="td-label">Nama Pegawai</td>
                <td class="td-val font-semibold">{{ getNamaLengkap(pegawaiFound, true) }}</td>
              </tr>
              <tr>
                <td class="td-label">NIP</td>
                <td class="td-val font-mono">{{ pegawaiFound['NIP BARU'] || pegawaiFound['NIP'] || '-' }}</td>
              </tr>
              <tr>
                <td class="td-label">Jenis Kelamin</td>
                <td class="td-val">{{ formatJenisKelamin(pegawaiFound['JENIS KELAMIN'] || pegawaiFound['JENIS_KELAMIN'] || pegawaiFound['GENDER'] || '') }}</td>
              </tr>
              <tr>
                <td class="td-label">Tempat / Tanggal Lahir</td>
                <td class="td-val">{{ tempatTglLahirDisplay }}</td>
              </tr>
              <tr>
                <td class="td-label">Pendidikan</td>
                <td class="td-val">{{ pendidikanDisplay }}</td>
              </tr>
              <tr>
                <td class="td-label">Jabatan</td>
                <td class="td-val">{{ pegawaiFound['JABATAN NAMA'] || pegawaiFound['JABATAN'] || '-' }}</td>
              </tr>
              <tr>
                <td class="td-label">Unit Organisasi (UNOR)</td>
                <td class="td-val">{{ pegawaiFound['UNOR NAMA'] || '-' }}</td>
              </tr>
              <tr>
                <td class="td-label">Pejabat Penetap</td>
                <td class="td-val font-semibold">{{ pejabatPenetapDisplay }}</td>
              </tr>
              <tr>
                <td class="td-label">Masa Hubungan Kontrak</td>
                <td class="td-val font-semibold" style="color: #2563eb;">{{ masaKontrakDisplay }}</td>
              </tr>
              <tr>
                <td class="td-label">Status Keaktifan</td>
                <td class="td-val">
                  <span class="status-pill active">{{ getStatusPppk(pegawaiFound) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="verification-footer">
          <div class="verification-stamp">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <p class="stamp-title">TERVERIFIKASI SISTEM ELEKTRONIK BKPSDM</p>
              <p class="stamp-time">Waktu Validasi: {{ currentTimestamp }}</p>
            </div>
          </div>
          <p class="legal-notice">
            Dokumen ini telah diterbitkan dan tercatat secara sah di Pemerintah Kabupaten Hulu Sungai Utara.
            Kebenaran data sesuai dengan basis data kepegawaian yang berlaku saat surat keputusan diterbitkan.
          </p>
        </div>
      </div>

      <!-- Result: NOT FOUND -->
      <div v-else-if="searchedNip" class="status-card invalid-card">
        <div class="badge-status-invalid">
          <i class="fa-solid fa-circle-xmark"></i>
          <span>DOKUMEN TIDAK TERDAFTAR</span>
        </div>
        <p class="invalid-desc">
          Data dengan NIP <strong>{{ searchedNip }}</strong> tidak ditemukan dalam basis data Surat Keputusan PPPK.
          Silakan periksa kembali nomor NIP atau hubungi Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM) Kab. Hulu Sungai Utara.
        </p>
      </div>

      <!-- Result: EMPTY STATE (Belum cari) -->
      <div v-else class="status-card empty-card">
        <i class="fa-solid fa-qrcode empty-icon"></i>
        <p class="empty-text">
          Pindai kode QR pada Surat Keputusan (SK) atau masukkan NIP pada kolom di atas untuk memverifikasi keabsahan dokumen.
        </p>
      </div>

      <!-- Back to portal link -->
      <div class="back-nav">
        <router-link to="/" class="back-link">
          <i class="fa-solid fa-arrow-left"></i> Kembali ke Beranda Aplikasi
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePegawaiStore } from '../stores/pegawaiStore'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import {
  getNamaLengkap,
  getStatusPppk,
  cleanNomorKontrakTag,
  formatIndoDate,
  calculateContractPeriod,
  formatJenisKelamin
} from '../utils/pppkLogic'
import garudaUrl from '../assets/garuda.png'

const route = useRoute()
const router = useRouter()
const pegawaiStore = usePegawaiStore()

const inputNip = ref('')
const searchedNip = ref('')
const isLoading = ref(false)
const currentTimestamp = ref('')
const pihakPertama = ref(null)

onMounted(async () => {
  currentTimestamp.value = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium'
  })

  // Muat data pihak pertama untuk menampilkan nama Pejabat Penetap (Bupati)
  try {
    const pSnap = await getDoc(doc(db, 'config', 'pihak_pertama'))
    if (pSnap.exists()) pihakPertama.value = pSnap.data()
  } catch (e) {
    console.warn('Gagal memuat pihak pertama di verifikasi:', e)
  }

  if (!pegawaiStore.pppkData || pegawaiStore.pppkData.length === 0) {
    isLoading.value = true
    try {
      await pegawaiStore.loadData()
    } finally {
      isLoading.value = false
    }
  }

  const queryNip = route.query.nip
  if (queryNip) {
    inputNip.value = String(queryNip).trim()
    searchedNip.value = String(queryNip).trim()
  }
})

watch(() => route.query.nip, (newNip) => {
  if (newNip) {
    inputNip.value = String(newNip).trim()
    searchedNip.value = String(newNip).trim()
  }
})

const pegawaiFound = computed(() => {
  if (!searchedNip.value || !pegawaiStore.pppkData) return null
  const cleanQuery = searchedNip.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return pegawaiStore.pppkData.find(item => {
    const nip = String(item['NIP BARU'] || item['NIP'] || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const pnsId = String(item['PNS ID'] || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    return nip === cleanQuery || pnsId === cleanQuery
  }) || null
})

const nomorSkDisplay = computed(() => {
  if (!pegawaiFound.value) return '-'
  const mid = cleanNomorKontrakTag(
    pegawaiFound.value['NO KONTRAK'] ||
    pegawaiFound.value['NOMOR KONTRAK'] ||
    pegawaiFound.value['NOMOR_KONTRAK'] || ''
  )
  return `800.1.2.5/${mid || '-'}/BKPSDM`
})

const tempatTglLahirDisplay = computed(() => {
  if (!pegawaiFound.value) return '-'
  const p = pegawaiFound.value
  const tempat = (p['TEMPAT LAHIR NAMA'] || p['TEMPAT LAHIR'] || p['KOTA LAHIR'] || '').trim()
  const tgl = formatIndoDate(p['TANGGAL LAHIR'] || p['TGL LAHIR'] || '')
  return [tempat, tgl !== '-' ? tgl : ''].filter(Boolean).join(', ') || '-'
})

const pendidikanDisplay = computed(() => {
  if (!pegawaiFound.value) return '-'
  const p = pegawaiFound.value
  const pend = (p['PENDIDIKAN TERAKHIR'] || p['PENDIDIKAN NAMA'] || p['PENDIDIKAN'] || '').trim()
  const thn = String(p['TAHUN LULUS'] || p['THN LULUS'] || '').trim()
  if (pend && thn) return `${pend} Tahun ${thn}`
  if (thn) return `Tahun ${thn}`
  return pend || '-'
})

const pejabatPenetapDisplay = computed(() => {
  const jab = (pihakPertama.value?.jabatan || 'BUPATI HULU SUNGAI UTARA').trim()
  const nama = (pihakPertama.value?.nama || 'H. SAHRUJANI').trim()
  return `${jab} (${nama})`
})

const masaKontrakDisplay = computed(() => {
  if (!pegawaiFound.value) return '-'
  const p = pegawaiFound.value
  const period = calculateContractPeriod(p)
  const tmtAwal = formatIndoDate(p['AWAL KONTRAK AKTIF'] || p['TMT CPNS'] || '')
  const tmtAkhir = (period && period.endDateStr && period.endDateStr !== '-' && period.endDateStr !== 'Format Tanggal Invalid')
    ? period.endDateStr
    : formatIndoDate(p['AKHIR KONTRAK AKTIF'] || '')
  return `${tmtAwal !== '-' ? tmtAwal : '—'} s.d. ${tmtAkhir !== '-' ? tmtAkhir : '—'}`
})

function handleSearch() {
  if (!inputNip.value.trim()) return
  searchedNip.value = inputNip.value.trim()
  router.replace({ path: '/verifikasi', query: { nip: searchedNip.value } })
}
</script>

<style scoped>
.verifikasi-page {
  min-height: 100vh;
  background: var(--bg-primary, #f1f5f9);
  padding: 40px 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: inherit;
}

.verifikasi-container {
  width: 100%;
  max-width: 760px;
}

.verifikasi-header {
  text-align: center;
  margin-bottom: 24px;
}

.garuda-logo {
  width: 72px;
  height: auto;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.instansi-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--text-primary, #0f172a);
  margin: 0 0 4px;
}

.dinas-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-secondary, #334155);
  margin: 0 0 6px;
}

.instansi-address {
  font-size: 0.8rem;
  color: var(--text-muted, #64748b);
  margin: 0 0 16px;
}

.header-divider {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #d97706, #2563eb, #1eaa6e);
  border-radius: 2px;
}

.search-box-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.search-form {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-icon {
  color: var(--text-muted, #94a3b8);
  font-size: 1.1rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--text-primary, #0f172a);
  outline: none;
}

.search-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #1d4ed8;
}

.status-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.loading-card {
  text-align: center;
  padding: 48px;
  color: var(--text-muted, #64748b);
}

.loading-icon {
  font-size: 2.2rem;
  color: #2563eb;
  margin-bottom: 12px;
}

.badge-status-valid {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 170, 110, 0.12);
  color: #1eaa6e;
  border: 1.5px solid #1eaa6e;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.92rem;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.badge-status-invalid {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border: 1.5px solid #dc2626;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.92rem;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.doc-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  margin: 0 0 20px;
  line-height: 1.45;
  border-bottom: 1px dashed var(--border-color, #cbd5e1);
  padding-bottom: 14px;
}

.detail-table-wrapper {
  margin-bottom: 24px;
  overflow-x: auto;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table tr {
  border-bottom: 1px solid var(--border-color, #f1f5f9);
}

.detail-table td {
  padding: 10px 8px;
  font-size: 0.9rem;
  vertical-align: top;
}

.td-label {
  width: 38%;
  color: var(--text-muted, #64748b);
  font-weight: 500;
}

.td-val {
  color: var(--text-primary, #0f172a);
}

.font-semibold {
  font-weight: 600;
}

.font-mono {
  font-family: monospace;
  font-weight: 600;
}

.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-pill.active {
  background: rgba(30, 170, 110, 0.12);
  color: #1eaa6e;
}

.verification-footer {
  background: rgba(37, 99, 235, 0.04);
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 12px;
  padding: 16px 20px;
}

.verification-stamp {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2563eb;
  margin-bottom: 10px;
}

.verification-stamp i {
  font-size: 1.8rem;
}

.stamp-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.stamp-time {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--text-muted, #64748b);
}

.legal-notice {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted, #64748b);
  line-height: 1.4;
}

.invalid-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
}

.empty-card {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-muted, #94a3b8);
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  margin: 0;
  font-size: 0.92rem;
  color: var(--text-muted, #64748b);
}

.back-nav {
  text-align: center;
  margin-top: 16px;
}

.back-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
