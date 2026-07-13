import { defineStore } from 'pinia'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import LZString from 'lz-string'
import { initialMockData } from '../utils/mockData'

export const usePegawaiStore = defineStore('pegawai', {
  state: () => ({
    pppkData: [],
    extensionHistory: [],
    isLoading: false,
    filterDashboard: 'all',
  }),
  actions: {
    async loadData() {
      this.isLoading = true
      try {
        const docRef = doc(db, 'database', 'pegawai')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.compressed) {
            const decompressed = LZString.decompressFromUTF16(data.payload)
            this.pppkData = JSON.parse(decompressed)
          } else if (data.jsonString) {
            this.pppkData = JSON.parse(data.jsonString)
          } else {
            this.pppkData = [...initialMockData]
          }
        } else {
          this.pppkData = [...initialMockData]
        }
        
        // Load History
        const historyRef = doc(db, 'database', 'riwayat')
        const historySnap = await getDoc(historyRef)
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
      } catch(e) {
        console.error("Error loading data:", e)
        this.pppkData = [...initialMockData]
        this.extensionHistory = []
      } finally {
        this.isLoading = false
      }
    },
    setFilterDashboard(filter) {
      this.filterDashboard = filter
    }
  },
  getters: {
    totalPegawai: (state) => state.pppkData.length,
    filteredDashboardData: (state) => {
      return state.pppkData.filter(item => {
        const itemJenis = item["JENIS PEGAWAI NAMA"] || "PPPK"
        return state.filterDashboard === "all" || itemJenis === state.filterDashboard
      })
    },
    // We can add other dashboard getters here (e.g. komposisiJabatan, statusPerpanjangan)
  }
})
