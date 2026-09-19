<template>
  <div style="max-width: 800px;">

    <!-- Section A: Koneksi -->
    <div class="settings-section-card" style="padding: 1.5rem; margin-bottom: 20px;">
      <h3 class="section-header">
        <div><i class="fa-brands fa-google-drive"></i> Koneksi Google Drive</div>
      </h3>

      <div v-if="!driveStore.isConnected">
        <p class="text-muted" style="margin-bottom: 16px;">
          Hubungkan akun Google Anda untuk mengaktifkan sinkronisasi dokumen ke Google Drive.
        </p>
        <button class="btn btn-primary" @click="handleConnect" :disabled="isConnecting">
          <i class="fa-brands fa-google"></i>&nbsp;
          {{ isConnecting ? 'Menghubungkan...' : 'Hubungkan Google Drive' }}
        </button>
      </div>

      <div v-else>
        <div style="display: flex; align-items: center; gap: 12px; background: rgba(30,170,110,0.1); border: 1px solid rgba(30,170,110,0.3); border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;">
          <i class="fa-brands fa-google-drive" style="font-size: 1.5rem; color: #1eaa6e;"></i>
          <div>
            <div style="font-weight: bold; color: #1eaa6e;">Terhubung</div>
            <div class="text-muted" style="font-size: 0.85rem;">{{ driveStore.connectedEmail }}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <label style="font-weight: bold;">Aktifkan Auto-Sync</label>
          <div
            @click="toggleEnabled"
            style="cursor:pointer; width:44px; height:24px; border-radius:12px; position:relative; transition:background 0.2s;"
            :style="driveStore.isEnabled ? 'background:#1eaa6e' : 'background:var(--border-color)'"
          >
            <div style="width:20px;height:20px;border-radius:50%;background:white;position:absolute;top:2px;transition:left 0.2s;" :style="driveStore.isEnabled ? 'left:22px' : 'left:2px'"></div>
          </div>
          <span class="text-muted" style="font-size:0.85rem;">{{ driveStore.isEnabled ? 'Aktif' : 'Nonaktif' }}</span>
        </div>

        <button class="btn btn-outline" style="color: #dc2626; border-color: #dc2626;" @click="handleDisconnect">
          <i class="fa-solid fa-link-slash"></i>&nbsp; Putuskan Koneksi
        </button>
      </div>
    </div>

    <!-- Section B: Pengaturan Dokumen -->
    <div class="settings-section-card" style="padding: 1.5rem; margin-bottom: 20px;" v-if="driveStore.isConnected">
      <h3 class="section-header">
        <div><i class="fa-solid fa-sliders"></i> Pengaturan Dokumen Default</div>
      </h3>

      <!-- Folder -->
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="font-weight:bold; margin-bottom:8px; display:block;">Folder Tujuan Google Drive</label>

        <!-- Status Folder Terpilih -->
        <div v-if="driveStore.settings.folderId" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(30, 170, 110, 0.08); border: 1.5px solid #1eaa6e; border-radius: 8px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
            <i class="fa-solid fa-folder-check" style="font-size: 1.3rem; color: #1eaa6e; flex-shrink: 0;"></i>
            <div style="min-width: 0;">
              <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ driveStore.settings.folderName || 'Folder Google Drive' }}
              </div>
              <div style="font-size: 0.78rem; font-family: monospace; color: var(--text-muted);">
                ID: {{ driveStore.settings.folderId }}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-shrink: 0;">
            <a :href="'https://drive.google.com/drive/folders/' + driveStore.settings.folderId" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" title="Buka folder di Google Drive">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button type="button" class="btn btn-sm btn-outline" @click="clearFolder" title="Lepas / Ganti Folder" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Input Link / ID Folder & Tombol Pilih Visual -->
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <input
              type="text"
              class="form-control"
              v-model="manualFolderInput"
              placeholder="Tempel URL folder (drive.google.com/...) atau Folder ID di sini..."
              @keyup.enter="applyManualFolder"
            />
          </div>
          <button type="button" class="btn btn-primary" @click="applyManualFolder" :disabled="isValidatingFolder || !manualFolderInput.trim()" style="white-space:nowrap;" title="Terapkan link / ID folder yang ditempel">
            <i class="fa-solid fa-check" v-if="!isValidatingFolder"></i>
            <i class="fa-solid fa-spinner fa-spin" v-else></i>
            &nbsp;Terapkan Link
          </button>
          <button type="button" class="btn btn-outline" @click="openPicker" :disabled="isPickerLoading" style="white-space:nowrap;" title="Pilih folder secara visual melalui Google Picker">
            <i class="fa-solid fa-folder-open"></i>&nbsp;
            {{ isPickerLoading ? 'Memuat...' : 'Pilih Folder Visual' }}
          </button>
        </div>
        <p class="form-text" style="margin-top: 6px; font-size: 0.8rem; color: var(--text-muted);">
          Anda dapat langsung menyalin URL folder dari browser Google Drive (contoh: <code>drive.google.com/drive/folders/...</code>) lalu klik <strong>Terapkan Link</strong>, atau klik <strong>Pilih Folder Visual</strong>.
        </p>
      </div>

      <!-- Bagian Dokumen -->
      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-weight:bold; margin-bottom:8px; display:block;">Bagian Dokumen</label>
        <select v-model="driveStore.settings.documentPart" class="form-control" style="max-width:300px;">
          <option value="full">Utuh (Perjanjian + Tanda Tangan)</option>
          <option value="perjanjian">Isi Perjanjian Saja</option>
          <option value="tandatangan">Halaman Tanda Tangan Saja</option>
          <option value="pisah">Pisah (2 file terpisah)</option>
        </select>
      </div>

      <!-- Mode File -->
      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-weight:bold; margin-bottom:8px; display:block;">Mode File</label>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <label v-for="opt in mergeModeOptions" :key="opt.value"
            style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:10px 16px; border:1.5px solid var(--border-color); border-radius:8px; flex:1;"
            :style="driveStore.settings.mergeMode === opt.value ? 'border-color:#2563eb; background:rgba(37,99,235,0.05)' : ''">
            <input type="radio" :value="opt.value" v-model="driveStore.settings.mergeMode" style="accent-color:#2563eb;">
            <div>
              <div>{{ opt.label }}</div>
              <div class="text-muted" style="font-size:0.78rem;">{{ opt.desc }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Tanggal Kontrak -->
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="font-weight:bold; margin-bottom:8px; display:block;">Tanggal Penandatanganan Kontrak Default</label>
        <input type="date" v-model="driveStore.settings.tanggalKontrak" class="form-control" style="max-width:220px;">
        <p class="text-muted" style="font-size:0.82rem; margin-top:6px;">Tanggal ini digunakan saat auto-sync. Dapat diubah kapan saja.</p>
      </div>

      <button class="btn btn-primary" @click="saveSettings" :disabled="driveStore.isSaving" style="background-color:var(--primary-color);">
        <i v-if="driveStore.isSaving" class="fa-solid fa-spinner fa-spin"></i>
        <i v-else class="fa-solid fa-save"></i>&nbsp;
        Simpan Pengaturan
      </button>
    </div>

    <!-- Section C: Aturan Sync -->
    <div class="settings-section-card" style="padding: 1.5rem; margin-bottom: 20px;" v-if="driveStore.isConnected">
      <h3 class="section-header">
        <div><i class="fa-solid fa-filter"></i> Aturan Sync Otomatis</div>
      </h3>
      <p class="text-muted" style="margin-bottom:16px;">
        Tentukan kriteria pegawai yang akan otomatis disinkronkan saat data disimpan.
        Pegawai yang memenuhi semua kriteria di bawah akan masuk ke daftar sync.
      </p>

      <!-- Rules -->
      <div v-for="(rule, i) in localRules" :key="i" style="display:flex; gap:8px; margin-bottom:10px; align-items:center;">
        <select v-model="rule.field" class="form-control" style="flex:0 0 180px;" @change="rule.value = ''">
          <option value="">Pilih Kriteria...</option>
          <option value="kelompok">Kelompok Pegawai</option>
          <option value="jenisPppk">Jenis PPPK</option>
          <option value="unorInduk">Unor Induk</option>
        </select>

        <select v-if="rule.field === 'kelompok'" v-model="rule.value" class="form-control" style="flex:1;">
          <option value="Tenaga Guru">Tenaga Guru</option>
          <option value="Tenaga Kesehatan">Tenaga Kesehatan</option>
          <option value="Tenaga Teknis">Tenaga Teknis</option>
        </select>
        <select v-else-if="rule.field === 'jenisPppk'" v-model="rule.value" class="form-control" style="flex:1;">
          <option value="PPPK">PPPK</option>
          <option value="PPPK Penuh Waktu">PPPK Penuh Waktu</option>
          <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
        </select>
        <input v-else v-model="rule.value" class="form-control" placeholder="Nilai kriteria..." style="flex:1;">

        <button class="btn btn-outline" style="color:#dc2626; border-color:#dc2626; flex-shrink:0;" @click="removeRule(i)" title="Hapus kriteria">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <button class="btn btn-outline" @click="addRule" style="margin-bottom:16px;">
        <i class="fa-solid fa-plus"></i>&nbsp; Tambah Kriteria
      </button>

      <div v-if="previewCount !== null" style="padding:10px 14px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); border-radius:8px; margin-bottom:16px; font-size:0.9rem;">
        <i class="fa-solid fa-circle-info" style="color:#2563eb;"></i>
        Dengan aturan ini, <strong>{{ previewCount }}</strong> pegawai aktif akan otomatis disinkronkan.
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-primary" @click="saveRules" :disabled="isSavingRules" style="background-color:var(--primary-color);">
          <i v-if="isSavingRules" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-floppy-disk"></i>&nbsp;
          Simpan Aturan
        </button>
        <button class="btn btn-outline" @click="syncAll" :disabled="isSyncingAll">
          <i v-if="isSyncingAll" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-rotate"></i>&nbsp;
          {{ isSyncingAll ? `Menyinkronkan ${syncProgress}...` : 'Sync Semua Sekarang' }}
        </button>
      </div>
    </div>

    <!-- Section D: Antrian Retry -->
    <div class="settings-section-card" style="padding: 1.5rem;" v-if="driveStore.isConnected && queueItems.length > 0">
      <h3 class="section-header">
        <div>
          <i class="fa-solid fa-clock-rotate-left"></i> Antrian Retry
          <span style="background:#dc2626; color:white; border-radius:999px; padding:2px 8px; font-size:0.8rem; margin-left:8px;">{{ queueItems.length }}</span>
        </div>
      </h3>
      <div class="table-responsive" style="margin-bottom:16px;">
        <table class="table" style="font-size:0.9rem;">
          <thead>
            <tr>
              <th>Pegawai</th>
              <th>Error</th>
              <th>Percobaan</th>
              <th>Retry Berikutnya</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in queueItems" :key="item.id">
              <td><strong>{{ item.pegawaiNama }}</strong><br><small class="text-muted">{{ item.pegawaiNip }}</small></td>
              <td style="color:#dc2626; font-size:0.82rem;">{{ item.errorMsg }}</td>
              <td style="text-align:center;">{{ item.attemptCount }}</td>
              <td style="font-size:0.82rem;">{{ formatDate(item.nextRetry) }}</td>
              <td>
                <button class="btn btn-outline btn-sm" @click="retryItem(item)" title="Coba Lagi">
                  <i class="fa-solid fa-rotate-right"></i>
                </button>
                <button class="btn btn-outline btn-sm" style="color:#dc2626; border-color:#dc2626; margin-left:4px;" @click="deleteQueueItem(item.id)" title="Hapus">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary" @click="retryAll" style="background-color:var(--primary-color);">
        <i class="fa-solid fa-rotate"></i>&nbsp; Coba Lagi Semua
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useDriveStore } from '../../stores/driveStore'
import { useGoogleAuth } from '../../composables/useGoogleAuth'
import { useGoogleDrive } from '../../composables/useGoogleDrive'
import { useDriveSync } from '../../composables/useDriveSync'
import { usePegawaiStore } from '../../stores/pegawaiStore'
import { getStatusPppk, getKelompokPegawai } from '../../utils/pppkLogic'
import { db } from '../../services/firebase'
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { customSwal } from '../../utils/swal'

