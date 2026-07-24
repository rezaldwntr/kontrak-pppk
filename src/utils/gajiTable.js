/**
 * TABEL GAJI POKOK PPPK - Perpres Nomor 11 Tahun 2024
 * ======================================================
 *
 * ATURAN MKG (Masa Kerja Golongan):
 * - Gol I, V    : initialMkg = 0 (MKG mulai dari 0 saat diangkat)
 * - Gol II, III, IV, VI, VII, VIII : initialMkg = 3
 *   (saat diangkat/TMT CPNS, pegawai SUDAH memiliki MKG 3 Tahun 0 Bulan)
 * - Gol IX - XVII : initialMkg = 0
 *
 * KENAIKAN BERKALA:
 * - Gol I - IV   : setiap 2 tahun (MKG 0,2,4,6... atau 3,5,7...)
 * - Gol V - VIII : setiap 2 tahun (MKG 0,1,3,5,7... atau 3,5,7...)
 *   Khusus Gol V: MKG 0→1 setelah 1 tahun, lalu setiap 2 tahun
 * - Gol IX - XVII: setiap 1 tahun (MKG 0,1,2,3,...)
 *
 * CATATAN:
 * - Nilai Gol I, II, III, IV, V(MKG 0-5) = KONFIRMASI dari tabel Perpres
 * - Nilai Gol V(MKG 7-33) = ESTIMASI (arithmetic progression, a₀=82900, d=3000)
 * - Nilai Gol VI, VII, VIII = ESTIMASI
 * - Nilai Gol IX-XVII = ESTIMASI (linear interpolation)
 * - Harap verifikasi nilai estimasi dengan dokumen resmi Perpres No. 11/2024
 */

// ============================================================
// HELPER: Generate arithmetic progression salary data
// ============================================================
function genArithData(min, max, firstIncrement, mkgStep, startMkg, endMkg) {
  const numSteps = (endMkg - startMkg) / mkgStep
  const sumN = numSteps * (numSteps - 1) / 2
  const d = (max - min - numSteps * firstIncrement) / sumN

  const data = {}
  let val = min
  let inc = firstIncrement

  for (let mkg = startMkg; mkg <= endMkg; mkg += mkgStep) {
    data[mkg] = Math.round(val / 100) * 100
    if (mkg < endMkg) {
      val += inc
      inc += d
    }
  }
  // Ensure exact max value
  data[endMkg] = max
  return data
}

