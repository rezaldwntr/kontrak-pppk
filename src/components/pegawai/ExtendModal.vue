<template>
  <div v-if="isOpen" class="modal-backdrop open" @click.self="emit('close')">
    <div class="modal-container" :style="{ maxWidth: selectedIds.length === 1 ? '720px' : '540px' }">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="modal-header-icon" style="width: 38px; height: 38px; border-radius: 10px; background: rgba(30, 170, 110, 0.12); color: #1eaa6e; display: flex; align-items: center; justify-content: center; font-size: 1.15rem;">
            <i class="fa-solid fa-file-signature"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-dark);">Proses Perpanjangan Kontrak</h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
              {{ selectedIds.length === 1 ? 'Perpanjangan kontrak kerja individu' : `Perpanjangan kontrak serentak untuk ${selectedIds.length} pegawai` }}
            </p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')" aria-label="Tutup">&times;</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="padding: 20px 24px; max-height: 75vh; overflow-y: auto;">
        <!-- Single Pegawai Profile Card -->
        <div v-if="selectedIds.length === 1 && currentPegawai" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(45, 122, 241, 0.1); color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-dark);">{{ currentPegawai['NAMA'] }}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                <span>NIP: {{ currentPegawai['NIP BARU'] }}</span>
                <span>•</span>
                <span>{{ currentPegawai['GOLONGAN'] || 'Golongan -' }}</span>
              </div>
            </div>
          </div>
          <span class="badge" style="background: rgba(30, 170, 110, 0.12); color: #1eaa6e; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
            {{ currentPegawai['JENIS PPPK'] || 'PPPK' }}
          </span>
        </div>

        <!-- Batch info banner -->
        <div v-else class="alert alert-info" style="margin-bottom: 20px; font-size: 0.85rem; background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 12px 16px; color: #1d4ed8; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-users" style="font-size: 1.1rem;"></i>
          <span>Anda akan memperpanjang kontrak untuk <strong>{{ selectedIds.length }}</strong> pegawai terpilih secara kolektif.</span>
        </div>
        
        <!-- Form for Single Mode -->
        <template v-if="selectedIds.length === 1">
          <div class="form-grid">
            <div class="form-group">
              <label style="font-weight: 600; font-size: 0.82rem; margin-bottom: 6px; display: block;">Nomor Kontrak Baru (Perpanjangan)</label>
              <input type="text" v-model="nomorKontrakBaru" class="form-control" placeholder="Contoh: 800.1.2/27/BKPSDM/2026">
            </div>
            <div class="form-group">
              <label style="font-weight: 600; font-size: 0.82rem; margin-bottom: 6px; display: block;">Nomor SK Perpanjangan</label>
              <input type="text" v-model="nomorSk" class="form-control" placeholder="Contoh: 800.1.2/05/BKPSDM/2026">
            </div>
            <div class="form-group">
              <label style="font-weight: 600; font-size: 0.82rem; margin-bottom: 6px; display: block;">Tanggal SK Perpanjangan</label>
              <input type="date" v-model="tanggalSk" class="form-control">
            </div>
            <div class="form-group">
              <label style="font-weight: 600; font-size: 0.82rem; margin-bottom: 6px; display: block;">
                TMT Kontrak Baru (Mulai) <span style="color: #ef4444;">*</span>
              </label>
              <input type="date" v-model="newTmtDate" class="form-control" required @change="recalculate">
            </div>
            <div class="form-group">
              <label style="font-weight: 600; font-size: 0.82rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <span>Tanggal Akhir Kontrak Baru</span>
                <span
                  v-if="isBup"
                  style="display: inline-block; background: rgba(239,68,68,0.15); color: #ef4444; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px; border: 1px solid rgba(239,68,68,0.35);"
                >BUP</span>
              </label>
              <input type="date" v-model="tanggalAkhir" class="form-control">
            </div>
            <div class="form-group">
              <label style="font-weight: 600; font-size: 0.82rem; margin-bottom: 6px; display: block;">Gaji Pokok Baru (Rp)</label>
              <input type="text" v-model="gajiPokok" class="form-control" placeholder="Otomatis terisi dari tabel gaji">
            </div>
          </div>

          <!-- BUP info banner -->
          <div v-if="isBup" style="margin-top: 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 10px 14px; color: #dc2626; font-size: 0.82rem; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-user-clock" style="font-size: 1.1rem;"></i>
            <span>Tanggal akhir kontrak disesuaikan dengan <strong>Batas Usia Pensiun (BUP)</strong> pegawai ini.</span>
          </div>
        </template>
        
        <!-- Form for Batch Mode -->
        <template v-else>
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="font-weight: 600; font-size: 0.88rem; margin-bottom: 6px; display: block;">
              TMT Kontrak Baru (Mulai Serentak) <span style="color: #ef4444;">*</span>
            </label>
            <input type="date" v-model="newTmtDate" class="form-control" required style="font-size: 0.95rem; padding: 10px 14px;">
            <small class="text-muted" style="display: block; margin-top: 6px; font-size: 0.8rem;">
              <i class="fa-solid fa-circle-info" style="color: var(--primary-color);"></i>
              Sistem secara otomatis mengisi rekomendasi tanggal TMT baru (1 hari setelah akhir kontrak lama). Anda dapat mengubahnya bila diperlukan.
            </small>
          </div>

          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-left: 4px solid #f59e0b; padding: 12px 14px; color: #b45309; border-radius: 6px; font-size: 0.82rem; line-height: 1.5;">
            <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-lightbulb"></i>
              <span>Tips Penomoran Kontrak:</span>
            </div>
            Nomor SK dan Nomor Kontrak pada perpanjangan massal dikosongkan sementara. Anda dapat melengkapinya secara otomatis dan cepat menggunakan fitur <strong>"Impor No. Kontrak"</strong> via Excel di Header, atau mengeditnya satu per satu di menu Detail Pegawai.
          </div>
        </template>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px;">
        <button class="btn btn-outline" @click="emit('close')">Batal</button>
        <button 
          class="btn btn-primary" 
          style="background-color: #1eaa6e; border-color: #1eaa6e; color: white;" 
          @click="handleSubmit" 
          :disabled="!newTmtDate"
        >
          <i class="fa-solid fa-file-signature" style="margin-right: 6px;"></i>
          <span>{{ selectedIds.length === 1 ? 'Proses Perpanjangan' : `Perpanjang (${selectedIds.length} Pegawai)` }}</span>
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