const driveStore = useDriveStore()
const { startOAuthFlow, handleOAuthCallback, disconnectDrive } = useGoogleAuth()
const { openFolderPicker, getFolderInfo } = useGoogleDrive()
const { shouldSync, syncEmployee, addToQueue } = useDriveSync()
const pegawaiStore = usePegawaiStore()

const isConnecting = ref(false)
const isPickerLoading = ref(false)
const manualFolderInput = ref('')
const isValidatingFolder = ref(false)
const isSavingRules = ref(false)
const isSyncingAll = ref(false)
const syncProgress = ref('')
const queueItems = ref([])

const localRules = ref([])

const mergeModeOptions = [
  { value: 'individual', label: 'Per Pegawai', desc: '1 file per pegawai, dikelompokkan dalam folder Unor' },
  { value: 'merged', label: 'Gabungan', desc: '1 file besar berisi semua kontrak, per Dinas' },
]

const previewCount = computed(() => {
  if (localRules.value.length === 0 || !pegawaiStore.pppkData.length) return null
  const tempRules = localRules.value.filter(r => r.field && r.value)
  if (tempRules.length === 0) return null
  return pegawaiStore.pppkData.filter(item => {
    if (getStatusPppk(item) !== 'Aktif') return false
    return tempRules.every(rule => {
      if (rule.field === 'kelompok') return getKelompokPegawai(item) === rule.value
      if (rule.field === 'jenisPppk') return (item['JENIS PPPK'] || 'PPPK') === rule.value
      if (rule.field === 'unorInduk') {
        const unorNama = item['UNOR NAMA'] || ''
        return unorNama.split('/')[0].trim() === rule.value
      }
      return false
    })
  }).length
})

