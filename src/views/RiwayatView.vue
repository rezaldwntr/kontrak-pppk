<template>
  <div>
    <div class="card" style="padding: 1.5rem;">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>TANGGAL DIPERPANJANG</th>
              <th>NAMA PEGAWAI</th>
              <th>NIP BARU</th>
              <th>TMT LAMA</th>
              <th>TMT BARU</th>
              <th v-if="authStore?.user">AKSI</th>
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
              <td>{{ history.tmtBaru || '-' }}</td>
              <td v-if="authStore?.user">
                <button class="btn btn-danger btn-sm" @click="handleCancel(history, index)" title="Batalkan Perpanjangan">
                  <i class="fa-solid fa-rotate-left"></i> Batal
                </button>
              </td>
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
import { useAuthStore } from '../stores/authStore'
import { customSwal } from '../utils/swal'

const pegawaiStore = usePegawaiStore()
const authStore = useAuthStore()

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData() // also loads history
  }
})

const handleCancel = async (history, index) => {
  const result = await customSwal.fire({
    title: 'Batalkan Perpanjangan?',
    text: `TMT pegawai ${history.nama} akan dikembalikan ke ${history.kontrakLama || 'semula'}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-rotate-left"></i> Ya, Batalkan',
    cancelButtonText: 'Tutup',
    confirmButtonColor: '#ef4444'
  })
  if (result.isConfirmed) {
    try {
      await pegawaiStore.cancelExtension(history, index)
      customSwal.fire({ icon: 'success', title: 'Berhasil', text: 'Perpanjangan dibatalkan.' })
    } catch (e) {
      customSwal.fire({ icon: 'error', title: 'Gagal', text: e.message })
    }
  }
}

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
