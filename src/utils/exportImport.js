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
        
        // Assign jenisPppk to all rows to enforce the selected type
        const processedData = jsonData.map(row => ({
          ...row,
          'JENIS PPPK': jenisPppk
        }))
        
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
      mergedData = [...newData]
    } else {
      // Append mode: merge based on NIP BARU
      mergedData = [...currentData]
      newData.forEach(newItem => {
        const nip = newItem['NIP BARU']
        const index = mergedData.findIndex(item => item['NIP BARU'] === nip)
        
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
    
    const docRef = doc(db, 'database', 'pegawai')
    await setDoc(docRef, {
      payload: compressed,
      compressed: true,
      lastUpdated: new Date().toISOString()
    })
    
    return mergedData
  } catch (error) {
    console.error("Save import error:", error)
    throw error
  }
}
