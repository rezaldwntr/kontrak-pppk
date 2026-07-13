import { defineStore } from 'pinia'
import { auth } from '../services/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthReady: false,
    authError: null
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
    }
  }
})
