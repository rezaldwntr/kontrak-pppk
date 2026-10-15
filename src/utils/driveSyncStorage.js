// src/utils/driveSyncStorage.js
// Utilitas penyimpanan sesi sinkronisasi Google Drive latar belakang (localStorage)

const STORAGE_KEY = 'drive_bulk_sync_session'

export function getPegawaiSyncId(item) {
  if (!item) return ''
  return String(item['PNS ID'] || item['NIP BARU'] || item.id || item['NIP'] || '').trim()
}

export function saveSyncSession(session) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const payload = {
      status: session.status || 'running',
      total: Number(session.total) || 0,
      remainingIds: Array.isArray(session.remainingIds) ? session.remainingIds : [],
      doneCount: Number(session.doneCount) || 0,
      failCount: Number(session.failCount) || 0,
      lastUpdated: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (err) {
    console.warn('[driveSyncStorage] Gagal menyimpan sesi sync:', err)
  }
}

export function loadSyncSession() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch (err) {
    console.warn('[driveSyncStorage] Gagal membaca sesi sync:', err)
    return null
  }
}

export function clearSyncSession() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[driveSyncStorage] Gagal menghapus sesi sync:', err)
  }
}

export function extractRemainingCandidates(session, pppkData) {
  if (!session || !Array.isArray(session.remainingIds) || session.remainingIds.length === 0) {
    return []
  }
  if (!Array.isArray(pppkData) || pppkData.length === 0) {
    return []
  }

  const idMap = new Map()
  for (const item of pppkData) {
    const id = getPegawaiSyncId(item)
    if (id && !idMap.has(id)) {
      idMap.set(id, item)
    }
  }

  const remaining = []
  for (const id of session.remainingIds) {
    const found = idMap.get(id)
    if (found) {
      remaining.push(found)
    }
  }
  return remaining
}
