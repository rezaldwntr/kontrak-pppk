<template>
  <div>
    <div class="filter-panel" style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 15px;">
        <div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%; align-items: flex-end; justify-content: space-between;">
            <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
                <div class="filter-group">
                    <label>Jenis PPPK</label>
                    <select v-model="jenisPppkFilter" @change="handleSearch" class="form-control" style="min-width: 130px;">
                        <option value="all" v-if="jenisPppkOptions.length !== 1">Semua Jenis</option>
                        <option v-for="opt in jenisPppkOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Cari</label>
                    <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Cari data apapun..." class="form-control" style="min-width: 150px;">
                </div>
                <div class="filter-group">
                    <label>Unor Induk</label>
                    <select v-model="unorIndukFilter" @change="handleUnorIndukChange" class="form-control" style="min-width: 150px; max-width: 200px;">
                        <option value="all" v-if="unorIndukOptions.length !== 1">Semua Unor Induk</option>
                        <option v-for="opt in unorIndukOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Unor Atasan</label>
                    <select v-model="unorAtasanFilter" @change="handleSearch" class="form-control" style="min-width: 150px; max-width: 200px;">
                        <option value="all" v-if="unorAtasanOptions.length !== 1">Semua Unor Atasan</option>
                        <option v-for="opt in unorAtasanOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Status Kontrak</label>
                    <select v-model="statusFilter" @change="handleSearch" class="form-control" style="min-width: 160px;">
                        <option value="all" v-if="statusOptions.length !== 1">Semua Status</option>
                        <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Status PPPK</label>
                    <select v-model="statusPppkFilter" @change="handleSearch" class="form-control" style="min-width: 160px;">
                        <option value="all" v-if="statusPppkOptions.length !== 1">Semua Status PPPK</option>
                        <option v-for="opt in statusPppkOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button class="btn btn-outline" @click="resetFilters" style="height: 38px; margin-bottom: 2px;" title="Reset Filter">
                        <i class="fa-solid fa-rotate-left"></i> Reset
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="widget-card table-widget">
        <div class="widget-header-actions">
            <div class="total-rows text-muted">
                Total: <span>{{ filteredData.length }}</span> PPPK
            </div>
        </div>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th width="40"><input type="checkbox" v-model="selectAll"></th>
                        <th>NIP BARU / ID</th>
                        <th>NAMA LENGKAP</th>
                        <th>TMT CPNS / MULAI</th>
                        <th>AKHIR KONTRAK</th>
                        <th>JABATAN</th>
                        <th>STATUS KONTRAK</th>
                        <th>STATUS PPPK</th>
                        <th width="120">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="pegawaiStore.isLoading">
                        <td colspan="8" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Memuat Data...</td>
                    </tr>
                    <tr v-else-if="paginatedData.length === 0">
                        <td colspan="8" class="text-center">Data tidak ditemukan.</td>
                    </tr>
                    <tr v-for="item in paginatedData" :key="item['PNS ID']">
                        <td>
                            <input type="checkbox" v-model="selectedIds" :value="item['PNS ID']">
                        </td>
                        <td>{{ item["NIP BARU"] ? String(item["NIP BARU"]).replace(/^'/, '') : '-' }}</td>
                        <td>
                            <strong>{{ getNamaLengkap(item) }}</strong>
                        </td>
                        <td>{{ formatIndoDate(item["TMT CPNS"]) }}</td>
                        <td>{{ calculateContractPeriod(item).endDateStr }}</td>
                        <td>{{ item["JABATAN NAMA"] }}</td>
                        <td>
                            <span :class="['badge', getBadgeClass(calculateContractPeriod(item).statusText)]">
                                {{ calculateContractPeriod(item).statusText }}
                            </span>
                        </td>
                        <td>
                            <span :class="['badge', getStatusPppkClass(getStatusPppk(item))]">{{ getStatusPppk(item) }}</span>
                        </td>
                        <td>
                            <div class="action-buttons-cell" style="display: flex; gap: 4px;">
                                <button class="btn btn-icon-only btn-sm" @click="emit('view', item)" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>
                                <button class="btn btn-icon-only btn-sm" style="background-color: var(--primary-color); color: white;" v-if="authStore.user" @click="emit('print', item)" title="Cetak"><i class="fa-solid fa-print"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="pagination" style="display: flex; gap: 15px; align-items: center; justify-content: flex-end; padding-top: 15px; padding-right: 15px;">
            <button class="btn btn-outline btn-sm" :disabled="currentPage === 1" @click="currentPage--"><i class="fa-solid fa-chevron-left"></i> Sebelumnya</button>
            <span class="page-info text-muted">Halaman {{ currentPage }} dari {{ totalPages }}</span>
            <button class="btn btn-outline btn-sm" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage++">Selanjutnya <i class="fa-solid fa-chevron-right"></i></button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { usePegawaiStore } from '../../stores/pegawaiStore'

const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()
const emit = defineEmits(['view', 'edit', 'print', 'delete', 'add', 'export', 'show-import', 'batchExtend', 'batchDelete'])

const jenisPppkFilter = ref('all')
const unorAtasanFilter = ref('all')
const unorIndukFilter = ref('all')
const statusFilter = ref('all')
const statusPppkFilter = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedIds = ref([])

import { calculateContractPeriod, getStatusPppk } from '../../utils/pppkLogic';

const handleSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  jenisPppkFilter.value = jenisPppkOptions.value.length === 1 ? jenisPppkOptions.value[0] : 'all'
  unorIndukFilter.value = unorIndukOptions.value.length === 1 ? unorIndukOptions.value[0] : 'all'
  unorAtasanFilter.value = unorAtasanOptions.value.length === 1 ? unorAtasanOptions.value[0] : 'all'
  statusFilter.value = statusOptions.value.length === 1 ? statusOptions.value[0] : 'all'
  statusPppkFilter.value = statusPppkOptions.value.length === 1 ? statusPppkOptions.value[0] : 'all'
  searchQuery.value = ''
  handleSearch()
}

const handleUnorIndukChange = () => {
  unorAtasanFilter.value = 'all'
  handleSearch()
}

// getStatusPppk is imported from pppkLogic.js

const getStatusPppkClass = (status) => {
  if (status === 'Aktif') return 'badge-success';
  if (status === 'Tidak Diperpanjang') return 'badge-warning';
  return 'badge-danger'; // Meninggal, Pensiun
}

const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return pegawaiStore.pppkData.filter(item => {
    let matchQuery = true
    if (query !== '') {
      matchQuery = Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      )
    }
    
    // Status Kontrak uses calculateContractPeriod status if available
    const contractStatus = calculateContractPeriod(item).statusText;
    const matchStatus = statusFilter.value === 'all' || contractStatus === statusFilter.value || item["STATUS_PERPANJANGAN"] === statusFilter.value
    
    const matchStatusPppk = statusPppkFilter.value === 'all' || getStatusPppk(item) === statusPppkFilter.value
    const matchJenis = jenisPppkFilter.value === 'all' || (item['JENIS PPPK'] || 'PPPK') === jenisPppkFilter.value
    const matchUnorAtasan = unorAtasanFilter.value === 'all' || getUnorAtasan(item['UNOR NAMA']) === unorAtasanFilter.value
    const matchUnorInduk = unorIndukFilter.value === 'all' || getUnorInduk(item['UNOR NAMA']) === unorIndukFilter.value
    
    return matchQuery && matchStatus && matchStatusPppk && matchJenis && matchUnorAtasan && matchUnorInduk
  })
})

