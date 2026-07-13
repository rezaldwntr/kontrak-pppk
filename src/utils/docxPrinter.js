import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Helper function to convert base64 to binary string
const base64ToBinaryString = (base64) => {
  const binary_string = window.atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

const enforcePageSizeProps = (rawXml, propsString) => {
  const sectPrRegex = /<w:sectPr[^>]*>([\s\S]*?)<\/w:sectPr>/g;
  let matches = [...rawXml.matchAll(sectPrRegex)];
  
  if (matches.length > 0) {
      let modifiedXml = rawXml;
      for (let match of matches) {
          const innerContent = match[1];
          let modifiedInner = innerContent.replace(/<w:pgSz[^>]*>/g, '');
          modifiedInner = modifiedInner.replace(/<w:pgMar[^>]*>/g, '');
          
          modifiedXml = modifiedXml.replace(match[0], `<w:sectPr>${propsString}${modifiedInner}</w:sectPr>`);
      }
      return modifiedXml;
  }
  return rawXml;
}

export const printDocx = async (pegawai, options = {}) => {
  const {
    paperSize = 'f4', // 'f4' or 'a4'
    scope = 'all', // 'all', 'perjanjian', or 'tandatangan'
    tglKontrak = new Date().toISOString().split('T')[0]
  } = options

  try {
    // Determine which template to fetch based on Jenis PPPK and paperSize
    let isParuhWaktu = (pegawai['JENIS PEGAWAI NAMA'] === 'PPPK Paruh Waktu')
    let templateKey = isParuhWaktu ? `template_paruh_${paperSize}` : `template_${paperSize}`

    // Fetch template from Firestore Config
    const configRef = doc(db, 'config', 'templates')
    const configSnap = await getDoc(configRef)
    
    let base64Template = null
    if (configSnap.exists()) {
      base64Template = configSnap.data()[templateKey]
    }

    if (!base64Template) {
       throw new Error(`Template ${templateKey} belum diatur di Pengaturan. Silakan upload template terlebih dahulu.`)
    }

    // Extract base64 part if it contains data uri prefix
    if (base64Template.includes(',')) {
        base64Template = base64Template.split(',')[1]
    }

    const zip = new PizZip(base64ToBinaryString(base64Template))
    
    // Page Size Enforcement (F4 / A4)
    let docXml = zip.file("word/document.xml").asText();
    if (paperSize === "f4") {
        const f4Props = '<w:pgSz w:w="12240" w:h="20160"/><w:pgMar w:top="850" w:right="850" w:bottom="2551" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>';
        docXml = enforcePageSizeProps(docXml, f4Props);
    } else if (paperSize === "a4") {
        const a4Props = '<w:pgSz w:w="11906" w:h="16838"/>';
        docXml = enforcePageSizeProps(docXml, a4Props);
    }

    // Prepare data context
    let dataContext = { ...pegawai }
    
    // Add computed fields
    dataContext.TGL_KONTRAK = tglKontrak
    
    // Scope Logic: we simulate by setting boolean tags so docxtemplater can show/hide sections
    if (scope === 'all') {
      dataContext.perjanjian = true
      dataContext.tandatangan = true
    } else if (scope === 'perjanjian') {
      dataContext.perjanjian = true
      dataContext.tandatangan = false
    } else if (scope === 'tandatangan') {
      dataContext.perjanjian = false
      dataContext.tandatangan = true
    }

    // Apply modified XML back to zip
    zip.file("word/document.xml", docXml);

    const docx = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    docx.render(dataContext)

    const blob = docx.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    const fileName = `Perjanjian_Kerja_${pegawai['NAMA'].replace(/\s+/g, '_')}_${pegawai['NIP BARU']}.docx`
    saveAs(blob, fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error("Print Error:", error)
    throw error
  }
}
