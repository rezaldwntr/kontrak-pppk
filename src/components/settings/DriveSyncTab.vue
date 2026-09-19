<template>
  <div class="drive-sync-wrapper">

    <!-- Card 1: Koneksi Akun Google Drive -->
    <div class="drive-card">
      <div class="drive-card-header">
        <div class="card-title-group">
          <i class="fa-brands fa-google-drive icon-accent-drive"></i>
          <span>Koneksi Akun Google Drive</span>
        </div>
      </div>

      <!-- State: Belum Terhubung -->
      <div v-if="!driveStore.isConnected" class="connect-prompt-box">
        <div class="connect-prompt-icon">
          <i class="fa-brands fa-google-drive"></i>
        </div>
        <div class="connect-prompt-content">
          <h4>Hubungkan Google Drive Anda</h4>
          <p>
            Integrasikan akun Google Drive Anda untuk mengaktifkan pengarsipan otomatis dan sinkronisasi berkas dokumen perjanjian kerja PPPK langsung ke penyimpanan cloud resmi instansi.
          </p>
          <button class="btn btn-primary btn-connect" @click="handleConnect" :disabled="isConnecting">
            <i class="fa-brands fa-google"></i>
            <span>{{ isConnecting ? 'Menghubungkan...' : 'Hubungkan dengan Google Drive' }}</span>
          </button>
        </div>
      </div>

      <!-- State: Sudah Terhubung -->
      <div v-else class="connected-content">
        <!-- Bar Akun -->
        <div class="account-card-bar">
          <div class="account-profile-box">
            <div class="drive-brand-circle">
              <i class="fa-brands fa-google-drive"></i>
            </div>
            <div class="account-meta">
              <div class="account-status-line">
                <span class="status-indicator-dot"></span>
                <span class="status-label">Terhubung ke Google Drive</span>
              </div>
              <div class="account-email">{{ driveStore.connectedEmail || 'Akun Google' }}</div>
            </div>
          </div>
          <div class="account-action-buttons">
            <button
              class="btn btn-sm btn-outline btn-reconnect"
              @click="reconnectWithDrive"
              title="Hubungkan ulang akun untuk memperbarui hak akses izin"
            >
              <i class="fa-solid fa-rotate"></i>
              <span>Perbarui Izin</span>
            </button>
            <button
              class="btn btn-sm btn-outline btn-outline-danger"
              @click="handleDisconnect"
              title="Putuskan koneksi Google Drive"
            >
              <i class="fa-solid fa-link-slash"></i>
              <span>Putuskan</span>
            </button>
          </div>
        </div>

        <!-- Banner Auto-Sync -->
        <div class="auto-sync-row">
          <div class="auto-sync-info">
            <div class="auto-sync-title">
              <i class="fa-solid fa-arrows-rotate"></i>
              <span>Sinkronisasi Otomatis (Auto-Sync)</span>
              <span :class="driveStore.isEnabled ? 'pill-active' : 'pill-inactive'">
                {{ driveStore.isEnabled ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
            <p class="auto-sync-caption">
              Dokumen kontrak otomatis dibuat dan diunggah ke Google Drive setiap kali Anda menyimpan perubahan data pegawai aktif.
            </p>
          </div>
          <div class="switch-container" @click="toggleEnabled" role="button" tabindex="0" title="Aktif/Nonaktifkan Sinkronisasi Otomatis">
            <div class="switch-track" :class="{ 'switch-on': driveStore.isEnabled }">
              <div class="switch-thumb"></div>
            </div>
          </div>
        </div>

        <!-- Banner Peringatan jika Izin Google Drive Belum Diberikan -->
        <div v-if="!driveStore.hasDriveScope" class="scope-warning-box">
          <div class="scope-warning-header">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>
              <h5>Izin Akses Google Drive Belum Lengkap</h5>
              <p>
                Akun Google Anda terhubung tanpa izin mengelola Google Drive. Silakan klik tombol di bawah dan <strong>pastikan mencentang seluruh kotak izin Google Drive</strong> saat login di halaman otentikasi Google.
              </p>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-danger" @click="reconnectWithDrive">
            <i class="fa-solid fa-rotate"></i>
            <span>Hubungkan Ulang & Berikan Izin Drive</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Card 2: Folder Tujuan Google Drive -->
    <div class="drive-card" v-if="driveStore.isConnected">
      <div class="drive-card-header">
        <div class="card-title-group">
          <i class="fa-solid fa-folder-tree icon-accent-folder"></i>
          <span>Folder Tujuan Penyimpanan di Google Drive</span>
        </div>
      </div>

      <!-- Status Folder Terpilih (Aktif) -->
      <div v-if="driveStore.settings.folderId" class="active-folder-card">
        <div class="active-folder-left">
          <div class="folder-avatar">
            <i class="fa-solid fa-folder-check"></i>
          </div>
          <div class="folder-details">
            <div class="folder-name-row">
              <span class="folder-name">{{ driveStore.settings.folderName || 'Folder Google Drive' }}</span>
              <span class="badge-folder-active">Folder Aktif</span>
            </div>
            <div class="folder-id-tag">
              <i class="fa-solid fa-hashtag"></i>
              <span>ID: {{ driveStore.settings.folderId }}</span>
            </div>
          </div>
        </div>
        <div class="active-folder-actions">
          <a
            :href="'https://drive.google.com/drive/folders/' + driveStore.settings.folderId"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm btn-outline"
            title="Buka folder di tab baru Google Drive"
          >
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Buka di Drive</span>
          </a>
          <button
            type="button"
            class="btn btn-sm btn-outline btn-outline-danger"
            @click="clearFolder"
            title="Ganti atau lepas folder tujuan"
          >
            <i class="fa-solid fa-xmark"></i>
            <span>Lepas Folder</span>
          </button>
        </div>
      </div>

      <!-- Formulir Pemilihan / Penghubungan Folder -->
      <div class="folder-selection-panel">
        <div class="panel-section-title">Pilih atau ubah folder penyimpanan:</div>

        <!-- Tombol Aksi Utama -->
        <div class="folder-action-buttons">
          <button
            type="button"
            class="btn btn-primary"
            @click="openPicker"
            :disabled="isPickerLoading"
            title="Buka jendela Google Picker untuk memilih folder secara visual"
          >
            <i class="fa-solid fa-folder-open" v-if="!isPickerLoading"></i>
            <i class="fa-solid fa-spinner fa-spin" v-else></i>
            <span>{{ isPickerLoading ? 'Membuka Picker...' : (driveStore.settings.folderId ? 'Ganti Folder (Google Picker)' : 'Pilih Folder (Google Picker)') }}</span>
          </button>

          <button
            type="button"
            class="btn btn-outline"
            @click="createNewDriveFolder"
            :disabled="isValidatingFolder"
            title="Buat folder baru otomatis di root Google Drive"
          >
            <i class="fa-solid fa-folder-plus icon-success"></i>
            <span>Buat Folder Otomatis</span>
          </button>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline btn-drive-link"
            title="Buka Google Drive di tab baru"
          >
            <i class="fa-brands fa-google-drive"></i>
            <span>Buka Google Drive</span>
          </a>
        </div>

        <!-- Opsi Tempel Link / ID Manual -->
        <div class="manual-input-box">
          <label class="manual-input-label">Atau tempel Link URL / ID Folder Google Drive secara manual:</label>
          <div class="manual-input-row">
            <input
              type="text"
              class="form-control manual-input-field"
              v-model="manualFolderInput"
              placeholder="Contoh: https://drive.google.com/drive/folders/1aBcDeFgHiJk... atau tempel ID folder"
              @keyup.enter="applyManualFolder"
              :disabled="isValidatingFolder"
            />
            <button
              type="button"
              class="btn btn-outline btn-apply-manual"
              @click="applyManualFolder"
              :disabled="isValidatingFolder || !manualFolderInput.trim()"
            >
              <i class="fa-solid fa-check" v-if="!isValidatingFolder"></i>
              <i class="fa-solid fa-spinner fa-spin" v-else></i>
              <span>Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3: Pengaturan Format Dokumen & Penamaan File -->
    <div class="drive-card" v-if="driveStore.isConnected">
      <div class="drive-card-header">
        <div class="card-title-group">
          <i class="fa-solid fa-sliders icon-accent-sliders"></i>
          <span>Pengaturan Format Dokumen & Penamaan Berkas</span>
        </div>
      </div>

      <!-- Grid Pengaturan 2 Kolom -->
      <div class="settings-two-col-grid">

        <!-- Kolom 1: Bagian Dokumen -->
        <div class="setting-grid-item">
          <label class="field-label-bold">Bagian Dokumen</label>
          <select v-model="driveStore.settings.documentPart" class="form-control select-modern">
            <option value="full">Utuh (Perjanjian + Tanda Tangan)</option>
            <option value="perjanjian">Isi Perjanjian Saja</option>
            <option value="tandatangan">Halaman Tanda Tangan Saja</option>
            <option value="pisah">Pisah (2 file terpisah)</option>
          </select>
          <span class="field-caption">Pilih bagian dokumen perjanjian kerja yang akan disimpan.</span>
        </div>

        <!-- Kolom 2: Tanggal Kontrak Default -->
        <div class="setting-grid-item">
          <label class="field-label-bold">Tanggal Kontrak Default</label>
          <input type="date" v-model="driveStore.settings.tanggalKontrak" class="form-control date-modern">
          <span class="field-caption">Tanggal penandatanganan yang digunakan saat proses auto-sync.</span>
        </div>

        <!-- Kolom 3: Mode File -->
        <div class="setting-grid-item">
          <label class="field-label-bold">Mode Pengelompokan File</label>
          <div class="radio-card-grid">
            <label
              v-for="opt in mergeModeOptions"
              :key="opt.value"
              class="radio-selection-card"
              :class="{ 'card-selected': driveStore.settings.mergeMode === opt.value }"
            >
              <input
                type="radio"
                :value="opt.value"
                v-model="driveStore.settings.mergeMode"
                class="radio-input-element"
              />
              <div class="radio-selection-content">
                <span class="radio-selection-title">{{ opt.label }}</span>
                <span class="radio-selection-desc">{{ opt.desc }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Kolom 4: Format Nama File Pegawai (Pilihan Gelar - Contoh Dihilangkan) -->
        <div class="setting-grid-item">
          <label class="field-label-bold">Format Penamaan File Pegawai</label>
          <div class="radio-card-grid">
            <label
              class="radio-selection-card"
              :class="{ 'card-selected': !driveStore.settings.includeGelar }"
            >
              <input
                type="radio"
                :value="false"
                v-model="driveStore.settings.includeGelar"
                class="radio-input-element"
              />
              <div class="radio-selection-content">
                <span class="radio-selection-title">Tanpa Gelar</span>
                <span class="badge-recommended">Rekomendasi</span>
              </div>
            </label>

            <label
              class="radio-selection-card"
              :class="{ 'card-selected': driveStore.settings.includeGelar }"
            >
              <input
                type="radio"
                :value="true"
                v-model="driveStore.settings.includeGelar"
                class="radio-input-element"
              />
              <div class="radio-selection-content">
                <span class="radio-selection-title">Sertakan Gelar</span>
              </div>
            </label>
          </div>
          <span class="field-caption">
            <i class="fa-solid fa-circle-check icon-success"></i> Spasi di tengah nama tetap dipertahankan sesuai nama pegawai.
          </span>
        </div>

      </div>

      <!-- Tombol Simpan Pengaturan -->
      <div class="settings-action-row">
        <button
          type="button"
          class="btn btn-primary btn-save-settings"
          @click="saveSettings"
          :disabled="driveStore.isSaving"
        >
          <i v-if="driveStore.isSaving" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-floppy-disk"></i>
          <span>{{ driveStore.isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Dokumen' }}</span>
        </button>
      </div>
    </div>

    <!-- Card 4: Aturan Sync Otomatis -->
    <div class="drive-card" v-if="driveStore.isConnected">
      <div class="drive-card-header">
        <div class="card-title-group">
          <i class="fa-solid fa-filter icon-accent-filter"></i>
          <span>Aturan Filter Sinkronisasi Otomatis</span>
        </div>
      </div>

      <p class="section-lead-text">
        Tentukan kriteria pegawai yang akan otomatis disinkronkan ke Google Drive. Pegawai aktif yang memenuhi kriteria di bawah akan otomatis diproses.
      </p>

      <!-- Daftar Baris Aturan -->
      <div class="rules-list-container">
        <div v-for="(rule, i) in localRules" :key="i" class="rule-item-row">
          <div class="rule-field-wrap">
            <select v-model="rule.field" class="form-control" @change="rule.value = ''">
              <option value="">Pilih Kriteria...</option>
              <option value="kelompok">Kelompok Pegawai</option>
              <option value="jenisPppk">Jenis PPPK</option>
              <option value="unorInduk">Unor Induk</option>
            </select>
          </div>

          <div class="rule-value-wrap">
            <select v-if="rule.field === 'kelompok'" v-model="rule.value" class="form-control">
              <option value="Tenaga Guru">Tenaga Guru</option>
              <option value="Tenaga Kesehatan">Tenaga Kesehatan</option>
              <option value="Tenaga Teknis">Tenaga Teknis</option>
            </select>
            <select v-else-if="rule.field === 'jenisPppk'" v-model="rule.value" class="form-control">
              <option value="PPPK">PPPK</option>
              <option value="PPPK Penuh Waktu">PPPK Penuh Waktu</option>
              <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
            </select>
            <select v-else-if="rule.field === 'unorInduk' && unorIndukOptions.length > 0" v-model="rule.value" class="form-control">
              <option value="">Pilih Unor Induk...</option>
              <option v-for="opt in unorIndukOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <input v-else v-model="rule.value" class="form-control" placeholder="Nilai kriteria..." />
          </div>

          <button
            type="button"
            class="btn btn-outline btn-outline-danger btn-delete-rule"
            @click="removeRule(i)"
            title="Hapus kriteria ini"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>

      <!-- Tombol Tambah Kriteria -->
      <button type="button" class="btn btn-outline btn-add-rule" @click="addRule">
        <i class="fa-solid fa-plus"></i>
        <span>Tambah Kriteria Filter</span>
      </button>

      <!-- Banner Pratinjau Kriteria -->
      <div v-if="previewCount !== null" class="criteria-preview-box">
        <i class="fa-solid fa-circle-info criteria-preview-icon"></i>
        <div class="criteria-preview-text">
          <span v-if="hasActiveRules">
            Dengan aturan ini, sebanyak <strong>{{ previewCount }} pegawai aktif</strong> memenuhi kriteria sinkronisasi.
          </span>
          <span v-else>
            Belum ada filter khusus (seluruh <strong>{{ previewCount }} pegawai aktif</strong> siap disinkronkan).
          </span>
        </div>
      </div>
      <div v-else-if="pegawaiStore.isLoading" class="criteria-preview-box criteria-loading">
        <i class="fa-solid fa-spinner fa-spin criteria-preview-icon"></i>
        <span>Memuat data pegawai...</span>
      </div>

      <!-- Aksi Aturan Sync -->
      <div class="rules-actions-row">
        <button
          type="button"
          class="btn btn-primary"
          @click="saveRules"
          :disabled="isSavingRules"
        >
          <i v-if="isSavingRules" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-floppy-disk"></i>
          <span>Simpan Aturan Filter</span>
        </button>

        <button
          type="button"
          class="btn btn-outline btn-sync-all"
          @click="syncAll"
          :disabled="isSyncingAll"
        >
          <i v-if="isSyncingAll" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-cloud-arrow-up"></i>
          <span>{{ isSyncingAll ? `Menyinkronkan ${syncProgress}...` : 'Sync Semua Sekarang' }}</span>
        </button>
      </div>
    </div>

    <!-- Card 5: Antrian Retry (Jika Ada Kegagalan) -->
    <div class="drive-card" v-if="driveStore.isConnected && queueItems.length > 0">
      <div class="drive-card-header">
        <div class="card-title-group">
          <i class="fa-solid fa-clock-rotate-left icon-accent-retry"></i>
          <span>Antrian Retry Sinkronisasi</span>
          <span class="badge-queue-count">{{ queueItems.length }}</span>
        </div>
      </div>

      <div class="table-responsive queue-table-wrap">
        <table class="table queue-table">
          <thead>
            <tr>
              <th>Pegawai</th>
              <th>Pesan Kendala</th>
              <th style="text-align:center;">Percobaan</th>
              <th>Jadwal Coba Lagi</th>
              <th style="text-align:center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in queueItems" :key="item.id">
              <td>
                <div class="queue-pegawai-name">{{ item.pegawaiNama }}</div>
                <div class="queue-pegawai-nip">{{ item.pegawaiNip }}</div>
              </td>
              <td>
                <span class="queue-error-msg">{{ item.errorMsg }}</span>
              </td>
              <td style="text-align:center;">
                <span class="badge-attempt">{{ item.attemptCount }}x</span>
              </td>
              <td class="queue-time-cell">{{ formatDate(item.nextRetry) }}</td>
              <td style="text-align:center;">
                <div class="queue-actions-inline">
                  <button class="btn btn-sm btn-outline" @click="retryItem(item)" title="Coba Lagi Sekarang">
                    <i class="fa-solid fa-rotate-right"></i>
                  </button>
                  <button class="btn btn-sm btn-outline btn-outline-danger" @click="deleteQueueItem(item.id)" title="Hapus dari antrian">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="queue-footer-row">
        <button class="btn btn-primary" @click="retryAll">
          <i class="fa-solid fa-rotate"></i>
          <span>Coba Lagi Semua Antrian</span>
        </button>
      </div>
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
import { getStatusPppk, getKelompokPegawai, getUnorInduk } from '../../utils/pppkLogic'
import { db } from '../../services/firebase'
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { customSwal } from '../../utils/swal'

const driveStore = useDriveStore()
const { startOAuthFlow, handleOAuthCallback, disconnectDrive } = useGoogleAuth()
const { openFolderPicker, getFolderInfo, createFolder } = useGoogleDrive()
const { shouldSync, matchRules, syncEmployee, addToQueue } = useDriveSync()
const pegawaiStore = usePegawaiStore()

const unorIndukOptions = computed(() => {
  if (!pegawaiStore.pppkData.length) return []
  const types = new Set(pegawaiStore.pppkData.map(item => getUnorInduk(item['UNOR NAMA'] || item['UNIT KERJA'] || '')))
  return Array.from(types).filter(t => t && t !== '-').sort()
})

const isConnecting = ref(false)
const isPickerLoading = ref(false)
const manualFolderInput = ref('')
const isValidatingFolder = ref(false)
const showManualInput = ref(false)
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
  if (!pegawaiStore.pppkData.length) return null
  const tempRules = localRules.value.filter(r => r.field && r.value)
  return pegawaiStore.pppkData.filter(item => {
    if (getStatusPppk(item) !== 'Aktif') return false
    return matchRules(item, tempRules, driveStore.syncRulesLogic)
  }).length
})

const hasActiveRules = computed(() => {
  return localRules.value.some(r => r.field && r.value)
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

async function reconnectWithDrive() {
  await disconnectDrive()
  startOAuthFlow()
}

async function promptInsufficientScopes() {
  const result = await customSwal.fire({
    icon: 'warning',
    title: 'Izin Google Drive Belum Lengkap',
    html: `
      <div style="text-align: left; font-size: 0.9rem; line-height: 1.55;">
        <p style="margin-bottom: 8px;">Google melaporkan: <strong>Request had insufficient authentication scopes</strong>.</p>
        <p style="margin-bottom: 10px;">Artinya akun Google Anda saat ini terhubung <u>tanpa izin mengelola Google Drive</u>.</p>
        <div style="background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.25); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
          <strong style="color: #2563eb; display: block; margin-bottom: 6px;">Langkah Penyelesaian Mudah:</strong>
          <ol style="margin: 0 0 0 16px; padding: 0;">
            <li style="margin-bottom: 4px;">Klik tombol <strong>"Hubungkan Ulang Sekarang"</strong> di bawah.</li>
            <li style="margin-bottom: 4px;">Pilih akun Google Anda.</li>
            <li><strong style="color: #2563eb;">PENTING:</strong> Pada layar persetujuan Google, pastikan Anda <strong>mencentang kotak izin</strong>:<br/>
              <span style="display:inline-block; margin-top: 6px; padding: 4px 8px; background: rgba(37,99,235,0.12); border-radius: 4px; font-weight: 600; color: #1e40af;">
                ☑ Lihat, edit, buat, dan hapus semua file Google Drive Anda
              </span>
            </li>
          </ol>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-rotate"></i>&nbsp; Hubungkan Ulang Sekarang',
    cancelButtonText: 'Tutup',
    confirmButtonColor: '#2563eb',
  })
  if (result.isConfirmed) {
    await reconnectWithDrive()
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
    if (e.message && e.message.toLowerCase().includes('insufficient')) {
      await promptInsufficientScopes()
      return
    }
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

async function createNewDriveFolder() {
  const { value: folderName } = await customSwal.fire({
    title: 'Buat Folder di Google Drive',
    input: 'text',
    inputLabel: 'Nama Folder Baru:',
    inputValue: 'KONTRAK PPPK',
    showCancelButton: true,
    confirmButtonText: 'Buat & Hubungkan',
    cancelButtonText: 'Batal',
    inputValidator: (val) => {
      if (!val || !val.trim()) return 'Nama folder tidak boleh kosong'
    }
  })

  if (!folderName) return

  isValidatingFolder.value = true
  try {
    const newFolderId = await createFolder(folderName.trim(), 'root')
    driveStore.settings.folderId = newFolderId
    driveStore.settings.folderName = folderName.trim()
    await driveStore.saveSettings()
    customSwal.fire({
      icon: 'success',
      title: 'Folder Berhasil Dibuat!',
      text: `Folder "${folderName.trim()}" berhasil dibuat di Google Drive dan terhubung sebagai folder tujuan.`,
      timer: 2500,
      showConfirmButton: false,
    })
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('insufficient')) {
      await promptInsufficientScopes()
      return
    }
    customSwal.fire({
      icon: 'error',
      title: 'Gagal Membuat Folder',
      text: err.message || 'Terjadi kesalahan saat membuat folder di Google Drive.',
    })
  } finally {
    isValidatingFolder.value = false
  }
}

async function openPicker() {
  isPickerLoading.value = true
  try {
    await openFolderPicker(
      async ({ id, name }) => {
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
      },
      () => {
        // Callback saat user klik Batal atau tutup popup Picker
        isPickerLoading.value = false
      },
      () => {
        // Callback saat jendela popup Picker sudah muncul di layar
        isPickerLoading.value = false
      }
    )
  } catch (e) {
    isPickerLoading.value = false
    if (e.message && e.message.toLowerCase().includes('insufficient')) {
      await promptInsufficientScopes()
      return
    }
    customSwal.fire({
      icon: 'error',
      title: 'Gagal membuka Google Picker',
      text: e.message || 'Terjadi kesalahan saat memuat Google Picker.',
    })
  }
}

async function syncAll() {
  if (!driveStore.isConnected) {
    return customSwal.fire({
      icon: 'warning',
      title: 'Belum Terhubung',
      text: 'Silakan hubungkan Google Drive terlebih dahulu.'
    })
  }

  if (!driveStore.settings.folderId) {
    return customSwal.fire({
      icon: 'warning',
      title: 'Folder Belum Dipilih',
      text: 'Silakan pilih atau buat folder tujuan Google Drive terlebih dahulu.'
    })
  }

  // Jika data pegawai belum termuat di store, tunggu proses load
  if (pegawaiStore.isLoading || pegawaiStore.pppkData.length === 0) {
    customSwal.fire({
      title: 'Memuat data pegawai...',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => customSwal.showLoading()
    })
    if (pegawaiStore.pppkData.length === 0) {
      pegawaiStore.loadData()
    }
    const startTime = Date.now()
    while ((pegawaiStore.isLoading || pegawaiStore.pppkData.length === 0) && Date.now() - startTime < 12000) {
      await new Promise(r => setTimeout(r, 250))
    }
    customSwal.close()
  }

  // Gunakan aturan yang valid dari formulir layar
  const validRules = localRules.value.filter(r => r.field && r.value)
  if (JSON.stringify(validRules) !== JSON.stringify(driveStore.syncRules)) {
    await driveStore.saveSyncRules(validRules)
  }

  const candidates = pegawaiStore.pppkData.filter(item =>
    getStatusPppk(item) === 'Aktif' && matchRules(item, validRules, driveStore.syncRulesLogic)
  )

  if (candidates.length === 0) {
    return customSwal.fire({
      icon: 'info',
      title: 'Tidak ada pegawai',
      text: validRules.length > 0
        ? 'Tidak ada pegawai aktif yang memenuhi kriteria aturan sync yang dipilih.'
        : 'Tidak ada data pegawai aktif yang ditemukan.'
    })
  }

  const confirmResult = await customSwal.fire({
    title: 'Mulai Sinkronisasi?',
    html: `Ditemukan <b>${candidates.length} pegawai aktif</b> yang memenuhi kriteria.<br>Dokumen akan dibuat dan diunggah ke folder Google Drive. Lanjutkan?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Mulai Sync',
    cancelButtonText: 'Batal',
    confirmButtonColor: 'var(--primary-color)',
  })

  if (!confirmResult.isConfirmed) return

  isSyncingAll.value = true
  let done = 0
  let failed = 0
  for (const item of candidates) {
    syncProgress.value = `${++done}/${candidates.length}`
    try {
      await syncEmployee(item)
    } catch (err) {
      failed++
      await addToQueue(item, err)
    }
  }
  isSyncingAll.value = false
  syncProgress.value = ''

  if (failed > 0) {
    customSwal.fire({
      icon: 'warning',
      title: 'Sync Selesai dengan Catatan',
      text: `${done - failed} dokumen berhasil disinkronkan, ${failed} dokumen masuk ke Antrian Retry karena kendala jaringan atau batas API Google.`,
    })
  } else {
    customSwal.fire({
      icon: 'success',
      title: 'Sync Selesai!',
      text: `Seluruh ${done} dokumen pegawai berhasil disinkronkan ke Google Drive.`,
      timer: 2500,
      showConfirmButton: false
    })
  }
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
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
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

<style scoped>
.drive-sync-wrapper {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-bottom: 40px;
}

/* Card Container */
.drive-card {
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  padding: 1.6rem 1.85rem;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.drive-card:hover {
  border-color: rgba(var(--primary-color-rgb, 16, 185, 129), 0.35);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.06));
}

/* Card Header */
.drive-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1.5px solid var(--border-color, #e5e7eb);
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.icon-accent-drive { color: #1eaa6e; font-size: 1.35rem; }
.icon-accent-folder { color: #3b82f6; font-size: 1.25rem; }
.icon-accent-sliders { color: #8b5cf6; font-size: 1.25rem; }
.icon-accent-filter { color: #f59e0b; font-size: 1.25rem; }
.icon-accent-retry { color: #ef4444; font-size: 1.25rem; }
.icon-success { color: var(--success-color, #10B981); }

/* Belum Terhubung State */
.connect-prompt-box {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 24px;
  background: var(--bg-primary, #f9fafb);
  border: 1.5px dashed var(--border-color, #e5e7eb);
  border-radius: 14px;
}

.connect-prompt-icon {
  font-size: 3rem;
  color: #1eaa6e;
  flex-shrink: 0;
  padding: 12px;
  background: rgba(30, 170, 110, 0.1);
  border-radius: 14px;
}

.connect-prompt-content h4 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.connect-prompt-content p {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.btn-connect {
  padding: 10px 22px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Terhubung: Bar Akun */
.account-card-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  background: rgba(16, 185, 129, 0.07);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 16px;
}

.account-profile-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drive-brand-circle {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  color: #10B981;
  flex-shrink: 0;
}

.account-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-status-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  display: inline-block;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
}

.status-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #10B981;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.account-email {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.account-action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-outline-danger {
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
}

.btn-outline-danger:hover {
  background: rgba(239, 68, 68, 0.08) !important;
  border-color: #ef4444 !important;
}

/* Auto-Sync Row */
.auto-sync-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: var(--bg-primary, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 16px;
}

.auto-sync-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.auto-sync-caption {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.pill-active {
  font-size: 0.75rem;
  font-weight: 700;
  color: #10B981;
  background: rgba(16, 185, 129, 0.15);
  padding: 2px 8px;
  border-radius: 999px;
}

.pill-inactive {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-light);
  background: rgba(100, 116, 139, 0.15);
  padding: 2px 8px;
  border-radius: 999px;
}

/* Switch Toggle Component */
.switch-container {
  cursor: pointer;
  padding: 4px;
  outline: none;
}

.switch-track {
  width: 48px;
  height: 26px;
  border-radius: 14px;
  background: var(--border-color, #d1d5db);
  position: relative;
  transition: background 0.25s ease;
}

.switch-track.switch-on {
  background: var(--primary-color, #10B981);
}

.switch-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.22);
}

.switch-track.switch-on .switch-thumb {
  transform: translateX(22px);
}

/* Scope Warning Box */
.scope-warning-box {
  margin-top: 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1.5px solid #ef4444;
  border-radius: 12px;
  padding: 16px 20px;
}

.scope-warning-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.scope-warning-header i {
  color: #ef4444;
  font-size: 1.35rem;
  margin-top: 2px;
}

.scope-warning-header h5 {
  margin: 0 0 4px 0;
  color: #ef4444;
  font-weight: 700;
  font-size: 0.95rem;
}

.scope-warning-header p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.5;
}

/* Folder Aktif Card */
.active-folder-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  background: rgba(16, 185, 129, 0.07);
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 18px;
}

.active-folder-left {
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  min-width: 0;
}

.folder-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #10B981;
  flex-shrink: 0;
}

.folder-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.folder-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.folder-name {
  font-weight: 700;
  font-size: 1.02rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-folder-active {
  font-size: 0.72rem;
  font-weight: 700;
  color: #10B981;
  background: rgba(16, 185, 129, 0.16);
  padding: 2px 7px;
  border-radius: 5px;
}

.folder-id-tag {
  font-size: 0.8rem;
  font-family: monospace;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 5px;
}

.active-folder-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

/* Folder Selection Panel */
.folder-selection-panel {
  background: var(--bg-primary, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 16px 20px;
}

.panel-section-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.folder-action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}

.folder-action-buttons .btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 9px 16px;
}

.manual-input-box {
  border-top: 1px dashed var(--border-color, #e5e7eb);
  padding-top: 14px;
}

.manual-input-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.manual-input-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.manual-input-field {
  flex: 1;
  min-width: 250px;
  font-size: 0.88rem;
}

.btn-apply-manual {
  white-space: nowrap;
  font-weight: 600;
  padding: 8px 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* 2-Kolom Settings Grid */
.settings-two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
  margin-bottom: 22px;
}

@media (max-width: 768px) {
  .settings-two-col-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.setting-grid-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-label-bold {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary);
  display: block;
}

.field-caption {
  font-size: 0.8rem;
  color: var(--text-light);
  line-height: 1.4;
  margin-top: 2px;
}

.select-modern,
.date-modern {
  width: 100%;
}

/* Radio Selection Cards (Mode File & Format Nama) */
.radio-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.radio-selection-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-secondary, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  min-height: 52px;
}

.radio-selection-card:hover {
  border-color: var(--primary-color, #10B981);
}

.radio-selection-card.card-selected {
  border-color: var(--primary-color, #10B981);
  background: var(--primary-light, rgba(16, 185, 129, 0.08));
}

.radio-input-element {
  accent-color: var(--primary-color, #10B981);
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.radio-selection-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.radio-selection-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.radio-selection-desc {
  font-size: 0.76rem;
  color: var(--text-light);
  line-height: 1.3;
}

.badge-recommended {
  font-size: 0.7rem;
  font-weight: 700;
  color: #10B981;
  background: rgba(16, 185, 129, 0.15);
  padding: 1px 6px;
  border-radius: 4px;
}

.settings-action-row {
  display: flex;
  justify-content: flex-start;
  padding-top: 6px;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.btn-save-settings {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  font-weight: 600;
  background-color: var(--primary-color, #10B981);
}

/* Rules Section */
.section-lead-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 18px;
}

.rules-list-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.rule-item-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.rule-field-wrap {
  flex: 0 0 190px;
}

@media (max-width: 600px) {
  .rule-field-wrap {
    flex: 1 1 100%;
  }
}

.rule-value-wrap {
  flex: 1;
  min-width: 200px;
}

.btn-delete-rule {
  flex-shrink: 0;
  padding: 8px 12px;
}

.btn-add-rule {
  margin-bottom: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  padding: 7px 14px;
}

/* Criteria Preview Box */
.criteria-preview-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.22);
  border-radius: 10px;
  margin-bottom: 18px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.criteria-preview-icon {
  color: #2563eb;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.criteria-loading {
  background: rgba(100, 116, 139, 0.08);
  border-color: rgba(100, 116, 139, 0.2);
}

.rules-actions-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.rules-actions-row .btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 9px 18px;
}

.btn-sync-all {
  border-color: var(--primary-color, #10B981);
  color: var(--primary-color, #10B981);
}

.btn-sync-all:hover {
  background: var(--primary-light, rgba(16, 185, 129, 0.1));
}

/* Retry Queue */
.badge-queue-count {
  background: #dc2626;
  color: #ffffff;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 700;
}

.queue-table-wrap {
  margin-bottom: 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
}

.queue-table {
  margin-bottom: 0;
  font-size: 0.88rem;
}

.queue-pegawai-name {
  font-weight: 700;
  color: var(--text-primary);
}

.queue-pegawai-nip {
  font-size: 0.78rem;
  color: var(--text-light);
}

.queue-error-msg {
  color: #ef4444;
  font-size: 0.82rem;
  line-height: 1.4;
}

.badge-attempt {
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
}

.queue-time-cell {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.queue-actions-inline {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.queue-footer-row {
  display: flex;
  justify-content: flex-start;
}
</style>