// ============================================================
// TABEL GAJI LENGKAP
// ============================================================
export const TABEL_GAJI = {

  // --- GOLONGAN I ---
  // MKG: 0, 2, 4, 6, 8, ..., 26 (every 2 years)
  // Sumber: Konfirmasi dari tabel foto (MKG 4 = estimasi)
  'I': {
    initialMkg: 0,
    data: {
      0: 1938500, 2: 1999500, 4: 2062800,
      6: 2127500,  8: 2194500,  10: 2263800,
      12: 2334900, 14: 2408400, 16: 2484300,
      18: 2562500, 20: 2643200, 22: 2726500,
      24: 2812400, 26: 2900900
    }
  },

  // --- GOLONGAN II ---
  // MKG: 3, 5, 7, ..., 27 (every 2 years, starts at MKG 3)
  // Sumber: Konfirmasi dari tabel foto
  'II': {
    initialMkg: 3,
    data: {
      3: 2116900,  5: 2183600,  7: 2252400,  9: 2323300,
      11: 2398500, 13: 2472000, 15: 2549600, 17: 2630100,
      19: 2713000, 21: 2798400, 23: 2886800, 25: 2977500,
      27: 3071200
    }
  },

  // --- GOLONGAN III ---
  // MKG: 3, 5, 7, ..., 27 (every 2 years, starts at MKG 3)
  // Sumber: Konfirmasi dari tabel foto
  'III': {
    initialMkg: 3,
    data: {
      3: 2206500,  5: 2276000,  7: 2347700,  9: 2421600,
      11: 2497900, 13: 2576500, 15: 2657700, 17: 2741400,
      19: 2827700, 21: 2918800, 23: 3008700, 25: 3103400,
      27: 3201200
    }
  },

  // --- GOLONGAN IV ---
  // MKG: 3, 5, 7, ..., 27 (every 2 years, starts at MKG 3)
  // Sumber: Konfirmasi dari tabel foto (MKG 9 = estimasi)
  'IV': {
    initialMkg: 3,
    data: {
      3: 2299800,  5: 2372300,  7: 2447000,  9: 2524000,
      11: 2603500, 13: 2685500, 15: 2770100, 17: 2857400,
      19: 2947400, 21: 3040200, 23: 3135900, 25: 3234700,
      27: 3336600
    }
  },

  // --- GOLONGAN V ---
  // MKG: 0, 1, 3, 5, 7, ..., 33
  // (MKG 0→1 setelah 1 tahun, lalu setiap 2 tahun dari MKG 1)
  // Sumber: MKG 0,1,3,5 konfirmasi; MKG 7-33 estimasi (a₀=82900, d=3000)
  'V': {
    initialMkg: 0,
    specialV: true, // flag untuk penanganan khusus MKG 0→1
    data: {
      0: 2511500,  1: 2551100,
      3: 2631400,  5: 2714300,  7: 2800200,  9: 2889100,
      11: 2981000, 13: 3075900, 15: 3173800, 17: 3274700,
      19: 3378600, 21: 3485500, 23: 3595400, 25: 3708300,
      27: 3824200, 29: 3943100, 31: 4065000, 33: 4189900
    }
  },

  // --- GOLONGAN VI ---
  // MKG: 3, 5, 7, ..., 33 (every 2 years, starts at MKG 3)
  // Sumber: MKG 3 konfirmasi; MKG 5-33 estimasi (a₀=87300, d≈3000)
  'VI': {
    initialMkg: 3,
    data: genArithData(2742800, 4367100, 87300, 2, 3, 33)
  },

  // --- GOLONGAN VII ---
  // MKG: 3, 5, 7, ..., 33 (every 2 years, starts at MKG 3)
  // Sumber: MKG 3 konfirmasi; MKG 5-33 estimasi (a₀=91900, d≈3000)
  'VII': {
    initialMkg: 3,
    data: genArithData(2858800, 4551800, 91900, 2, 3, 33)
  },

  // --- GOLONGAN VIII ---
  // MKG: 3, 5, 7, ..., 33 (every 2 years, starts at MKG 3)
  // Sumber: MKG 3 konfirmasi; MKG 5-33 estimasi (a₀=96600, d≈3000)
  'VIII': {
    initialMkg: 3,
    data: genArithData(2979700, 4744400, 96600, 2, 3, 33)
  },

  // --- GOLONGAN IX - XVII ---
  // MKG: 0, 1, 2, ..., 32 (every year, starts at MKG 0)
  // Sumber: MKG 0 dan MKG 32 konfirmasi; nilai antara = ESTIMASI
  'IX':   { initialMkg: 0, data: genArithData(3203600, 5261500, 49400, 1, 0, 32) },
  'X':    { initialMkg: 0, data: genArithData(3339100, 5484000, 52100, 1, 0, 32) },
  'XI':   { initialMkg: 0, data: genArithData(3480300, 5716000, 55000, 1, 0, 32) },
  'XII':  { initialMkg: 0, data: genArithData(3627500, 5957800, 57900, 1, 0, 32) },
  'XIII': { initialMkg: 0, data: genArithData(3781000, 6209800, 61000, 1, 0, 32) },
  'XIV':  { initialMkg: 0, data: genArithData(3940900, 6472500, 64200, 1, 0, 32) },
  'XV':   { initialMkg: 0, data: genArithData(4107600, 6746200, 67500, 1, 0, 32) },
  'XVI':  { initialMkg: 0, data: genArithData(4281400, 7031600, 71000, 1, 0, 32) },
  'XVII': { initialMkg: 0, data: genArithData(4462500, 7329000, 74700, 1, 0, 32) },
}

// Golongan yang kenaikan berkalanya tahunan (bukan 2 tahun)
const GOL_ANNUAL = new Set(['IX','X','XI','XII','XIII','XIV','XV','XVI','XVII'])

// ============================================================
// FUNGSI UTAMA
// ============================================================

/**
 * Normalisasi string golongan menjadi format standar (I, II, ..., XVII)
 * Contoh: "IV/a" → "IV", "Gol. IX" → "IX"
 */
/**
 * Normalisasi string golongan menjadi format standar (I, II, ..., XVII)
 * Contoh: "IV/a" → "IV", "Gol. IX" → "IX", "5" → "V"
 */
