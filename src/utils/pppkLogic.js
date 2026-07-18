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
    const tmtStr = (item && item["TMT CPNS"]) ? item["TMT CPNS"] : "";
    let startDate = null;
    const parts = tmtStr.split(/[-/]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) startDate = new Date(parts[0], parts[1]-1, parts[2]);
        else if (parts[2].length === 4) startDate = new Date(parts[2], parts[1]-1, parts[0]);
    }
    
    if (!startDate || isNaN(startDate.getTime())) {
        return { endDateStr: "Format Tanggal Invalid", sisaBulan: 999, statusText: "Format Tanggal Invalid" };
    }
    
    let standardEndDate = new Date(startDate);
    standardEndDate.setFullYear(standardEndDate.getFullYear() + contractYears);
    standardEndDate.setDate(standardEndDate.getDate() - 1);
    
    // 2. BUP End Date Calculation
    let bupEndDate = null;
    const tglLahirStr = (item && item["TANGGAL LAHIR"]) ? item["TANGGAL LAHIR"] : "";
    if (tglLahirStr) {
        let birthDate = null;
        const bParts = tglLahirStr.split(/[-/]/);
        if (bParts.length === 3) {
            if (bParts[0].length === 4) birthDate = new Date(bParts[0], bParts[1]-1, bParts[2]);
            else if (bParts[2].length === 4) birthDate = new Date(bParts[2], bParts[1]-1, bParts[0]);
        }
        
        if (birthDate && !isNaN(birthDate.getTime())) {
            const jabatan = (item["JABATAN NAMA"] || "").toLowerCase();
            const bupAge = jabatan.includes("guru") ? 60 : 58;
            
            bupEndDate = new Date(birthDate);
            bupEndDate.setFullYear(bupEndDate.getFullYear() + bupAge);
            bupEndDate.setMonth(bupEndDate.getMonth() + 1);
            bupEndDate.setDate(0); 
        }
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
