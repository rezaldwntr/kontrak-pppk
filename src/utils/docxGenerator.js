import PizZip from 'pizzip'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { calculateContractPeriod, parseDate } from './pppkLogic'
import { calculateGajiFromItem } from './gajiTable'

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

function formatIndo(str) {
  if (!str) return ''
  if (str instanceof Date) {
    if (isNaN(str.getTime())) return ''
    return `${str.getDate()} ${BULAN[str.getMonth()]} ${str.getFullYear()}`
  }
  const d = parseDate(str)
  if (!d || isNaN(d.getTime())) return ''
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
 * Buat objek tag dari data pegawai + data pihak pertama + tanggal penandatanganan kontrak
 * @param {object} item - data pegawai
 * @param {object|null} pihakPertama - data pihak pertama (Bupati/Walikota)
 * @param {Date|null} tanggalKontrak - tanggal penandatanganan kontrak yang dipilih user
 */
function buildTagData(item, pihakPertama, tanggalKontrak = null) {
  // TMT Aktif: gunakan "AWAL KONTRAK AKTIF" sebagai sumber utama, fallback ke TMT CPNS
  const tmtAwal = item['AWAL KONTRAK AKTIF'] || item['TMT CPNS'] || item['TMT KONTRAK BARU'] || ''
  const tmtAwalFormatted = formatIndo(tmtAwal)

  // Akhir Kontrak Aktif: jika belum ada di data, kalkulasi otomatis via calculateContractPeriod
  let tmtAkhirFormatted = formatIndo(item['AKHIR KONTRAK AKTIF'] || '')
  if (!tmtAkhirFormatted) {
    const period = calculateContractPeriod(item)
    if (period && period.endDateStr && period.endDateStr !== '-' && period.endDateStr !== 'Format Tanggal Invalid') {
      tmtAkhirFormatted = period.endDateStr
    } else if (period && period.rawDate && !isNaN(period.rawDate.getTime())) {
      tmtAkhirFormatted = formatIndo(period.rawDate)
    }
  }

  // Gaji: cari di data tersimpan, jika tidak ada/0, kalkulasi otomatis dari golongan & masa kerja (Perpres 11/2024)
  const gajiRaw = item['GAJI POKOK SAAT INI'] || item['GAJI POKOK SAAT INI (RP)'] || item['GAJI POKOK'] || item['GAJI'] || item['GAJI_POKOK'] || ''
  let gajiAngka = stripRupiah(gajiRaw)
  if (!gajiAngka || gajiAngka === 0) {
    const gajiCalc = calculateGajiFromItem(item)
    if (gajiCalc && gajiCalc.gaji) {
      gajiAngka = gajiCalc.gaji
    }
  }

  // Golongan: coba berbagai kemungkinan nama kolom
  const golongan = item['GOLONGAN'] || item['GOL AKHIR NAMA'] || item['GOL RUANG'] || item['GOLONGAN AKHIR'] || item['GOL AKHIR ID'] || item['GOL AWAL NAMA'] || ''

  // Tempat & Tanggal Lahir: fallback mencakup TEMPAT LAHIR NAMA dari data BKN/SIASN
  const tempatLahir = (item['TEMPAT LAHIR NAMA'] || item['TEMPAT LAHIR'] || item['TEMPAT_LAHIR_NAMA'] || item['TEMPAT_LAHIR'] || item['KOTA LAHIR'] || '').trim()
  const tglLahir = item['TANGGAL LAHIR'] || item['TGL LAHIR'] || item['TANGGAL_LAHIR'] || ''
  const tglLahirFormatted = formatIndo(tglLahir)
  const tempatTglLahir = [tempatLahir, tglLahirFormatted].filter(Boolean).join(', ')

  // Pendidikan: fallback mencakup PENDIDIKAN TERAKHIR, PENDIDIKAN NAMA, dsb. Format: [Pendidikan], Tahun : [Tahun]
  const pendidikan = (item['PENDIDIKAN TERAKHIR'] || item['PENDIDIKAN NAMA'] || item['PENDIDIKAN'] || item['TINGKAT PENDIDIKAN NAMA'] || item['TINGKAT PENDIDIKAN'] || item['JENJANG PENDIDIKAN'] || '').trim()
  const tahunLulus = String(item['TAHUN LULUS'] || item['THN LULUS'] || item['TAHUN_LULUS'] || '').trim()
  let pendidikanLulus = pendidikan
  if (pendidikan && tahunLulus) {
    pendidikanLulus = `${pendidikan}, Tahun : ${tahunLulus}`
  } else if (!pendidikan && tahunLulus) {
    pendidikanLulus = `Tahun : ${tahunLulus}`
  }

  // Unit Kerja vs UNOR: beda sumber agar tidak identik
  const unorNama = item['UNOR NAMA'] || item['NAMA UNOR'] || item['OPD'] || item['UNIT ORGANISASI'] || ''
  const unitKerja = item['UNIT KERJA'] || item['NAMA UNIT KERJA'] || item['LOKASI KERJA NAMA'] || item['LOKASI KERJA'] || unorNama

  // Tanggal penandatanganan kontrak dari input user
  const tglKontrak = tanggalKontrak instanceof Date && !isNaN(tanggalKontrak.getTime())
    ? tanggalKontrak
    : null

  return {
    // Pihak Pertama
    NAMA_BUPATI: (pihakPertama?.nama || '').toUpperCase(),
    JABATAN_BUPATI: pihakPertama?.jabatan || 'Bupati',

    // Data Kontrak
    NO_KONTRAK_BARU: item['NOMOR KONTRAK AKTIF'] || item['NOMOR KONTRAK BARU'] || item['NO_KONTRAK'] || '',

    // Data Pegawai
    NAMA_PEGAWAI: getNamaLengkap(item),
    NIP_BARU: String(item['NIP BARU'] || item['NIP'] || '').replace(/^'/, ''),
    ALAMAT: item['ALAMAT LENGKAP'] || item['ALAMAT'] || '',
    JABATAN: item['JABATAN NAMA'] || item['JABATAN'] || '',
    UNOR_NAMA: unorNama,
    UNIT_KERJA: unitKerja,
    KELOMPOK_PEGAWAI: getKelompokPegawai(item),
    FUNGSI_PEGAWAI: getFungsiPegawai(item),
    SASARAN_PELAYANAN: getSasaranPelayanan(item),
    GOLONGAN: golongan,
    TEMPAT_TGL_LAHIR: tempatTglLahir,
    PENDIDIKAN_LULUS: pendidikanLulus,

    // TMT Aktif
    TMT_AWAL_AKTIF: tmtAwalFormatted,
    TMT_AKHIR_AKTIF: tmtAkhirFormatted,

    // Gaji
    GAJI_BARU: formatRupiahFull(gajiAngka),
    GAJI_TERBILANG: gajiAngka ? terbilang(gajiAngka) + ' Rupiah' : '',

    // Tanggal penandatanganan kontrak (dari input user) — HURUF BESAR
    KONTRAK_HARI: tglKontrak ? HARI[tglKontrak.getDay()].toUpperCase() : '',
    KONTRAK_TANGGAL_TERBILANG: tglKontrak ? terbilang(tglKontrak.getDate()).toUpperCase() : '',
    KONTRAK_BULAN: tglKontrak ? BULAN[tglKontrak.getMonth()].toUpperCase() : '',
    KONTRAK_TAHUN_TERBILANG: tglKontrak ? terbilang(tglKontrak.getFullYear()).toUpperCase() : '',
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
 * Escape karakter XML khusus agar aman disimpan sebagai nilai tag
 */
function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Bersihkan XML tags yang mungkin disisipkan Word DI DALAM {{TAG}}.
 * Word kadang memecah satu tag menjadi beberapa XML run, contoh:
 *   <w:t>{{NAMA</w:t></w:r><w:r><w:t>_PEGAWAI}}</w:t>
 * Fungsi ini menghapus semua XML element yang ada di antara {{ dan }}
 * secara iteratif sampai tidak ada lagi XML di dalam placeholder.
 */
function consolidateSplitTags(xml) {
  let prev = ''
  let result = xml
  // Iterasi sampai tidak ada perubahan (semua XML tag dalam {{ }} sudah dibersihkan)
  while (prev !== result) {
    prev = result
    // Hapus XML element yang muncul di antara {{ dan }} (sebelum closing }})
    result = result.replace(/(\{\{[^{}]*?)<[^>]+>([^{}]*?\}\})/g, '$1$2')
    // Hapus XML element yang muncul di antara {{ dan }} (sebelum isi tag, tidak perlu closing)
    result = result.replace(/(\{\{[^{}]*?)<[^>]+>/g, '$1')
  }
  return result
}

/**
 * Pisahkan XML dokumen menjadi bagian-bagian struktural untuk memungkinkan
 * penggabungan (merge) beberapa dokumen menjadi satu, atau mengekstrak bagian tertentu.
 *
 * @param {string} xml - word/document.xml setelah consolidateSplitTags
 * @returns {object} Struktur XML yang siap direplace dan digabung.
 */
function extractDocumentParts(xml) {
  // Normalisasi marker agar tidak case-sensitive dan mentoleransi spasi (misal: {{ #Perjanjian }})
  let normalizedXml = xml
    .replace(/\{\{\s*#\s*perjanjian\s*\}\}/gi, '{{#perjanjian}}')
    .replace(/\{\{\s*\/\s*perjanjian\s*\}\}/gi, '{{/perjanjian}}')
    .replace(/\{\{\s*#\s*tandatangan\s*\}\}/gi, '{{#tandatangan}}')
    .replace(/\{\{\s*\/\s*tandatangan\s*\}\}/gi, '{{/tandatangan}}')

  const MARKERS = ['{{#perjanjian}}', '{{/perjanjian}}', '{{#tandatangan}}', '{{/tandatangan}}']
  const hasAny = MARKERS.some(m => normalizedXml.includes(m))
  
  const BODY_OPEN = '<w:body>'
  const BODY_CLOSE = '</w:body>'
  const bodyOpenEnd = normalizedXml.indexOf(BODY_OPEN)
  const bodyCloseStart = normalizedXml.lastIndexOf(BODY_CLOSE)
  
  if (bodyOpenEnd === -1 || bodyCloseStart === -1) {
    return { hasSections: false, isValid: false }
  }

  const preBody  = xml.substring(0, bodyOpenEnd + BODY_OPEN.length)
  let bodyContent = xml.substring(bodyOpenEnd + BODY_OPEN.length, bodyCloseStart)
  const postBody = xml.substring(bodyCloseStart)

  // Extract the last <w:sectPr> in the document (page margins/paper size)
  const sectPrStart = bodyContent.lastIndexOf('<w:sectPr')
  const sectPrEndTag = bodyContent.indexOf('</w:sectPr>', sectPrStart)
  let sectPr = ''
  if (sectPrStart !== -1 && sectPrEndTag !== -1) {
    sectPr = bodyContent.substring(sectPrStart, sectPrEndTag + '</w:sectPr>'.length)
    bodyContent = bodyContent.substring(0, sectPrStart)
  }

  if (!hasAny) {
    // Bersihkan marker sisa jika ada (tapi hasAny false, jadi aman)
    const cleanBody = bodyContent
      .split('{{#perjanjian}}').join('')
      .split('{{/perjanjian}}').join('')
      .split('{{#tandatangan}}').join('')
      .split('{{/tandatangan}}').join('')
    return {
      isValid: true, hasSections: false, preBody, postBody, sectPr,
      fullBody: cleanBody, perjanjianBody: null, tandatanganBody: null
    }
  }

  function findMarkerParagraph(marker) {
    const regexStr = marker.split('').map(char => {
      if (['{', '}', '/', '#'].includes(char)) return '\\' + char;
      return char;
    }).join('(?:<[^>]+>)*');
    const regex = new RegExp(regexStr);
    const match = bodyContent.match(regex);
    if (!match) return null;
    const markerIdx = match.index;
    const before = bodyContent.substring(0, markerIdx)
    let pStart = -1, searchPos = 0
    while (searchPos < before.length) {
      const cand = before.indexOf('<w:p', searchPos)
      if (cand === -1) break
      const nextChar = before[cand + 4]
      if (nextChar === '>' || nextChar === ' ' || nextChar === '\n' || nextChar === '\r' || nextChar === '\t') {
        pStart = cand
      }
      searchPos = cand + 1
    }
    if (pStart === -1) return null
    const closeIdx = bodyContent.indexOf('</w:p>', markerIdx)
    if (closeIdx === -1) return null
    return { pStart, pEnd: closeIdx + '</w:p>'.length }
  }

  const openPer  = findMarkerParagraph('{{#perjanjian}}')
  const closePer = findMarkerParagraph('{{/perjanjian}}')
  const openTtd  = findMarkerParagraph('{{#tandatangan}}')
  const closeTtd = findMarkerParagraph('{{/tandatangan}}')

  let failReason = null
  if (!openPer) failReason = 'Tag {{#perjanjian}} tidak ditemukan'
  else if (!closePer) failReason = 'Tag penutup {{/perjanjian}} tidak ditemukan'
  else if (!openTtd) failReason = 'Tag {{#tandatangan}} tidak ditemukan'
  else if (!closeTtd) failReason = 'Tag penutup {{/tandatangan}} tidak ditemukan'
  else if (!(openPer.pStart < closePer.pEnd && closePer.pEnd <= openTtd.pStart && openTtd.pStart < closeTtd.pEnd)) {
    failReason = 'Urutan tag salah. Pastikan urutannya: {{#perjanjian}} ... {{/perjanjian}} lalu {{#tandatangan}} ... {{/tandatangan}}'
  }

  if (failReason) {
    // Fallback jika tag tidak lengkap / tidak urut
    const cleanBody = bodyContent
      .split('{{#perjanjian}}').join('')
      .split('{{/perjanjian}}').join('')
      .split('{{#tandatangan}}').join('')
      .split('{{/tandatangan}}').join('')
    return {
      isValid: true, hasSections: false, preBody, postBody, sectPr,
      fullBody: cleanBody, perjanjianBody: null, tandatanganBody: null,
      failReason
    }
  }

  const perjanjianContent   = bodyContent.substring(openPer.pEnd,  closePer.pStart)
  const tandatanganContent  = bodyContent.substring(openTtd.pEnd,  closeTtd.pStart)
  const fullBody =
    bodyContent.substring(0, openPer.pStart) + 
    perjanjianContent + 
    bodyContent.substring(closePer.pEnd, openTtd.pStart) + 
    tandatanganContent + 
    bodyContent.substring(closeTtd.pEnd)

  /** Helper to remove inner sectPr to prevent duplication */
  function removeInnerSectPr(content) {
    let clean = content
    const innerSectPrStart = clean.lastIndexOf('<w:sectPr')
    if (innerSectPrStart !== -1) {
      const innerSectPrEnd = clean.indexOf('</w:sectPr>', innerSectPrStart)
      if (innerSectPrEnd !== -1) {
        clean = clean.substring(0, innerSectPrStart) + clean.substring(innerSectPrEnd + '</w:sectPr>'.length)
      }
    }
    return clean
  }

  return {
    isValid: true, hasSections: true, preBody, postBody, sectPr,
    fullBody: removeInnerSectPr(fullBody),
    perjanjianBody: removeInnerSectPr(perjanjianContent),
    tandatanganBody: removeInnerSectPr(tandatanganContent)
  }
}


/**
 * Generate satu file .docx dari item pegawai dan template.
 * Menggunakan PizZip + string replacement langsung (tanpa Docxtemplater).
 *
 * Return value: objek { hasSections, fullBlob, perjanjianBlob, tandatanganBlob }
 *   - fullBlob         : seluruh dokumen dengan marker dihapus
 *   - perjanjianBlob   : hanya bagian {{#perjanjian}}...{{/perjanjian}} (null jika tidak ada)
 *   - tandatanganBlob  : hanya bagian {{#tandatangan}}...{{/tandatangan}} (null jika tidak ada)
 *   - hasSections      : true jika template memiliki keempat tag section
 */
async function generateDocx(item, templateBase64, pihakPertama, tanggalKontrak = null) {
  // Decode base64 → binary
  const base64Data = templateBase64.includes(',') ? templateBase64.split(',')[1] : templateBase64
  const binaryStr = atob(base64Data)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

  const zipTemplate = new PizZip(bytes)
  if (!zipTemplate.files['word/document.xml']) {
    throw new Error('Template tidak valid: word/document.xml tidak ditemukan di dalam file .docx.')
  }

  // Ambil & bersihkan XML
  let xml = zipTemplate.files['word/document.xml'].asText()
  xml = consolidateSplitTags(xml)

  // Ganti setiap tag dengan data pegawai
  const tagData = buildTagData(item, pihakPertama, tanggalKontrak)
  for (const [key, value] of Object.entries(tagData)) {
    xml = xml.split(`{{${key}}}`).join(escapeXml(value))
  }

  /**
   * Helper: buat docx Blob dari konten XML yang diberikan.
   * Menggunakan `bytes` asli agar styles, images, fonts, rels tetap terjaga.
   */
  function makeBlob(xmlContent) {
    const z = new PizZip(bytes)
    z.file('word/document.xml', xmlContent)
    return z.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
  }

  // Pisahkan bagian perjanjian & tanda tangan (jika ada marker section)
  const parts = extractDocumentParts(xml)

  if (!parts.hasSections) {
    return {
      hasSections: false,
      fullBlob: makeBlob(parts.preBody + parts.fullBody + parts.sectPr + parts.postBody),
      perjanjianBlob: null,
      tandatanganBlob: null,
      failReason: parts.failReason
    }
  }

  return {
    hasSections: true,
    fullBlob: makeBlob(parts.preBody + parts.fullBody + parts.sectPr + parts.postBody),
    perjanjianBlob: makeBlob(parts.preBody + parts.perjanjianBody + parts.sectPr + parts.postBody),
    tandatanganBlob: makeBlob(parts.preBody + parts.tandatanganBody + parts.sectPr + parts.postBody),
    failReason: null
  }
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
 * Download satu .docx (atau .zip jika mode pisah) untuk satu pegawai.
 * @param {object}    item           - data pegawai
 * @param {string}    paperSize      - 'f4' atau 'a4'
 * @param {Date|null} tanggalKontrak - tanggal penandatanganan kontrak dari input user
 * @param {string}    documentPart   - 'full' | 'perjanjian' | 'tandatangan' | 'pisah'
 * @returns {{ hasSections: boolean }}
 */
export async function downloadSingleContract(item, paperSize = 'f4', tanggalKontrak = null, documentPart = 'full') {
  const templateKey = getTemplateKey(item, paperSize)
  const [templateBase64, pihakPertama] = await Promise.all([
    loadTemplate(templateKey),
    loadPihakPertama()
  ])

  const result = await generateDocx(item, templateBase64, pihakPertama, tanggalKontrak)

  if (documentPart !== 'full' && !result.hasSections) {
    throw new Error(`Template belum memiliki tag section lengkap: ${result.failReason || 'Tag tidak ditemukan'}. Silakan perbaiki template di menu Pengaturan.`)
  }

  const baseName = `kontrak_${String(item['NIP BARU'] || '').replace(/[^a-zA-Z0-9]/g, '')}_${item['NAMA'] || 'pegawai'}`
    .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')

  if (documentPart === 'pisah') {
    const pisahZip = new JSZip()
    pisahZip.file(`${baseName}_perjanjian.docx`,  result.perjanjianBlob)
    pisahZip.file(`${baseName}_tandatangan.docx`, result.tandatanganBlob)
    const zipBlob = await pisahZip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `${baseName}_pisah.zip`)
  } else {
    let blobToSave = result.fullBlob
    let nameSuffix = ''
    if (documentPart === 'perjanjian') {
      blobToSave = result.perjanjianBlob
      nameSuffix = '_perjanjian'
    } else if (documentPart === 'tandatangan') {
      blobToSave = result.tandatanganBlob
      nameSuffix = '_tandatangan'
    } else {
      nameSuffix = '_utuh'
    }
    saveAs(blobToSave, `${baseName}${nameSuffix}.docx`)
  }

  return { hasSections: result.hasSections }
}

async function generateMergedDocx(items, templateBase64, pihakPertama, tanggalKontrak, documentPart = 'full') {
  const base64Data = templateBase64.includes(',') ? templateBase64.split(',')[1] : templateBase64
  const binaryStr = atob(base64Data)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

  const zipTemplate = new PizZip(bytes)
  if (!zipTemplate.files['word/document.xml']) {
    throw new Error('Template tidak valid: word/document.xml tidak ditemukan.')
  }

  let xml = zipTemplate.files['word/document.xml'].asText()
  xml = consolidateSplitTags(xml)
  const parts = extractDocumentParts(xml)
  
  if (documentPart !== 'full' && !parts.hasSections) {
    throw new Error(`Template belum memiliki tag section lengkap: ${parts.failReason || 'Tag tidak ditemukan'}. Silakan perbaiki template.`)
  }

  let baseContent = parts.fullBody
  if (documentPart === 'perjanjian') baseContent = parts.perjanjianBody
  if (documentPart === 'tandatangan') baseContent = parts.tandatanganBody

  let numberingXml = zipTemplate.files['word/numbering.xml'] ? zipTemplate.files['word/numbering.xml'].asText() : null
  const PAGE_BREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
  let mergedBodies = []
  let addedNumNodes = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    let content = baseContent
    const tagData = buildTagData(item, pihakPertama, tanggalKontrak)
    for (const [key, value] of Object.entries(tagData)) {
      content = content.split(`{{${key}}}`).join(escapeXml(value))
    }

    if (i > 0 && numberingXml) {
      let usedNums = new Set()
      content = content.replace(/<w:numId[^>]*w:val="(\d+)"[^>]*\/>/g, (match, id) => {
        usedNums.add(id)
        const newId = parseInt(id) + (i * 10000)
        return match.replace(`w:val="${id}"`, `w:val="${newId}"`)
      })

      usedNums.forEach(id => {
        const regex = new RegExp(`<w:num[^>]*w:numId="${id}"[^>]*>([\\s\\S]*?)<\\/w:num>`)
        const match = numberingXml.match(regex)
        if (match) {
           const newId = parseInt(id) + (i * 10000)
           let inner = match[1]
           if (!inner.includes('<w:startOverride')) {
               let overrides = ''
               for(let lvl=0; lvl<9; lvl++) {
                   overrides += `<w:lvlOverride w:ilvl="${lvl}"><w:startOverride w:val="1"/></w:lvlOverride>`
               }
               inner += overrides
           }
           addedNumNodes.push(`<w:num w:numId="${newId}">${inner}</w:num>`)
        }
      })
    }

    mergedBodies.push(content)
  }

  const finalXml = parts.preBody + mergedBodies.join(PAGE_BREAK) + parts.sectPr + parts.postBody
  zipTemplate.file('word/document.xml', finalXml)
  
  if (addedNumNodes.length > 0 && numberingXml) {
    numberingXml = numberingXml.replace('</w:numbering>', addedNumNodes.join('') + '</w:numbering>')
    zipTemplate.file('word/numbering.xml', numberingXml)
  }
  
  return zipTemplate.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
}

/**
 * Download batch sebagai ZIP atau merged DOCX.
 * @param {Array}     items          - array data pegawai
 * @param {string}    paperSize      - 'f4' atau 'a4'
 * @param {Function|null} onProgress - callback (done, total)
 * @param {Date|null} tanggalKontrak - tanggal penandatanganan kontrak dari input user
 * @param {string}    exportFormat   - 'zip' | 'merged'
 * @param {string}    documentPart   - 'full' | 'perjanjian' | 'tandatangan' | 'pisah'
 * @returns {{ hasSections: boolean }}
 */
export async function downloadBatchContracts(items, paperSize = 'f4', onProgress = null, tanggalKontrak = null, exportFormat = 'zip', documentPart = 'full') {
  const pihakPertama = await loadPihakPertama()

  // Load semua template yang diperlukan (cache per key)
  const templateCache = {}
  const uniqueKeys = [...new Set(items.map(item => getTemplateKey(item, paperSize)))]
  for (const key of uniqueKeys) {
    try {
      templateCache[key] = await loadTemplate(key)
    } catch (e) {
      console.warn(`Template ${key} not found:`, e.message)
    }
  }

  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`

  let partSuffix = '_utuh'
  if (documentPart === 'perjanjian') partSuffix = '_perjanjian'
  if (documentPart === 'tandatangan') partSuffix = '_tandatangan'

  if (exportFormat === 'merged') {
    // Generate 1 word file per template key (biasanya cuma 1 key)
    const zip = new JSZip()
    
    for (let i = 0; i < uniqueKeys.length; i++) {
      const key = uniqueKeys[i]
      const itemsForKey = items.filter(item => getTemplateKey(item, paperSize) === key)
      if (!templateCache[key]) continue

      try {
        const mergedBlob = await generateMergedDocx(itemsForKey, templateCache[key], pihakPertama, tanggalKontrak, documentPart)
        
        if (uniqueKeys.length === 1) {
          // Hanya 1 template, langsung save docx (bukan zip)
          saveAs(mergedBlob, `kontrak_gabungan${partSuffix}_${dateStr}.docx`)
          if (onProgress) onProgress(items.length, items.length)
          return { hasSections: true }
        } else {
          // Ada beberapa jenis template (reguler vs paruh waktu), masukkan ke zip
          const suffix = key.includes('paruh') ? 'paruh_waktu' : 'reguler'
          zip.file(`kontrak_gabungan_${suffix}${partSuffix}.docx`, mergedBlob)
        }
      } catch (e) {
        throw e
      }
      if (onProgress) onProgress(Math.floor((i+1)/uniqueKeys.length * items.length), items.length)
    }
    
    if (uniqueKeys.length > 1) {
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `kontrak_gabungan${partSuffix}_${dateStr}.zip`)
    }
    return { hasSections: true }
  }

  // ==== MODE ZIP BIASA ====
  const zip = new JSZip()
  let anySections = false

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (onProgress) onProgress(i + 1, items.length)

    const key = getTemplateKey(item, paperSize)
    if (!templateCache[key]) continue

    try {
      const result = await generateDocx(item, templateCache[key], pihakPertama, tanggalKontrak)
      
      if (documentPart !== 'full' && !result.hasSections) {
        throw new Error(`Template belum memiliki tag section lengkap: ${result.failReason || 'Tag tidak ditemukan'}. Silakan perbaiki template.`)
      }

      const baseName = `kontrak_${String(item['NIP BARU'] || '').replace(/[^a-zA-Z0-9]/g, '')}_${item['NAMA'] || 'pegawai'}`
        .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')

      if (documentPart === 'pisah') {
        anySections = true
        zip.file(`${baseName}_perjanjian.docx`,  result.perjanjianBlob)
        zip.file(`${baseName}_tandatangan.docx`, result.tandatanganBlob)
      } else {
        let blobToSave = result.fullBlob
        let nameSuffix = ''
        if (documentPart === 'perjanjian') {
          blobToSave = result.perjanjianBlob
          nameSuffix = '_perjanjian'
        } else if (documentPart === 'tandatangan') {
          blobToSave = result.tandatanganBlob
          nameSuffix = '_tandatangan'
        } else {
          nameSuffix = '_utuh'
        }
        zip.file(`${baseName}${nameSuffix}.docx`, blobToSave)
      }
    } catch (e) {
      console.error(`Error generating doc for ${item['NAMA']}:`, e)
      throw e 
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `kontrak_batch${partSuffix}_${dateStr}.zip`)

  return { hasSections: anySections }
}

