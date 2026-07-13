<template>
  <div class="table-container">
    <div class="table-actions">
      <div class="search-bar">
        <i class="fa-solid fa-search"></i>
        <input type="text" v-model="searchQuery" placeholder="Cari NAMA, NIP, atau Instansi..." @input="handleSearch" />
      </div>
      <div class="table-filters" v-if="authStore.user">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="all">Semua Status</option>
          <option value="Belum Diproses">Belum Diproses</option>
          <option value="Memenuhi Syarat">Memenuhi Syarat</option>
          <option value="Tidak Memenuhi Syarat">Tidak Memenuhi Syarat</option>
          <option value="Selesai Diperpanjang">Selesai Diperpanjang</option>
        </select>
      </div>
      <div class="action-buttons" v-if="authStore.user">
        <button class="btn btn-outline" @click="emit('export')"><i class="fa-solid fa-file-excel"></i> Ekspor</button>
        <button class="btn btn-primary" @click="emit('add')"><i class="fa-solid fa-plus"></i> Tambah Data</button>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th v-if="authStore.user">
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          </th>
          <th>No</th>
          <th>NIP PPPK</th>
          <th>Nama Lengkap</th>
          <th>Jabatan</th>
          <th>Masa Kerja</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="pegawaiStore.isLoading">
          <td colspan="8" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Memuat Data...</td>
        </tr>
        <tr v-else-if="paginatedData.length === 0">
          <td colspan="8" class="text-center">Data tidak ditemukan.</td>
        </tr>
        <tr v-for="(item, index) in paginatedData" :key="item['PNS ID']" :class="getRowClass(item)">
          <td v-if="authStore.user">
            <input type="checkbox" :value="item['PNS ID']" v-model="selectedIds" />
          </td>
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td>{{ item["NIP BARU"] }}</td>
          <td>
            <strong>{{ item["NAMA"] }}</strong><br>
            <small>{{ item["NIK"] }}</small>
          </td>
          <td>{{ item["JABATAN NAMA"] }}</td>
          <td>{{ item["MK TAHUN"] }} Tahun {{ item["MK BULAN"] }} Bulan</td>
          <td>
            <span :class="['status-badge', getBadgeClass(item['STATUS_PERPANJANGAN'])]">
              {{ item["STATUS_PERPANJANGAN"] || "Belum Diproses" }}
            </span>
          </td>
          <td class="action-cell">
            <button class="btn-icon btn-view" @click="emit('view', item)" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon btn-edit" v-if="authStore.user" @click="emit('edit', item)" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn-icon btn-print" v-if="authStore.user" @click="emit('print', item)" title="Cetak SPK"><i class="fa-solid fa-print"></i></button>
            <button class="btn-icon btn-delete" v-if="authStore.user" @click="emit('delete', item)" title="Hapus"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <div class="pagination-info">
        Menampilkan {{ Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1) }} - {{ Math.min(filteredData.length, currentPage * itemsPerPage) }} dari {{ filteredData.length }} data
      </div>
      <div class="pagination-controls">
        <button class="btn btn-outline" :disabled="currentPage === 1" @click="currentPage--"><i class="fa-solid fa-chevron-left"></i> Sebelumnya</button>
        <span class="page-number">Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button class="btn btn-outline" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage++">Selanjutnya <i class="fa-solid fa-chevron-right"></i></button>
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
  switch(status) {
    case 'Memenuhi Syarat': return 'aktif'
    case 'Tidak Memenuhi Syarat': return 'tms'
    case 'Selesai Diperpanjang': return 'selesai'
    default: return 'belum'
  }
}

const getRowClass = (item) => {
  // Can add custom row classes if needed based on contract end dates etc.
  return ''
}
</script>

<style scoped>
/* Table styles inherit from global CSS */
</style>
