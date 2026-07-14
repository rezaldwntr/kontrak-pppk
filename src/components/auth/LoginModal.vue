<template>
  <div class="modal-backdrop open" v-if="authStore.showLoginModal" @click.self="close">
    <div class="modal-container" style="max-width: 420px; padding: 2.5rem;">
      <div class="login-header" style="text-align: center; margin-bottom: 2rem;">
        <div class="login-icon" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), var(--primary-hover)); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 15px;">
          <i class="fa-solid fa-file-signature"></i>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 5px;">E-Kontrak PPPK</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Silakan login untuk mengakses manajemen data</p>
      </div>
      
      <div class="login-body">
        <transition name="fade">
          <div v-if="authStore.authError" class="alert-error" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: var(--border-radius); padding: 12px 15px; margin-bottom: 20px; font-size: 13px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-circle-exclamation"></i> {{ authStore.authError }}
          </div>
        </transition>

        <div class="form-group" style="margin-bottom: 20px;">
          <label for="login-email" style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Email Administrator</label>
          <div class="input-with-icon" style="position: relative;">
            <i class="fa-solid fa-envelope" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
            <input type="email" id="login-email" class="form-control" v-model="email" placeholder="admin@kontrak-pppk.com" @keyup.enter="handleLogin" style="padding-left: 45px; height: 48px; border-radius: 12px; width: 100%;">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label for="login-password" style="display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Password</label>
          <div class="input-with-icon" style="position: relative;">
            <i class="fa-solid fa-lock" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
            <input type="password" id="login-password" class="form-control" v-model="password" placeholder="••••••••" @keyup.enter="handleLogin" style="padding-left: 45px; height: 48px; border-radius: 12px; width: 100%;">
          </div>
        </div>

        <button class="btn btn-primary login-btn" @click="handleLogin" :disabled="isLoading" style="width: 100%; height: 48px; font-size: 1rem; font-weight: 600; border-radius: 12px; display: flex; justify-content: center; align-items: center;">
          <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
          <span v-else>Masuk ke Sistem</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const close = () => {
  if (!isLoading.value) {
    authStore.showLoginModal = false
  }
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    authStore.authError = "Email dan password wajib diisi!"
    return
  }
  
  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    authStore.showLoginModal = false
    
    // Automatically redirect to the next route or data-pegawai
    if (route.query.redirect) {
      router.push(route.query.redirect)
    } else if (route.name === 'dashboard') {
      router.push('/data-pegawai')
    }
  } catch (e) {
    // Error handled in store
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Inherits modal styles from global CSS */
</style>
