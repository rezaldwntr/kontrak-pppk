import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../services/firebase'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'

export const useDriveStore = defineStore('drive', () => {
  // State
  const isConnected = ref(false)
  const connectedEmail = ref('')
  const isEnabled = ref(false)
  const accessToken = ref(null)
  const tokenExpiry = ref(0)
  const scope = ref('')

  // Settings
  const settings = ref({
    folderId: '',
    folderName: '',
    paperSize: 'f4',
    documentPart: 'full',
    mergeMode: 'individual',
    tanggalKontrak: '',
    includeGelar: false,
  })

  // Sync rules
  const syncRules = ref([])
  const syncRulesLogic = ref('AND')

  // Queue
  const queueCount = ref(0)

  // Loading states
  const isLoading = ref(false)
  const isSaving = ref(false)

  // Computed
  const isTokenValid = computed(() => {
    return accessToken.value && tokenExpiry.value > Date.now() + 60000 // 1 min buffer
  })

  // Load settings from Firestore
  async function loadSettings() {
    isLoading.value = true
    try {
      const settingsDoc = await getDoc(doc(db, 'config', 'drive_sync_settings'))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        settings.value = {
          folderId: data.folderId || '',
          folderName: data.folderName || '',
          paperSize: data.paperSize || 'f4',
          documentPart: data.documentPart || 'full',
          mergeMode: data.mergeMode || 'individual',
          tanggalKontrak: data.tanggalKontrak || '',
          includeGelar: data.includeGelar || false,
        }
        isEnabled.value = data.isEnabled || false
      }

      const tokensDoc = await getDoc(doc(db, 'config', 'drive_tokens'))
      if (tokensDoc.exists()) {
        const data = tokensDoc.data()
        isConnected.value = !!data.refreshToken
        connectedEmail.value = data.connectedEmail || ''
        scope.value = data.scope || ''
      }

      const rulesDoc = await getDoc(doc(db, 'config', 'drive_sync_rules'))
      if (rulesDoc.exists()) {
        const data = rulesDoc.data()
        syncRules.value = data.rules || []
        syncRulesLogic.value = data.logic || 'AND'
      }
    } finally {
      isLoading.value = false
    }
  }

  // Save settings to Firestore
  async function saveSettings() {
    isSaving.value = true
    try {
      await setDoc(doc(db, 'config', 'drive_sync_settings'), {
        ...settings.value,
        isEnabled: isEnabled.value,
        updatedAt: new Date(),
      })
    } finally {
      isSaving.value = false
    }
  }

  // Save sync rules
  async function saveSyncRules(rules, logic = 'AND') {
    syncRules.value = rules
    syncRulesLogic.value = logic
    await setDoc(doc(db, 'config', 'drive_sync_rules'), {
      rules,
      logic,
      updatedAt: new Date(),
    })
  }

  // Store access token in memory (never persisted)
  function setAccessToken(token, expiry) {
    accessToken.value = token
    tokenExpiry.value = expiry
  }

  // Mark as connected
  function setConnected(email, userScope = '') {
    isConnected.value = true
    connectedEmail.value = email
    scope.value = userScope
  }

  // Mark as disconnected
  function setDisconnected() {
    isConnected.value = false
    connectedEmail.value = ''
    scope.value = ''
    accessToken.value = null
    tokenExpiry.value = 0
  }

  const hasDriveScope = computed(() => {
    if (!isConnected.value) return true
    if (!scope.value) return true // Jika belum ada data scope, anggap true agar tidak false positive
    return scope.value.includes('drive')
  })

  return {
    isConnected, connectedEmail, scope, hasDriveScope, isEnabled, accessToken, tokenExpiry,
    settings, syncRules, syncRulesLogic, queueCount, isLoading, isSaving,
    isTokenValid,
    loadSettings, saveSettings, saveSyncRules, setAccessToken, setConnected, setDisconnected,
  }
})
