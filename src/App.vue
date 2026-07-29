<template>
  <div class="app-container">
    <Sidebar />
    
    <div class="main-content">
      <Header />
      <router-view />
    </div>

    <LoginModal />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import LoginModal from './components/auth/LoginModal.vue'

const authStore = useAuthStore()
const route = useRoute()

const isAuthenticated = computed(() => !!authStore.user)

// Initialize theme from local storage or default to dark
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.body.setAttribute('data-theme', savedTheme)
})

import { watch } from 'vue'
import { usePegawaiStore } from './stores/pegawaiStore'
const pegawaiStore = usePegawaiStore()

watch(() => pegawaiStore.pppkData, async (data) => {
  if (data && data.length > 0) {
    const pIndex = data.findIndex(p => p['NIP BARU'] === '197802262021211003')
    if (pIndex !== -1 && data[pIndex]['AWAL KONTRAK AKTIF'] === '2026-01-01') {
      const fixedData = { ...data[pIndex] }
      fixedData['AWAL KONTRAK AKTIF'] = '2021-01-01'
      delete fixedData['FORCE_AKTIF']
      delete fixedData['STATUS_PERPANJANGAN']
      try {
        await pegawaiStore.updatePegawai(fixedData['PNS ID'], fixedData)
        console.log('✅ Anomaly data fixed for NIP 197802262021211003')
      } catch (e) {
        console.error('Failed to fix anomaly data', e)
      }
    }
  }
}, { immediate: true })
</script>

<style>
/* We are using the legacy styles.css globally via main.js, 
   but specific app-level tweaks can go here */
#app-container {
  display: flex;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-light);
}
.main-content.auth-mode {
  justify-content: center;
  align-items: center;
}
</style>
