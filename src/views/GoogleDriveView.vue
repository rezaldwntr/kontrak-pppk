<template>
  <div>
    <DriveSyncTab />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import DriveSyncTab from '../components/settings/DriveSyncTab.vue'
import { usePegawaiStore } from '../stores/pegawaiStore'

const pegawaiStore = usePegawaiStore()

onMounted(() => {
  if (pegawaiStore.pppkData.length === 0) {
    pegawaiStore.loadData()
  }
})
</script>