const cleanUnorName = (unorNama) => {
  if (!unorNama) return '-'
  return unorNama.replace(/\s*-\s*PEMERINTAH KABUPATEN HULU SUNGAI UTARA$/i, '')
}

const getUnorAtasan = (unorNama) => {
  const cleaned = cleanUnorName(unorNama)
  if (cleaned === '-') return '-'
  const parts = cleaned.split(' - ')
  if (parts.length <= 1) return parts[0]
  return parts.slice(0, parts.length - 1).join(' - ') || '-'
}

const getUnorInduk = (unorNama) => {
  const cleaned = cleanUnorName(unorNama)
  if (cleaned === '-') return '-'
  const parts = cleaned.split(' - ')
  return parts[parts.length - 1] || '-'
}

const getNamaLengkap = (item) => {
  if (!item) return ''
  const dpn = item['GELAR DEPAN'] && item['GELAR DEPAN'] !== '-' ? item['GELAR DEPAN'] + ' ' : ''
  const blk = item['GELAR BELAKANG'] && item['GELAR BELAKANG'] !== '-' ? ', ' + item['GELAR BELAKANG'] : ''
  return dpn + item['NAMA'] + blk
}

const formatIndoDate = (dateStr) => {
    if (!dateStr) return "-";
    let startDate = null;
    const parts = String(dateStr).split(/[-/]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) startDate = new Date(parts[0], parts[1]-1, parts[2]);
        else if (parts[2].length === 4) startDate = new Date(parts[2], parts[1]-1, parts[0]);
    }
    if (!startDate || isNaN(startDate.getTime())) return String(dateStr);
    
    const y = startDate.getFullYear();
    const mStr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][startDate.getMonth()];
    const d = startDate.getDate();
    return `${d} ${mStr} ${y}`;
}

const jenisPppkOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData.map(item => item['JENIS PPPK'] || 'PPPK'))
  return Array.from(types).sort()
})

const unorAtasanOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData
    .filter(item => unorIndukFilter.value === 'all' || getUnorInduk(item['UNOR NAMA']) === unorIndukFilter.value)
    .map(item => getUnorAtasan(item['UNOR NAMA']))
  )
  return Array.from(types).filter(t => t !== '-').sort()
})

const unorIndukOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData.map(item => getUnorInduk(item['UNOR NAMA'])))
  return Array.from(types).filter(t => t !== '-').sort()
})

const statusOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData.map(item => calculateContractPeriod(item).statusText))
  return Array.from(types).sort()
})

const statusPppkOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData.map(item => getStatusPppk(item)))
  return Array.from(types).sort()
})

// Auto-select if only 1 option available when data loads
watch(() => pegawaiStore.pppkData, () => {
  if (pegawaiStore.pppkData.length > 0) {
    if (jenisPppkOptions.value.length === 1) jenisPppkFilter.value = jenisPppkOptions.value[0]
    if (unorIndukOptions.value.length === 1) unorIndukFilter.value = unorIndukOptions.value[0]
    if (unorAtasanOptions.value.length === 1) unorAtasanFilter.value = unorAtasanOptions.value[0]
    if (statusOptions.value.length === 1) statusFilter.value = statusOptions.value[0]
    if (statusPppkOptions.value.length === 1) statusPppkFilter.value = statusPppkOptions.value[0]
  }
}, { immediate: true })

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + Number(itemsPerPage.value)
  return filteredData.value.slice(start, end)
})

const selectAll = computed({
  get: () => selectedIds.value.length === paginatedData.value.length && paginatedData.value.length > 0,
  set: (val) => {
    if (val) {
      selectedIds.value = paginatedData.value.map(item => item['PNS ID'])
    } else {
      selectedIds.value = []
    }
  }
})

const toggleSelectAll = () => {
  // Handled by computed setter
}

const getBadgeClass = (status) => {
  if (!status || status === 'Belum Diproses') return 'badge-secondary'
  if (status === 'Memenuhi Syarat' || status === 'Selesai Diperpanjang' || status === 'Kontrak Masih Berlaku' || status === 'Masih Berlaku') return 'badge-success'
  if (status === 'Kontrak Hampir Habis' || status === 'Hampir Habis') return 'badge-warning'
  if (status === 'Tidak Memenuhi Syarat' || status === 'Kontrak Habis' || status === 'Kontrak Habis (BUP)' || status === 'Habis' || status === 'Habis (BUP)') return 'badge-danger'
  return 'badge-secondary'
}

const getRowClass = (item) => {
  // Can add custom row classes if needed based on contract end dates etc.
  return ''
}
</script>

<style scoped>
/* Table styles inherit from global CSS */
</style>
