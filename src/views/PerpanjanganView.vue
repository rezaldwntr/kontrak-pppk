<template>
  <div>
    <!-- Tab Bar -->
    <div class="pppk-tabs" style="display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid var(--border-color);">
      <router-link
        v-for="tab in tabs"
        :key="tab.key"
        :to="`/perpanjangan/${tab.key}`"
        class="pppk-tab-item"
        :class="{ active: activeTab === tab.key }"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
        <span class="tab-badge">{{ tabCounts[tab.key] }}</span>
      </router-link>
    </div>

    <div class="card" style="padding: 1.5rem;">
      <PegawaiTable ref="tableRef" 
        :key="activeTab"
        :allowBatchExtend="true"
        :allowBatchDownload="true"
        :onlyNeedExtension="true"
        :customData="filteredData"
        :hideJenisPppkFilter="true"
        :hideStatusKontrakFilter="true"
        @batch-extend="handleBatchExtend"
        @download="handleDownload"
        @batch-download="handleBatchDownload"
        @view="handleView"
        @print="handlePrint"
      />
    </div>

    <div style="margin-top: 24px; margin-bottom: 24px;">
      <ChartCard :title="chartTitle" icon="fa-solid fa-building" chartType="horizontalBar" :chartData="unorChartData" :chartHeight="unorChartHeight" />
    </div>

    <!-- Modals -->
    <DetailModal 
      v-if="showDetail" 
      :isOpen="showDetail" 
      :item="selectedItem" 
      @close="showDetail = false" 
      @print="handlePrint"
    />

    <ExtendModal
      v-if="showExtendModal"
      :isOpen="showExtendModal"
      :selectedIds="extendIds"
      @close="showExtendModal = false"
      @submit="submitBatchExtend"
    />

    <PrintPreviewModal
      v-if="showPrintOptions"
      :show="showPrintOptions"
      :pegawai="selectedItem"
      @close="showPrintOptions = false"
    />
    
    <PasswordPromptModal 
      :isOpen="showPasswordModal" 
      :description="passwordPromptDesc"
      @close="showPasswordModal = false"
      @success="executeBatchExtend"
    />
    <DownloadContractModal
      :isOpen="showDownloadModal"
      :items="downloadItems"
      @close="showDownloadModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePegawaiStore } from '../stores/pegawaiStore'
import ChartCard from '../components/dashboard/ChartCard.vue'
import PegawaiTable from '../components/pegawai/PegawaiTable.vue'
import DetailModal from '../components/pegawai/DetailModal.vue'
import PrintPreviewModal from '../components/pegawai/PrintPreviewModal.vue'
import ExtendModal from '../components/pegawai/ExtendModal.vue'
import PasswordPromptModal from '../components/auth/PasswordPromptModal.vue'
import DownloadContractModal from '../components/pegawai/DownloadContractModal.vue'
import { customSwal } from '../utils/swal'
import { calculateContractPeriod } from '../utils/pppkLogic'

const route = useRoute()
const pegawaiStore = usePegawaiStore()
const showDetail = ref(false)
const showPrintOptions = ref(false)
const showExtendModal = ref(false)
const selectedItem = ref(null)
const extendIds = ref([])

const tabs = [
  { key: 'pppk', label: 'Perpanjangan PPPK', icon: 'fa-solid fa-file-signature' },
  { key: 'paruh-waktu', label: 'Perpanjangan PPPK Paruh Waktu', icon: 'fa-solid fa-file-invoice' },
]

const tableRef = ref(null)
  const activeTab = computed(() => route.params.jenis || 'pppk')

// Helper function to check if item is eligible for extension
const isEligibleForExtension = (item) => {
  const contractStatus = calculateContractPeriod(item).statusText
  const manualStatus = item['STATUS KEAKTIFAN PPPK'] || item['STATUS KEDUDUKAN'];
  if (['Diberhentikan', 'Meninggal', 'Mengundurkan Diri', 'Tidak Diperpanjang'].includes(manualStatus)) return false;
  return ['Kontrak Hampir Habis', 'Kontrak Habis'].includes(contractStatus)
}

const tabCounts = computed(() => {
  const counts = { 'pppk': 0, 'paruh-waktu': 0 }
  pegawaiStore.pppkData.forEach(item => {
    // Only count those eligible for extension to match the table's default behavior
    if (isEligibleForExtension(item)) {
      if (item['JENIS PPPK'] === 'PPPK Paruh Waktu') {
        counts['paruh-waktu']++
      } else {
        counts['pppk']++
      }
    }
  })
  return counts
})

