<template>
  <header class="header">
    <div class="header-left">
      <!-- Title injected by route meta or state if needed, for now static or omitted -->
      <button id="btn-mobile-menu" aria-label="Buka Menu">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>
    
    <div class="header-right">
      <button class="btn-icon" @click="logout" aria-label="Keluar / Logout" title="Keluar">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Inherits from styles.css */
</style>
