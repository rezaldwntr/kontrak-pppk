<template>
  <div>
    <div class="filter-panel" style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 15px;">
        <div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%; align-items: flex-end; justify-content: space-between;">
            <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
                <div class="filter-group">
                    <label>Jenis PPPK</label>
                    <select v-model="jenisPppkFilter" @change="handleSearch" class="form-control" style="min-width: 150px;">
                        <option value="all">Semua Jenis</option>
                        <option v-for="opt in jenisPppkOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Unor Atasan</label>
                    <select v-model="unorAtasanFilter" @change="handleSearch" class="form-control" style="min-width: 180px; max-width: 250px;">
                        <option value="all">Semua Unor Atasan</option>
                        <option v-for="opt in unorAtasanOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Unor Induk</label>
                    <select v-model="unorIndukFilter" @change="handleSearch" class="form-control" style="min-width: 180px; max-width: 250px;">
                        <option value="all">Semua Unor Induk</option>
                        <option v-for="opt in unorIndukOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Status Kontrak</label>
                    <select v-model="statusFilter" @change="handleSearch" class="form-control" style="min-width: 200px;">
                        <option value="all">Semua Status</option>
                        <option value="Kontrak Masih Berlaku">Kontrak Masih Berlaku</option>
                        <option value="Kontrak Hampir Habis">Kontrak Hampir Habis</option>
                        <option value="Kontrak Habis">Kontrak Habis</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Tampilkan Baris</label>
                    <select v-model="itemsPerPage" @change="handleSearch" class="form-control" style="min-width: 120px;">
                        <option value="10">10 Baris</option>
                        <option value="50">50 Baris</option>
                        <option value="100">100 Baris</option>
                    </select>
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
                            <strong>{{ item["NAMA"] }}</strong>
                        </td>
                        <td>{{ item["TMT CPNS"] }}</td>
                        <td>{{ calculateContractPeriod(item).endDateStr }}</td>
                        <td>{{ item["JABATAN NAMA"] }}</td>
                        <td>
                            <span :class="['badge', getBadgeClass(item['STATUS_PERPANJANGAN'])]">
                                {{ item["STATUS_PERPANJANGAN"] || "Belum Diproses" }}
                            </span>
                        </td>
                        <td>
                            <span class="badge badge-success">Aktif</span>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { usePegawaiStore } from '../../stores/pegawaiStore'

const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()
const emit = defineEmits(['view', 'edit', 'print', 'delete', 'add', 'export', 'show-import', 'batchExtend', 'batchDelete'])

const jenisPppkFilter = ref('all')
const unorAtasanFilter = ref('all')
const unorIndukFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedIds = ref([])

const handleSearch = () => {
  currentPage.value = 1
}

const filteredData = computed(() => {
  return pegawaiStore.pppkData.filter(item => {
    const matchStatus = statusFilter.value === 'all' || item["STATUS_PERPANJANGAN"] === statusFilter.value
    const matchJenis = jenisPppkFilter.value === 'all' || (item['JENIS PPPK'] || 'PPPK') === jenisPppkFilter.value
    const matchUnorAtasan = unorAtasanFilter.value === 'all' || getUnorAtasan(item['UNOR NAMA']) === unorAtasanFilter.value
    const matchUnorInduk = unorIndukFilter.value === 'all' || getUnorInduk(item['UNOR NAMA']) === unorIndukFilter.value
    
    return matchStatus && matchJenis && matchUnorAtasan && matchUnorInduk
  })
})

const getUnorAtasan = (unorNama) => {
  if (!unorNama) return '-'
  const parts = unorNama.split(' - ')
  if (parts.length <= 1) return parts[0]
  return parts.slice(0, parts.length - 1).join(' - ') || '-'
}

const getUnorInduk = (unorNama) => {
  if (!unorNama) return '-'
  const parts = unorNama.split(' - ')
  return parts[parts.length - 1] || '-'
}

const calculateContractPeriod = (item) => {
    if (item && typeof item === "object" && item._periodCache) {
        return item._periodCache;
    }
    const contractYears = (item && typeof item === "object" && item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
    if (item && typeof item === "object") {
        if (item["STATUS KEDUDUKAN"] === "Meninggal") {
            return { endDateStr: "-", sisaBulan: 0, statusText: "Meninggal" };
        }
        if (item["STATUS KEDUDUKAN"] === "Pensiun BUP") {
            return { endDateStr: "-", sisaBulan: 0, statusText: "Pensiun (BUP)" };
        }
    }
    
    const tmtStr = (item && item["TMT CPNS"]) ? item["TMT CPNS"] : "";
    let startDate = null;
    const parts = tmtStr.split('-');
    if (parts.length === 3) {
        if (parts[0].length === 4) startDate = new Date(tmtStr);
        else if (parts[2].length === 4) startDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    
    if (!startDate || isNaN(startDate.getTime())) {
        return { endDateStr: "Format Tanggal Invalid", sisaBulan: 999, statusText: "Format Tanggal Invalid" };
    }
    
    let endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + contractYears);
    endDate.setDate(endDate.getDate() - 1);
    
    const y = endDate.getFullYear();
    const mStr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][endDate.getMonth()];
    const d = endDate.getDate();
    const endDateStr = `${d} ${mStr} ${y}`;
    
    const today = new Date();
    const diffMonths = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    
    let statusText = "Masih Berlaku";
    if (diffMonths <= 0) statusText = "Habis";
    else if (diffMonths <= 6) statusText = "Hampir Habis";
    
    const res = { endDateStr, sisaBulan: diffMonths, statusText };
    if (item && typeof item === "object") {
        item._periodCache = res;
    }
    return res;
}

const jenisPppkOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData.map(item => item['JENIS PPPK'] || 'PPPK'))
  return Array.from(types).sort()
})

const unorAtasanOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData.map(item => getUnorAtasan(item['UNOR NAMA'])))
  return Array.from(types).filter(t => t !== '-').sort()
})

const unorIndukOptions = computed(() => {
  const types = new Set(pegawaiStore.pppkData.map(item => getUnorInduk(item['UNOR NAMA'])))
  return Array.from(types).filter(t => t !== '-').sort()
})

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
  if (status === 'Memenuhi Syarat' || status === 'Selesai Diperpanjang' || status === 'Kontrak Masih Berlaku') return 'badge-success'
  if (status === 'Kontrak Hampir Habis') return 'badge-warning'
  if (status === 'Tidak Memenuhi Syarat' || status === 'Kontrak Habis' || status === 'Kontrak Habis (BUP)') return 'badge-danger'
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
