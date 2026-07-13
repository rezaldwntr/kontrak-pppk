<template>
  <div>
    <header class="header">
      <div class="page-title">
        <h2>Riwayat Perpanjangan Kontrak</h2>
        <p>Catatan riwayat perpanjangan kontrak otomatis yang telah dilakukan.</p>
      </div>
    </header>

    <div class="card" style="padding: 1.5rem;">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>TANGGAL DIPERPANJANG</th>
              <th>NAMA PEGAWAI</th>
              <th>NIP BARU</th>
              <th>KONTRAK LAMA</th>
              <th>KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pegawaiStore.isLoading">
              <td colspan="5" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Memuat Riwayat...</td>
            </tr>
            <tr v-else-if="pegawaiStore.extensionHistory.length === 0">
              <td colspan="5" class="text-center">Belum ada riwayat perpanjangan kontrak.</td>
            </tr>
            <tr v-else v-for="(history, index) in pegawaiStore.extensionHistory" :key="index">
              <td>{{ formatDate(history.tglDiperpanjang) }}</td>
              <td><strong>{{ history.nama }}</strong></td>
              <td>{{ history.nip }}</td>
              <td>{{ history.kontrakLama || '-' }}</td>
              <td><span class="badge badge-success">{{ history.keterangan }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePegawaiStore } from '../stores/pegawaiStore'

const pegawaiStore = usePegawaiStore()

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData() // also loads history
  }
})

const formatDate = (isoString) => {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
.badge-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
</style>
