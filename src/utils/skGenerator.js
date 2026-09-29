import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import {
  getNamaLengkap,
  cleanNomorKontrakTag,
  formatIndoDate,
  calculateContractPeriod,
  formatJenisKelamin
} from './pppkLogic'
import { calculateGajiFromItem } from './gajiTable'
import { generateBknQrUint8Array } from './qrCode'
import bundledSkTemplateUrl from '../assets/img/data_samples/Template SK PPPK.docx?url'

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatIndo(str) {
  const res = formatIndoDate(str)
  return res === '-' ? '' : res
}

/**
 * Mendapatkan klausul Gaji/Upah untuk SK:
 * - PPPK Paruh Waktu: "AKAN DICANTUMKAN DALAM PERJANJIAN KERJA"
 * - PPPK (Penuh Waktu): nominal gaji (contoh: "Rp 3.200.000")
 */
export function getGajiSkText(item) {
  const jenisPppk = (item['JENIS PPPK'] || item['JENIS_PPPK'] || '').toLowerCase()
  const isParuhWaktu = jenisPppk.includes('paruh')
  if (isParuhWaktu) {
    return 'AKAN DICANTUMKAN DALAM PERJANJIAN KERJA'
  }
  const gajiRaw = item['GAJI POKOK SAAT INI'] || item['GAJI POKOK SAAT INI (RP)'] || item['GAJI POKOK'] || item['GAJI'] || item['GAJI_POKOK'] || ''
  let gajiAngka = typeof gajiRaw === 'number' ? gajiRaw : parseInt(String(gajiRaw).replace(/[^0-9]/g, ''), 10)
  if (!gajiAngka || isNaN(gajiAngka)) {
    const gajiCalc = calculateGajiFromItem(item)
    if (gajiCalc?.gaji) {
      gajiAngka = gajiCalc.gaji
    }
  }
  return gajiAngka ? `Rp ${Number(gajiAngka).toLocaleString('id-ID')}` : 'AKAN DICANTUMKAN DALAM PERJANJIAN KERJA'
}

/**
 * Bersihkan XML tags yang mungkin memecah tag {{TAG}} di Word
 */
