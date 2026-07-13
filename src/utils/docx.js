import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'

export const printDocx = async (data, templatePath = '/assets/template_spk.docx') => {
  try {
    // Note: ensure the template is placed in public/assets or fetched properly
    const response = await fetch(templatePath)
    if (!response.ok) {
      throw new Error(`Failed to load template from ${templatePath}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    
    const zip = new PizZip(arrayBuffer)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })
    
    // Formatting data for template
    const templateData = {
      ...data,
      // Add custom computed fields here if needed by the template
      NAMA_LENGKAP: (data['GELAR DEPAN'] && data['GELAR DEPAN'] !== '-' ? data['GELAR DEPAN'] + ' ' : '') + 
                    data['NAMA'] + 
                    (data['GELAR BELAKANG'] && data['GELAR BELAKANG'] !== '-' ? ', ' + data['GELAR BELAKANG'] : ''),
      TANGGAL_CETAK: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    doc.render(templateData)
    
    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    
    saveAs(out, `SPK_${data['NAMA']}_${data['NIP BARU']}.docx`)
  } catch (error) {
    console.error("Error generating DOCX:", error)
    alert("Gagal mencetak dokumen. Pastikan template tersedia.")
  }
}
