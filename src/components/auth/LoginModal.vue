<template>
  <div class="modal-backdrop open" v-if="authStore.showLoginModal" @click.self="close">
    <div class="modal-container" style="max-width: 420px; padding: 2rem; position: relative;">
      <button 
        class="close-btn" 
        @click="close" 
        aria-label="Tutup" 
        style="position: absolute; right: 16px; top: 16px; font-size: 1.4rem; color: var(--text-muted); cursor: pointer;"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="login-header" style="text-align: center; margin-bottom: 1.6rem;">
        <div class="login-icon" style="width: 54px; height: 54px; border-radius: 14px; background: linear-gradient(135deg, var(--primary-color), var(--primary-hover)); color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 12px; box-shadow: 0 4px 12px rgba(45, 122, 241, 0.25);">
          <i class="fa-solid fa-file-signature"></i>
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">E-Kontrak PPPK</h2>
        <p style="color: var(--text-secondary); font-size: 0.84rem; margin: 0;">Silakan masuk untuk mengakses pengelolaan data</p>
      </div>
      
      <div class="login-body">
        <transition name="fade">
          <div v-if="authStore.authError" class="alert-error" style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 0.82rem; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(239, 68, 68, 0.25);">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ authStore.authError }}</span>
          </div>
        </transition>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="login-email" style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Email Administrator</label>
          <div class="input-with-icon" style="position: relative;">
            <i class="fa-solid fa-envelope" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.95rem;"></i>
            <input 
              type="email" 
              id="login-email" 
              class="form-control" 
              v-model="email" 
              placeholder="admin@kontrak-pppk.com" 
              @keyup.enter="handleLogin" 
              style="padding-left: 42px; height: 44px; border-radius: 8px; width: 100%; font-size: 0.9rem;"
            >
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label for="login-password" style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Kata Sandi</label>
          <div class="input-with-icon" style="position: relative;">
            <i class="fa-solid fa-lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.95rem;"></i>
            <input 
              type="password" 
              id="login-password" 
              class="form-control" 
              v-model="password" 
              placeholder="••••••••" 
              @keyup.enter="handleLogin" 
              style="padding-left: 42px; height: 44px; border-radius: 8px; width: 100%; font-size: 0.9rem;"
            >
          </div>
        </div>

        <button 
          class="btn btn-primary login-btn" 
          @click="handleLogin" 
          :disabled="isLoading" 
          style="width: 100%; height: 44px; font-size: 0.92rem; font-weight: 600; border-radius: 8px; display: flex; justify-content: center; align-items: center; gap: 8px;"
        >
          <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-right-to-bracket"></i>
          <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem' }}</span>
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
    authStore.authError = "Email dan kata sandi wajib diisi!"
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