function consolidateSplitTags(xml) {
  let prev = ''
  let result = xml
  while (prev !== result) {
    prev = result
    result = result.replace(/(\{\{[^{}]*?)<[^>]+>([^{}]*?\}\})/g, '$1$2')
    result = result.replace(/(\{\{[^{}]*?)<[^>]+>/g, '$1')
  }
  return result
}

/**
 * Muat konfigurasi Pihak Pertama (Bupati) dari database Firestore
 */
export async function loadPihakPertama() {
  try {
    const snap = await getDoc(doc(db, 'config', 'pihak_pertama'))
    if (snap.exists()) return snap.data()
  } catch (e) {
    console.warn('Gagal memuat pihak_pertama dari Firestore:', e)
  }
  return null
}

/**
 * Muat binary template SK PPPK (mendukung template_sk maupun template_sk_paruh dari Firestore)
 */
async function loadSkTemplateBytes() {
  try {
    const snap = await getDoc(doc(db, 'config', 'templates'))
    if (snap.exists()) {
      const data = snap.data()
      const b64 = data.template_sk || data.template_sk_paruh
      if (b64) {
        const base64Data = b64.includes(',') ? b64.split(',')[1] : b64
        const binaryStr = atob(base64Data)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
        return bytes.buffer
      }
    }
  } catch (e) {
    console.warn('Gagal memuat template SK dari Firestore, gunakan template bawaan:', e)
  }

  try {
    const res = await fetch('/templates/Template_SK_PPPK.docx')
    if (res.ok) return await res.arrayBuffer()
  } catch (e) {
    console.warn('Fetch /templates/Template_SK_PPPK.docx gagal:', e)
  }

  try {
    const res = await fetch('/templates/Template_SK_PPPK_Paruh_Waktu.docx')
    if (res.ok) return await res.arrayBuffer()
  } catch (e) {
    console.warn('Fetch template dari /templates gagal, gunakan bundled url:', e)
  }

  const res = await fetch(bundledSkTemplateUrl)
  return await res.arrayBuffer()
}

/**
 * Susun kamus nilai data pegawai untuk MERGEFIELD dan tag {{TAG}} di template SK
 */
export function buildSkFields(item) {
  const period = calculateContractPeriod(item)
  let tmtAwal = formatIndo(item['AWAL KONTRAK AKTIF'] || item['TMT CPNS'] || item['TMT KONTRAK BARU'] || '')
  let tmtAkhir = formatIndo(item['AKHIR KONTRAK AKTIF'] || '')

  if (!tmtAkhir && period && period.endDateStr && period.endDateStr !== '-' && period.endDateStr !== 'Format Tanggal Invalid') {
    tmtAkhir = period.endDateStr
  }

  const tempatLahir = (item['TEMPAT LAHIR NAMA'] || item['TEMPAT LAHIR'] || item['KOTA LAHIR'] || '').trim()
  const tglLahirFormatted = formatIndo(item['TANGGAL LAHIR'] || item['TGL LAHIR'] || '')
  const tempatTglLahir = [tempatLahir, tglLahirFormatted].filter(Boolean).join(', ')

  const pendidikan = (item['PENDIDIKAN TERAKHIR'] || item['PENDIDIKAN NAMA'] || item['PENDIDIKAN'] || '').trim()
  const tahunLulus = String(item['TAHUN LULUS'] || item['THN LULUS'] || '').trim()
  let pendidikanLulus = pendidikan
  if (pendidikan && tahunLulus) pendidikanLulus = `${pendidikan} Tahun ${tahunLulus}`
  else if (tahunLulus) pendidikanLulus = `Tahun ${tahunLulus}`

  const nomorSkVal = cleanNomorKontrakTag(
    item['NOMOR SK'] || item['NO SK'] || item['NOMOR_SK'] || item['NO_SK'] ||
    item['NO KONTRAK'] || item['NOMOR KONTRAK'] || item['NOMOR_KONTRAK'] || ''
  )
  const gajiText = getGajiSkText(item)
  const namaBerGelar = getNamaLengkap(item, true)
  const nipVal = String(item['NIP BARU'] || item['NIP'] || '').trim()
  const jkVal = formatJenisKelamin(item['JENIS KELAMIN'] || item['JENIS_KELAMIN'] || item['GENDER'] || '')
  const jabatanVal = item['JABATAN NAMA'] || item['JABATAN'] || item['NAMA JABATAN'] || '-'
  const unorVal = item['UNOR NAMA'] || item['NAMA UNOR'] || '-'

  return {
    NOMOR_KONTRAK: nomorSkVal,
    NOMOR_SK: nomorSkVal,
    NO_SK: nomorSkVal,
    TMT_AWAL_BARU: tmtAwal || '-',
    TMT_AWAL: tmtAwal || '-',
    TMT_AKHIR_BARU: tmtAkhir || '-',
    TMT_AKHIR: tmtAkhir || '-',
    Nama_Lengkap: namaBerGelar,
    NAMA_LENGKAP: namaBerGelar,
    NAMA_PEGAWAI: namaBerGelar,
    NIP: nipVal,
    NIP_BARU: nipVal,
    TEMPAT_TGL_LAHIR: tempatTglLahir || '-',
    JENIS_KELAMIN: jkVal,
    PENDIDIKAN_LULUS: pendidikanLulus || '-',
    JABATAN_NAMA: jabatanVal,
    JABATAN: jabatanVal,
    UNOR_NAMA: unorVal,
    GAJI: gajiText,
    GAJI_UPAH: gajiText,
    GAJI_BARU: gajiText
  }
}

/**
 * Ganti seluruh MERGEFIELD di dalam XML dokumen
 */
function replaceMergeFields(xml, fields) {
  let res = xml
  for (const [k, v] of Object.entries(fields)) {
    const pattern = new RegExp(
      '<w:r[\\s>](?:(?!<w:r[\\s>]).)*?<w:fldChar\\s+w:fldCharType="begin"\\/>(?:(?!<w:fldChar)[\\s\\S])*?MERGEFIELD\\s+' +
      k +
      '(?:(?!<w:fldChar\\s+w:fldCharType="begin")[\\s\\S])*?<w:fldChar\\s+w:fldCharType="end"\\/>(?:(?!<\\/w:r>).)*?<\\/w:r>',
      'gi'
    )
    const replacement = `<w:r><w:rPr><w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(v)}</w:t></w:r>`
    res = res.replace(pattern, replacement)
  }
  return res
}

/**
 * Ganti tabel sel barcode atau tag {{QR_CODE}} dengan gambar QR Code inline drawing rata kiri (seperti Gambar 3)
 */
function replaceBarcodeWithQrDrawing(xml) {
  let barcodeIdx = xml.indexOf('MERGEBARCODE')
  if (barcodeIdx === -1) barcodeIdx = xml.indexOf('DISPLAYBARCODE')
  if (barcodeIdx === -1) barcodeIdx = xml.indexOf('{{QR_CODE}}')
  if (barcodeIdx === -1) barcodeIdx = xml.indexOf('{{BARCODE}}')
  if (barcodeIdx === -1) barcodeIdx = xml.indexOf('{{QR}}')
  if (barcodeIdx === -1) return xml

  let tcStart = xml.lastIndexOf('<w:tc>', barcodeIdx)
  if (tcStart === -1) tcStart = xml.lastIndexOf('<w:tc ', barcodeIdx)
  const tcEnd = xml.indexOf('</w:tc>', barcodeIdx)

  // Ukuran cx=850000 cy=850000 (~2.25cm) dengan posisi rata kiri (w:jc w:val="left") sesuai Gambar 3
  const drawingXml = '<w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distR="0"><wp:extent cx="850000" cy="850000"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="101" name="BKN_QRCode"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="qr_code.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdQR"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="850000" cy="850000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'

  if (tcStart !== -1 && tcEnd !== -1 && barcodeIdx < tcEnd) {
    const tcPrEnd = xml.indexOf('</w:tcPr>', tcStart) + '</w:tcPr>'.length
    return xml.substring(0, tcPrEnd) + drawingXml + xml.substring(tcEnd)
  }

  const pStart = xml.lastIndexOf('<w:p ', barcodeIdx) !== -1 ? xml.lastIndexOf('<w:p ', barcodeIdx) : xml.lastIndexOf('<w:p>', barcodeIdx)
  const pEnd = xml.indexOf('</w:p>', barcodeIdx)
  if (pStart !== -1 && pEnd !== -1) {
    return xml.substring(0, pStart) + drawingXml + xml.substring(pEnd + '</w:p>'.length)
  }

  return xml
}

/**
 * Sisipkan relasi gambar rIdQR ke word/_rels/document.xml.rels
 */
function ensureQrRelationship(relsXml) {
  if (relsXml.includes('media/qr_code.png') || relsXml.includes('rIdQR')) {
    return relsXml
  }
  const ins = relsXml.lastIndexOf('</Relationships>')
  if (ins === -1) return relsXml
  const rel = '<Relationship Id="rIdQR" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/qr_code.png"/>'
  return relsXml.substring(0, ins) + rel + relsXml.substring(ins)
}

/**
 * Buat dokumen SK PPPK dalam bentuk Blob (mendukung Penuh Waktu & Paruh Waktu)
 * @param {object} item - Data pegawai
 * @param {object} options - Opsi qrMode ('url' | 'nip'), tanggalSk (Date|string), pihakPertama
 * @returns {Promise<Blob>}
 */
export async function generateSkDocxBlob(item, options = {}) {
  const qrMode = options.qrMode || 'url'
  const nip = String(item['NIP BARU'] || item['NIP'] || '').trim()
  const qrText = qrMode === 'nip'
    ? nip
    : `${window.location.origin}/verifikasi?nip=${encodeURIComponent(nip)}`

  const [templateBuffer, qrBytes, pihakPertama] = await Promise.all([
    loadSkTemplateBytes(),
    generateBknQrUint8Array(qrText, { size: 500 }),
    options.pihakPertama !== undefined ? options.pihakPertama : loadPihakPertama()
  ])

  const zip = await JSZip.loadAsync(templateBuffer)

  const docXmlFile = zip.file('word/document.xml')
  if (!docXmlFile) throw new Error('File word/document.xml tidak ditemukan di template SK.')
  let xml = await docXmlFile.async('string')

  // 1. Bersihkan XML tags yang mungkin memecah placeholder {{TAG}}
  xml = consolidateSplitTags(xml)

  // 2. Ganti seluruh MERGEFIELD dan tag {{TAG}}
  const fields = buildSkFields(item)
  xml = replaceMergeFields(xml, fields)
  for (const [k, v] of Object.entries(fields)) {
    xml = xml.replaceAll(`{{${k}}}`, escapeXml(v))
  }

  // 3. Ganti Barcode / QR Code
  xml = replaceBarcodeWithQrDrawing(xml)

  // 4. Sesuaikan klausul Gaji/Upah dan teks paruh waktu jika pegawai adalah Penuh Waktu
  const jenisPppk = (item['JENIS PPPK'] || item['JENIS_PPPK'] || '').toLowerCase()
  const isParuhWaktu = jenisPppk.includes('paruh')
  if (!isParuhWaktu) {
    const gajiNominal = getGajiSkText(item)
    xml = xml.replace(/>AKAN DICANTUMKAN DALAM PERJANJIAN KERJA</g, `>${escapeXml(gajiNominal)}<`)
    xml = xml.replace(/PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA PARUH WAKTU/g, 'PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA')
    xml = xml.replace(/Nomor Induk PPPK Paruh Waktu/g, 'Nomor Induk PPPK')
  }

  // 5. Ganti Tanggal SK
  if (options.tanggalSk) {
    const formattedTgl = formatIndo(options.tanggalSk)
    if (formattedTgl) {
      xml = xml.replace(/>30 September 2026</g, `>${escapeXml(formattedTgl)}<`)
      xml = xml.replaceAll('{{TANGGAL_SK}}', escapeXml(formattedTgl))
    }
  } else {
    xml = xml.replaceAll('{{TANGGAL_SK}}', '30 September 2026')
  }

  // 6. Ganti Nama & Jabatan Bupati berdasarkan Pengaturan Pihak Pertama
  if (pihakPertama?.nama) {
    const namaBupati = pihakPertama.nama.trim().toUpperCase()
    const pattBupati = /<w:r[^>]*>(?:(?!<w:r[ >]).)*?<w:t[^>]*>H\.\s*<\/w:t>[\s\S]*?<w:t[^>]*>SAHRUJANI<\/w:t>(?:(?!<\/w:r>).)*?<\/w:r>/i
    const repBupati = `<w:r><w:rPr><w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style" w:cs="Arial"/><w:b/><w:bCs/><w:sz w:val="18"/><w:szCs w:val="18"/><w:lang w:val="sv-SE"/></w:rPr><w:t>${escapeXml(namaBupati)}</w:t></w:r>`
    xml = xml.replace(pattBupati, repBupati)
    xml = xml.replaceAll('{{NAMA_BUPATI}}', escapeXml(namaBupati))
  }
  if (pihakPertama?.jabatan) {
    const jabatanBupati = pihakPertama.jabatan.trim().toUpperCase()
    xml = xml.replace(/>BUPATI HULU SUNGAI UTARA</g, `>${escapeXml(jabatanBupati)}<`)
    xml = xml.replaceAll('{{JABATAN_BUPATI}}', escapeXml(jabatanBupati))
  }

  zip.file('word/document.xml', xml)

  // 4. Tambahkan relasi rIdQR di word/_rels/document.xml.rels
  const relsFile = zip.file('word/_rels/document.xml.rels')
  if (relsFile) {
    let relsXml = await relsFile.async('string')
    relsXml = ensureQrRelationship(relsXml)
    zip.file('word/_rels/document.xml.rels', relsXml)
  }

  // 5. Masukkan file gambar QR Code ke word/media/qr_code.png
  zip.file('word/media/qr_code.png', qrBytes)

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
}

/**
 * Download dokumen SK untuk satu pegawai
 */
export async function downloadSingleSk(item, qrMode = 'url', tanggalSk = null) {
  const blob = await generateSkDocxBlob(item, { qrMode, tanggalSk })
  const nip = String(item['NIP BARU'] || item['NIP'] || '').replace(/[^a-zA-Z0-9]/g, '')
  const nama = getNamaLengkap(item, true).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  const jenisPppk = (item['JENIS PPPK'] || item['JENIS_PPPK'] || '').toLowerCase()
  const prefix = jenisPppk.includes('paruh') ? 'SK_PPPK_Paruh_Waktu' : 'SK_PPPK'
  saveAs(blob, `${prefix}_${nip}_${nama}.docx`)
}

/**
 * Download batch dokumen SK untuk banyak pegawai dalam 1 ZIP
 */
export async function downloadBatchSk(items, qrMode = 'url', tanggalSk = null, onProgress = null) {
  if (!items || items.length === 0) return
  if (items.length === 1) {
    return await downloadSingleSk(items[0], qrMode, tanggalSk)
  }

  const pihakPertama = await loadPihakPertama()
  const zip = new JSZip()
  let done = 0

  for (const item of items) {
    const blob = await generateSkDocxBlob(item, { qrMode, tanggalSk, pihakPertama })
    const nip = String(item['NIP BARU'] || item['NIP'] || '').replace(/[^a-zA-Z0-9]/g, '')
    const nama = getNamaLengkap(item, true).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
    const jenisPppk = (item['JENIS PPPK'] || item['JENIS_PPPK'] || '').toLowerCase()
    const prefix = jenisPppk.includes('paruh') ? 'SK_PPPK_Paruh_Waktu' : 'SK_PPPK'
    zip.file(`${prefix}_${nip}_${nama}.docx`, blob)
    done++
    if (onProgress) onProgress(done, items.length)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const dateStr = new Date().toISOString().split('T')[0]
  saveAs(zipBlob, `SK_PPPK_Batch_${items.length}_Pegawai_${dateStr}.zip`)
}

