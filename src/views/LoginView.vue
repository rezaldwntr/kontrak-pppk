<template>
  <div class="modal-content" style="max-width: 400px; margin: auto; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: var(--border-radius);">
    <div class="modal-header">
      <h3><i class="fa-solid fa-lock" style="margin-right: 0.5rem; color: var(--primary-color);"></i> Login Admin</h3>
    </div>
    <div class="modal-body">
      <div v-if="authStore.authError" class="alert alert-warning" style="margin-bottom: 1rem; color: #dc2626; font-size: 0.9rem;">
        {{ authStore.authError }}
      </div>
      <div class="form-group">
        <label for="login-email">Email Admin</label>
        <input type="email" id="login-email" v-model="email" placeholder="admin@kontrak-pppk.com" @keyup.enter="handleLogin">
      </div>
      <div class="form-group">
        <label for="login-password">Password</label>
        <input type="password" id="login-password" v-model="password" placeholder="Masukkan password" @keyup.enter="handleLogin">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" style="width: 100%;" @click="handleLogin" :disabled="isLoading">
        <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
        <i v-else class="fa-solid fa-right-to-bracket"></i> Login
      </button>
    </div>
    
    <div style="text-align: center; margin-top: 1.5rem;">
      <router-link to="/" class="btn btn-outline" style="font-size: 0.85rem;">
        <i class="fa-solid fa-chart-pie"></i> Lihat Dashboard (Tamu)
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    authStore.authError = "Email dan password wajib diisi!"
    return
  }
  
  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/data-pegawai')
  } catch (e) {
    // Error handled in store
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Inherits from styles.css */
</style>