export function normalizeGolongan(golStr) {
  if (!golStr) return ''
  const str = String(golStr).trim().toUpperCase()

  // Map langsung untuk angka atau penulisan umum
  const directMap = {
    '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
    '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X',
    '11': 'XI', '12': 'XII', '13': 'XIII', '14': 'XIV', '15': 'XV',
    '16': 'XVI', '17': 'XVII'
  }
  if (directMap[str]) return directMap[str]

  // Cari substring Romawi terbesar lebih dulu (XVII, XVI, ..., I)
  const romanPattern = /(XVII|XVI|XV|XIV|XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)/
  const match = str.match(romanPattern)
  if (match) return match[1]

  return str
}

/**
 * Hitung MKG (Masa Kerja Golongan) saat ini
 * @param {string} golongan - Golongan (I, II, ..., XVII)
 * @param {number} yearsOfService - Tahun layanan sejak TMT CPNS
 * @returns {number} - MKG saat ini
 */
export function calculateMkg(golongan, yearsOfService) {
  const gol = TABEL_GAJI[golongan]
  if (!gol) return 0

  const years = Math.max(0, yearsOfService)

  if (GOL_ANNUAL.has(golongan)) {
    // Kenaikan tahunan: MKG = tahun layanan (maks 32)
    return Math.min(Math.floor(years), 32)
  }

  if (golongan === 'V') {
    // Kenaikan khusus: 0→1 setelah 1 tahun, lalu setiap 2 tahun
    if (years < 1) return 0
    const mkg = 1 + Math.floor((years - 1) / 2) * 2
    return Math.min(mkg, 33)
  }

  // Kenaikan 2 tahun: initialMkg + floor(years/2)*2
  const initialMkg = gol.initialMkg || 0
  const mkg = initialMkg + Math.floor(years / 2) * 2
  const maxMkg = golongan === 'I' ? 26 : 27
  return Math.min(mkg, maxMkg)
}

/**
 * Ambil gaji pokok berdasarkan golongan dan MKG
 * @param {string} golongan - Golongan (I, II, ..., XVII)
 * @param {number} mkg - MKG saat ini
 * @returns {number|null} - Gaji pokok dalam rupiah
 */
export function getGajiPokok(golongan, mkg) {
  const gol = TABEL_GAJI[golongan]
  if (!gol) return null

  // Cari MKG tertinggi yang <= mkg yang tersedia dalam tabel
  const validMkgs = Object.keys(gol.data).map(Number).sort((a, b) => a - b)
  let selectedMkg = validMkgs[0]
  for (const m of validMkgs) {
    if (m <= mkg) selectedMkg = m
    else break
  }

  return gol.data[selectedMkg] || null
}

/**
 * Hitung MKG dan Gaji Pokok dari data pegawai (objek item)
 * @param {Object} item - Data pegawai dari store
 * @returns {{ golongan: string, mkg: number, gaji: number|null, yearsOfService: number }}
 */
export function calculateGajiFromItem(item) {
  // Ambil dan normalisasi golongan
  const golRaw = item['GOLONGAN'] || item['GOL AKHIR NAMA'] || item['GOL RUANG'] || ''
  const golongan = normalizeGolongan(golRaw)

  if (!golongan || !TABEL_GAJI[golongan]) {
    return { golongan: golRaw, mkg: 0, gaji: null, yearsOfService: 0 }
  }

  // Parse TMT CPNS jika ada
  const tmtStr = item['TMT CPNS'] || item['AWAL KONTRAK AKTIF'] || ''
  let yearsOfService = 0

  if (tmtStr) {
    let tmtDate = null
    const parts = String(tmtStr).split(/[-/]/)
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        tmtDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      } else if (parts[2].length === 4) {
        tmtDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      }
    }
    if (tmtDate && !isNaN(tmtDate.getTime())) {
      const today = new Date()
      yearsOfService = (today - tmtDate) / (365.25 * 24 * 60 * 60 * 1000)
      if (yearsOfService < 0) yearsOfService = 0
    }
  }

  const mkg = calculateMkg(golongan, yearsOfService)
  const gaji = getGajiPokok(golongan, mkg)

  return { golongan, mkg, gaji, yearsOfService }
}

/**
 * Format angka rupiah tanpa desimal
 * Contoh: 2500000 → "2.500.000"
 */
export function formatRupiah(amount) {
  if (!amount) return ''
  return Number(amount).toLocaleString('id-ID')
}
