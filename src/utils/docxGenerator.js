import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'

// ===== Helper Functions =====

/**
 * Angka ke terbilang Bahasa Indonesia
 */
function terbilang(n) {
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    'Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas',
    'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas']
  
  if (n === 0) return 'Nol'
  if (n < 0) return 'Minus ' + terbilang(-n)
  if (n < 20) return satuan[n]
  if (n < 100) {
    const tens = Math.floor(n / 10)
    const remainder = n % 10
    const tensMap = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh',
      'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh']
    return tensMap[tens] + (remainder > 0 ? ' ' + satuan[remainder] : '')
  }
  if (n < 200) return 'Seratus' + (n > 100 ? ' ' + terbilang(n - 100) : '')
  if (n < 1000) return satuan[Math.floor(n / 100)] + ' Ratus' + (n % 100 > 0 ? ' ' + terbilang(n % 100) : '')
  if (n < 2000) return 'Seribu' + (n > 1000 ? ' ' + terbilang(n - 1000) : '')
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000)
    return terbilang(thousands) + ' Ribu' + (n % 1000 > 0 ? ' ' + terbilang(n % 1000) : '')
  }
  if (n < 1000000000) {
    const millions = Math.floor(n / 1000000)
    return terbilang(millions) + ' Juta' + (n % 1000000 > 0 ? ' ' + terbilang(n % 1000000) : '')
  }
  const billions = Math.floor(n / 1000000000)
  return terbilang(billions) + ' Miliar' + (n % 1000000000 > 0 ? ' ' + terbilang(n % 1000000000) : '')
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function parseDate(str) {
  if (!str) return null
  // Handle various formats: YYYY-MM-DD, DD/MM/YYYY, etc.
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]))
  const dmy = str.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})/)
  if (dmy) return new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]))
  return null
}

