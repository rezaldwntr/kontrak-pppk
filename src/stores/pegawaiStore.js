import { defineStore } from 'pinia'
import { db, savePegawaiChunks } from '../services/firebase'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import LZString from 'lz-string'
import { initialMockData } from '../utils/mockData'
import { toRoman, cleanNomorKontrakTag } from '../utils/pppkLogic'

export const usePegawaiStore = defineStore('pegawai', {
  state: () => ({
    pppkData: [],
    extensionHistory: [],
    isLoading: false,
    filterDashboard: 'all',
    showImportModal: false,
    showImportNomorKontrakModal: false,
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
      
      const ensurePnsId = (dataArray) => {
        if (!Array.isArray(dataArray)) return [];
        return dataArray.map(item => {
          if (!item['PNS ID']) {
            item['PNS ID'] = item['NIP BARU'] || `TEMP-${Math.random().toString(36).substr(2, 9)}`
          }
          return item;
        });
      };

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
                    this.pppkData = ensurePnsId(decompressed ? JSON.parse(decompressed) : []);
                  } catch (err) {
                    console.error("Error loading chunks:", err);
                    this.pppkData = ensurePnsId([...initialMockData]);
                  } finally {
                    this.isLoading = false;
                  }
                })();
                return; // wait for async completion
              } else if (data.payload) {
                const decompressed = LZString.decompressFromUTF16(data.payload)
                this.pppkData = ensurePnsId(JSON.parse(decompressed))
              }
            } else if (data.jsonString) {
              this.pppkData = ensurePnsId(JSON.parse(data.jsonString))
            } else {
              this.pppkData = ensurePnsId([...initialMockData])
            }
          } else {
            this.pppkData = ensurePnsId([...initialMockData])
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
        const index = this.pppkData.findIndex(item => 
          (item['PNS ID'] && item['PNS ID'] === updatedItem['PNS ID']) || 
          (item['NIP BARU'] && item['NIP BARU'] === updatedItem['NIP BARU'])
        )
        if (index !== -1) {
          this.pppkData[index] = { ...updatedItem }
          await this.saveAllPegawai()
        } else {
          console.error("Item not found for update:", updatedItem)
          throw new Error("Pegawai tidak ditemukan dalam data internal.");
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
      // Jeda agar UI bisa merender animasi loading sebelum proses synchronous berat dimulai
      await new Promise(resolve => setTimeout(resolve, 50))
      await savePegawaiChunks(this.pppkData)
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
              tmtBaru: formData.newTmtDate,
              keterangan: isSingle ? 'Perpanjangan Individu' : 'Perpanjangan Otomatis'
            })
            
            // Buat atau perbarui riwayat kontrak multi-periode
            const currentHistory = Array.isArray(item.RIWAYAT_KONTRAK) ? [...item.RIWAYAT_KONTRAK] : []
            if (currentHistory.length === 0) {
              currentHistory.push({
                periode: 1,
                jenis: 'Kontrak Pertama (Awal)',
                nomorKontrak: cleanNomorKontrakTag(item['NOMOR KONTRAK AKTIF'] || item['NOMOR KONTRAK BARU'] || item['NO_KONTRAK'] || ''),
                nomorSk: item['NOMOR SK CPNS'] || '',
                tanggalSk: item['TANGGAL SK CPNS'] || '',
                tmtAwal: item['TMT CPNS'] || oldTmt,
                tmtAkhir: item['AKHIR KONTRAK AKTIF'] || ''
              })
            }
            const nextPeriodNum = currentHistory.length + 1
            const newNomorKontrak = isSingle ? cleanNomorKontrakTag(formData.nomorKontrakBaru || '') : ''
            currentHistory.push({
              periode: nextPeriodNum,
              jenis: `Perpanjangan ${toRoman(nextPeriodNum - 1)}`,
              nomorKontrak: newNomorKontrak,
              nomorSk: isSingle ? (formData.nomorSk || '') : '',
              tanggalSk: isSingle ? (formData.tanggalSk || '') : '',
              tmtAwal: formData.newTmtDate,
              tmtAkhir: (isSingle && formData.tanggalAkhir) ? formData.tanggalAkhir : ''
            })

            const updatedItem = {
              ...item,
              'AWAL KONTRAK AKTIF': formData.newTmtDate,
              'NOMOR KONTRAK AKTIF': newNomorKontrak,
              'NOMOR SK PERPANJANGAN': isSingle ? (formData.nomorSk || '') : '',
              'TANGGAL SK PERPANJANGAN': isSingle ? (formData.tanggalSk || '') : '',
              STATUS_PERPANJANGAN: 'Selesai Diperpanjang',
              'STATUS KEAKTIFAN PPPK': 'Aktif',
              FORCE_AKTIF: true,
              RIWAYAT_KONTRAK: currentHistory
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
        await this.saveAllPegawai()
        
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
    },
    async cancelExtension(historyItem, index) {
      this.isLoading = true
      try {
        const dateNow = new Date().toISOString()
        
        // Revert TMT on the specific Pegawai
        const pIndex = this.pppkData.findIndex(p => 
          (p['PNS ID'] && p['PNS ID'] === historyItem.id) ||
          (p['NIP BARU'] && p['NIP BARU'] === historyItem.nip)
        )
        if (pIndex !== -1) {
          const emp = this.pppkData[pIndex]
          emp['AWAL KONTRAK AKTIF'] = historyItem.kontrakLama
          delete emp['FORCE_AKTIF']
          delete emp['STATUS_PERPANJANGAN']
          
          // Revert riwayat kontrak terakhir
          if (Array.isArray(emp.RIWAYAT_KONTRAK) && emp.RIWAYAT_KONTRAK.length > 1) {
            emp.RIWAYAT_KONTRAK.pop()
            const prev = emp.RIWAYAT_KONTRAK[emp.RIWAYAT_KONTRAK.length - 1]
            emp['NOMOR KONTRAK AKTIF'] = prev?.nomorKontrak || ''
            emp['NOMOR SK PERPANJANGAN'] = prev?.nomorSk || ''
            emp['TANGGAL SK PERPANJANGAN'] = prev?.tanggalSk || ''
          }
        }

        // Remove from history
        this.extensionHistory.splice(index, 1)

        // Save Pegawai data
        await this.saveAllPegawai()
        
        // Save History
        const historyRef = doc(db, 'database', 'riwayat')
        await setDoc(historyRef, {
          jsonString: JSON.stringify(this.extensionHistory),
          lastUpdated: dateNow
        })
      } catch (error) {
        console.error("Cancel extension error:", error)
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
