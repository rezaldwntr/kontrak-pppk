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
              <input type="text" v-model="nomorKontrakBaru" class="form-control">
            </div>
            <div class="form-group">
              <label>Nomor SK Perpanjangan</label>
              <input type="text" v-model="nomorSk" class="form-control">
            </div>
            <div class="form-group">
              <label>Tanggal SK Perpanjangan</label>
              <input type="date" v-model="tanggalSk" class="form-control">
            </div>
            <div class="form-group">
              <label>TMT Kontrak Baru (Mulai)</label>
              <input type="date" v-model="newTmtDate" class="form-control" required @change="recalculate">
            </div>
            <div class="form-group">
              <label>
                Tanggal Akhir Kontrak Baru
                <span
                  v-if="isBup"
                  style="display: inline-block; background: rgba(239,68,68,0.15); color: #ef4444; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; margin-left: 6px; letter-spacing: 0.5px; border: 1px solid rgba(239,68,68,0.35);"
                >BUP</span>
              </label>
              <input type="date" v-model="tanggalAkhir" class="form-control">
            </div>
            <div class="form-group">
              <label>Gaji Pokok Baru (Rp)</label>
              <input type="text" v-model="gajiPokok" class="form-control">
            </div>
          </div>

          <!-- BUP info banner -->
          <div v-if="isBup" style="margin-top: 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 10px 14px; color: #ef4444; font-size: 0.85rem; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-user-clock"></i>
            <span>Tanggal akhir kontrak disesuaikan dengan <strong>Batas Usia Pensiun (BUP)</strong> pegawai ini.</span>
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
        <button class="btn btn-outline btn-icon-only" @click="emit('close')" title="Batal">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <button class="btn btn-primary btn-icon-only" style="background-color: #1eaa6e; border-color: #1eaa6e; color: white;" @click="handleSubmit" :disabled="!newTmtDate" title="Proses Perpanjangan">
          <i class="fa-solid fa-file-signature"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePegawaiStore } from '../../stores/pegawaiStore'
import { calculateContractPeriod, parseDate } from '../../utils/pppkLogic'
import { calculateGajiFromItem, formatRupiah } from '../../utils/gajiTable'

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
const isBup = ref(false)

let currentPegawai = null

const formatDateToInput = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const recalculate = () => {
  if (!currentPegawai || !newTmtDate.value) return

  const isParuhWaktu = currentPegawai['JENIS PPPK'] === 'PPPK Paruh Waktu'
  const contractYears = isParuhWaktu ? 1 : 5

  // Hitung tanggal akhir standar (dari TMT baru)
  const tmtStart = parseDate(newTmtDate.value)
  if (!tmtStart || isNaN(tmtStart.getTime())) return

  let standardEndDate = new Date(tmtStart)
  standardEndDate.setFullYear(standardEndDate.getFullYear() + contractYears)
  standardEndDate.setDate(standardEndDate.getDate() - 1)

  // Hitung BUP
  let bupEndDate = null
  const birthDate = parseDate(currentPegawai['TANGGAL LAHIR'] || '')
  if (birthDate && !isNaN(birthDate.getTime())) {
    const jabatan = (currentPegawai['JABATAN NAMA'] || '').toLowerCase()
    const bupAge = jabatan.includes('guru') ? 60 : 58
    bupEndDate = new Date(birthDate)
    bupEndDate.setFullYear(bupEndDate.getFullYear() + bupAge)
    bupEndDate.setMonth(bupEndDate.getMonth() + 1)
    bupEndDate.setDate(0)
  }

  // Pilih tanggal yang lebih awal
  let finalEndDate = standardEndDate
  isBup.value = false
  if (bupEndDate && bupEndDate.getTime() < standardEndDate.getTime()) {
    finalEndDate = bupEndDate
    isBup.value = true
  }

  tanggalAkhir.value = formatDateToInput(finalEndDate)

  // Hitung gaji pokok baru berdasarkan TMT baru sebagai titik awal masa kerja
  // Masa kerja dihitung dari TMT CPNS awal hingga TMT baru
  const tmtCpns = parseDate(currentPegawai['TMT CPNS'] || currentPegawai['AWAL KONTRAK AKTIF'] || '')
  if (tmtCpns && !isNaN(tmtCpns.getTime())) {
    const yearsFromCpns = (tmtStart - tmtCpns) / (1000 * 60 * 60 * 24 * 365.25)
    const gajiItem = { ...currentPegawai, 'TMT CPNS': formatDateToInput(tmtCpns) }
    // Buat item khusus dengan masa kerja berdasarkan dari TMT CPNS ke TMT baru
    const gajiResult = calculateGajiFromItem({
      ...gajiItem,
      '_override_years': yearsFromCpns
    })
    if (gajiResult && gajiResult.gaji) {
      gajiPokok.value = formatRupiah(gajiResult.gaji)
    }
  }
}

watch(() => props.isOpen, (newVal) => {
  nomorKontrakBaru.value = ''
  nomorSk.value = ''
  tanggalSk.value = ''
  tanggalAkhir.value = ''
  gajiPokok.value = ''
  isBup.value = false
  currentPegawai = null

  if (newVal && props.selectedIds && props.selectedIds.length > 0) {
    currentPegawai = pegawaiStore.pppkData.find(p => p['PNS ID'] === props.selectedIds[0])
    if (currentPegawai) {
      const period = calculateContractPeriod(currentPegawai)
      if (period && period.rawDate && !isNaN(period.rawDate.getTime())) {
        const nextDate = new Date(period.rawDate)
        nextDate.setDate(nextDate.getDate() + 1) // 1 hari setelah akhir kontrak
        newTmtDate.value = formatDateToInput(nextDate)
      } else {
        const today = new Date()
        newTmtDate.value = formatDateToInput(today)
      }
      recalculate()
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