const filteredData = computed(() => {
  return pegawaiStore.pppkData.filter(item => {
    if (activeTab.value === 'paruh-waktu') {
      return item['JENIS PPPK'] === 'PPPK Paruh Waktu'
    } else {
      return item['JENIS PPPK'] !== 'PPPK Paruh Waktu'
    }
  })
})

const getUnorAtasan = (unorNama) => {
  if (!unorNama) return '-'
  let cleaned = unorNama.replace(/\s*-\s*PEMERINTAH KABUPATEN HULU SUNGAI UTARA$/i, '')
  if (cleaned === '-') return '-'
  const parts = cleaned.split(' - ')
  if (parts.length <= 1) return parts[0]
  return parts.slice(0, parts.length - 1).join(' - ') || '-'
}

const getUnorInduk = (unorNama) => {
  if (!unorNama) return '-'
  let cleaned = unorNama.replace(/\s*-\s*PEMERINTAH KABUPATEN HULU SUNGAI UTARA$/i, '')
  if (cleaned === '-') return '-'
  const parts = cleaned.split(' - ')
  return parts[parts.length - 1] || '-'
}

const isSingleInduk = computed(() => {
  const uniqueInduk = new Set()
  filteredData.value.forEach(item => {
    if (isEligibleForExtension(item)) {
      uniqueInduk.add(getUnorInduk(item['UNOR NAMA']))
    }
  })
  return uniqueInduk.size === 1
})

const chartTitle = computed(() => {
  return isSingleInduk.value 
    ? 'Statistik Unor Atasan (Belum Diperpanjang)' 
    : 'Statistik Unor Induk (Belum Diperpanjang)'
})

const unorChartData = computed(() => {
  const counts = {}
  filteredData.value.forEach(item => {
    if (isEligibleForExtension(item)) {
      const label = isSingleInduk.value ? getUnorAtasan(item['UNOR NAMA']) : getUnorInduk(item['UNOR NAMA'])
      counts[label] = (counts[label] || 0) + 1
    }
  })
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1])
  return {
    labels: sorted.map(k => k[0]),
    datasets: [{
      label: 'Pegawai Belum Diperpanjang',
      data: sorted.map(k => k[1]),
      backgroundColor: '#1eaa6e',
      borderRadius: 4
    }]
  }
})

const unorChartHeight = computed(() => {
  return Math.max(320, unorChartData.value.labels.length * 30 + 100) + 'px'
})

const showPasswordModal = ref(false)
const passwordPromptDesc = ref('')
let pendingExtendData = null

const showDownloadModal = ref(false)
const downloadItems = ref([])

const handleDownload = (item) => {
  downloadItems.value = [item]
  showDownloadModal.value = true
}

const handleBatchDownload = (items) => {
  downloadItems.value = items
  showDownloadModal.value = true
}

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})

const handleView = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const handlePrint = (item) => {
  selectedItem.value = item
  showPrintOptions.value = true
}

const handleBatchExtend = (selectedIds) => {
  extendIds.value = selectedIds
  showExtendModal.value = true
}

const submitBatchExtend = async (extendData) => {
  showExtendModal.value = false
  pendingExtendData = extendData
  passwordPromptDesc.value = `Masukkan password Anda untuk memproses perpanjangan kontrak bagi ${extendIds.value.length} pegawai.`
  showPasswordModal.value = true
}

const executeBatchExtend = async () => {
  if (!pendingExtendData) return
  
  try {
    customSwal.fire({
      title: 'Memproses...',
      html: 'Sedang memperpanjang kontrak. Mohon tunggu...',
      allowOutsideClick: false,
      didOpen: () => { customSwal.showLoading() }
    })
    
    await new Promise(resolve => setTimeout(resolve, 100))
    const res = await pegawaiStore.batchExtend(extendIds.value, pendingExtendData)
    customSwal.fire({ 
      icon: 'success', 
      title: 'Berhasil', 
      text: `Berhasil memperpanjang ${res.count} kontrak pegawai!`
    }).then(() => {
      if (tableRef.value) {
        tableRef.value.resetFilters()
      }
    })
  } catch (e) {
    customSwal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memperpanjang kontrak: ' + e.message })
  } finally {
    pendingExtendData = null
  }
}
</script>
