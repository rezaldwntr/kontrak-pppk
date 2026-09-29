import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import {
  getNamaLengkap,
  cleanNomorKontrakTag,
  formatIndoDate,
  calculateContractPeriod
} from './pppkLogic'
import { generateBknQrUint8Array } from './qrCode'
import bundledSkTemplateUrl from '../assets/img/data_samples/Template SK PPPK Paruh Waktu.docx?url'

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
 * Muat binary template SK PPPK Paruh Waktu
 */
async function loadSkTemplateBytes() {
  try {
    const snap = await getDoc(doc(db, 'config', 'templates'))
    if (snap.exists() && snap.data().template_sk_paruh) {
      const b64 = snap.data().template_sk_paruh
      const base64Data = b64.includes(',') ? b64.split(',')[1] : b64
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      return bytes.buffer
    }
  } catch (e) {
    console.warn('Gagal memuat template SK dari Firestore, gunakan template bawaan:', e)
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
 * Susun kamus nilai data pegawai untuk 10 MERGEFIELD di template SK
 */
function buildSkFields(item) {
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

  return {
    NOMOR_KONTRAK: cleanNomorKontrakTag(item['NO KONTRAK'] || item['NOMOR KONTRAK'] || item['NOMOR_KONTRAK'] || ''),
    TMT_AWAL_BARU: tmtAwal || '-',
    TMT_AKHIR_BARU: tmtAkhir || '-',
    Nama_Lengkap: getNamaLengkap(item),
    NIP: String(item['NIP BARU'] || item['NIP'] || '').trim(),
    TEMPAT_TGL_LAHIR: tempatTglLahir || '-',
    JENIS_KELAMIN: item['JENIS KELAMIN'] || item['JENIS_KELAMIN'] || '-',
    PENDIDIKAN_LULUS: pendidikanLulus || '-',
    JABATAN_NAMA: item['JABATAN NAMA'] || item['JABATAN'] || item['NAMA JABATAN'] || '-',
    UNOR_NAMA: item['UNOR NAMA'] || item['NAMA UNOR'] || '-'
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
 * Ganti tabel sel barcode dengan gambar QR Code inline drawing
 */
function replaceBarcodeWithQrDrawing(xml) {
  const barcodeIdx = xml.indexOf('MERGEBARCODE')
  if (barcodeIdx === -1) return xml

  let tcStart = xml.lastIndexOf('<w:tc>', barcodeIdx)
  if (tcStart === -1) tcStart = xml.lastIndexOf('<w:tc ', barcodeIdx)
  const tcEnd = xml.indexOf('</w:tc>', barcodeIdx)
  if (tcStart === -1 || tcEnd === -1) return xml

  const tcPrEnd = xml.indexOf('</w:tcPr>', tcStart) + '</w:tcPr>'.length

  const drawingXml = '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="1080000" cy="1080000"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="101" name="BKN_QRCode"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="qr_code.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdQR"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1080000" cy="1080000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'

  return xml.substring(0, tcPrEnd) + drawingXml + xml.substring(tcEnd)
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
 * Buat dokumen SK PPPK Paruh Waktu dalam bentuk Blob
 * @param {object} item - Data pegawai
 * @param {object} options - Opsi qrMode ('url' | 'nip')
 * @returns {Promise<Blob>}
 */
export async function generateSkDocxBlob(item, options = {}) {
  const qrMode = options.qrMode || 'url'
  const nip = String(item['NIP BARU'] || item['NIP'] || '').trim()
  const qrText = qrMode === 'nip'
    ? nip
    : `${window.location.origin}/verifikasi?nip=${encodeURIComponent(nip)}`

  const [templateBuffer, qrBytes] = await Promise.all([
    loadSkTemplateBytes(),
    generateBknQrUint8Array(qrText, { size: 500 })
  ])

  const zip = await JSZip.loadAsync(templateBuffer)

  // 1. Ganti MERGEFIELD dan Barcode di word/document.xml
  const docXmlFile = zip.file('word/document.xml')
  if (!docXmlFile) throw new Error('File word/document.xml tidak ditemukan di template SK.')
  let xml = await docXmlFile.async('string')
  xml = replaceMergeFields(xml, buildSkFields(item))
  xml = replaceBarcodeWithQrDrawing(xml)
  zip.file('word/document.xml', xml)

  // 2. Tambahkan relasi rIdQR di word/_rels/document.xml.rels
  const relsFile = zip.file('word/_rels/document.xml.rels')
  if (relsFile) {
    let relsXml = await relsFile.async('string')
    relsXml = ensureQrRelationship(relsXml)
    zip.file('word/_rels/document.xml.rels', relsXml)
  }

  // 3. Masukkan file gambar QR Code ke word/media/qr_code.png
  zip.file('word/media/qr_code.png', qrBytes)

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
}

/**
 * Download dokumen SK untuk satu pegawai
 */
export async function downloadSingleSk(item, qrMode = 'url') {
  const blob = await generateSkDocxBlob(item, { qrMode })
  const nip = String(item['NIP BARU'] || item['NIP'] || '').replace(/[^a-zA-Z0-9]/g, '')
  const nama = getNamaLengkap(item).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  saveAs(blob, `SK_PPPK_Paruh_Waktu_${nip}_${nama}.docx`)
}

/**
 * Download batch dokumen SK untuk banyak pegawai dalam 1 ZIP
 */
export async function downloadBatchSk(items, qrMode = 'url', onProgress = null) {
  if (!items || items.length === 0) return
  if (items.length === 1) {
    return await downloadSingleSk(items[0], qrMode)
  }

  const zip = new JSZip()
  let done = 0

  for (const item of items) {
    const blob = await generateSkDocxBlob(item, { qrMode })
    const nip = String(item['NIP BARU'] || item['NIP'] || '').replace(/[^a-zA-Z0-9]/g, '')
    const nama = getNamaLengkap(item).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
    zip.file(`SK_PPPK_Paruh_Waktu_${nip}_${nama}.docx`, blob)
    done++
    if (onProgress) onProgress(done, items.length)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const dateStr = new Date().toISOString().split('T')[0]
  saveAs(zipBlob, `SK_PPPK_Paruh_Waktu_Batch_${items.length}_Pegawai_${dateStr}.zip`)
}
