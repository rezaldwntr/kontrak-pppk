<template>
  <div class="dashboard-filters">
    <label for="filter-dashboard-jenis">Filter Dashboard:</label>
    <select id="filter-dashboard-jenis" class="form-control" style="min-width: 200px;" v-model="filterDashboard" @change="pegawaiStore.setFilterDashboard(filterDashboard)">
      <option value="all">Semua Jenis PPPK</option>
      <option value="PPPK">PPPK</option>
      <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
    </select>
  </div>

  <!-- Dashboard Overview Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon bg-indigo"><i class="fa-solid fa-users-viewfinder"></i></div>
      <div class="stat-details">
        <h3>{{ totalPegawai }}</h3>
        <span>Total PPPK</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon bg-warning"><i class="fa-solid fa-hourglass-half"></i></div>
      <div class="stat-details">
        <h3>{{ warningCount }}</h3>
        <span>Kontrak Hampir Habis</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon bg-success"><i class="fa-solid fa-file-circle-check"></i></div>
      <div class="stat-details">
        <h3>{{ activeCount }}</h3>
        <span>Kontrak Masih Berlaku</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon bg-info"><i class="fa-solid fa-file-circle-exclamation"></i></div>
      <div class="stat-details">
        <h3>{{ expiredCount }}</h3>
        <span>Kontrak Habis</span>
      </div>
    </div>
  </div>

  <div class="charts-grid">
    <ChartCard title="Komposisi Jabatan PPPK" icon="fa-solid fa-chart-pie" chartType="doughnut" :chartData="jabatanChartData" />
    <ChartCard title="Jadwal Perpanjangan" icon="fa-solid fa-calendar-check" chartType="bar" :chartData="kontrakChartData" />
    <ChartCard title="Proyeksi Pensiun (BUP)" icon="fa-solid fa-user-clock" chartType="line" :chartData="bupChartData" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { usePegawaiStore } from '../stores/pegawaiStore'
import ChartCard from '../components/dashboard/ChartCard.vue'

const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()
const filterDashboard = ref('all')

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})

const filteredData = computed(() => pegawaiStore.filteredDashboardData)
const totalPegawai = computed(() => filteredData.value.length)

const warningCount = computed(() => {
  return filteredData.value.filter(item => {
    return item["STATUS_PERPANJANGAN"] === "Kontrak Hampir Habis"
  }).length
})

const activeCount = computed(() => {
  return filteredData.value.filter(item => {
    return item["STATUS_PERPANJANGAN"] === "Kontrak Masih Berlaku" || !item["STATUS_PERPANJANGAN"] || item["STATUS_PERPANJANGAN"] === "Belum Diproses"
  }).length
})

const expiredCount = computed(() => {
  return filteredData.value.filter(item => {
    return item["STATUS_PERPANJANGAN"] === "Kontrak Habis"
  }).length
})

// Data preparation for charts
const jabatanChartData = computed(() => {
  const counts = {}
  filteredData.value.forEach(item => {
    const jabatan = item["JABATAN NAMA"] || "Tidak Diketahui"
    counts[jabatan] = (counts[jabatan] || 0) + 1
  })
  
  return {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Jumlah Pegawai',
      data: Object.values(counts),
      backgroundColor: [
        '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1',
        '#06b6d4', '#34d399', '#fbbf24', '#f87171', '#c084fc'
      ]
    }]
  }
})

const kontrakChartData = computed(() => {
  const counts = {}
  filteredData.value.forEach(item => {
    // simplified mock extraction, year 2026-2031
    const tmt = item["TMT CPNS"] || ""
    if (tmt) {
       const year = parseInt(tmt.split('-')[0]) + 5 // assume 5 year contract
       counts[year] = (counts[year] || 0) + 1
    }
  })
  
  return {
    labels: Object.keys(counts).sort(),
    datasets: [{
      label: 'Jadwal Perpanjangan',
      data: Object.keys(counts).sort().map(k => counts[k]),
      backgroundColor: '#3498db'
    }]
  }
})

const bupChartData = computed(() => {
  const counts = {}
  filteredData.value.forEach(item => {
    const tl = item["TANGGAL LAHIR"] || ""
    if (tl) {
       const year = parseInt(tl.split('-')[0]) + 58 // assume BUP 58
       if (year >= 2025 && year <= 2061) {
           counts[year] = (counts[year] || 0) + 1
       }
    }
  })
  
  return {
    labels: Object.keys(counts).sort(),
    datasets: [{
      label: 'Proyeksi Pensiun (BUP)',
      data: Object.keys(counts).sort().map(k => counts[k]),
      borderColor: '#2ecc71',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointBackgroundColor: '#2ecc71',
      tension: 0.3
    }]
  }
})
</script>
