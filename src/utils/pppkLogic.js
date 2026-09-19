export const parseDate = (raw) => {
    if (!raw) return null;
    if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

    const str = String(raw).trim();
    if (!str) return null;

    // Clean off time portion if present e.g. "2022-03-01T00:00:00" -> "2022-03-01"
    const cleanStr = str.split(/[T ]/)[0];

    const parts = cleanStr.split(/[-/]/);
    if (parts.length === 3) {
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        const p2 = parseInt(parts[2], 10);

        if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                return new Date(p0, p1 - 1, p2);
            } else if (parts[2].length === 4) {
                // DD-MM-YYYY
                return new Date(p2, p1 - 1, p0);
            }
        }
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
};

export const calculateContractPeriod = (item) => {
    const isParuhWaktu = (item && typeof item === "object" && item["JENIS PPPK"] === "PPPK Paruh Waktu");
    const contractYears = isParuhWaktu ? 1 : 5;
    const thresholdHampirHabis = isParuhWaktu ? 3 : 6;
    
    if (item && typeof item === "object") {
        const manualStatus = item["STATUS KEAKTIFAN PPPK"] || item["STATUS KEDUDUKAN"];
        if (manualStatus === "Meninggal") {
            return { endDateStr: "-", sisaBulan: 0, statusText: "Kontrak Habis", isBup: false, rawDate: new Date() };
        }
    }
    
    // 1. Standard End Date Calculation
    const tmtRaw = item ? (item["AWAL KONTRAK AKTIF"] || item["TMT CPNS"] || "") : "";
    const startDate = parseDate(tmtRaw);
    
    if (!startDate || isNaN(startDate.getTime())) {
        return { endDateStr: "Format Tanggal Invalid", sisaBulan: 999, statusText: "Format Tanggal Invalid" };
    }
    
    let standardEndDate = new Date(startDate);
    standardEndDate.setFullYear(standardEndDate.getFullYear() + contractYears);
    standardEndDate.setDate(standardEndDate.getDate() - 1);
    
    // 2. BUP End Date Calculation
    let bupEndDate = null;
    const tglLahirRaw = item ? (item["TANGGAL LAHIR"] || "") : "";
    const birthDate = parseDate(tglLahirRaw);
    if (birthDate && !isNaN(birthDate.getTime())) {
        const jabatan = (item["JABATAN NAMA"] || "").toLowerCase();
        const bupAge = jabatan.includes("guru") ? 60 : 58;
        
        bupEndDate = new Date(birthDate);
        bupEndDate.setFullYear(bupEndDate.getFullYear() + bupAge);
        bupEndDate.setMonth(bupEndDate.getMonth() + 1);
        bupEndDate.setDate(0); 
    }
    
    // 3. Finalize End Date
    let finalEndDate = standardEndDate;
    let isBup = false;
    
    if (bupEndDate && bupEndDate.getTime() < standardEndDate.getTime()) {
        finalEndDate = bupEndDate;
        isBup = true;
    }
    
    const y = finalEndDate.getFullYear();
    const mStr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][finalEndDate.getMonth()];
    const d = finalEndDate.getDate();
    const endDateStr = `${d} ${mStr} ${y}`;
    
    // 4. Calculate Sisa Bulan
    const today = new Date();
    const diffMonths = (finalEndDate.getFullYear() - today.getFullYear()) * 12 + (finalEndDate.getMonth() - today.getMonth());
    
    let statusText = "Kontrak Masih Berlaku";
    
    if (finalEndDate.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
        statusText = isBup ? "Kontrak Habis (BUP)" : "Kontrak Habis";
    } else if (diffMonths <= thresholdHampirHabis) {
        statusText = "Kontrak Hampir Habis";
    }
    
    return {
        endDateStr,
        sisaBulan: diffMonths,
        statusText,
        isBup,
        rawDate: finalEndDate
    };
};

export const getStatusPppk = (item) => {
    const manualStatus = item["STATUS KEAKTIFAN PPPK"] || item["STATUS KEDUDUKAN"];
    if (manualStatus === "Diberhentikan" || manualStatus === "Meninggal" || manualStatus === "Mengundurkan Diri" || manualStatus === "Tidak Diperpanjang") {
        return "Diberhentikan";
    }

    const contractStatus = calculateContractPeriod(item).statusText;
    
    if (contractStatus === "Kontrak Habis (BUP)") return "Pensiun";
    if (contractStatus === "Kontrak Habis") return "Diberhentikan";
    
    if (contractStatus === "Kontrak Hampir Habis" || contractStatus === "Kontrak Masih Berlaku") {
        return "Aktif";
    }
    
    return "Aktif";
};

