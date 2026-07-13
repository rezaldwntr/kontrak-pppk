<template>
  <div class="modal-backdrop open" v-if="isOpen" @click.self="emit('close')">
    <div class="modal-container" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <h3><i class="fa-solid fa-address-card"></i> Detail Pegawai (PPPK)</h3>
        <button class="close-btn" @click="emit('close')" aria-label="Tutup">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="modal-tabs">
          <div class="tab-btn" :class="{ active: activeTab === 'personal' }" @click="activeTab = 'personal'">Data Personal</div>
          <div class="tab-btn" :class="{ active: activeTab === 'kepegawaian' }" @click="activeTab = 'kepegawaian'">Kepegawaian</div>
          <div class="tab-btn" :class="{ active: activeTab === 'jabatan' }" @click="activeTab = 'jabatan'">Jabatan & Kerja</div>
        </div>

        <div class="tab-content" v-show="activeTab === 'personal'">
          <div class="form-grid">
            <div class="form-group">
              <label>PNS ID</label>
              <input type="text" :value="item['PNS ID']" disabled>
            </div>
            <div class="form-group">
              <label>NIK</label>
              <input type="text" :value="item['NIK']" disabled>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Nama Lengkap (Termasuk Gelar)</label>
              <input type="text" :value="namaLengkap" disabled>
            </div>
            <div class="form-group">
              <label>Tempat Lahir</label>
              <input type="text" :value="item['TEMPAT LAHIR NAMA']" disabled>
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input type="date" :value="item['TANGGAL LAHIR']" disabled>
            </div>
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <input type="text" :value="item['JENIS KELAMIN'] === 'L' ? 'Laki-Laki' : 'Perempuan'" disabled>
            </div>
            <div class="form-group">
              <label>Agama</label>
              <input type="text" :value="item['AGAMA NAMA']" disabled>
            </div>
          </div>
        </div>

        <div class="tab-content" v-show="activeTab === 'kepegawaian'">
          <div class="form-grid">
            <div class="form-group">
              <label>NIP PPPK (NIP Baru)</label>
              <input type="text" :value="item['NIP BARU']" disabled>
            </div>
            <div class="form-group">
              <label>Kartu ASN Virtual</label>
              <input type="text" :value="item['KARTU ASN VIRTUAL']" disabled>
            </div>
            <div class="form-group">
              <label>Nomor SK CPNS/PPPK</label>
              <input type="text" :value="item['NOMOR SK CPNS']" disabled>
            </div>
            <div class="form-group">
              <label>Tanggal SK</label>
              <input type="date" :value="item['TANGGAL SK CPNS']" disabled>
            </div>
            <div class="form-group">
              <label>TMT CPNS/PPPK (Awal Kontrak)</label>
              <input type="date" :value="item['TMT CPNS']" disabled>
            </div>
            <div class="form-group">
              <label>Masa Kerja</label>
              <input type="text" :value="item['MK TAHUN'] + ' Tahun ' + item['MK BULAN'] + ' Bulan'" disabled>
            </div>
            <div class="form-group">
              <label>Status Perpanjangan</label>
              <input type="text" :value="item['STATUS_PERPANJANGAN'] || 'Belum Diproses'" disabled>
            </div>
          </div>
        </div>

        <div class="tab-content" v-show="activeTab === 'jabatan'">
          <div class="form-grid">
            <div class="form-group" style="grid-column: span 2;">
              <label>Jabatan</label>
              <input type="text" :value="item['JABATAN NAMA']" disabled>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Instansi Kerja</label>
              <input type="text" :value="item['INSTANSI KERJA NAMA']" disabled>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Satuan Kerja (Unit)</label>
              <input type="text" :value="item['SATUAN KERJA KERJA NAMA']" disabled>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-outline" @click="emit('close')">Tutup</button>
        <button class="btn btn-primary" v-if="authStore.user" @click="emit('print', item)">
          <i class="fa-solid fa-print"></i> Cetak SPK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})
const emit = defineEmits(['close', 'print'])

const authStore = useAuthStore()
const activeTab = ref('personal')

const namaLengkap = computed(() => {
  if (!props.item) return ''
  const dpn = props.item['GELAR DEPAN'] && props.item['GELAR DEPAN'] !== '-' ? props.item['GELAR DEPAN'] + ' ' : ''
  const blk = props.item['GELAR BELAKANG'] && props.item['GELAR BELAKANG'] !== '-' ? ', ' + props.item['GELAR BELAKANG'] : ''
  return dpn + props.item['NAMA'] + blk
})
</script>

<style scoped>
/* Scoped overrides if needed, relies on styles.css */
</style>
