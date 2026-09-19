import { useGoogleAuth } from './useGoogleAuth'
import { useDriveStore } from '../stores/driveStore'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'

export function useGoogleDrive() {
  const { getValidToken } = useGoogleAuth()
  const driveStore = useDriveStore()

  async function authHeaders() {
    const token = await getValidToken()
    return { Authorization: `Bearer ${token}` }
  }

  // Cari file/folder berdasarkan nama di parent folder
  async function findItem(name, parentId, mimeType = null) {
    const headers = await authHeaders()
    let q = `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`
    if (mimeType) q += ` and mimeType='${mimeType}'`

    const res = await fetch(
      `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)`,
      { headers }
    )
    const data = await res.json()
    return data.files && data.files.length > 0 ? data.files[0] : null
  }

  // Buat folder
  async function createFolder(name, parentId) {
    const headers = await authHeaders()
    const res = await fetch(`${DRIVE_API}/files`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(`Gagal buat folder: ${data.error.message}`)
    return data.id
  }

  // Dapatkan atau buat folder
  async function getOrCreateFolder(name, parentId) {
    const existing = await findItem(name, parentId, 'application/vnd.google-apps.folder')
    if (existing) return existing.id
    return createFolder(name, parentId)
  }

  // Upload file baru
  async function uploadFile(blob, fileName, folderId) {
    const token = await getValidToken()
    const metadata = { name: fileName, parents: [folderId] }
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', blob, fileName)

    const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const data = await res.json()
    if (data.error) throw new Error(`Gagal upload: ${data.error.message}`)
    return data.id
  }

  // Update file existing
  async function updateFile(fileId, blob) {
    const token = await getValidToken()
    const res = await fetch(`${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': blob.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      body: blob,
    })
    const data = await res.json()
    if (data.error) throw new Error(`Gagal update: ${data.error.message}`)
    return data.id
  }

  // Upload atau update (upsert)
  async function upsertFile(blob, fileName, folderId) {
    const existing = await findItem(fileName, folderId)
    if (existing) {
      return updateFile(existing.id, blob)
    } else {
      return uploadFile(blob, fileName, folderId)
    }
  }

  // Bangun struktur folder dan kembalikan target folderId
  // structure: [Kontrak|Isi Perjanjian|Tanda Tangan] / [Unor Induk] (if individual)
  async function getTargetFolder(documentPart, unorInduk = null, mergeMode = 'individual') {
    const rootFolderId = driveStore.settings.folderId
    if (!rootFolderId) throw new Error('Folder Google Drive belum dikonfigurasi')

    // Level 1: dokumen part folder
    const partNames = {
      full: 'Kontrak',
      perjanjian: 'Isi Perjanjian',
      tandatangan: 'Tanda Tangan',
    }
    const partFolderName = partNames[documentPart] || 'Kontrak'
    const partFolderId = await getOrCreateFolder(partFolderName, rootFolderId)

    // Level 2: jika individual, buat subfolder Unor Induk
    if (mergeMode === 'individual' && unorInduk) {
      return getOrCreateFolder(unorInduk, partFolderId)
    }

    return partFolderId
  }

  // Helper untuk memastikan script gapi dan google picker sudah siap
  function ensurePickerLoaded() {
    return new Promise((resolve, reject) => {
      if (window.google?.picker) return resolve()

      const loadPickerApi = () => {
        if (window.gapi) {
          window.gapi.load('picker', {
            callback: () => resolve(),
            onerror: () => reject(new Error('Gagal memuat Google Picker API')),
          })
        } else {
          reject(new Error('Google API Client (gapi) tidak tersedia'))
        }
      }

      if (window.gapi) {
        loadPickerApi()
      } else {
        const script = document.createElement('script')
        script.src = 'https://apis.google.com/js/api.js'
        script.onload = loadPickerApi
        script.onerror = () => reject(new Error('Gagal memuat script Google API'))
        document.head.appendChild(script)
      }
    })
  }

  // Dapatkan info folder berdasarkan ID atau URL Google Drive
  async function getFolderInfo(folderIdOrUrl) {
    if (!folderIdOrUrl) throw new Error('ID atau URL folder tidak boleh kosong')

    let folderId = folderIdOrUrl.trim()
    const urlMatch = folderId.match(/folders\/([a-zA-Z0-9_-]+)/)
    if (urlMatch && urlMatch[1]) {
      folderId = urlMatch[1]
    } else if (folderId.includes('id=')) {
      const idParam = new URLSearchParams(folderId.split('?')[1]).get('id')
      if (idParam) folderId = idParam
    }

    const headers = await authHeaders()
    const res = await fetch(
      `${DRIVE_API}/files/${folderId}?fields=id,name,mimeType,trashed`,
      { headers }
    )
    const data = await res.json()
    if (data.error) {
      if (data.error.code === 404) {
        throw new Error('Folder tidak ditemukan di Google Drive akun yang terhubung.')
      }
      throw new Error(data.error.message || 'Gagal mengakses folder Google Drive.')
    }
    if (data.trashed) {
      throw new Error('Folder ini berada di tempat sampah (Trash).')
    }
    if (data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('Item yang dimasukkan adalah file, bukan folder Google Drive.')
    }
    return { id: data.id, name: data.name }
  }

  // Buka Google Picker untuk pilih folder
  async function openFolderPicker(onSelected) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_API_KEY') {
      throw new Error('API Key Google belum diatur. Harap periksa VITE_GOOGLE_API_KEY di environment variables.')
    }

    const token = await getValidToken()

    if (!token) {
      throw new Error('Hubungkan Google Drive terlebih dahulu.')
    }

    await ensurePickerLoaded()

    const pickerCallback = (data) => {
      if (data.action === google.picker.Action.PICKED) {
        const folder = data.docs[0]
        onSelected({ id: folder.id, name: folder.name })
      }
    }

    const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
      .setSelectFolderEnabled(true)
      .setMimeTypes('application/vnd.google-apps.folder')

    const origin = window.location.protocol + '//' + window.location.host
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    const appId = clientId.includes('-') ? clientId.split('-')[0] : ''

    const builder = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(apiKey)
      .setOrigin(origin)
      .setCallback(pickerCallback)
      .setTitle('Pilih Folder Tujuan Google Drive')

    if (appId) {
      builder.setAppId(appId)
    }

    const picker = builder.build()
    picker.setVisible(true)
  }

  return {
    findItem,
    createFolder,
    getOrCreateFolder,
    uploadFile,
    updateFile,
    upsertFile,
    getTargetFolder,
    openFolderPicker,
    getFolderInfo,
  }
}
