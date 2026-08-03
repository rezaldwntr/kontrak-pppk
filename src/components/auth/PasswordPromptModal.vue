<template>
  <div v-if="isOpen" class="modal-backdrop open" style="z-index: 2000;">
    <div class="modal-container modal-sm">
      <div class="modal-header">
        <h3><i class="fa-solid fa-lock"></i> Verifikasi Keamanan</h3>
        <button class="close-btn" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-warning" style="margin-bottom: 20px; font-size: 13px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; color: #f59e0b; border-radius: var(--border-radius);">
          <i class="fa-solid fa-shield-halved"></i>
          {{ description || 'Aksi ini memerlukan verifikasi identitas. Masukkan kata sandi (password) Anda untuk melanjutkan.' }}
        </div>
        
        <div class="form-group">
          <label>Kata Sandi (Password)</label>
          <input type="password" v-model="password" class="form-control" placeholder="Masukkan password Anda..." @keyup.enter="handleVerify" ref="pwdInput">
        </div>

        <div v-if="errorMsg" style="margin-top: 15px; font-size: 13px; color: #ef4444; background: rgba(239,68,68,0.1); padding: 8px 12px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.3);">
          {{ errorMsg }}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" @click="emit('close')" :disabled="isLoading">Batal</button>
        <button class="btn btn-primary" @click="handleVerify" :disabled="!password || isLoading" style="background-color: var(--primary-color);">
          <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i> 
          <i v-else class="fa-solid fa-check"></i> 
          Verifikasi
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
const errorMsg = ref('')
const isLoading = ref(false)
const pwdInput = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    password.value = ''
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