function formatDate(ts) {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('id-ID')
}

function addRule() {
  localRules.value.push({ field: '', value: '' })
}

function removeRule(i) {
  localRules.value.splice(i, 1)
}

async function saveRules() {
  isSavingRules.value = true
  try {
    const validRules = localRules.value.filter(r => r.field && r.value)
    await driveStore.saveSyncRules(validRules)
    customSwal.fire({ icon: 'success', title: 'Aturan tersimpan!', timer: 1500, showConfirmButton: false })
  } finally {
    isSavingRules.value = false
  }
}

async function saveSettings() {
  await driveStore.saveSettings()
  customSwal.fire({ icon: 'success', title: 'Pengaturan tersimpan!', timer: 1500, showConfirmButton: false })
}

async function toggleEnabled() {
  driveStore.isEnabled = !driveStore.isEnabled
  await driveStore.saveSettings()
}

function handleConnect() {
  isConnecting.value = true
  startOAuthFlow()
}

async function handleDisconnect() {
  const result = await customSwal.fire({
    title: 'Putuskan Google Drive?',
    text: 'Koneksi dan token akan dihapus. Auto-sync akan berhenti.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Putuskan',
  })
  if (result.isConfirmed) {
    await disconnectDrive()
    await driveStore.loadSettings()
  }
}

