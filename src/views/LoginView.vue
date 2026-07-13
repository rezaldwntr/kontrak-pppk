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
  background-color: var(--bg-primary); /* matches dashboard background */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}

.login-card {
  background-color: var(--bg-secondary); /* matches dashboard cards */
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  width: 60px;
  height: 60px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.2rem;
  font-size: 24px;
  color: white;
  box-shadow: 0 4px 10px rgba(45, 122, 241, 0.4);
}

.login-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.alert-error {
  background-color: var(--danger-color);
  color: white;
  padding: 1rem;
  border-radius: var(--border-radius);
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
  color: var(--text-dark);
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
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.input-with-icon .form-control {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background-color: var(--bg-primary); /* slightly darker than card */
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-dark);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.input-with-icon .form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(45, 122, 241, 0.2);
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