function formatIndo(str) {
  const d = parseDate(str)
  if (!d) return str || '-'
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

function stripRupiah(str) {
  if (!str) return 0
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0
}

function formatRupiahFull(angka) {
  if (!angka) return 'Rp 0'
  return 'Rp ' + Number(angka).toLocaleString('id-ID')
}

function getFungsiPegawai(item) {
  const jabatan = (item['JABATAN NAMA'] || '').toLowerCase()
  if (jabatan.includes('guru')) return 'PPPK Fungsional Guru'
  if (jabatan.includes('dokter') || jabatan.includes('perawat') || jabatan.includes('bidan') || jabatan.includes('apoteker') || jabatan.includes('kesehatan')) return 'PPPK Fungsional Kesehatan'
  return 'PPPK Fungsional Teknis'
}

function getSasaranPelayanan(item) {
  const jabatan = (item['JABATAN NAMA'] || '').toLowerCase()
  if (jabatan.includes('guru')) return 'Anak Didik'
  if (jabatan.includes('dokter') || jabatan.includes('perawat') || jabatan.includes('bidan') || jabatan.includes('apoteker')) return 'Pasien'
  return 'Masyarakat'
}

function getKelompokPegawai(item) {
  const jabatan = (item['JABATAN NAMA'] || '').toLowerCase()
  if (jabatan.includes('guru')) return 'Tenaga Guru'
  if (jabatan.includes('dokter') || jabatan.includes('perawat') || jabatan.includes('bidan') || jabatan.includes('apoteker') || jabatan.includes('gizi') || jabatan.includes('kesehatan')) return 'Tenaga Kesehatan'
  return 'Tenaga Teknis'
}

function getNamaLengkap(item) {
  const gelarDepan = (item['GELAR DEPAN'] || '').trim()
  const nama = (item['NAMA'] || '').trim()
  const gelarBelakang = (item['GELAR BELAKANG'] || '').trim()
  let full = nama
  if (gelarDepan) full = gelarDepan + ' ' + full
  if (gelarBelakang) full = full + ', ' + gelarBelakang
  return full
}

/**
 * Buat objek tag dari data pegawai + data pihak pertama
 */
function buildTagData(item, pihakPertama) {
  const tmtAwal = item['AWAL KONTRAK AKTIF'] || item['TMT CPNS'] || ''
  const tmtDate = parseDate(tmtAwal)
  
  const gajiAngka = stripRupiah(item['GAJI POKOK SAAT INI'])
  
  const skDate = parseDate(item['TANGGAL SK PERPANJANGAN'] || '')
  
  return {
    NAMA_BUPATI: pihakPertama?.nama || '',
    JABATAN_BUPATI: pihakPertama?.jabatan || 'Bupati',
    NO_KONTRAK_BARU: item['NOMOR KONTRAK AKTIF'] || '',
    NO_SK_BARU: item['NOMOR SK PERPANJANGAN'] || '',
    TGL_SK_BARU: skDate ? formatIndo(item['TANGGAL SK PERPANJANGAN']) : (item['TANGGAL SK PERPANJANGAN'] || ''),
    NAMA_PEGAWAI: getNamaLengkap(item),
    NIP_BARU: String(item['NIP BARU'] || '').replace(/^'/, ''),
    NIK_PEGAWAI: item['NIK'] || item['NIK PEGAWAI'] || '',
    ALAMAT: item['ALAMAT'] || '',
    JABATAN: item['JABATAN NAMA'] || '',
    UNOR_NAMA: item['UNOR NAMA'] || item['UNIT KERJA'] || '',
    UNIT_KERJA: item['UNIT KERJA'] || item['UNOR NAMA'] || '',
    KELOMPOK_PEGAWAI: getKelompokPegawai(item),
    FUNGSI_PEGAWAI: getFungsiPegawai(item),
    SASARAN_PELAYANAN: getSasaranPelayanan(item),
    GOLONGAN: item['GOLONGAN AKHIR'] || item['GOLONGAN'] || '',
    TEMPAT_TGL_LAHIR: [item['TEMPAT LAHIR'], formatIndo(item['TANGGAL LAHIR'])].filter(Boolean).join(', '),
    PENDIDIKAN_LULUS: [item['PENDIDIKAN'], item['TAHUN LULUS'] ? 'Tahun : ' + item['TAHUN LULUS'] : ''].filter(Boolean).join(', '),
    TMT_AWAL_BARU: formatIndo(tmtAwal),
    TMT_AKHIR_BARU: formatIndo(item['AKHIR KONTRAK AKTIF'] || ''),
    GAJI_BARU: formatRupiahFull(gajiAngka),
    GAJI_BARU_ANGKA: gajiAngka ? gajiAngka.toLocaleString('id-ID') : '',
    GAJI_TERBILANG: gajiAngka ? terbilang(gajiAngka) + ' Rupiah' : '',
    KONTRAK_HARI: tmtDate ? HARI[tmtDate.getDay()] : '',
    KONTRAK_TANGGAL_TERBILANG: tmtDate ? terbilang(tmtDate.getDate()) : '',
    KONTRAK_BULAN: tmtDate ? BULAN[tmtDate.getMonth()] : '',
    KONTRAK_TAHUN_TERBILANG: tmtDate ? terbilang(tmtDate.getFullYear()) : '',
  }
}

/**
 * Load data pihak pertama dari Firestore
 */
async function loadPihakPertama() {
  try {
    const docRef = doc(db, 'config', 'pihak_pertama')
    const snap = await getDoc(docRef)
    if (snap.exists()) return snap.data()
    return null
  } catch (e) {
    console.error('Failed to load pihak_pertama:', e)
    return null
  }
}

/**
 * Load template dari Firestore berdasarkan key
 * @param {string} templateKey - misal: 'template_f4', 'template_a4', 'template_paruh_f4', 'template_paruh_a4'
 */
async function loadTemplate(templateKey) {
  const docRef = doc(db, 'config', 'templates')
  const snap = await getDoc(docRef)
  if (!snap.exists()) throw new Error('Template belum diunggah. Silakan unggah template di menu Pengaturan terlebih dahulu.')
  const data = snap.data()
  if (!data[templateKey]) throw new Error(`Template "${templateKey}" belum diunggah. Silakan unggah template di menu Pengaturan terlebih dahulu.`)
  return data[templateKey] // base64 string
}

/**
 * Generate satu file .docx dari item pegawai dan template
 */
async function generateDocx(item, templateBase64, pihakPertama) {
  console.log('[DEBUG] generateDocx START')
  console.log('[DEBUG] templateBase64 type:', typeof templateBase64)
  console.log('[DEBUG] templateBase64 length:', templateBase64?.length)
  console.log('[DEBUG] templateBase64 prefix:', templateBase64?.substring(0, 80))

  // Decode base64 → binary bytes
  const base64Data = templateBase64.includes(',') ? templateBase64.split(',')[1] : templateBase64
  console.log('[DEBUG] base64Data length after split:', base64Data?.length)
  console.log('[DEBUG] base64Data preview:', base64Data?.substring(0, 30))

  let binaryStr
  try {
    binaryStr = atob(base64Data)
    console.log('[DEBUG] atob() success, binary length:', binaryStr.length)
  } catch (e) {
    console.error('[DEBUG] atob() FAILED:', e.message)
    throw new Error('Gagal mendekode base64 template: ' + e.message)
  }

  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  console.log('[DEBUG] Uint8Array created, first 4 bytes (PK header check):', bytes[0], bytes[1], bytes[2], bytes[3])
  // PK header: 80, 75, 3, 4 (valid ZIP/DOCX)
  const isValidZip = bytes[0] === 80 && bytes[1] === 75
  console.log('[DEBUG] Is valid ZIP/DOCX header:', isValidZip)

  let zip
  try {
    zip = new PizZip(bytes)
    console.log('[DEBUG] PizZip loaded OK. Files in zip:', Object.keys(zip.files).join(', '))
  } catch (e) {
    console.error('[DEBUG] PizZip FAILED:', e.message)
    throw new Error('Gagal membaca file ZIP template: ' + e.message)
  }

  // Cek apakah document.xml ada dan tidak kosong
  const docXml = zip.files['word/document.xml']
  if (docXml) {
    const xmlContent = docXml.asText()
    console.log('[DEBUG] word/document.xml length:', xmlContent.length)
    console.log('[DEBUG] word/document.xml preview:', xmlContent.substring(0, 300))
  } else {
    console.error('[DEBUG] word/document.xml NOT FOUND in zip!')
    throw new Error('Template tidak valid: word/document.xml tidak ditemukan.')
  }

  let doc
  try {
    doc = new Docxtemplater(zip, {
      linebreaks: true,
      nullGetter: () => '',
      delimiters: { start: '{{', end: '}}' }
    })
    console.log('[DEBUG] Docxtemplater instantiated OK')
  } catch (e) {
    console.error('[DEBUG] Docxtemplater init FAILED:', e)
    throw new Error('Gagal inisialisasi Docxtemplater: ' + e.message)
  }

  const tagData = buildTagData(item, pihakPertama)
  console.log('[DEBUG] tagData keys:', Object.keys(tagData).join(', '))
  console.log('[DEBUG] tagData sample:', JSON.stringify({ NAMA_PEGAWAI: tagData.NAMA_PEGAWAI, NIP_BARU: tagData.NIP_BARU }))

  try {
    doc.render(tagData)
    console.log('[DEBUG] doc.render() SUCCESS')
  } catch (e) {
    console.error('[DEBUG] doc.render() FAILED:', e)
    if (e.properties && e.properties.errors) {
      const errDetails = e.properties.errors.map(err => 
        `Tag: ${err.properties?.id || '?'} - ${err.message}`
      ).join('; ')
      throw new Error(`Gagal me-render template. Detail: ${errDetails}`)
    }
    throw e
  }

  // Cek XML setelah render — apakah konten hilang?
  const renderedZip = doc.getZip()
  const renderedXml = renderedZip.files['word/document.xml']?.asText() || ''
  console.log('[DEBUG] POST-RENDER word/document.xml length:', renderedXml.length)
  console.log('[DEBUG] POST-RENDER preview (first 500 chars):', renderedXml.substring(0, 500))
  // Cek apakah ada teks tersisa (indikator sederhana: <w:t> tags)
  const textTagCount = (renderedXml.match(/<w:t/g) || []).length
  console.log('[DEBUG] Number of <w:t> text tags in rendered XML:', textTagCount)

  const blob = renderedZip.generate({ 
    type: 'blob', 
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  })
  console.log('[DEBUG] Blob generated, size:', blob.size, 'bytes')
  return blob
}

/**
 * Tentukan template key berdasarkan jenis PPPK dan ukuran kertas
 */
function getTemplateKey(item, paperSize = 'f4') {
  const jenis = (item['JENIS PPPK'] || '').toLowerCase()
  const isParuh = jenis.includes('paruh')
  return isParuh ? `template_paruh_${paperSize}` : `template_${paperSize}`
}

/**
 * Download satu file .docx untuk pegawai
 */
export async function downloadSingleContract(item, paperSize = 'f4') {
  const templateKey = getTemplateKey(item, paperSize)
  const [templateBase64, pihakPertama] = await Promise.all([
    loadTemplate(templateKey),
    loadPihakPertama()
  ])
  
  const blob = await generateDocx(item, templateBase64, pihakPertama)
  const namaFile = `kontrak_${String(item['NIP BARU'] || '').replace(/[^a-zA-Z0-9]/g, '')}_${item['NAMA'] || 'pegawai'}.docx`
    .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
  saveAs(blob, namaFile)
}

/**
 * Download batch sebagai ZIP
 */
export async function downloadBatchContracts(items, paperSize = 'f4', onProgress = null) {
  const pihakPertama = await loadPihakPertama()
  
  // Load semua template yang diperlukan (PPPK & Paruh Waktu)
  const templateCache = {}
  const uniqueKeys = [...new Set(items.map(item => getTemplateKey(item, paperSize)))]
  for (const key of uniqueKeys) {
    try {
      templateCache[key] = await loadTemplate(key)
    } catch (e) {
      // skip if not uploaded
      console.warn(`Template ${key} not found:`, e.message)
    }
  }
  
  // Generate ZIP
  const zip = new JSZip()
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (onProgress) onProgress(i + 1, items.length)
    
    const key = getTemplateKey(item, paperSize)
    if (!templateCache[key]) {
      console.warn(`Skipping ${item['NAMA']}: template not found`)
      continue
    }
    
    try {
      const blob = await generateDocx(item, templateCache[key], pihakPertama)
      const namaFile = `kontrak_${String(item['NIP BARU'] || '').replace(/[^a-zA-Z0-9]/g, '')}_${item['NAMA'] || 'pegawai'}.docx`
        .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
      zip.file(namaFile, blob)
    } catch (e) {
      console.error(`Error generating doc for ${item['NAMA']}:`, e)
    }
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
  saveAs(zipBlob, `kontrak_perjanjian_${dateStr}.zip`)
}