async function applyManualFolder() {
  const val = manualFolderInput.value.trim()
  if (!val) return
  isValidatingFolder.value = true
  try {
    const folder = await getFolderInfo(val)
    driveStore.settings.folderId = folder.id
    driveStore.settings.folderName = folder.name
    manualFolderInput.value = ''
    await driveStore.saveSettings()
    customSwal.fire({
      icon: 'success',
      title: 'Folder Dihubungkan',
      text: `Folder "${folder.name}" berhasil dihubungkan!`,
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (e) {
    customSwal.fire({
      icon: 'error',
      title: 'Gagal Menghubungkan Folder',
      text: e.message || 'Pastikan link atau ID folder valid dan akun Google Drive Anda memiliki akses ke folder tersebut.',
    })
  } finally {
    isValidatingFolder.value = false
  }
}

function clearFolder() {
  driveStore.settings.folderId = ''
  driveStore.settings.folderName = ''
  driveStore.saveSettings()
}

async function openPicker() {
  isPickerLoading.value = true
  try {
    await openFolderPicker(async ({ id, name }) => {
      driveStore.settings.folderId = id
      driveStore.settings.folderName = name
      await driveStore.saveSettings()
      isPickerLoading.value = false
      customSwal.fire({
        icon: 'success',
        title: 'Folder Dipilih',
        text: `Folder "${name}" berhasil dihubungkan!`,
        timer: 2000,
        showConfirmButton: false,
      })
    })
  } catch (e) {
    isPickerLoading.value = false
    customSwal.fire({ icon: 'error', title: 'Gagal membuka picker', text: e.message })
  }
}

async function syncAll() {
  const candidates = pegawaiStore.pppkData.filter(item =>
    getStatusPppk(item) === 'Aktif' && shouldSync(item)
  )
  if (candidates.length === 0) {
    return customSwal.fire({ icon: 'info', title: 'Tidak ada pegawai', text: 'Tidak ada pegawai yang memenuhi aturan sync.' })
  }

  isSyncingAll.value = true
  let done = 0
  for (const item of candidates) {
    syncProgress.value = `${++done}/${candidates.length}`
    try {
      await syncEmployee(item)
    } catch (err) {
      await addToQueue(item, err)
    }
  }
  isSyncingAll.value = false
  customSwal.fire({ icon: 'success', title: 'Sync selesai!', text: `${done} dokumen berhasil disinkronkan.`, timer: 2000, showConfirmButton: false })
}

async function retryItem(item) {
  try {
    const pegawaiData = JSON.parse(item.itemSnapshot || '{}')
    await syncEmployee(pegawaiData)
    await deleteDoc(doc(db, 'sync_queue', item.id))
    customSwal.fire({ icon: 'success', title: 'Berhasil!', timer: 1500, showConfirmButton: false })
  } catch (err) {
    customSwal.fire({ icon: 'error', title: 'Gagal', text: err.message })
  }
}

async function retryAll() {
  for (const item of queueItems.value) {
    await retryItem(item)
  }
}

async function deleteQueueItem(id) {
  await deleteDoc(doc(db, 'sync_queue', id))
}

// Listen ke sync queue
onMounted(async () => {
  await driveStore.loadSettings()

  // Init localRules dari store
  localRules.value = driveStore.syncRules.map(r => ({ ...r }))

  // Cek OAuth callback
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const oauthError = urlParams.get('error')

  if (oauthError) {
    window.history.replaceState({}, '', window.location.pathname)
    customSwal.fire({ icon: 'warning', title: 'Otorisasi Dibatalkan', text: `Google: ${oauthError}` })
  } else if (code) {
    try {
      customSwal.fire({ title: 'Menghubungkan...', html: 'Memproses otorisasi Google Drive...', allowOutsideClick: false, didOpen: () => customSwal.showLoading() })
      await handleOAuthCallback(code)
      // Bersihkan URL
      window.history.replaceState({}, '', window.location.pathname)
      await driveStore.loadSettings()
      customSwal.fire({ icon: 'success', title: 'Google Drive terhubung!', text: `Akun: ${driveStore.connectedEmail}`, timer: 2500, showConfirmButton: false })
    } catch (err) {
      window.history.replaceState({}, '', window.location.pathname)
      customSwal.fire({ icon: 'error', title: 'Koneksi gagal', text: err.message })
    }
  }

  // Load Google Picker script
  if (!window.google?.picker) {
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => window.gapi.load('picker', () => {})
    document.head.appendChild(script)
  }

  // Listen queue
  const q = query(collection(db, 'sync_queue'), where('status', '==', 'pending'))
  onSnapshot(q, (snapshot) => {
    queueItems.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    driveStore.queueCount = queueItems.value.length
  })
})

watch(() => driveStore.syncRules, (newRules) => {
  localRules.value = newRules.map(r => ({ ...r }))
}, { deep: true })
</script>
