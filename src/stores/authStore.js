import { defineStore } from 'pinia'
import { auth } from '../services/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateEmail } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthReady: false,
    authError: null,
    showLoginModal: false
  }),
  actions: {
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.user = user
          this.isAuthReady = true
          resolve(user)
        })
      })
    },
    async login(email, password) {
      this.authError = null
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (error) {
        this.authError = error.message
        if(error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            this.authError = 'Email atau password salah!'
        }
        throw error
      }
    },
    async logout() {
      await signOut(auth)
      this.user = null
    },
    async reauthenticate(password) {
      if (!this.user) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
      const credential = EmailAuthProvider.credential(this.user.email, password);
      await reauthenticateWithCredential(this.user, credential);
    },
    async changePassword(oldPassword, newPassword) {
      await this.reauthenticate(oldPassword);
      await updatePassword(this.user, newPassword);
    },
    async changeEmail(password, newEmail) {
      await this.reauthenticate(password);
      await updateEmail(this.user, newEmail);
    }
  }
})
