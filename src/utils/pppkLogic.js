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
    const tmtRaw = item ? (item["TMT CPNS"] || item["AWAL KONTRAK AKTIF"] || "") : "";
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
    if (manualStatus === "Meninggal") return "Meninggal";
    
    if (manualStatus === "Aktif" && item["FORCE_AKTIF"]) {
        return "Aktif";
    }
    
    const contractStatus = calculateContractPeriod(item).statusText;
    if (contractStatus === "Kontrak Habis (BUP)") return "Pensiun";
    if (contractStatus === "Kontrak Habis") return "Tidak Diperpanjang";
    
    if (contractStatus === "Kontrak Hampir Habis" || contractStatus === "Kontrak Masih Berlaku") {
        return "Aktif";
    }
    
    return manualStatus || "Aktif";
};