const currentPegawai = ref(null)

const formatDateToInput = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const recalculate = () => {
  if (!currentPegawai.value || !newTmtDate.value) return

  const isParuhWaktu = currentPegawai.value['JENIS PPPK'] === 'PPPK Paruh Waktu'
  const contractYears = isParuhWaktu ? 1 : 5

  // Hitung tanggal akhir standar (dari TMT baru)
  const tmtStart = parseDate(newTmtDate.value)
  if (!tmtStart || isNaN(tmtStart.getTime())) return

  let standardEndDate = new Date(tmtStart)
  standardEndDate.setFullYear(standardEndDate.getFullYear() + contractYears)
  standardEndDate.setDate(standardEndDate.getDate() - 1)

  // Hitung BUP
  let bupEndDate = null
  const birthDate = parseDate(currentPegawai.value['TANGGAL LAHIR'] || '')
  if (birthDate && !isNaN(birthDate.getTime())) {
    const jabatan = (currentPegawai.value['JABATAN NAMA'] || '').toLowerCase()
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
  const tmtCpns = parseDate(currentPegawai.value['TMT CPNS'] || currentPegawai.value['AWAL KONTRAK AKTIF'] || '')
  if (tmtCpns && !isNaN(tmtCpns.getTime())) {
    const yearsFromCpns = (tmtStart - tmtCpns) / (1000 * 60 * 60 * 24 * 365.25)
    const gajiItem = { ...currentPegawai.value, 'TMT CPNS': formatDateToInput(tmtCpns) }
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
  currentPegawai.value = null

  if (newVal && props.selectedIds && props.selectedIds.length > 0) {
    currentPegawai.value = pegawaiStore.pppkData.find(p => p['PNS ID'] === props.selectedIds[0])
    if (currentPegawai.value) {
      const period = calculateContractPeriod(currentPegawai.value)
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
/* Inherited from styles.css */
</style>
