<template>
  <div v-if="isOpen" class="modal-backdrop open" style="z-index: 2000;" @click.self="emit('close')">
    <div class="modal-container modal-sm" style="max-width: 440px;">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="modal-header-icon" style="width: 36px; height: 36px; border-radius: 8px; background: rgba(245, 158, 11, 0.12); color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 1.05rem;">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-dark);">Verifikasi Keamanan</h3>
            <p style="margin: 0; font-size: 0.78rem; color: var(--text-muted);">Konfirmasi identitas administrator</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="padding: 18px 22px;">
        <div class="alert alert-warning" style="margin-bottom: 16px; font-size: 0.82rem; background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; padding: 10px 14px; color: #b45309; border-radius: 6px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.4;">
          <i class="fa-solid fa-lock" style="margin-top: 2px;"></i>
          <span>{{ description || 'Aksi ini memerlukan verifikasi identitas. Masukkan kata sandi akun Anda untuk melanjutkan.' }}</span>
        </div>
        
        <div class="form-group" style="margin-bottom: 6px;">
          <label style="font-weight: 600; font-size: 0.82rem; color: var(--text-dark); display: block; margin-bottom: 6px;">Kata Sandi Administrator</label>
          <div style="position: relative;">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              class="form-control" 
              placeholder="Masukkan kata sandi..." 
              @keyup.enter="handleVerify" 
              ref="pwdInput"
              style="padding-right: 38px; height: 42px; font-size: 0.9rem;"
            >
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;"
              title="Tampilkan / Sembunyikan"
            >
              <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="errorMsg" style="margin-top: 12px; font-size: 0.8rem; color: #ef4444; background: rgba(239, 68, 68, 0.08); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.25); display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ errorMsg }}</span>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding: 14px 22px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-outline" @click="emit('close')" :disabled="isLoading">Batal</button>
        <button class="btn btn-primary" @click="handleVerify" :disabled="!password || isLoading" style="background-color: var(--primary-color);">
          <i v-if="isLoading" class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> 
          <i v-else class="fa-solid fa-check" style="margin-right: 6px;"></i> 
          <span>{{ isLoading ? 'Memverifikasi...' : 'Verifikasi' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const props = defineProps({
  isOpen: Boolean,
  description: String,
})

const emit = defineEmits(['close', 'success'])
const authStore = useAuthStore()

const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const isLoading = ref(false)
const pwdInput = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    password.value = ''
    showPassword.value = false
    errorMsg.value = ''
    isLoading.value = false
    nextTick(() => {
      if (pwdInput.value) pwdInput.value.focus()
    })
  }
})

const handleVerify = async () => {
  if (!password.value) return
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    await authStore.reauthenticate(password.value)
    emit('success', password.value)
    emit('close')
  } catch (error) {
    console.error("Auth error:", error)
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMsg.value = 'Kata sandi yang Anda masukkan salah.'
    } else {
      errorMsg.value = 'Terjadi kesalahan: ' + error.message
    }
  } finally {
    isLoading.value = false
  }
}
</script>
