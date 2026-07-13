<template>
  <div class="app-container">
    <Sidebar v-if="!isLoginRoute" />
    
    <div class="main-content" :class="{ 'auth-mode': isLoginRoute }">
      <router-view />
    </div>

    <!-- Modals that are global can go here later -->
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'

const authStore = useAuthStore()
const route = useRoute()

const isAuthenticated = computed(() => !!authStore.user)
const isLoginRoute = computed(() => route.name === 'login')

// Initialize theme from local storage or default to dark
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.body.setAttribute('data-theme', savedTheme)
})
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
