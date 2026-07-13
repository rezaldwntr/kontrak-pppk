import * as XLSX from 'xlsx'

export const exportToExcel = (data, filename = 'Data_PPPK.xlsx') => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor.")
    return
  }

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data)
  
  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Pegawai")
  
  // Export
  XLSX.writeFile(wb, filename)
}
