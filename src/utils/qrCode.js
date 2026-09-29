import qrcode from './qrcode-generator.js'
import garudaUrl from '../assets/garuda.png'

let cachedGarudaImg = null

/**
 * Memuat gambar Garuda Pancasila emblem secara asinkron
 * @returns {Promise<HTMLImageElement>}
 */
function loadGarudaImage() {
  if (cachedGarudaImg && cachedGarudaImg.complete && cachedGarudaImg.naturalWidth > 0) {
    return Promise.resolve(cachedGarudaImg)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      cachedGarudaImg = img
      resolve(img)
    }
    img.onerror = (err) => reject(new Error('Gagal memuat gambar Garuda: ' + err))
    img.src = garudaUrl
  })
}

/**
 * Menggambar QR code ke canvas HTML5 dengan emblem BKN transparan di tengah
 * Sesuai spesifikasi BKN: Garuda di kiri, BKN magenta di kanan, tanpa latar belakang putih
 * @param {string} text - Nilai atau URL yang di-encode
 * @param {object} options - Opsi ukuran dan margin
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderBknQrCanvas(text, options = {}) {
  const size = options.size || 400
  const margin = options.margin !== undefined ? options.margin : 4
  const qr = qrcode(0, 'H')
  qr.addData(text || '')
  qr.make()

  const moduleCount = qr.getModuleCount()
  const totalModules = moduleCount + margin * 2
  const cellSize = size / totalModules

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Latar belakang putih untuk modul QR
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  // Gambar modul QR hitam
  ctx.fillStyle = '#000000'
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = Math.round((col + margin) * cellSize)
        const y = Math.round((row + margin) * cellSize)
        const w = Math.ceil(cellSize)
        const h = Math.ceil(cellSize)
        ctx.fillRect(x, y, w, h)
      }
    }
  }

  // Muat dan gambar emblem Garuda + BKN (Transparan)
  try {
    const garuda = await loadGarudaImage()
    const badgeW = Math.round(size * 0.325)
    const badgeH = Math.round(size * 0.14)
    const bx = Math.round((size - badgeW) / 2)
    const by = Math.round((size - badgeH) / 2)

    const gH = Math.round(size * 0.125)
    const gW = Math.round(garuda.width * (gH / garuda.height))
    const gx = bx
    const gy = by + Math.round((badgeH - gH) / 2)

    ctx.drawImage(garuda, gx, gy, gW, gH)

    const fontSize = Math.round(size * 0.09)
    ctx.font = `bold ${fontSize}px "Arial", sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const textX = gx + gW + Math.round(size * 0.015)
    const textY = by + Math.round(badgeH / 2)

    // Stroke tipis putih agar terbaca jelas di atas titik QR hitam
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = Math.max(2, Math.round(size * 0.0075))
    ctx.lineJoin = 'round'
    ctx.strokeText('BKN', textX, textY)

    // Tulisan utama BKN warna magenta resmi
    ctx.fillStyle = '#be185d'
    ctx.fillText('BKN', textX, textY)
  } catch (err) {
    console.warn('Gagal menambahkan emblem BKN pada QR:', err)
  }

  return canvas
}

/**
 * Generate BKN QR Code dalam bentuk Blob PNG
 * @param {string} text
 * @param {object} options
 * @returns {Promise<Blob>}
 */
export async function generateBknQrBlob(text, options = {}) {
  const canvas = await renderBknQrCanvas(text, options)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

/**
 * Generate BKN QR Code dalam bentuk Data URL (base64)
 * @param {string} text
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function generateBknQrDataUrl(text, options = {}) {
  const canvas = await renderBknQrCanvas(text, options)
  return canvas.toDataURL('image/png')
}

/**
 * Generate BKN QR Code dalam bentuk Uint8Array untuk langsung disisipkan ke ZIP docx
 * @param {string} text
 * @param {object} options
 * @returns {Promise<Uint8Array>}
 */
export async function generateBknQrUint8Array(text, options = {}) {
  const blob = await generateBknQrBlob(text, options)
  const arrayBuffer = await blob.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}
