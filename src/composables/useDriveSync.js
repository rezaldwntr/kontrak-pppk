import { useDriveStore } from '../stores/driveStore'
import { useGoogleDrive } from './useGoogleDrive'
import { db } from '../services/firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { getKelompokPegawai, parseDate, getUnorInduk as resolveUnorInduk, getUnorAtasan as resolveUnorAtasan, getDriveFolderName, formatNamaFilePegawai } from '../utils/pppkLogic'
import { downloadSingleContract } from '../utils/docxGenerator'

export function useDriveSync() {
  const driveStore = useDriveStore()
  const { getTargetFolder, upsertFile } = useGoogleDrive()

  // Evaluasi apakah pegawai memenuhi aturan kriteria tertentu
  function matchRules(item, rules = null, logic = 'AND') {
    const activeRules = rules !== null ? rules : (driveStore.syncRules || [])
    if (!activeRules || activeRules.length === 0) return true

    const validRules = activeRules.filter(r => r && r.field && r.value)
    if (validRules.length === 0) return true

    const ruleLogic = logic || driveStore.syncRulesLogic || 'AND'

    const results = validRules.map(rule => {
      switch (rule.field) {
        case 'kelompok':
          return getKelompokPegawai(item) === rule.value
        case 'unorInduk': {
          const unorNama = item['UNOR NAMA'] || item['UNIT KERJA'] || ''
          return resolveUnorInduk(unorNama) === rule.value
        }
        case 'unorAtasan': {
          const unorNama = item['UNOR NAMA'] || item['UNIT KERJA'] || ''
          return resolveUnorAtasan(unorNama) === rule.value
        }
        case 'jenisPppk':
          return (item['JENIS PPPK'] || 'PPPK') === rule.value
        default:
          return true
      }
    })

    return ruleLogic === 'AND' ? results.every(Boolean) : results.some(Boolean)
  }

  // Evaluasi apakah pegawai memenuhi auto-sync saat trigger save data
  function shouldSync(item) {
    if (!driveStore.isEnabled || !driveStore.isConnected) return false
    if (!driveStore.syncRules || driveStore.syncRules.length === 0) return false
    const validRules = driveStore.syncRules.filter(r => r.field && r.value)
    if (validRules.length === 0) return false
    return matchRules(item, validRules, driveStore.syncRulesLogic)
  }

  // Generate nama file (mempertahankan spasi dan mendukung opsi gelar)
  function getFileName(item, suffix = '', includeGelarOverride = null) {
    const nip = String(item['NIP BARU'] || item['NIP'] || '').replace(/[^a-zA-Z0-9]/g, '')
    const withGelar = includeGelarOverride !== null ? includeGelarOverride : (driveStore.settings.includeGelar || false)
    const nama = formatNamaFilePegawai(item, withGelar)
    return nip ? `${nip}_${nama}${suffix}.docx` : `${nama}${suffix}.docx`
  }

  // Dapatkan folder tujuan Drive per pegawai
  function getUnorInduk(item) {
    return getDriveFolderName(item)
  }

  // Parse tanggal dari string
  function parseDateInput(str) {
    if (!str) return null
    return parseDate(str)
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

  return { shouldSync, matchRules, syncEmployee, addToQueue, processQueue, getUnorInduk, getDriveFolderName, getFileName }
}
