<template>
  <div>
    <div class="filter-panel" style="margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%; align-items: flex-end;">
            <div class="filter-group">
                <label>Status Kontrak</label>
                <select v-model="statusFilter" @change="handleSearch">
                    <option value="all">Semua Status</option>
                    <option value="Kontrak Masih Berlaku">Kontrak Masih Berlaku</option>
                    <option value="Kontrak Hampir Habis">Kontrak Hampir Habis</option>
                    <option value="Kontrak Habis">Kontrak Habis</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Tampilkan Baris</label>
                <select v-model="itemsPerPage" @change="handleSearch">
                    <option value="10">10 Baris</option>
                    <option value="50">50 Baris</option>
                    <option value="100">100 Baris</option>
                </select>
            </div>
        </div>
    </div>

    <div class="widget-card table-widget">
        <div class="widget-header-actions">
            <div class="bulk-actions" v-if="selectedIds.length > 0">
                <span>{{ selectedIds.length }} terpilih</span>
                <button class="btn btn-sm btn-success">
                    <i class="fa-solid fa-check-double"></i> Perpanjang Massal
                </button>
            </div>
            <div class="total-rows text-muted" v-else>
                Total: <span>{{ filteredData.length }}</span> PPPK
            </div>
        </div>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th width="40" v-if="authStore.user"><input type="checkbox" v-model="selectAll"></th>
                        <th>NIP BARU / ID</th>
                        <th>NAMA LENGKAP</th>
                        <th>TMT CPNS / MULAI</th>
                        <th>MASA KERJA</th>
                        <th>JABATAN</th>
                        <th>STATUS KONTRAK</th>
                        <th>STATUS PPPK</th>
                        <th width="120">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="pegawaiStore.isLoading">
                        <td colspan="9" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Memuat Data...</td>
                    </tr>
                    <tr v-else-if="paginatedData.length === 0">
                        <td colspan="9" class="text-center">Data tidak ditemukan.</td>
                    </tr>
                    <tr v-for="item in paginatedData" :key="item['PNS ID']">
                        <td v-if="authStore.user">
                            <input type="checkbox" :value="item['PNS ID']" v-model="selectedIds" />
                        </td>
                        <td>{{ item["NIP BARU"] }}</td>
                        <td>
                            <strong>{{ item["NAMA"] }}</strong><br>
                            <small class="text-muted">{{ item["NIK"] }}</small>
                        </td>
                        <td>{{ item["TMT CPNS"] }}</td>
                        <td>{{ item["MK TAHUN"] }} Tahun {{ item["MK BULAN"] }} Bln</td>
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
                            <div class="action-buttons-cell">
                                <button class="btn btn-icon-only btn-sm" @click="emit('view', item)" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>
                                <button class="btn btn-icon-only btn-sm" style="background-color: var(--primary-color); color: white;" v-if="authStore.user" @click="emit('print', item)" title="Cetak"><i class="fa-solid fa-print"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="pagination">
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
const emit = defineEmits(['view', 'edit', 'print', 'delete', 'add', 'export'])

const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedIds = ref([])

const handleSearch = () => {
  currentPage.value = 1
}

const filteredData = computed(() => {
  return pegawaiStore.pppkData.filter(item => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = q === '' || 
      (item["NAMA"]?.toLowerCase().includes(q) || 
       item["NIP BARU"]?.toLowerCase().includes(q) ||
       item["INSTANSI KERJA NAMA"]?.toLowerCase().includes(q))
    
    const matchStatus = statusFilter.value === 'all' || item["STATUS_PERPANJANGAN"] === statusFilter.value
    
    return matchSearch && matchStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
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
