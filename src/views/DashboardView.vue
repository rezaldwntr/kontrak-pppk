<template>
  <!-- Modern Dashboard Filters Toolbar -->
  <div class="dashboard-filter-card">
    <div class="filter-row-primary">
      <div class="filter-header-title">
        <i class="fa-solid fa-sliders"></i>
        <span>Filter Data Dashboard</span>
      </div>

      <!-- Segmented Buttons: Jenis PPPK -->
      <div class="filter-pills-group">
        <button
          class="filter-pill-btn"
          :class="{ active: filterJenis === 'all' }"
          @click="setJenis('all')"
          type="button"
          title="Semua Jenis PPPK"
        >
          <i class="fa-solid fa-users"></i>
          <span>Semua Jenis</span>
          <span class="pill-badge">{{ countSemuaJenis }}</span>
        </button>
        <button
          class="filter-pill-btn"
          :class="{ active: filterJenis === 'PPPK' }"
          @click="setJenis('PPPK')"
          type="button"
          title="PPPK Penuh Waktu"
        >
          <i class="fa-solid fa-briefcase"></i>
          <span>Penuh Waktu</span>
          <span class="pill-badge">{{ countPenuhWaktu }}</span>
        </button>
        <button
          class="filter-pill-btn"
          :class="{ active: filterJenis === 'PPPK Paruh Waktu' }"
          @click="setJenis('PPPK Paruh Waktu')"
          type="button"
          title="PPPK Paruh Waktu"
        >
          <i class="fa-solid fa-business-time"></i>
          <span>Paruh Waktu</span>
          <span class="pill-badge">{{ countParuhWaktu }}</span>
        </button>
      </div>
    </div>

    <!-- Filter Row Secondary: Kelompok Pegawai Chips -->
    <div class="filter-row-secondary">
      <span class="filter-sublabel">Kelompok:</span>
      <div class="kelompok-chips-container">
        <button
          v-for="kel in kelompokOptions"
          :key="kel.value"
          class="kelompok-chip-btn"
          :class="{ active: filterKelompok === kel.value }"
          @click="setKelompok(kel.value)"
          type="button"
        >
          <i :class="kel.icon"></i>
          <span>{{ kel.label }}</span>
          <span class="chip-count">{{ kel.count }}</span>
        </button>
      </div>
    </div>
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
import { calculateContractPeriod, getKelompokPegawai } from '../utils/pppkLogic'

const authStore = useAuthStore()
const pegawaiStore = usePegawaiStore()

const filterJenis = ref('all')
const filterKelompok = ref('all')

const setJenis = (val) => {
  filterJenis.value = val
  pegawaiStore.setFilterDashboard(val)
}

const setKelompok = (val) => {
  filterKelompok.value = val
}

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})

const countSemuaJenis = computed(() => pegawaiStore.pppkData.length)
const countPenuhWaktu = computed(() => pegawaiStore.pppkData.filter(i => (i['JENIS PPPK'] || 'PPPK') === 'PPPK').length)
const countParuhWaktu = computed(() => pegawaiStore.pppkData.filter(i => (i['JENIS PPPK'] || 'PPPK') === 'PPPK Paruh Waktu').length)

const kelompokOptions = computed(() => {
  const baseData = pegawaiStore.pppkData.filter(item => {
    const itemJenis = item["JENIS PPPK"] || "PPPK"
    return filterJenis.value === "all" || itemJenis === filterJenis.value
  })

  return [
    { value: 'all', label: 'Semua', icon: 'fa-solid fa-layer-group', count: baseData.length },
    { value: 'Tenaga Guru', label: 'Tenaga Guru', icon: 'fa-solid fa-graduation-cap', count: baseData.filter(i => getKelompokPegawai(i) === 'Tenaga Guru').length },
    { value: 'Tenaga Kesehatan', label: 'Tenaga Kesehatan', icon: 'fa-solid fa-user-doctor', count: baseData.filter(i => getKelompokPegawai(i) === 'Tenaga Kesehatan').length },
    { value: 'Tenaga Teknis', label: 'Tenaga Teknis', icon: 'fa-solid fa-laptop-code', count: baseData.filter(i => getKelompokPegawai(i) === 'Tenaga Teknis').length },
  ]
})

