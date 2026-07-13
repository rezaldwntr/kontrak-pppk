<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">
          <i class="fa-solid fa-file-signature"></i>
        </div>
        <h2>E-Kontrak PPPK</h2>
        <p>Silakan login untuk mengakses manajemen data</p>
      </div>
      
      <div class="login-body">
        <transition name="fade">
          <div v-if="authStore.authError" class="alert-error">
            <i class="fa-solid fa-circle-exclamation"></i> {{ authStore.authError }}
          </div>
        </transition>

        <div class="form-group">
          <label for="login-email">Email Administrator</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-envelope"></i>
            <input type="email" id="login-email" class="form-control" v-model="email" placeholder="admin@kontrak-pppk.com" @keyup.enter="handleLogin">
          </div>
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-lock"></i>
            <input type="password" id="login-password" class="form-control" v-model="password" placeholder="••••••••" @keyup.enter="handleLogin">
          </div>
        </div>

        <button class="btn btn-primary login-btn" @click="handleLogin" :disabled="isLoading">
          <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
          <span v-else>Masuk ke Sistem</span>
        </button>
      </div>
      
      <div class="login-footer">
        <router-link to="/" class="guest-link">
          <i class="fa-solid fa-arrow-left"></i> Kembali ke Dashboard
        </router-link>
      </div>
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
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at center, #1e2130 0%, #13151f 100%);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}

.login-card {
  background: rgba(30, 33, 48, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color), #4f46e5);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 28px;
  color: white;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #9ca3af;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(220, 38, 38, 0.1);
  border-left: 4px solid #ef4444;
  color: #fca5a5;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  transition: color 0.3s ease;
}

.input-with-icon .form-control {
  width: 100%;
  padding: 12px 14px 12px 40px;
  background: rgba(15, 17, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.input-with-icon .form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  background: rgba(15, 17, 26, 0.9);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.input-with-icon .form-control:focus + i,
.input-with-icon .form-control:not(:placeholder-shown) + i {
  color: var(--primary-color);
}

.login-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  background: linear-gradient(135deg, var(--primary-color), #4f46e5);
  border: none;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.guest-link {
  color: #9ca3af;
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.guest-link:hover {
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
