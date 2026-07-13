<template>
  <div class="content-header">
    <div>
      <h2>Dashboard Analisis</h2>
      <p>Ringkasan status perpanjangan kontrak kerja PPPK</p>
    </div>
    <div v-if="!authStore.user" style="margin-left: auto;">
      <router-link to="/login" class="btn btn-primary"><i class="fa-solid fa-right-to-bracket"></i> Login</router-link>
    </div>
  </div>

  <div class="dashboard-filters">
    <label for="filter-dashboard-jenis">Filter Dashboard:</label>
    <select id="filter-dashboard-jenis" v-model="filterDashboard" @change="pegawaiStore.setFilterDashboard(filterDashboard)">
      <option value="all">Semua Jenis PPPK</option>
      <option value="PPPK">PPPK Teknis/Fungsional</option>
      <option value="PPPK Guru">PPPK Guru</option>
      <option value="PPPK Tenaga Kesehatan">PPPK Tenaga Kesehatan</option>
    </select>
  </div>

  <!-- Dashboard Overview Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon"><i class="fa-solid fa-users-rectangle"></i></div>
      <div class="stat-info">
        <h3>{{ totalPegawai }}</h3>
        <p>Total PPPK</p>
      </div>
    </div>
    <div class="stat-card warning" v-if="warningCount > 0">
      <div class="stat-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
      <div class="stat-info">
        <h3>{{ warningCount }}</h3>
        <p>Perlu Perhatian</p>
      </div>
    </div>
  </div>

  <div class="charts-grid">
    <ChartCard title="Komposisi Jabatan PPPK" icon="fa-solid fa-chart-pie" chartType="pie" :chartData="jabatanChartData" />
    <ChartCard title="Status Perpanjangan Kontrak" icon="fa-solid fa-file-signature" chartType="doughnut" :chartData="statusChartData" />
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
    // Basic logic for warning, adjust based on your calculateContractPeriod
    return item["STATUS_PERPANJANGAN"] === "Belum Diproses"
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
      backgroundColor: ['#2e4a8c', '#e74c3c', '#f1c40f', '#27ae60', '#8e44ad', '#34495e']
    }]
  }
})

const statusChartData = computed(() => {
  const counts = {}
  filteredData.value.forEach(item => {
    const status = item["STATUS_PERPANJANGAN"] || "Belum Diproses"
    counts[status] = (counts[status] || 0) + 1
  })
  
  return {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Status Perpanjangan',
      data: Object.values(counts),
      backgroundColor: ['#3498db', '#e67e22', '#2ecc71']
    }]
  }
})
</script>