export const getKeteranganDiberhentikan = (item) => {
    const ket = item["KETERANGAN DIBERHENTIKAN"];
    if (ket) return ket;
    
    const manualStatus = item["STATUS KEAKTIFAN PPPK"] || item["STATUS KEDUDUKAN"];
    if (manualStatus === "Meninggal") return "Meninggal";
    if (manualStatus === "Mengundurkan Diri") return "Mengundurkan Diri";
    if (manualStatus === "Tidak Diperpanjang") return "Kontrak Tidak Diperpanjang";
    
    const contractStatus = calculateContractPeriod(item).statusText;
    if (contractStatus === "Kontrak Habis") return "Kontrak Tidak Diperpanjang";
    
    return "Diberhentikan";
};

/**
 * Mengembalikan kategori tab untuk seorang pegawai:
 * - 'aktif'             : kontrak masih berlaku / hampir habis
 * - 'akan-pensiun'      : terkena BUP tapi tanggal BUP belum terlewat
 * - 'sudah-pensiun'     : terkena BUP dan tanggal BUP sudah terlewat
 * - 'diberhentikan'     : kontrak habis (bukan karena BUP) atau manual diberhentikan
 */
export const getPegawaiCategory = (item) => {
    const manualStatus = item["STATUS KEAKTIFAN PPPK"] || item["STATUS KEDUDUKAN"];
    if (manualStatus === "Diberhentikan" || manualStatus === "Meninggal" || manualStatus === "Mengundurkan Diri" || manualStatus === "Tidak Diperpanjang") {
        return "diberhentikan";
    }

    const result = calculateContractPeriod(item);
    const { statusText, isBup, rawDate } = result;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isBup) {
        // BUP: cek apakah tanggal pensiun sudah lewat atau belum
        return rawDate && rawDate.getTime() >= today.getTime() ? "akan-pensiun" : "sudah-pensiun";
    }
    if (statusText === "Kontrak Masih Berlaku" || statusText === "Kontrak Hampir Habis") {
        return "aktif";
    }
    if (statusText === "Kontrak Habis") {
        return "diberhentikan";
    }
    // Fallback: anggap aktif
    return "aktif";
};

/**
 * Membersihkan nama unit organisasi dari suffix PEMERINTAH KABUPATEN HSU
 */
export const cleanUnorName = (unorNama) => {
  if (!unorNama) return '-'
  return String(unorNama).replace(/\s*-\s*PEMERINTAH KABUPATEN HULU SUNGAI UTARA$/i, '').trim()
}

/**
 * Mendapatkan Unor Atasan (unit kerja spesifik di bawah induk, misal: SD Negeri A, Puskesmas B, dsb)
 */
export const getUnorAtasan = (unorNama) => {
  const cleaned = cleanUnorName(unorNama)
  if (cleaned === '-') return '-'
  const separator = cleaned.includes(' - ') ? ' - ' : (cleaned.includes('/') ? '/' : null)
  if (!separator) return cleaned
  const parts = cleaned.split(separator).map(s => s.trim()).filter(Boolean)
  if (parts.length <= 1) return parts[0]
  return parts.slice(0, parts.length - 1).join(' - ') || '-'
}

/**
 * Mendapatkan Unor Induk (OPD utama, misal: DINAS PENDIDIKAN DAN KEBUDAYAAN, DINAS KESEHATAN, dsb)
 */
export const getUnorInduk = (unorNama) => {
  const cleaned = cleanUnorName(unorNama)
  if (cleaned === '-') return '-'
  const separator = cleaned.includes(' - ') ? ' - ' : (cleaned.includes('/') ? '/' : null)
  if (!separator) return cleaned
  const parts = cleaned.split(separator).map(s => s.trim()).filter(Boolean)
  return parts[parts.length - 1] || '-'
}

/**
 * Mengelompokkan pegawai ke dalam 3 rumpun:
 * - Tenaga Guru
 * - Tenaga Kesehatan
 * - Tenaga Teknis
 */
