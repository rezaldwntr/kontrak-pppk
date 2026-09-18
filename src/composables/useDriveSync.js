import { useDriveStore } from '../stores/driveStore'
import { useGoogleDrive } from './useGoogleDrive'
import { db } from '../services/firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { getKelompokPegawai } from '../utils/pppkLogic'
import { downloadSingleContract } from '../utils/docxGenerator'

export function useDriveSync() {
  const driveStore = useDriveStore()
  const { getTargetFolder, upsertFile } = useGoogleDrive()

  // Evaluasi apakah pegawai memenuhi sync rules
  function shouldSync(item) {
    if (!driveStore.isEnabled || !driveStore.isConnected) return false
    if (!driveStore.syncRules || driveStore.syncRules.length === 0) return false

    const rules = driveStore.syncRules
    const logic = driveStore.syncRulesLogic || 'AND'

    const results = rules.map(rule => {
      switch (rule.field) {
        case 'kelompok':
          return getKelompokPegawai(item) === rule.value
        case 'unorInduk': {
          const unorNama = item['UNOR NAMA'] || ''
          const parts = unorNama.split('/').map(s => s.trim())
          return parts[0] === rule.value
        }
        case 'unorAtasan': {
          const unorNama = item['UNOR NAMA'] || ''
          const parts = unorNama.split('/').map(s => s.trim())
          return parts[parts.length - 1] === rule.value
        }
        case 'jenisPppk':
          return (item['JENIS PPPK'] || 'PPPK') === rule.value
        default:
          return false
      }
    })

    return logic === 'AND' ? results.every(Boolean) : results.some(Boolean)
  }

  // Generate nama file
  function getFileName(item, suffix = '') {
    const nip = String(item['NIP BARU'] || '').replace(/[^a-zA-Z0-9]/g, '')
    const nama = (item['NAMA'] || 'pegawai').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
    return `${nip}_${nama}${suffix}.docx`
  }

  // Dapatkan Unor Induk dari item
  function getUnorInduk(item) {
    const unorNama = item['UNOR NAMA'] || ''
    const parts = unorNama.split('/').map(s => s.trim())
    return parts[0] || 'Umum'
  }

  // Parse tanggal dari string YYYY-MM-DD
  function parseDateInput(str) {
    if (!str) return null
    const [y, m, d] = str.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  // Sync satu pegawai ke Drive
  async function syncEmployee(item) {
    const { documentPart, mergeMode, paperSize, tanggalKontrak: tglStr } = driveStore.settings
    const tanggalKontrak = parseDateInput(tglStr)
    const unorInduk = getUnorInduk(item)

    // Generate docx blob
    const result = await downloadSingleContract(item, paperSize, tanggalKontrak, documentPart, { returnBlob: true })

    if (documentPart === 'pisah') {
      // Upload dua file terpisah
      const perjanjianFolderId = await getTargetFolder('perjanjian', unorInduk, mergeMode)
      const tandatanganFolderId = await getTargetFolder('tandatangan', unorInduk, mergeMode)
      await upsertFile(result.perjanjianBlob, getFileName(item, '_perjanjian'), perjanjianFolderId)
      await upsertFile(result.tandatanganBlob, getFileName(item, '_tandatangan'), tandatanganFolderId)
    } else {
      const targetFolderId = await getTargetFolder(documentPart, unorInduk, mergeMode)
      const blobToUpload = documentPart === 'perjanjian' ? result.perjanjianBlob :
                           documentPart === 'tandatangan' ? result.tandatanganBlob :
                           result.fullBlob
      await upsertFile(blobToUpload, getFileName(item), targetFolderId)
    }
  }

  // Tambah ke retry queue
  async function addToQueue(item, error) {
    try {
      await addDoc(collection(db, 'sync_queue'), {
        pegawaiId: item['PNS ID'] || '',
        pegawaiNama: item['NAMA'] || '',
        pegawaiNip: String(item['NIP BARU'] || ''),
        errorMsg: error?.message || String(error),
        attemptCount: 1,
        nextRetry: new Date(Date.now() + 5 * 60 * 1000), // retry 5 menit lagi
        createdAt: serverTimestamp(),
        status: 'pending',
        itemSnapshot: JSON.stringify(item),
      })
      driveStore.queueCount++
    } catch (e) {
      console.error('Failed to add to queue:', e)
    }
  }

  // Proses retry queue
  async function processQueue() {
    const now = new Date()
    const q = query(
      collection(db, 'sync_queue'),
      where('status', '==', 'pending'),
      where('nextRetry', '<=', now)
    )
    const snapshot = await getDocs(q)

    for (const qDoc of snapshot.docs) {
      const qData = qDoc.data()
      try {
        const item = JSON.parse(qData.itemSnapshot || '{}')
        await syncEmployee(item)
        await updateDoc(doc(db, 'sync_queue', qDoc.id), { status: 'success' })
        driveStore.queueCount = Math.max(0, driveStore.queueCount - 1)
      } catch (err) {
        const attempts = (qData.attemptCount || 1) + 1
        await updateDoc(doc(db, 'sync_queue', qDoc.id), {
          attemptCount: attempts,
          errorMsg: err.message,
          status: attempts >= 5 ? 'failed' : 'pending',
          nextRetry: new Date(Date.now() + Math.min(attempts * 10 * 60 * 1000, 60 * 60 * 1000)),
        })
      }
    }
  }

  return { shouldSync, syncEmployee, addToQueue, processQueue, getUnorInduk, getFileName }
}
