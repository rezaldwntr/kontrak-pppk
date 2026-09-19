import { useDriveStore } from '../stores/driveStore'
import { db } from '../services/firebase'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

const ENV_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
].join(' ')

export function getRedirectUri() {
  if (typeof window === 'undefined') return 'https://kontrak-pppk.vercel.app/drive'
  return `${window.location.origin}/drive`
}

export function useGoogleAuth() {
  const driveStore = useDriveStore()

  async function resolveClientId() {
    if (ENV_CLIENT_ID) return ENV_CLIENT_ID

    try {
      const res = await fetch('/api/drive/token?action=config')
      if (res.ok) {
        const data = await res.json()
        if (data.clientId) return data.clientId
      }
    } catch (e) {
      console.warn('Could not fetch clientId from server:', e)
    }
    return ''
  }

  async function buildOAuthUrl(state = '') {
    const clientId = await resolveClientId()
    if (!clientId) {
      throw new Error('Google Client ID belum diatur. Harap tambahkan VITE_GOOGLE_CLIENT_ID di Vercel Environment Variables.')
    }

    const redirectUri = getRedirectUri()
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  async function startOAuthFlow() {
    try {
      const state = Math.random().toString(36).substring(2)
      sessionStorage.setItem('drive_oauth_state', state)
      const url = await buildOAuthUrl(state)
      window.location.href = url
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleOAuthCallback(code) {
    const redirectUri = getRedirectUri()
    const res = await fetch(`/api/drive/token?action=exchange&code=${encodeURIComponent(code)}&redirectUri=${encodeURIComponent(redirectUri)}`)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to exchange token')
    }
    const data = await res.json()

    // Frontend (authenticated) menyimpan refreshToken ke Firestore
    await setDoc(doc(db, 'config', 'drive_tokens'), {
      refreshToken: data.refreshToken,
      tokenExpiry: data.tokenExpiry,
      connectedEmail: data.connectedEmail || '',
      scope: data.scope || '',
      updatedAt: new Date(),
    }, { merge: true })

    driveStore.setAccessToken(data.accessToken, data.tokenExpiry)
    driveStore.setConnected(data.connectedEmail, data.scope || '')
    return data
  }

  async function getValidToken() {
    if (driveStore.isTokenValid) return driveStore.accessToken

    // Baca refreshToken dari Firestore (frontend sudah terautentikasi)
    const tokenDoc = await getDoc(doc(db, 'config', 'drive_tokens'))
    if (!tokenDoc.exists() || !tokenDoc.data().refreshToken) {
      driveStore.setDisconnected()
      throw new Error('Session Google Drive berakhir. Silakan hubungkan kembali.')
    }

    const refreshToken = tokenDoc.data().refreshToken

    // Kirim ke Vercel function untuk di-refresh
    const res = await fetch(`/api/drive/token?action=refresh&refreshToken=${encodeURIComponent(refreshToken)}`)
    if (!res.ok) {
      const errData = await res.json()
      // Jika token sudah tidak valid, hapus dari Firestore
      if (errData.invalidGrant) {
        await deleteDoc(doc(db, 'config', 'drive_tokens'))
      }
      driveStore.setDisconnected()
      throw new Error('Session Google Drive berakhir. Silakan hubungkan kembali.')
    }

    const data = await res.json()

    // Update tokenExpiry di Firestore
    await setDoc(doc(db, 'config', 'drive_tokens'), {
      tokenExpiry: data.tokenExpiry,
      updatedAt: new Date(),
    }, { merge: true })

    driveStore.setAccessToken(data.accessToken, data.tokenExpiry)
    return data.accessToken
  }

  async function disconnectDrive() {
    // Baca refresh token sebelum dihapus
    const tokenDoc = await getDoc(doc(db, 'config', 'drive_tokens'))
    const refreshToken = tokenDoc.exists() ? tokenDoc.data().refreshToken : null

    // Revoke di Google
    if (refreshToken) {
      await fetch(`/api/drive/token?action=revoke&refreshToken=${encodeURIComponent(refreshToken)}`, {
        method: 'POST',
      }).catch(() => {})
    }

    // Hapus dari Firestore
    await deleteDoc(doc(db, 'config', 'drive_tokens')).catch(() => {})

    driveStore.setDisconnected()
    return true
  }

  return { startOAuthFlow, handleOAuthCallback, getValidToken, disconnectDrive }
}