const filteredData = computed(() => {
  return pegawaiStore.pppkData.filter(item => {
    const itemJenis = item["JENIS PPPK"] || "PPPK"
    const matchJenis = filterJenis.value === "all" || itemJenis === filterJenis.value
    const matchKelompok = filterKelompok.value === "all" || getKelompokPegawai(item) === filterKelompok.value
    return matchJenis && matchKelompok
  })
})

const totalPegawai = computed(() => filteredData.value.length)

const warningCount = computed(() => {
  return filteredData.value.filter(item => {
    return calculateContractPeriod(item).statusText === "Kontrak Hampir Habis"
  }).length
})

const activeCount = computed(() => {
  return filteredData.value.filter(item => {
    return calculateContractPeriod(item).statusText === "Kontrak Masih Berlaku"
  }).length
})

const expiredCount = computed(() => {
  return filteredData.value.filter(item => {
    const s = calculateContractPeriod(item).statusText;
    return s === "Kontrak Habis" || s === "Kontrak Habis (BUP)" || s === "Meninggal"
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
    const period = calculateContractPeriod(item)
    if (!period.isBup && period.statusText !== 'Meninggal' && period.rawDate && !isNaN(period.rawDate.getTime())) {
       const newTmt = new Date(period.rawDate);
       newTmt.setDate(newTmt.getDate() + 1);
       const year = newTmt.getFullYear()
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
    const period = calculateContractPeriod(item)
    // To plot BUP projections, we need the actual BUP year even if they aren't BUP yet
    // calculateContractPeriod doesn't return the raw BUP date unless they are BUP
    // Let's re-calculate it quickly for the chart
    const tglLahirStr = String(item["TANGGAL LAHIR"] || "")
    if (tglLahirStr) {
        let birthDate = null;
        const bParts = tglLahirStr.split(/[-/]/);
        if (bParts.length === 3) {
            if (bParts[0].length === 4) birthDate = new Date(bParts[0], bParts[1]-1, bParts[2]);
            else if (bParts[2].length === 4) birthDate = new Date(bParts[2], bParts[1]-1, bParts[0]);
        }
        
        if (birthDate && !isNaN(birthDate.getTime())) {
            const jabatan = (item["JABATAN NAMA"] || "").toLowerCase();
            const bupAge = jabatan.includes("guru") ? 60 : 58;
            const year = birthDate.getFullYear() + bupAge;
            if (year >= 2025 && year <= 2061) {
               counts[year] = (counts[year] || 0) + 1
            }
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

<style scoped>
.dashboard-filter-card {
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.filter-row-primary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.filter-header-title i {
  color: var(--primary-color, #2563eb);
}

.filter-pills-group {
  display: inline-flex;
  background: var(--bg-secondary, rgba(0, 0, 0, 0.04));
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  gap: 4px;
  overflow-x: auto;
  max-width: 100%;
}

.filter-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  font-size: 0.88rem;
  font-weight: 500;
  border-radius: 9px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-pill-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.filter-pill-btn.active {
  background: var(--primary-color, #2563eb);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.pill-badge {
  font-size: 0.76rem;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
  font-weight: 600;
}

.filter-pill-btn.active .pill-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.filter-row-secondary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  border-top: 1px dashed var(--border-color, rgba(255, 255, 255, 0.08));
  padding-top: 12px;
}

.filter-sublabel {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.kelompok-chips-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.kelompok-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 999px;
  border: 1.5px solid var(--border-color, rgba(255, 255, 255, 0.12));
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.kelompok-chip-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.kelompok-chip-btn.active {
  border-color: var(--primary-color);
  background: rgba(37, 99, 235, 0.12);
  color: var(--primary-color);
  font-weight: 600;
}

.chip-count {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  color: inherit;
}

.kelompok-chip-btn.active .chip-count {
  background: var(--primary-color);
  color: #ffffff;
}

@media (max-width: 768px) {
  .filter-row-primary {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-pills-group {
    width: 100%;
    display: flex;
  }
  .filter-pill-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 10px;
    font-size: 0.82rem;
  }
}
</style>
