import * as XLSX from 'xlsx'
import { db } from '../services/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import LZString from 'lz-string'

export const exportToExcel = (data, filename = 'Data_Pegawai.xlsx') => {
  if (!data || data.length === 0) {
    throw new Error('Tidak ada data untuk diekspor')
  }

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data)
  
  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Pegawai")
  
  // Generate and save file
  XLSX.writeFile(wb, filename)
}

export const processImportFile = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const { mode = 'append', jenisPppk = 'PPPK' } = options
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
        
        if (jsonData.length === 0) {
          throw new Error('File tidak mengandung data.')
        }

        // Validate data has NIP or ID
        if (!jsonData[0]['NIP BARU'] && !jsonData[0]['NAMA']) {
          throw new Error('Format file tidak dikenali. Kolom NIP BARU atau NAMA tidak ditemukan.')
        }
        
        // Assign jenisPppk and format date columns
        const dateColumns = ['TMT CPNS', 'TANGGAL LAHIR', 'TMT GOLONGAN', 'TMT JABATAN', 'TMT PNS']
        
        const processedData = jsonData.map(row => {
          const newRow = {}
          
          // Strip leading single quotes from all values
          Object.keys(row).forEach(key => {
            if (typeof row[key] === 'string') {
              newRow[key] = row[key].replace(/^'/, '')
            } else {
              newRow[key] = row[key]
            }
          })

          // Pilihan jenis PPPK dari radio button SELALU menang
          // (menimpa nilai kolom JENIS PPPK dari file Excel jika ada)
          newRow['JENIS PPPK'] = jenisPppk
          
          // Convert Excel serial dates to YYYY-MM-DD
          dateColumns.forEach(col => {
            if (newRow[col] && !isNaN(Number(newRow[col]))) {
              const serial = Number(newRow[col]);
              // Basic check for typical Excel date range (e.g. 1927 to 2173)
              if (serial > 10000 && serial < 99999) {
                const utc_days = Math.floor(serial - 25569);
                const date_info = new Date(utc_days * 86400 * 1000);
                newRow[col] = date_info.toISOString().split('T')[0];
              }
            }
          })

          // Extract Gender from NIP or normalize
          const nip = String(newRow['NIP BARU'] || '').replace(/\D/g, '');
          if (nip.length === 18) {
            const jkChar = nip.charAt(14);
            if (jkChar === '1') newRow['JENIS KELAMIN'] = 'L';
            else if (jkChar === '2') newRow['JENIS KELAMIN'] = 'P';
          } else if (newRow['JENIS KELAMIN']) {
            let jk = String(newRow['JENIS KELAMIN']).toUpperCase();
            if (jk.startsWith('L') || jk === 'PRIA' || jk === '1') newRow['JENIS KELAMIN'] = 'L';
            else if (jk.startsWith('P') || jk === 'WANITA' || jk === '2' || jk === 'PEREMPUAN') newRow['JENIS KELAMIN'] = 'P';
          }
          
          return newRow
        })
        
        resolve(processedData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

export const saveImportedData = async (newData, mode = 'append', currentData = []) => {
  try {
    let mergedData = []
    
    if (mode === 'overwrite') {
      mergedData = newData.map(item => {
        if (!item['PNS ID']) item['PNS ID'] = item['NIP BARU'] || `TEMP-${Math.random().toString(36).substr(2, 9)}`;
        return item;
      })
    } else {
      // Append mode: merge based on NIP BARU
      mergedData = [...currentData]
      newData.forEach(newItem => {
        const nip = newItem['NIP BARU']
        const index = mergedData.findIndex(item => item['NIP BARU'] === nip)
        
        if (!newItem['PNS ID']) newItem['PNS ID'] = newItem['NIP BARU'] || `TEMP-${Math.random().toString(36).substr(2, 9)}`;

        if (index >= 0) {
          // Update existing
          mergedData[index] = { ...mergedData[index], ...newItem }
        } else {
          // Add new
          mergedData.push(newItem)
        }
      })
    }

    // Save to Firestore (compress if large)
    const jsonString = JSON.stringify(mergedData)
    const compressed = LZString.compressToUTF16(jsonString)
    const chunkSize = 250000;
    const numChunks = Math.ceil(compressed.length / chunkSize);
    
    for (let i = 0; i < numChunks; i++) {
      const chunkRef = doc(db, 'database', 'pegawai_chunk_' + i);
      await setDoc(chunkRef, {
        payload: compressed.substring(i * chunkSize, (i + 1) * chunkSize)
      })
    }

    const docRef = doc(db, 'database', 'pegawai')
    await setDoc(docRef, {
      compressed: true,
      numChunks: numChunks,
      lastUpdated: new Date().toISOString()
    })
    return mergedData
  } catch (error) {
    console.error("Save import error:", error)
    throw error
  }
}

/**
 * Download file template Excel untuk impor nomor kontrak massal
 */
export const downloadTemplateNomorKontrak = () => {
  const sampleData = [
    {
      'NIP': '198507122023211005',
      'NOMOR KONTRAK': '800.1.2/19/BKPSDM/2026',
      'NOMOR SK': '800.1.2/05/BKPSDM/2026',
      'TANGGAL SK': '2026-01-02',
      'KETERANGAN (OPSIONAL)': 'Contoh - Baris ini bisa dihapus atau diganti data asli'
    },
    {
      'NIP': '199003152023212003',
      'NOMOR KONTRAK': '800.1.2/27/BKPSDM/2026',
      'NOMOR SK': '800.1.2/06/BKPSDM/2026',
      'TANGGAL SK': '2026-01-02',
      'KETERANGAN (OPSIONAL)': 'Contoh format'
    }
  ]

  const ws = XLSX.utils.json_to_sheet(sampleData)
  // Set column widths
  ws['!cols'] = [
    { wch: 22 }, // NIP
    { wch: 28 }, // NOMOR KONTRAK
    { wch: 28 }, // NOMOR SK
    { wch: 15 }, // TANGGAL SK
    { wch: 40 }  // KETERANGAN
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template Nomor Kontrak')
  XLSX.writeFile(wb, 'Template_Impor_Nomor_Kontrak.xlsx')
}

/**
 * Normalisasi string NIP (hilangkan tanda petik, spasi, karakter non-digit)
 */
function cleanNip(raw) {
  if (!raw) return ''
  return String(raw).replace(/^'/, '').replace(/\D/g, '').trim()
}

/**
 * Mencari nilai dari objek baris Excel dengan berbagai kemungkinan nama header kolom
 */
function findRowValue(row, possibleKeys) {
  const rowKeys = Object.keys(row)
  for (const pKey of possibleKeys) {
    const foundKey = rowKeys.find(k => k.trim().toUpperCase() === pKey.toUpperCase())
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return String(row[foundKey]).trim()
    }
  }
  return ''
}

/**
 * Memproses file Excel/CSV impor nomor kontrak secara massal
 * @param {File} file - file yang diunggah
 * @param {string} targetMode - 'auto' | 'initial' | 'extension'
 * @param {Array} currentData - array data pppkData saat ini
 * @returns {Promise<object>} { updatedData, matchedCount, unmatchedCount, unmatchedList, previewRows }
 */
export const processImportNomorKontrak = async (file, targetMode = 'auto', currentData = []) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        if (jsonData.length === 0) {
          throw new Error('File tidak mengandung data.')
        }

        // Header alias matching
        const nipKeys = ['NIP', 'NIP BARU', 'NIP_BARU', 'NO NIP', 'NO_NIP', 'NIP PEGAWAI']
        const noKontrakKeys = ['NOMOR KONTRAK', 'NO KONTRAK', 'NOMOR_KONTRAK', 'NO_KONTRAK', 'NOMOR PERJANJIAN', 'NO PERJANJIAN', 'NO_PERJANJIAN', 'KONTRAK']
        const noSkKeys = ['NOMOR SK', 'NO SK', 'NOMOR_SK', 'NO_SK', 'NOMOR SK PERPANJANGAN', 'NO SK PERPANJANGAN']
        const tglSkKeys = ['TANGGAL SK', 'TGL SK', 'TANGGAL_SK', 'TGL_SK', 'TANGGAL SK PERPANJANGAN']

        // Clone current data
        const updatedData = currentData.map(item => ({ ...item }))
        
        // Map lookup by cleaned NIP
        const nipIndexMap = new Map()
        updatedData.forEach((item, idx) => {
          const nip = cleanNip(item['NIP BARU'] || item['NIP'])
          if (nip) {
            nipIndexMap.set(nip, idx)
          }
        })

        let matchedCount = 0
        let unmatchedCount = 0
        const unmatchedList = []
        const previewRows = []

        jsonData.forEach((row, rowIdx) => {
          const rawNip = findRowValue(row, nipKeys)
          const nomorKontrak = findRowValue(row, noKontrakKeys).replace(/^'/, '').trim()
          const nomorSk = findRowValue(row, noSkKeys).replace(/^'/, '').trim()
          const tanggalSk = findRowValue(row, tglSkKeys).replace(/^'/, '').trim()

          const cleaned = cleanNip(rawNip)
          if (!cleaned) return // Lewati baris kosong

          if (nipIndexMap.has(cleaned)) {
            const empIdx = nipIndexMap.get(cleaned)
            const emp = updatedData[empIdx]

            // Inisialisasi RIWAYAT_KONTRAK jika belum ada
            let history = Array.isArray(emp.RIWAYAT_KONTRAK) ? [...emp.RIWAYAT_KONTRAK] : []
            
            // Hitung periode saat ini
            let targetPeriodNum = 1
            const tmtCpns = emp['TMT CPNS'] || ''
            const tmtAwalAktif = emp['AWAL KONTRAK AKTIF'] || tmtCpns
            const tmtAkhirAktif = emp['AKHIR KONTRAK AKTIF'] || ''

            if (targetMode === 'initial') {
              targetPeriodNum = 1
            } else if (targetMode === 'extension') {
              targetPeriodNum = Math.max(2, history.length + 1)
            } else {
              // 'auto' mode
              if (history.length > 0) {
                targetPeriodNum = history.length
              } else if (tmtAwalAktif && tmtCpns && tmtAwalAktif !== tmtCpns) {
                targetPeriodNum = 2
              } else if (emp['STATUS_PERPANJANGAN'] === 'Selesai Diperpanjang') {
                targetPeriodNum = 2
              } else {
                targetPeriodNum = 1
              }
            }

            // Jika riwayat kosong, inisialisasi minimal periode 1
            if (history.length === 0) {
              history.push({
                periode: 1,
                jenis: 'Kontrak Pertama (Awal)',
                nomorKontrak: targetPeriodNum === 1 ? nomorKontrak : (emp['NOMOR KONTRAK AKTIF'] || emp['NOMOR KONTRAK BARU'] || emp['NO_KONTRAK'] || ''),
                nomorSk: targetPeriodNum === 1 ? (nomorSk || emp['NOMOR SK CPNS'] || '') : (emp['NOMOR SK CPNS'] || ''),
                tanggalSk: targetPeriodNum === 1 ? (tanggalSk || emp['TANGGAL SK CPNS'] || '') : (emp['TANGGAL SK CPNS'] || ''),
                tmtAwal: tmtCpns,
                tmtAkhir: targetPeriodNum === 1 ? tmtAkhirAktif : ''
              })
            }

            // Cari atau buat entri untuk targetPeriodNum
            const existingEntryIdx = history.findIndex(h => parseInt(h.periode, 10) === targetPeriodNum)
            const periodeLabel = targetPeriodNum === 1 ? 'Kontrak Pertama (Awal)' : `Perpanjangan ${targetPeriodNum - 1}`

            if (existingEntryIdx !== -1) {
              history[existingEntryIdx] = {
                ...history[existingEntryIdx],
                nomorKontrak: nomorKontrak || history[existingEntryIdx].nomorKontrak,
                nomorSk: nomorSk || history[existingEntryIdx].nomorSk,
                tanggalSk: tanggalSk || history[existingEntryIdx].tanggalSk,
              }
            } else {
              history.push({
                periode: targetPeriodNum,
                jenis: periodeLabel,
                nomorKontrak: nomorKontrak,
                nomorSk: nomorSk,
                tanggalSk: tanggalSk,
                tmtAwal: tmtAwalAktif,
                tmtAkhir: tmtAkhirAktif
              })
            }

            // Update data pegawai
            emp.RIWAYAT_KONTRAK = history
            
            // Perbarui NOMOR KONTRAK AKTIF jika menargetkan periode aktif saat ini
            if (targetMode === 'auto' || targetMode === 'extension' || (targetMode === 'initial' && targetPeriodNum === 1 && (!tmtAwalAktif || tmtAwalAktif === tmtCpns))) {
              emp['NOMOR KONTRAK AKTIF'] = nomorKontrak
              if (nomorSk) emp['NOMOR SK PERPANJANGAN'] = nomorSk
              if (tanggalSk) emp['TANGGAL SK PERPANJANGAN'] = tanggalSk
            }

            matchedCount++

            if (previewRows.length < 5) {
              previewRows.push({
                nip: emp['NIP BARU'] || cleaned,
                nama: emp['NAMA'] || '-',
                jabatan: emp['JABATAN NAMA'] || '-',
                periode: periodeLabel,
                nomorKontrak: nomorKontrak,
                nomorSk: nomorSk || '-'
              })
            }
          } else {
            unmatchedCount++
            if (unmatchedList.length < 10) {
              unmatchedList.push({
                nip: cleaned || rawNip || `Baris ${rowIdx + 2}`,
                nomorKontrak: nomorKontrak
              })
            }
          }
        })

        resolve({
          updatedData,
          matchedCount,
          unmatchedCount,
          unmatchedList,
          previewRows,
          totalRows: jsonData.length
        })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsArrayBuffer(file)
  })
}

