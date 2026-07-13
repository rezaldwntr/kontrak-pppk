<template>
  <div id="app-container" :class="themeClass">
    <Sidebar v-if="isAuthenticated" />
    
    <div class="main-content" :class="{ 'auth-mode': !isAuthenticated }">
      <Header v-if="isAuthenticated" />
      <router-view />
    </div>

    <!-- Modals that are global can go here later -->
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'

const authStore = useAuthStore()

const isAuthenticated = computed(() => !!authStore.user)

// Example logic for dark mode can be tied to a config store later
const themeClass = computed(() => {
  return 'light-theme' // default for now
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