export function getKelompokPegawai(item) {
  if (!item) return 'Tenaga Teknis'
  const jabatan = String(item['JABATAN NAMA'] || item['JABATAN'] || '').toLowerCase().trim()

  // 1. Tenaga Guru
  if (
    jabatan.includes('guru') ||
    jabatan.includes('tutor') ||
    jabatan.includes('pamong') ||
    jabatan.includes('pengawas sekolah') ||
    jabatan.includes('penilik') ||
    jabatan.includes('widyaprada')
  ) {
    return 'Tenaga Guru'
  }

  // 2. Tenaga Kesehatan (30 Rumpun Jabatan Fungsional Kesehatan Permenpan-RB / Kemenkes)
  const nakesKeywords = [
    'dokter',
    'perawat',
    'bidan',
    'apoteker',
    'farmasi',
    'nutrisionis',
    'dietisien',
    'gizi',
    'terapis',
    'gigi',
    'sanitarian',
    'sanitasi',
    'epidemiolog',
    'entomolog',
    'radiografer',
    'radioterapi',
    'fisioterapis',
    'fisioterapi',
    'perekam medis',
    'rekam medis',
    'analis kesehatan',
    'laboratorium kesehatan',
    'laboratorium medik',
    'pranata laboratorium',
    'elektromedis',
    'refraksionis',
    'optisien',
    'optometris',
    'ortotis',
    'prostetis',
    'akupunktur',
    'transfusi',
    'kardiovaskuler',
    'anestesi',
    'fisikawan medis',
    'psikolog klinis',
    'adminkes',
    'administrator kesehatan',
    'promosi kesehatan',
    'promkes',
    'penyuluh kesehatan',
    'pembimbing kesehatan kerja',
    'tenaga kesehatan',
    'medis'
  ]

  const isNakes = nakesKeywords.some(keyword => jabatan.includes(keyword))
  if (isNakes) {
    return 'Tenaga Kesehatan'
  }

  // 3. Tenaga Teknis
  return 'Tenaga Teknis'
}

/**
 * Menentukan nama subfolder penyimpanan dokumen Google Drive untuk per-pegawai:
 * Default: Unor Induk saja.
 * PENGECUALIAN:
 * 1. Jika Tenaga Guru -> masuk ke folder 'Guru' (bukan ke Dinas Pendidikan)
 * 2. Jika Unit Organisasi mengandung 'Rumah Sakit' / 'RSUD' -> masuk ke folder 'RUMAH SAKIT UMUM DAERAH PAMBALAH BATUNG' (bukan ke Dinas Kesehatan)
 * 3. Jika Unit Organisasi mengandung 'Puskesmas' -> masuk ke folder 'Dinas Kesehatan'
 * 4. Jika Unit Organisasi mengandung 'Kecamatan' atau 'Kelurahan' -> masuk ke folder 'KECAMATAN DAN KELURAHAN'
 */
export function getDriveFolderName(item) {
  if (!item) return 'Umum'
  const unorNama = String(item['UNOR NAMA'] || item['UNIT KERJA'] || '')
  const unorLower = unorNama.toLowerCase()
  const kelompok = getKelompokPegawai(item)

  // 1. Tenaga Guru -> folder 'Guru' (bukan ke Dinas Pendidikan)
  if (kelompok === 'Tenaga Guru') {
    return 'Guru'
  }

  // 2. Rumah Sakit -> folder 'RUMAH SAKIT UMUM DAERAH PAMBALAH BATUNG' (bukan ke Dinas Kesehatan)
  if (unorLower.includes('rumah sakit') || unorLower.includes('rsud')) {
    return 'RUMAH SAKIT UMUM DAERAH PAMBALAH BATUNG'
  }

  // 3. Puskesmas -> folder 'Dinas Kesehatan'
  if (unorLower.includes('puskesmas')) {
    return 'Dinas Kesehatan'
  }

  // 4. Kecamatan atau Kelurahan -> folder 'KECAMATAN DAN KELURAHAN'
  if (unorLower.includes('kecamatan') || unorLower.includes('kelurahan')) {
    return 'KECAMATAN DAN KELURAHAN'
  }

  // 5. Default: Unor Induk
  const induk = getUnorInduk(unorNama)
  return induk && induk !== '-' ? induk : 'Umum'
}
