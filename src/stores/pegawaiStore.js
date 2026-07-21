import { defineStore } from 'pinia'
import { db } from '../services/firebase'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import LZString from 'lz-string'
import { initialMockData } from '../utils/mockData'

export const usePegawaiStore = defineStore('pegawai', {
  state: () => ({
    pppkData: [],
    extensionHistory: [],
    isLoading: false,
    filterDashboard: 'all',
    showImportModal: false,
  }),
  actions: {
    async deleteAllPegawai() {
      this.isLoading = true
      try {
        this.pppkData = []
        await this.saveAllPegawai()
      } catch (error) {
        console.error("Delete all error:", error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    loadData() {
      if (this.isLoading) return
      this.isLoading = true
      
      try {
        const docRef = doc(db, 'database', 'pegawai')
        // Use real-time listener instead of getDoc
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.compressed) {
              if (data.numChunks) {
                let fullCompressed = "";
                (async () => {
                  try {
                    for (let i = 0; i < data.numChunks; i++) {
                      const chunkRef = doc(db, 'database', 'pegawai_chunk_' + i);
                      const chunkSnap = await getDoc(chunkRef);
                      if (chunkSnap.exists()) {
                        fullCompressed += chunkSnap.data().payload || "";
                      }
                    }
                    const decompressed = LZString.decompressFromUTF16(fullCompressed);
                    this.pppkData = decompressed ? JSON.parse(decompressed) : [];
                  } catch (err) {
                    console.error("Error loading chunks:", err);
                    this.pppkData = [...initialMockData];
                  } finally {
                    this.isLoading = false;
                  }
                })();
                return; // wait for async completion
              } else if (data.payload) {
                const decompressed = LZString.decompressFromUTF16(data.payload)
                this.pppkData = JSON.parse(decompressed)
              }
            } else if (data.jsonString) {
              this.pppkData = JSON.parse(data.jsonString)
            } else {
              this.pppkData = [...initialMockData]
            }
          } else {
            this.pppkData = [...initialMockData]
          }
          this.isLoading = false
        }, (error) => {
          console.error("Error listening to pegawai:", error)
          this.isLoading = false
        })
        
        // Load History real-time
        const historyRef = doc(db, 'database', 'riwayat')
        onSnapshot(historyRef, (historySnap) => {
          if (historySnap.exists()) {
            const data = historySnap.data()
            if (data.jsonString) {
              this.extensionHistory = JSON.parse(data.jsonString)
            } else {
               this.extensionHistory = []
            }
          } else {
            this.extensionHistory = []
          }
        }, (error) => {
          console.error("Error listening to riwayat:", error)
        })
        
      } catch(e) {
        console.error("Error setting up listeners:", e)
        this.pppkData = [...initialMockData]
        this.extensionHistory = []
        this.isLoading = false
      }
    },
    setFilterDashboard(filter) {
      this.filterDashboard = filter
    },
    async deletePegawai(nipBaru) {
      try {
        this.pppkData = this.pppkData.filter(item => item['NIP BARU'] !== nipBaru)
        await this.saveAllPegawai()
      } catch (error) {
        console.error("Delete error:", error)
        throw error
      }
    },
    async updatePegawai(updatedItem) {
      try {
        const index = this.pppkData.findIndex(item => item['PNS ID'] === updatedItem['PNS ID'])
        if (index !== -1) {
          this.pppkData[index] = { ...updatedItem }
          await this.saveAllPegawai()
        }
      } catch (error) {
        console.error("Update error:", error)
        throw error
      }
    },
    async batchDelete(nips) {
      this.isLoading = true
      try {
        this.pppkData = this.pppkData.filter(item => !nips.includes(item['NIP BARU']))
        await this.saveAllPegawai()
      } catch (error) {
        console.error("Batch Delete error:", error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async saveAllPegawai() {
      const dateNow = new Date().toISOString()
      const pegawaiRef = doc(db, 'database', 'pegawai')
      
      // Jeda agar UI bisa merender animasi loading sebelum proses synchronous berat dimulai
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const pegawaiJson = JSON.stringify(this.pppkData)
      
      await new Promise(resolve => setTimeout(resolve, 50))
      const compressed = LZString.compressToUTF16(pegawaiJson)
      const chunkSize = 250000;
      const numChunks = Math.ceil(compressed.length / chunkSize);
      
      for (let i = 0; i < numChunks; i++) {
        const chunkRef = doc(db, 'database', 'pegawai_chunk_' + i);
        await setDoc(chunkRef, {
          payload: compressed.substring(i * chunkSize, (i + 1) * chunkSize)
        })
      }
      
      await setDoc(pegawaiRef, {
        compressed: true,
        numChunks: numChunks,
        lastUpdated: dateNow
      })
    },
    async batchExtend(selectedIds, formData) {
      this.isLoading = true
      try {
        const dateNow = new Date().toISOString()
        const historyEntries = []
        const isSingle = selectedIds.length === 1
        
        // Process local data
        this.pppkData = this.pppkData.map(item => {
          if (selectedIds.includes(item['PNS ID'])) {
            const oldTmt = item['AWAL KONTRAK AKTIF'] || item['TMT CPNS'] || ''
            // Log history
            historyEntries.push({
              id: item['PNS ID'],
              nama: item['NAMA'],
              nip: item['NIP BARU'],
              tglDiperpanjang: dateNow,
              kontrakLama: oldTmt,
              keterangan: isSingle ? 'Perpanjangan Individu' : 'Perpanjangan Otomatis'
            })
            
            const updatedItem = {
              ...item,
              'AWAL KONTRAK AKTIF': formData.newTmtDate,
              'NOMOR KONTRAK AKTIF': isSingle ? (formData.nomorKontrakBaru || '') : '',
              'NOMOR SK PERPANJANGAN': isSingle ? (formData.nomorSk || '') : '',
              'TANGGAL SK PERPANJANGAN': isSingle ? (formData.tanggalSk || '') : '',
              STATUS_PERPANJANGAN: 'Selesai Diperpanjang',
              'STATUS KEAKTIFAN PPPK': 'Aktif',
              FORCE_AKTIF: true
            }
            
            if (isSingle && formData.gajiPokok) {
              updatedItem['GAJI POKOK SAAT INI'] = formData.gajiPokok
            }
            if (isSingle && formData.tanggalAkhir) {
              updatedItem['AKHIR KONTRAK AKTIF'] = formData.tanggalAkhir
            }
            
            return updatedItem
          }
          return item
        })
        
        this.extensionHistory = [...historyEntries, ...this.extensionHistory]
        
        // Save to Firestore
        const pegawaiRef = doc(db, 'database', 'pegawai')
        const pegawaiJson = JSON.stringify(this.pppkData)
        const compressed = LZString.compressToUTF16(pegawaiJson)
        const chunkSize = 250000;
        const numChunks = Math.ceil(compressed.length / chunkSize);
        
        for (let i = 0; i < numChunks; i++) {
          const chunkRef = doc(db, 'database', 'pegawai_chunk_' + i);
          await setDoc(chunkRef, {
            payload: compressed.substring(i * chunkSize, (i + 1) * chunkSize)
          })
        }
        
        await setDoc(pegawaiRef, {
          compressed: true,
          numChunks: numChunks,
          lastUpdated: dateNow
        })
        
        const historyRef = doc(db, 'database', 'riwayat')
        await setDoc(historyRef, {
          jsonString: JSON.stringify(this.extensionHistory),
          lastUpdated: dateNow
        })
        
        return { success: true, count: selectedIds.length }
      } catch (error) {
        console.error("Batch extend error:", error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  },
  getters: {
    totalPegawai: (state) => state.pppkData.length,
    filteredDashboardData: (state) => {
      return state.pppkData.filter(item => {
        const itemJenis = item["JENIS PPPK"] || "PPPK"
        return state.filterDashboard === "all" || itemJenis === state.filterDashboard
      })
    },
    // We can add other dashboard getters here (e.g. komposisiJabatan, statusPerpanjangan)
  }
})
