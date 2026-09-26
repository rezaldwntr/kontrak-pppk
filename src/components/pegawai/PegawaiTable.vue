<template>
  <div class="pegawai-table-wrapper">
    <!-- Filter Card 2-Tier -->
    <div class="filter-panel-card">
      <!-- Tier 1: Search Bar, Quick Kelompok Chips, Total & Reset -->
      <div class="filter-tier-main">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="Cari nama, NIP, jabatan, unit organisasi..."
            class="form-control table-search-input"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="btn-clear-search"
            @click="searchQuery = ''; handleSearch()"
            title="Bersihkan pencarian"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="quick-kelompok-chips">
          <button
            type="button"
            class="chip-btn"
            :class="{ active: kelompokPppkFilter === 'all' }"
            @click="kelompokPppkFilter = 'all'; handleSearch()"
            title="Semua Kelompok Pegawai"
          >
            <i class="fa-solid fa-layer-group"></i>
            <span>Semua Kelompok</span>
          </button>
          <button
            v-for="opt in kelompokPppkOptions.filter(o => o !== 'all')"
            :key="opt"
            type="button"
            class="chip-btn"
            :class="{ active: kelompokPppkFilter === opt }"
            @click="kelompokPppkFilter = opt; handleSearch()"
          >
            <i :class="opt.includes('Guru') ? 'fa-solid fa-graduation-cap' : opt.includes('Kesehatan') ? 'fa-solid fa-user-doctor' : 'fa-solid fa-laptop-code'"></i>
            <span>{{ opt }}</span>
          </button>
        </div>

        <div class="filter-tier-actions">
          <span class="total-records-pill">
            <i class="fa-solid fa-users"></i>
            <span><strong>{{ filteredData.length }}</strong> Pegawai</span>
          </span>
          <button
            type="button"
            class="btn btn-outline btn-sm btn-reset-filters"
            @click="resetFilters"
            title="Reset seluruh filter"
          >
            <i class="fa-solid fa-rotate-left"></i>
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      <!-- Tier 2: Specific Dropdown Filters -->
      <div class="filter-tier-sub">
        <div class="sub-filter-item" v-if="!hideJenisPppkFilter">
          <label class="sub-filter-label">Jenis PPPK</label>
          <select v-model="jenisPppkFilter" @change="handleSearch" class="form-control form-control-sm">
            <option value="all" v-if="jenisPppkOptions.length !== 1">Semua Jenis</option>
            <option v-for="opt in jenisPppkOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="sub-filter-item">
          <label class="sub-filter-label">Unor Induk (OPD)</label>
          <select v-model="unorIndukFilter" @change="handleUnorIndukChange" class="form-control form-control-sm">
            <option value="all" v-if="unorIndukOptions.length !== 1">Semua Unor Induk</option>
            <option v-for="opt in unorIndukOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="sub-filter-item">
          <label class="sub-filter-label">Unor Atasan (Unit Kerja)</label>
          <select v-model="unorAtasanFilter" @change="handleSearch" class="form-control form-control-sm" :disabled="unorIndukFilter === 'all'">
            <option value="all" v-if="unorAtasanOptions.length !== 1">Semua Unor Atasan</option>
            <option v-for="opt in unorAtasanOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="sub-filter-item" v-if="!hideStatusKontrakFilter">
          <label class="sub-filter-label">Status Kontrak</label>
          <select v-model="statusFilter" @change="handleSearch" class="form-control form-control-sm">
            <option value="all" v-if="statusOptions.length !== 1">Semua Status</option>
            <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="sub-filter-item" v-if="!onlyNeedExtension && !hideStatusPppkFilter">
          <label class="sub-filter-label">Status PPPK</label>
          <select v-model="statusPppkFilter" @change="handleSearch" class="form-control form-control-sm">
            <option value="all" v-if="statusPppkOptions.length !== 1">Semua Status PPPK</option>
            <option v-for="opt in statusPppkOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="sub-filter-item" v-if="!onlyNeedExtension && !hidePerpanjanganFilter">
          <label class="sub-filter-label">Periode Perpanjangan</label>
          <select v-model="perpanjanganFilter" @change="handleSearch" class="form-control form-control-sm">
            <option value="all">Semua Perpanjangan</option>
            <option value="bup">Kontrak Habis (BUP)</option>
            <option v-for="opt in perpanjanganOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Floating / Sticky Batch Action Bar -->
    <div
      v-if="selectedIds.length > 0 && (allowBatchExtend || allowBatchDelete || allowBatchDownload)"
      class="batch-action-bar-modern"
    >
      <div class="batch-selected-info">
        <i class="fa-solid fa-circle-check batch-icon-check"></i>
        <span><strong>{{ selectedIds.length }}</strong> data pegawai terpilih</span>
      </div>
      <div class="batch-buttons-group">
        <button
          v-if="allowBatchExtend"
          class="btn btn-sm btn-success btn-batch"
          @click="emit('batchExtend', selectedIds)"
          title="Perpanjang kontrak pegawai terpilih"
        >
          <i class="fa-solid fa-file-signature"></i>
          <span>Perpanjang Massal ({{ selectedIds.length }})</span>
        </button>
        <button
          v-if="allowBatchDownload || !allowBatchExtend"
          class="btn btn-sm btn-primary btn-batch"
          @click="emit('batchDownload', getSelectedItems())"
          title="Unduh dokumen kontrak pegawai terpilih"
        >
          <i class="fa-solid fa-download"></i>
          <span>Unduh Kontrak ({{ selectedIds.length }})</span>
        </button>
        <button
          v-if="allowBatchDelete"
          class="btn btn-sm btn-outline-danger btn-batch"
          @click="emit('batchDelete', selectedIds)"
          title="Hapus data pegawai terpilih"
        >
          <i class="fa-solid fa-trash-can"></i>
          <span>Hapus Data ({{ selectedIds.length }})</span>
        </button>
      </div>
    </div>

    <!-- Table Card Container -->
    <div class="table-container-card">
      <div class="table-responsive">
        <table class="table modern-data-table">
          <thead>
            <tr>
              <th width="44" style="text-align:center;">
                <input type="checkbox" v-model="selectAll" title="Pilih Semua di Filter Ini" class="custom-checkbox">
              </th>
              <th>NIP BARU / ID</th>
              <th>NAMA LENGKAP</th>
              <th v-if="!isBupTab">TMT CPNS / MULAI</th>
              <th v-if="!isBupTab">AKHIR KONTRAK</th>
              <th v-if="isBupTab">TMT PENSIUN</th>
              <th>JABATAN</th>
              <th>UNIT ORGANISASI</th>
              <th width="120" style="text-align:center;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pegawaiStore.isLoading">
              <td :colspan="isBupTab ? 7 : 8" class="text-center table-loading-cell">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Memuat data pegawai...</span>
              </td>
            </tr>
            <tr v-else-if="paginatedData.length === 0">
              <td :colspan="isBupTab ? 7 : 8" class="text-center table-empty-cell">
                <i class="fa-solid fa-folder-open text-muted" style="font-size: 1.5rem; display: block; margin-bottom: 6px;"></i>
                <span>Tidak ada data pegawai yang sesuai dengan filter saat ini.</span>
              </td>
            </tr>
            <tr v-for="item in paginatedData" :key="item['PNS ID']" :class="{ 'row-selected': selectedIds.includes(item['PNS ID']) }">
              <td style="text-align:center;">
                <input type="checkbox" v-model="selectedIds" :value="item['PNS ID']" class="custom-checkbox">
              </td>
              <td class="cell-nip">{{ item["NIP BARU"] ? String(item["NIP BARU"]).replace(/^'/, '') : '-' }}</td>
              <td class="cell-nama">
                <strong>{{ getNamaLengkap(item) }}</strong>
                <span v-if="item['JENIS PPPK'] === 'PPPK Paruh Waktu'" class="badge-paruh-inline">Paruh Waktu</span>
              </td>
              <td v-if="!isBupTab" class="cell-date">
                <div>{{ formatIndoDate(item["AWAL KONTRAK AKTIF"] || item["TMT CPNS"]) }}</div>
                <div v-if="item['NOMOR KONTRAK AKTIF'] || item['NO_KONTRAK']" style="font-size: 0.72rem; font-family: monospace; color: var(--primary-color); margin-top: 3px; font-weight: 600;">
                  <i class="fa-solid fa-file-contract" style="margin-right: 3px;"></i>
                  {{ formatNomorKontrakDisplay(item['NOMOR KONTRAK AKTIF'] || item['NO_KONTRAK']) }}
                </div>
              </td>
              <td v-if="!isBupTab" class="cell-date">
                <span :class="calculateContractPeriod(item).statusText === 'Kontrak Hampir Habis' ? 'badge-warning-soft' : ''">
                  {{ calculateContractPeriod(item).endDateStr }}
                </span>
              </td>
              <td v-if="isBupTab" class="cell-date">{{ getTmtPensiunStr(calculateContractPeriod(item).rawDate) }}</td>
              <td class="cell-jabatan">{{ item["JABATAN NAMA"] }}</td>
              <td class="cell-unor">{{ cleanUnorName(item["UNOR NAMA"]) }}</td>
              <td>
                <div class="table-actions-group">
                  <button
                    class="btn btn-sm btn-outline btn-table-icon"
                    v-if="!allowBatchExtend"
                    @click="emit('view', item)"
                    title="Lihat Detail Profil"
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-primary btn-table-icon"
                    v-if="!allowBatchExtend && getStatusPppk(item) === 'Aktif'"
                    @click="emit('download', item)"
                    title="Unduh Perjanjian Kerja"
                  >
                    <i class="fa-solid fa-download"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-success btn-table-icon"
                    v-if="authStore.user && allowBatchExtend && getStatusPppk(item) === 'Aktif'"
                    @click="emit('batchExtend', [item['PNS ID']])"
                    title="Perpanjang Kontrak Pegawai Ini"
                  >
                    <i class="fa-solid fa-file-signature"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-primary btn-table-icon"
                    v-if="allowBatchExtend && getStatusPppk(item) === 'Aktif'"
                    @click="emit('download', item)"
                    title="Unduh Perjanjian Kerja"
                  >
                    <i class="fa-solid fa-download"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modern Pagination Bar -->
      <div class="pagination-bar-modern">
        <div class="pagination-count-info">
          Menampilkan <strong>{{ filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</strong> - <strong>{{ Math.min(currentPage * itemsPerPage, filteredData.length) }}</strong> dari <strong>{{ filteredData.length }}</strong> PPPK
        </div>
        <div class="pagination-controls">
          <button
            type="button"
            class="btn btn-outline btn-sm btn-page-nav"
            :disabled="currentPage === 1"
            @click="currentPage--"
            title="Halaman Sebelumnya"
          >
            <i class="fa-solid fa-chevron-left"></i>
            <span>Sebelumnya</span>
          </button>
          <span class="pagination-page-indicator">
            Halaman <strong>{{ currentPage }}</strong> / {{ totalPages || 1 }}
          </span>
          <button
            type="button"
            class="btn btn-outline btn-sm btn-page-nav"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage++"
            title="Halaman Selanjutnya"
          >
            <span>Selanjutnya</span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { usePegawaiStore } from '../../stores/pegawaiStore'

const props = defineProps({
  allowBatchExtend: { type: Boolean, default: false },
  allowBatchDelete: { type: Boolean, default: false },
  allowBatchDownload: { type: Boolean, default: false },
  onlyNeedExtension: { type: Boolean, default: false },
  customData: { type: Array, default: null },
  hideJenisPppkFilter: { type: Boolean, default: false },
  hideStatusPppkFilter: { type: Boolean, default: false },
  hideStatusKontrakFilter: { type: Boolean, default: false },
  hidePerpanjanganFilter: { type: Boolean, default: false },
  isBupTab: { type: Boolean, default: false }
})

const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()
const emit = defineEmits(['view', 'edit', 'print', 'delete', 'add', 'export', 'show-import', 'batchExtend', 'batchDelete', 'download', 'batchDownload'])

const jenisPppkFilter = ref('all')
const kelompokPppkFilter = ref('all')
const unorAtasanFilter = ref('all')
const unorIndukFilter = ref('all')
const statusFilter = ref('all')
const statusPppkFilter = ref('all')
const perpanjanganFilter = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedIds = ref([])
import { 
  calculateContractPeriod, 
  getStatusPppk, 
  getKelompokPegawai, 
  formatNomorKontrakDisplay,
  cleanUnorName,
  getUnorAtasan,
  getUnorInduk,
  getNamaLengkap,
  formatIndoDate
} from '../../utils/pppkLogic';

const handleSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  jenisPppkFilter.value = jenisPppkOptions.value.length === 1 ? jenisPppkOptions.value[0] : 'all'
  kelompokPppkFilter.value = kelompokPppkOptions.value.length === 1 ? kelompokPppkOptions.value[0] : 'all'
  unorIndukFilter.value = unorIndukOptions.value.length === 1 ? unorIndukOptions.value[0] : 'all'
  unorAtasanFilter.value = unorAtasanOptions.value.length === 1 ? unorAtasanOptions.value[0] : 'all'
  statusFilter.value = statusOptions.value.length === 1 ? statusOptions.value[0] : 'all'
  statusPppkFilter.value = statusPppkOptions.value.length === 1 ? statusPppkOptions.value[0] : 'all'
  perpanjanganFilter.value = 'all'
  searchQuery.value = ''
  handleSearch()
}

const handleUnorIndukChange = () => {
  unorAtasanFilter.value = 'all'
  handleSearch()
}

// Get full item objects from selectedIds
const getSelectedItems = () => {
  const items = baseData.value.filter(item => selectedIds.value.includes(item['PNS ID']))
  return items.sort((a, b) => {
    const nameA = (a['NAMA'] || '').toString().toUpperCase()
    const nameB = (b['NAMA'] || '').toString().toUpperCase()
    return nameA.localeCompare(nameB)
  })
}

// getStatusPppk is imported from pppkLogic.js

const getStatusPppkClass = (status) => {
  if (status === 'Aktif') return 'badge-success';
  if (status === 'Pensiun') return 'badge-primary';
  return 'badge-danger'; // Diberhentikan
}

const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return baseData.value.filter(item => {
    let matchQuery = true
    if (query !== '') {
      matchQuery = Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      )
    }
    
    // Status Kontrak uses calculateContractPeriod status if available
    const period = calculateContractPeriod(item);
    const contractStatus = period.statusText;
    const matchStatus = statusFilter.value === 'all' || contractStatus === statusFilter.value || item["STATUS_PERPANJANGAN"] === statusFilter.value
    
    const matchStatusPppk = statusPppkFilter.value === 'all' || getStatusPppk(item) === statusPppkFilter.value
    const matchJenis = jenisPppkFilter.value === 'all' || (item['JENIS PPPK'] || 'PPPK') === jenisPppkFilter.value
    const matchKelompok = kelompokPppkFilter.value === 'all' || getKelompokPegawai(item) === kelompokPppkFilter.value
    const matchUnorAtasan = unorAtasanFilter.value === 'all' || getUnorAtasan(item['UNOR NAMA']) === unorAtasanFilter.value
    const matchUnorInduk = unorIndukFilter.value === 'all' || getUnorInduk(item['UNOR NAMA']) === unorIndukFilter.value
    
    const matchPerpanjangan = (() => {
        if (perpanjanganFilter.value === 'all') return true;
        if (perpanjanganFilter.value === 'bup') return contractStatus === 'Kontrak Habis (BUP)';
        
        if (!period.isBup && contractStatus !== 'Meninggal' && period.rawDate) {
            const newTmt = new Date(period.rawDate);
            newTmt.setDate(newTmt.getDate() + 1);
            const y = newTmt.getFullYear();
            const m = String(newTmt.getMonth() + 1).padStart(2, '0');
            const d = String(newTmt.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            return dateStr === perpanjanganFilter.value;
        }
        return false;
    })();
    
    if (props.onlyNeedExtension) {
      if (getStatusPppk(item) === 'Diberhentikan') return false;
        if (!['Kontrak Hampir Habis', 'Kontrak Habis'].includes(contractStatus)) {
        return false;
      }
    }
    
    return matchQuery && matchStatus && matchStatusPppk && matchJenis && matchKelompok && matchUnorAtasan && matchUnorInduk && matchPerpanjangan
  })
})

const getTmtPensiunStr = (rawDate) => {
  if (!rawDate || isNaN(rawDate.getTime())) return '-';
  const tmtPensiun = new Date(rawDate);
  tmtPensiun.setDate(tmtPensiun.getDate() + 1);
  return formatIndoDate(tmtPensiun);
}

const baseData = computed(() => {
  // Jika ada customData (mode tab terfilter dari parent), gunakan itu
  const source = props.customData !== null ? props.customData : pegawaiStore.pppkData
  if (props.onlyNeedExtension) {
    return source.filter(item => {
      const contractStatus = calculateContractPeriod(item).statusText;
      if (getStatusPppk(item) === 'Diberhentikan') return false;
        return ['Kontrak Hampir Habis', 'Kontrak Habis'].includes(contractStatus);
    });
  }
  return source;
});

watch(baseData, (newData) => {
    if (selectedIds.value.length > 0) {
      const currentIds = new Set(newData.map(item => item['PNS ID']))
      selectedIds.value = selectedIds.value.filter(id => currentIds.has(id))
    }
  });

  const clearSelection = () => {
    selectedIds.value = [];
  };

  defineExpose({ clearSelection, resetFilters });

const jenisPppkOptions = computed(() => {
  const types = new Set(baseData.value.map(item => item['JENIS PPPK'] || 'PPPK'))
  return Array.from(types).sort()
})

const kelompokPppkOptions = computed(() => {
  const types = new Set(baseData.value.map(item => getKelompokPegawai(item)))
  return Array.from(types).sort()
})

const filteredOptionsBase = computed(() => {
  return baseData.value.filter(item => {
    const period = calculateContractPeriod(item);
    const contractStatus = period.statusText;
    const matchStatus = statusFilter.value === 'all' || contractStatus === statusFilter.value || item["STATUS_PERPANJANGAN"] === statusFilter.value;
    const matchStatusPppk = statusPppkFilter.value === 'all' || getStatusPppk(item) === statusPppkFilter.value;
    const matchJenis = jenisPppkFilter.value === 'all' || (item['JENIS PPPK'] || 'PPPK') === jenisPppkFilter.value;
    const matchKelompok = kelompokPppkFilter.value === 'all' || getKelompokPegawai(item) === kelompokPppkFilter.value;
    
    const matchPerpanjangan = (() => {
        if (perpanjanganFilter.value === 'all') return true;
        if (perpanjanganFilter.value === 'bup') return contractStatus === 'Kontrak Habis (BUP)';
        if (!period.isBup && contractStatus !== 'Meninggal' && period.rawDate) {
            const newTmt = new Date(period.rawDate);
            newTmt.setDate(newTmt.getDate() + 1);
            const y = newTmt.getFullYear();
            const m = String(newTmt.getMonth() + 1).padStart(2, '0');
            const d = String(newTmt.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}` === perpanjanganFilter.value;
        }
        return false;
    })();

    return matchStatus && matchStatusPppk && matchJenis && matchKelompok && matchPerpanjangan;
  });
});

const unorAtasanOptions = computed(() => {
  if (unorIndukFilter.value === 'all') return [];
  const types = new Set(filteredOptionsBase.value
    .filter(item => getUnorInduk(item['UNOR NAMA']) === unorIndukFilter.value)
    .map(item => getUnorAtasan(item['UNOR NAMA']))
  )
  return Array.from(types).filter(t => t !== '-').sort()
})

const unorIndukOptions = computed(() => {
  const types = new Set(filteredOptionsBase.value.map(item => getUnorInduk(item['UNOR NAMA'])))
  return Array.from(types).filter(t => t !== '-').sort()
})

const allStatusOptions = computed(() => {
  const contractStatusSet = new Set()
  const pppkStatusSet = new Set()
  for (const item of baseData.value) {
    contractStatusSet.add(calculateContractPeriod(item).statusText)
    pppkStatusSet.add(getStatusPppk(item))
  }
  return {
    contractStatuses: Array.from(contractStatusSet).sort(),
    pppkStatuses: Array.from(pppkStatusSet).sort()
  }
})

const statusOptions = computed(() => allStatusOptions.value.contractStatuses)
const statusPppkOptions = computed(() => allStatusOptions.value.pppkStatuses)

const baseForPerpanjanganOptions = computed(() => {
  return baseData.value.filter(item => {
    const period = calculateContractPeriod(item);
    const contractStatus = period.statusText;
    const matchStatus = statusFilter.value === 'all' || contractStatus === statusFilter.value || item["STATUS_PERPANJANGAN"] === statusFilter.value;
    const matchStatusPppk = statusPppkFilter.value === 'all' || getStatusPppk(item) === statusPppkFilter.value;
    const matchJenis = jenisPppkFilter.value === 'all' || (item['JENIS PPPK'] || 'PPPK') === jenisPppkFilter.value;
    const matchKelompok = kelompokPppkFilter.value === 'all' || getKelompokPegawai(item) === kelompokPppkFilter.value;
    const matchUnorAtasan = unorAtasanFilter.value === 'all' || getUnorAtasan(item['UNOR NAMA']) === unorAtasanFilter.value;
    const matchUnorInduk = unorIndukFilter.value === 'all' || getUnorInduk(item['UNOR NAMA']) === unorIndukFilter.value;
    return matchStatus && matchStatusPppk && matchJenis && matchKelompok && matchUnorAtasan && matchUnorInduk;
  });
});

const perpanjanganOptions = computed(() => {
  const groups = {}; 
  baseForPerpanjanganOptions.value.forEach(item => {
    const period = calculateContractPeriod(item);
    if (!period.isBup && period.statusText !== 'Meninggal' && period.rawDate && !isNaN(period.rawDate.getTime())) {
      const newTmt = new Date(period.rawDate);
      newTmt.setDate(newTmt.getDate() + 1); 
      
      const y = newTmt.getFullYear();
      const m = String(newTmt.getMonth() + 1).padStart(2, '0');
      const d = String(newTmt.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      if (!groups[y]) groups[y] = new Set();
      groups[y].add(dateStr);
    }
  });

  const options = [];
  const sortedYears = Object.keys(groups).sort();
  
  sortedYears.forEach(year => {
    const dates = Array.from(groups[year]).sort();
    if (dates.length === 1) {
      options.push({
        value: dates[0],
        label: `Perpanjangan Periode ${year} (${formatIndoDate(dates[0])})`
      });
    } else {
      dates.forEach((dateStr, idx) => {
        options.push({
          value: dateStr,
          label: `Perpanjangan Periode ${year} - Tahap ${idx + 1} (${formatIndoDate(dateStr)})`
        });
      });
    }
  });
  
  return options;
})

// Auto-select if only 1 option available when data loads
watch(() => pegawaiStore.pppkData, () => {
  if (pegawaiStore.pppkData.length > 0) {
    if (jenisPppkOptions.value.length === 1) jenisPppkFilter.value = jenisPppkOptions.value[0]
    if (kelompokPppkOptions.value.length === 1) kelompokPppkFilter.value = kelompokPppkOptions.value[0]
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
  get: () => selectedIds.value.length === filteredData.value.length && filteredData.value.length > 0,
  set: (val) => {
    if (val) {
      selectedIds.value = filteredData.value.map(item => item['PNS ID'])
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
.pegawai-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* --- Tiered Filter Card --- */
.filter-panel-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  transition: border-color var(--transition-fast, 0.2s);
}

.filter-panel-card:focus-within {
  border-color: var(--primary-color);
}

/* Tier 1: Search, Quick Chips, Actions */
.filter-tier-main {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  font-size: 0.9rem;
  pointer-events: none;
}

.table-search-input {
  width: 100%;
  padding: 10px 38px 10px 38px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  transition: all var(--transition-fast, 0.2s);
}

.table-search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: var(--bg-secondary);
}

.btn-clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: color 0.15s;
}

.btn-clear-search:hover {
  color: var(--danger-color);
}

/* Quick Kelompok Chips */
.quick-kelompok-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.chip-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.chip-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.filter-tier-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.total-records-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--primary-light);
  color: var(--primary-color);
  font-size: 0.82rem;
  white-space: nowrap;
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  padding: 6px 12px;
  border-radius: var(--radius-md, 8px);
  white-space: nowrap;
}

/* Tier 2: Specific Dropdown Filters */
.filter-tier-sub {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

.sub-filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-light);
}

.sub-filter-item select.form-control-sm {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm, 6px);
  color: var(--text-primary);
  font-size: 0.83rem;
  padding: 6px 10px;
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s);
}

.sub-filter-item select.form-control-sm:focus {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.sub-filter-item select.form-control-sm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- Batch Action Bar Modern --- */
.batch-action-bar-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.15);
  animation: slideDownFade 0.25s ease-out;
}

@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.batch-selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.batch-icon-check {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.batch-buttons-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-batch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.84rem;
  font-weight: 500;
  border-radius: var(--radius-sm, 6px);
  transition: all var(--transition-fast, 0.2s);
}

/* --- Table Card & Data Table --- */
.table-container-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
}

.modern-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.modern-data-table thead th {
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  vertical-align: middle;
}

.modern-data-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  background: transparent;
  transition: background-color 0.15s;
}

.modern-data-table tbody tr:hover td {
  background: var(--primary-light);
}

.modern-data-table tbody tr.row-selected td {
  background: rgba(16, 185, 129, 0.08);
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.cell-nip {
  font-family: var(--font-secondary, monospace);
  font-size: 0.82rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cell-nama {
  color: var(--text-primary);
}

.badge-paruh-inline {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  vertical-align: middle;
}

.cell-date {
  font-size: 0.83rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cell-jabatan {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.cell-unor {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.83rem;
  color: var(--text-secondary);
}

.table-actions-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.badge-warning-soft {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--warning-light, rgba(245, 176, 65, 0.15));
  color: #d97706;
  font-weight: 600;
  font-size: 0.8rem;
}

.table-loading-cell,
.table-empty-cell {
  padding: 40px 20px !important;
  color: var(--text-light);
  font-size: 0.9rem;
}

.table-loading-cell i {
  margin-right: 8px;
  color: var(--primary-color);
}

/* --- Pagination Modern Bar --- */
.pagination-bar-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.pagination-count-info {
  font-size: 0.83rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-page-nav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.82rem;
  border-radius: var(--radius-sm, 6px);
}

.btn-page-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-page-indicator {
  font-size: 0.83rem;
  color: var(--text-secondary);
  padding: 0 4px;
}

@media (max-width: 768px) {
  .filter-tier-main {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-tier-actions {
    margin-left: 0;
    justify-content: space-between;
  }
  .pagination-bar-modern {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
