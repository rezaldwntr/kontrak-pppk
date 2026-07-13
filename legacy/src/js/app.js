// Override native alert with custom app modal
window.appAlert = function(message) {
    const alertModal = document.getElementById("app-alert-modal");
    const alertMessage = document.getElementById("app-alert-message");
    
    if (alertModal && alertMessage) {
        alertMessage.innerText = message;
        alertModal.classList.add("open");
    } else {
        // Fallback to console if DOM not ready
        console.log("ALERT:", message);
    }
};

// Custom confirm modal (Returns Promise)
window.appConfirm = function(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("app-confirm-modal");
        const msgEl = document.getElementById("app-confirm-message");
        const btnOk = document.getElementById("btn-execute-app-confirm");
        const btnCancel = document.getElementById("btn-cancel-app-confirm");
        
        if (!modal || !msgEl || !btnOk || !btnCancel) {
            resolve(confirm(message)); // Fallback
            return;
        }
        
        msgEl.innerText = message;
        
        const cleanup = () => {
            modal.classList.remove("open");
            btnOk.removeEventListener("click", onOk);
            btnCancel.removeEventListener("click", onCancel);
        };
        
        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };
        
        btnOk.addEventListener("click", onOk);
        btnCancel.addEventListener("click", onCancel);
        
        modal.classList.add("open");
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const btnCloseAlert = document.getElementById("btn-close-app-alert");
    if (btnCloseAlert) {
        btnCloseAlert.addEventListener("click", () => {
            document.getElementById("app-alert-modal").classList.remove("open");
        });
    }
});

// Mock Initial Data representing the 70+ columns of PPPK Profile
const initialMockData = [
    {
        "PNS ID": "A827391823901",
        "NIP BARU": "199405122021071002",
        "NIP LAMA": "-",
        "NAMA": "ARIEF SETIAWAN",
        "GELAR DEPAN": "S.Kom.",
        "GELAR BELAKANG": "M.T.",
        "TEMPAT LAHIR ID": "3171",
        "TEMPAT LAHIR NAMA": "JAKARTA PUSAT",
        "TANGGAL LAHIR": "1994-05-12",
        "JENIS KELAMIN": "L",
        "AGAMA ID": "1",
        "AGAMA NAMA": "ISLAM",
        "JENIS KAWIN ID": "1",
        "JENIS KAWIN NAMA": "KAWIN",
        "NIK": "3171021205940003",
        "NOMOR HP": "081234567890",
        "EMAIL": "arief.setiawan@gmail.com",
        "EMAIL GOV": "arief.setiawan@jakarta.go.id",
        "ALAMAT": "Jl. Merdeka Barat No. 15, Gambir, Jakarta Pusat",
        "NPWP NOMOR": "48.123.456.7-012.000",
        "BPJS": "0001234567890",
        "JENIS PEGAWAI ID": "2",
        "JENIS PEGAWAI NAMA": "PPPK",
        "KEDUDUKAN HUKUM ID": "1",
        "KEDUDUKAN HUKUM NAMA": "AKTIF",
        "STATUS CPNS PNS": "PPPK",
        "KARTU ASN VIRTUAL": "ASN-V-19940512",
        "NOMOR SK CPNS": "800/102/PPPK/2021",
        "TANGGAL SK CPNS": "2021-07-01",
        "TMT CPNS": "2021-07-15", // This makes contract end in July 2026 (soon!)
        "NOMOR SK PNS": "-",
        "TANGGAL SK PNS": "-",
        "TMT PNS": "-",
        "GOL AWAL ID": "IX",
        "GOL AWAL NAMA": "Golongan IX",
        "GOL AKHIR ID": "IX",
        "GOL AKHIR NAMA": "Golongan IX",
        "TMT GOLONGAN": "2021-07-15",
        "MK TAHUN": 5,
        "MK BULAN": 0,
        "JENIS JABATAN ID": "2",
        "JENIS JABATAN NAMA": "FUNGSIONAL",
        "JABATAN ID": "J0192",
        "JABATAN NAMA": "PRANATA KOMPUTER AHLI PERTAMA",
        "TMT JABATAN": "2021-07-15",
        "TINGKAT PENDIDIKAN ID": "S2",
        "TINGKAT PENDIDIKAN NAMA": "PASCA SARJANA",
        "PENDIDIKAN ID": "P1029",
        "PENDIDIKAN NAMA": "TEKNOLOGI INFORMASI",
        "TAHUN LULUS": 2018,
        "KPKN ID": "K012",
        "KPKN NAMA": "KPKN JAKARTA I",
        "LOKASI KERJA ID": "L3171",
        "LOKASI KERJA NAMA": "BALAI KOTA DKI JAKARTA",
        "UNOR ID": "U9810",
        "UNOR NAMA": "DINAS KOMUNIKASI, INFORMATIKA DAN STATISTIK - BAGIAN PENGEMBANGAN SISTEM INFORMASI",
        "INSTANSI INDUK ID": "I3100",
        "INSTANSI INDUK NAMA": "PEMERINTAH PROVINSI DKI JAKARTA",
        "INSTANSI KERJA ID": "I3100",
        "INSTANSI KERJA NAMA": "PEMERINTAH PROVINSI DKI JAKARTA",
        "SATUAN KERJA INDUK ID": "S091",
        "SATUAN KERJA INDUK NAMA": "SEKRETARIAT DAERAH",
        "SATUAN KERJA KERJA ID": "S095",
        "SATUAN KERJA KERJA NAMA": "BAGIAN PENGEMBANGAN SISTEM INFORMASI",
        "IS VALID NIK": "YA",
        "NAMA SEKOLAH": "UNIVERSITAS INDONESIA",
        "FLAG IKD": "1",
        "GAJI": "",
        "NOMOR_KONTRAK": "SPK/9801/DISKOMINFO/2021",
        "STATUS_PERPANJANGAN": "Belum Diproses"
    },
    {
        "PNS ID": "A827391823902",
        "NIP BARU": "199108242021081001",
        "NIP LAMA": "-",
        "NAMA": "DIAN PRATIWI",
        "GELAR DEPAN": "Dr.",
        "GELAR BELAKANG": "S.H., M.H.",
        "TEMPAT LAHIR ID": "3578",
        "TEMPAT LAHIR NAMA": "SURABAYA",
        "TANGGAL LAHIR": "1991-08-24",
        "JENIS KELAMIN": "P",
        "AGAMA ID": "1",
        "AGAMA NAMA": "ISLAM",
        "JENIS KAWIN ID": "1",
        "JENIS KAWIN NAMA": "KAWIN",
        "NIK": "3578022408910005",
        "NOMOR HP": "081299998888",
        "EMAIL": "dian.pratiwi@gmail.com",
        "EMAIL GOV": "dian.pratiwi@surabaya.go.id",
        "ALAMAT": "Jl. Dharmahusada Indah No. 45, Surabaya",
        "NPWP NOMOR": "48.987.654.3-012.000",
        "BPJS": "0005432109876",
        "JENIS PEGAWAI ID": "2",
        "JENIS PEGAWAI NAMA": "PPPK",
        "KEDUDUKAN HUKUM ID": "1",
        "KEDUDUKAN HUKUM NAMA": "AKTIF",
        "STATUS CPNS PNS": "PPPK",
        "KARTU ASN VIRTUAL": "ASN-V-19910824",
        "NOMOR SK CPNS": "800/215/PPPK/2021",
        "TANGGAL SK CPNS": "2021-08-01",
        "TMT CPNS": "2021-08-15", // Contract end August 2026 (soon!)
        "NOMOR SK PNS": "-",
        "TANGGAL SK PNS": "-",
        "TMT PNS": "-",
        "GOL AWAL ID": "X",
        "GOL AWAL NAMA": "Golongan X",
        "GOL AKHIR ID": "X",
        "GOL AKHIR NAMA": "Golongan X",
        "TMT GOLONGAN": "2021-08-15",
        "MK TAHUN": 5,
        "MK BULAN": 0,
        "JENIS JABATAN ID": "2",
        "JENIS JABATAN NAMA": "FUNGSIONAL",
        "JABATAN ID": "J0195",
        "JABATAN NAMA": "PERANCANG PERATURAN PERUNDANG-UNDANGAN AHLI PERTAMA",
        "TMT JABATAN": "2021-08-15",
        "TINGKAT PENDIDIKAN ID": "S3",
        "TINGKAT PENDIDIKAN NAMA": "DOKTOR",
        "PENDIDIKAN ID": "P1098",
        "PENDIDIKAN NAMA": "ILMU HUKUM",
        "TAHUN LULUS": 2020,
        "KPKN ID": "K018",
        "KPKN NAMA": "KPKN SURABAYA I",
        "LOKASI KERJA ID": "L3578",
        "LOKASI KERJA NAMA": "KANTOR WALIKOTA SURABAYA",
        "UNOR ID": "U9815",
        "UNOR NAMA": "SEKRETARIAT DAERAH - BAGIAN HUKUM DAN ORGANISASI",
        "INSTANSI INDUK ID": "I3500",
        "INSTANSI INDUK NAMA": "PEMERINTAH KOTA SURABAYA",
        "INSTANSI KERJA ID": "I3500",
        "INSTANSI KERJA NAMA": "PEMERINTAH KOTA SURABAYA",
        "SATUAN KERJA INDUK ID": "S091",
        "SATUAN KERJA INDUK NAMA": "SEKRETARIAT DAERAH",
        "SATUAN KERJA KERJA ID": "S099",
        "SATUAN KERJA KERJA NAMA": "SUB BAGIAN BANTUAN HUKUM",
        "IS VALID NIK": "YA",
        "NAMA SEKOLAH": "UNIVERSITAS AIRLANGGA",
        "FLAG IKD": "1",
        "GAJI": "",
        "NOMOR_KONTRAK": "SPK/4405/HUKUM/2021",
        "STATUS_PERPANJANGAN": "Belum Diproses"
    },
    {
        "PNS ID": "A827391823903",
        "NIP BARU": "199003052021022001",
        "NIP LAMA": "-",
        "NAMA": "BUDI SANTOSO",
        "GELAR DEPAN": "Ir.",
        "GELAR BELAKANG": "S.T.",
        "TEMPAT LAHIR ID": "3374",
        "TEMPAT LAHIR NAMA": "SEMARANG",
        "TANGGAL LAHIR": "1990-03-05",
        "JENIS KELAMIN": "L",
        "AGAMA ID": "1",
        "AGAMA NAMA": "ISLAM",
        "JENIS KAWIN ID": "1",
        "JENIS KAWIN NAMA": "KAWIN",
        "NIK": "3374020503900007",
        "NOMOR HP": "081322223333",
        "EMAIL": "budi.santoso@gmail.com",
        "EMAIL GOV": "budi.santoso@jatengprov.go.id",
        "ALAMAT": "Jl. Pandanaran No. 80, Semarang",
        "NPWP NOMOR": "48.223.334.4-012.000",
        "BPJS": "0003214567890",
        "JENIS PEGAWAI ID": "2",
        "JENIS PEGAWAI NAMA": "PPPK",
        "KEDUDUKAN HUKUM ID": "1",
        "KEDUDUKAN HUKUM NAMA": "AKTIF",
        "STATUS CPNS PNS": "PPPK",
        "KARTU ASN VIRTUAL": "ASN-V-19900305",
        "NOMOR SK CPNS": "800/012/PPPK/2021",
        "TANGGAL SK CPNS": "2021-02-01",
        "TMT CPNS": "2021-02-15", // Ended in Feb 2026 (Needs immediate attention!)
        "NOMOR SK PNS": "-",
        "TANGGAL SK PNS": "-",
        "TMT PNS": "-",
        "GOL AWAL ID": "IX",
        "GOL AWAL NAMA": "Golongan IX",
        "GOL AKHIR ID": "IX",
        "GOL AKHIR NAMA": "Golongan IX",
        "TMT GOLONGAN": "2021-02-15",
        "MK TAHUN": 5,
        "MK BULAN": 0,
        "JENIS JABATAN ID": "2",
        "JENIS JABATAN NAMA": "FUNGSIONAL",
        "JABATAN ID": "J0199",
        "JABATAN NAMA": "TEKNIK JALAN DAN JEMBATAN AHLI PERTAMA",
        "TMT JABATAN": "2021-02-15",
        "TINGKAT PENDIDIKAN ID": "S1",
        "TINGKAT PENDIDIKAN NAMA": "SARJANA",
        "PENDIDIKAN ID": "P1011",
        "PENDIDIKAN NAMA": "TEKNIK SIPIL",
        "TAHUN LULUS": 2013,
        "KPKN ID": "K020",
        "KPKN NAMA": "KPKN SEMARANG I",
        "LOKASI KERJA ID": "L3374",
        "LOKASI KERJA NAMA": "KANTOR DINAS PU JATENG",
        "UNOR ID": "U9820",
        "UNOR NAMA": "DINAS PEKERJAAN UMUM DAN BINA MARGA CIPTADA - UPTD WILAYAH SEMARANG",
        "INSTANSI INDUK ID": "I3300",
        "INSTANSI INDUK NAMA": "PEMERINTAH PROVINSI JAWA TENGAH",
        "INSTANSI KERJA ID": "I3300",
        "INSTANSI KERJA NAMA": "PEMERINTAH PROVINSI JAWA TENGAH",
        "SATUAN KERJA INDUK ID": "S091",
        "SATUAN KERJA INDUK NAMA": "DINAS PU",
        "SATUAN KERJA KERJA ID": "S092",
        "SATUAN KERJA KERJA NAMA": "UPTD WILAYAH SEMARANG",
        "IS VALID NIK": "YA",
        "NAMA SEKOLAH": "UNIVERSITAS DIPONEGORO",
        "FLAG IKD": "1",
        "GAJI": "",
        "NOMOR_KONTRAK": "SPK/0112/PU-JATENG/2021",
        "STATUS_PERPANJANGAN": "Belum Diproses"
    },
    {
        "PNS ID": "A827391823904",
        "NIP BARU": "198811122022032001",
        "NIP LAMA": "-",
        "NAMA": "RINA MARDIANA",
        "GELAR DEPAN": "Hj.",
        "GELAR BELAKANG": "S.Pd.",
        "TEMPAT LAHIR ID": "3273",
        "TEMPAT LAHIR NAMA": "BANDUNG",
        "TANGGAL LAHIR": "1988-11-12",
        "JENIS KELAMIN": "P",
        "AGAMA ID": "1",
        "AGAMA NAMA": "ISLAM",
        "JENIS KAWIN ID": "1",
        "JENIS KAWIN NAMA": "KAWIN",
        "NIK": "3273011112880004",
        "NOMOR HP": "081512341234",
        "EMAIL": "rina.mardiana@gmail.com",
        "EMAIL GOV": "rina.mardiana@jabarprov.go.id",
        "ALAMAT": "Jl. Setiabudhi No. 102, Bandung",
        "NPWP NOMOR": "48.334.445.5-012.000",
        "BPJS": "0006789123450",
        "JENIS PEGAWAI ID": "2",
        "JENIS PEGAWAI NAMA": "PPPK",
        "KEDUDUKAN HUKUM ID": "1",
        "KEDUDUKAN HUKUM NAMA": "AKTIF",
        "STATUS CPNS PNS": "PPPK",
        "KARTU ASN VIRTUAL": "ASN-V-19881112",
        "NOMOR SK CPNS": "800/314/PPPK/2022",
        "TANGGAL SK CPNS": "2022-03-01",
        "TMT CPNS": "2022-03-15", // Ends in March 2027 (Longer time)
        "NOMOR SK PNS": "-",
        "TANGGAL SK PNS": "-",
        "TMT PNS": "-",
        "GOL AWAL ID": "IX",
        "GOL AWAL NAMA": "Golongan IX",
        "GOL AKHIR ID": "IX",
        "GOL AKHIR NAMA": "Golongan IX",
        "TMT GOLONGAN": "2022-03-15",
        "MK TAHUN": 4,
        "MK BULAN": 3,
        "JENIS JABATAN ID": "2",
        "JENIS JABATAN NAMA": "FUNGSIONAL",
        "JABATAN ID": "J0201",
        "JABATAN NAMA": "GURU BAHASA INGGRIS AHLI PERTAMA",
        "TMT JABATAN": "2022-03-15",
        "TINGKAT PENDIDIKAN ID": "S1",
        "TINGKAT PENDIDIKAN NAMA": "SARJANA",
        "PENDIDIKAN ID": "P1122",
        "PENDIDIKAN NAMA": "PENDIDIKAN BAHASA INGGRIS",
        "TAHUN LULUS": 2011,
        "KPKN ID": "K025",
        "KPKN NAMA": "KPKN BANDUNG I",
        "LOKASI KERJA ID": "L3273",
        "LOKASI KERJA NAMA": "SMAN 1 BANDUNG",
        "UNOR ID": "U9830",
        "UNOR NAMA": "DINAS PENDIDIKAN PROVINSI JAWA BARAT - CABANG DINAS WILAYAH VII",
        "INSTANSI INDUK ID": "I3200",
        "INSTANSI INDUK NAMA": "PEMERINTAH PROVINSI JAWA BARAT",
        "INSTANSI KERJA ID": "I3200",
        "INSTANSI KERJA NAMA": "PEMERINTAH PROVINSI JAWA BARAT",
        "SATUAN KERJA INDUK ID": "S091",
        "SATUAN KERJA INDUK NAMA": "SEKRETARIAT DINAS PENDIDIKAN",
        "SATUAN KERJA KERJA ID": "S094",
        "SATUAN KERJA KERJA NAMA": "CABANG DINAS WILAYAH VII",
        "IS VALID NIK": "YA",
        "NAMA SEKOLAH": "UNIVERSITAS PENDIDIKAN INDONESIA",
        "FLAG IKD": "1",
        "GAJI": "",
        "NOMOR_KONTRAK": "SPK/0322/DIK-JABAR/2022",
        "STATUS_PERPANJANGAN": "Belum Diproses"
    }
];

// App State Management
let pppkData = [];
let extensionHistory = [];
let filteredData = [];
let selectedRows = new Set();
let selectedDueRows = new Set();
let currentPage = 1;
const rowsPerPage = 10;
let currentEditingItem = null;
let bulkMergeItems = null;
let dueBulkMergeItems = null;

// Template state variables
let tempTemplateF4Base64 = null;
let tempTemplateF4Name = "";
let tempTemplateF4Size = 0;

let tempTemplateA4Base64 = null;
let tempTemplateA4Name = "";
let tempTemplateA4Size = 0;

// The System Reference Date (from metadata 2026-06-25)
// The System Reference Date (from metadata 2026-06-25)
const systemDate = new Date("2026-06-25");

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBxG-jaiscNcJYJNSptLwB4ZrBx-Ai4w50",
    authDomain: "employee-contract-e78f5.firebaseapp.com",
    projectId: "employee-contract-e78f5",
    storageBucket: "employee-contract-e78f5.firebasestorage.app",
    messagingSenderId: "633360764521",
    appId: "1:633360764521:web:3807ed97fc273310181cf8",
    measurementId: "G-BPLKEXKTNR"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
let db = null; // Assigned later after lazy loading Firestore

// Set Auth Persistence to SESSION (logs out when tab is closed)
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(console.error);

// Initializing Application
document.addEventListener("DOMContentLoaded", () => {
    // Theme Loader
    loadTheme();
    
    // Auto Logout on Idle (30 Minutes)
    let idleTimeout;
    const IDLE_LIMIT = 30 * 60 * 1000;
    
    function resetIdleTimer() {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            if (auth.currentUser) {
                auth.signOut().then(() => {
                    if (typeof window.appAlert === 'function') {
                        window.appAlert("Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.");
                    } else {
                        alert("Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.");
                    }
                });
            }
        }, IDLE_LIMIT);
    }
    
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetIdleTimer, true);
    });
    
    // Initialize the timer once on load
    resetIdleTimer();

    // Nav Switcher
    setupTabSwitcher();
    
    // Filters & Action Listeners
    setupListeners();
    
    // Auth State Observer
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            document.querySelectorAll('.auth-required').forEach(el => el.style.display = '');
            document.getElementById('btn-login-modal').style.display = 'none';
            
            // Re-trigger click on active tab to correctly set header buttons visibility based on tab rules
            const currentTabEl = document.querySelector('.menu-item.active');
            if (currentTabEl) currentTabEl.click();

            // Load Chart and Firestore immediately upon login
            await loadChartAndFirestore();

            // Load Data from Firestore instead of Local Storage
            await loadData();
            
            // Update UI
            updateDashboard();
            renderTable();

            // Pre-load export dependencies in the background to not block initial render
            setTimeout(loadExportDependencies, 2000);
            loadTemplateConfig();
            
            if (typeof renderHistoryLog === "function") renderHistoryLog();
        } else {
            // User is signed out
            document.querySelectorAll('.auth-required').forEach(el => el.style.display = 'none');
            document.getElementById('btn-login-modal').style.display = '';
            
            // Force go to dashboard
            document.querySelector('[data-tab="dashboard"]').click();
            
            // For guests (PageSpeed Insights bot), we delay the heavy Chart/Firestore loading slightly
            // so the initial FCP/LCP isn't penalized by JS execution.
            setTimeout(async () => {
                await loadChartAndFirestore();
                await loadData();
                updateDashboard();
                renderTable();
            }, 1500);
        }
    });

    // Lazy Load Dependencies Function
    window.heavyDependenciesLoaded = false;
    window.chartFirestoreLoaded = false;
    
    async function loadChartAndFirestore() {
        if (window.chartFirestoreLoaded) return;
        const scripts = [
            "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js",
            "https://cdn.jsdelivr.net/npm/chart.js",
            "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js"
        ];
        const promises = scripts.map(src => {
            return new Promise((resolve) => {
                if (document.querySelector(`script[src="${src}"]`)) return resolve();
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = resolve; // Continue even if one fails
                document.body.appendChild(script);
            });
        });
        await Promise.all(promises);
        
        // Initialize Firestore once script is loaded
        if (typeof firebase !== "undefined" && firebase.firestore) {
            db = firebase.firestore();
            window.db = db;
        }
        
        window.chartFirestoreLoaded = true;
    }

    async function loadExportDependencies() {
        if (window.heavyDependenciesLoaded) return;
        const scripts = [
            "https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.min.js",
            "https://cdn.jsdelivr.net/npm/docxtemplater@3.49.1/build/docxtemplater.js",
            "https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js",
            "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
        ];
        const promises = scripts.map(src => {
            return new Promise((resolve) => {
                if (document.querySelector(`script[src="${src}"]`)) return resolve();
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = resolve; 
                document.body.appendChild(script);
            });
        });
        await Promise.all(promises);
        window.heavyDependenciesLoaded = true;
    }

    // Login Form Logic
    const btnExecuteLogin = document.getElementById("btn-execute-login");
    if (btnExecuteLogin) {
        btnExecuteLogin.addEventListener("click", () => {
            const email = document.getElementById("login-email").value;
            const pass = document.getElementById("login-password").value;
            const errEl = document.getElementById("login-error-msg");
            errEl.style.display = "none";
            
            if(!email || !pass) {
                errEl.innerText = "Email dan password wajib diisi!";
                errEl.style.display = "block";
                return;
            }
            
            const originalText = btnExecuteLogin.innerHTML;
            btnExecuteLogin.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses...`;
            btnExecuteLogin.disabled = true;
            
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => {
                    document.getElementById("login-modal").classList.remove("open");
                })
                .catch((error) => {
                    errEl.innerText = error.message;
                    errEl.style.display = "block";
                })
                .finally(() => {
                    btnExecuteLogin.innerHTML = originalText;
                    btnExecuteLogin.disabled = false;
                });
        });
    }

    // Modal Close
    document.getElementById("btn-close-login-modal")?.addEventListener("click", () => {
        document.getElementById("login-modal").classList.remove("open");
    });
    document.getElementById("btn-login-modal")?.addEventListener("click", () => {
        document.getElementById("login-modal").classList.add("open");
    });
    document.getElementById("btn-logout")?.addEventListener("click", () => {
        auth.signOut();
    });

    // Bupati Config Loader
    const savedBupatiNama = localStorage.getItem("bupati_nama") || "DR. H. MOCHAMAD RIDWAN KAMIL, S.T., M.U.D.";
    const savedBupatiJabatan = localStorage.getItem("bupati_jabatan") || "Bupati";
    const bupatiNamaInput = document.getElementById("cfg-nama-bupati");
    const bupatiJabatanInput = document.getElementById("cfg-jabatan-bupati");
    if (bupatiNamaInput) bupatiNamaInput.value = savedBupatiNama;
    if (bupatiJabatanInput) bupatiJabatanInput.value = savedBupatiJabatan;

    // Template Config Loader
    loadTemplateConfig();

    // Select the default active tab on startup
    const activeTabItem = document.querySelector('.menu-item.active');
    if (activeTabItem) {
        activeTabItem.click();
    }
});

// Load Theme from LocalStorage
function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const themeCheckbox = document.getElementById("checkbox");
    if (themeCheckbox) {
        themeCheckbox.checked = (savedTheme === "dark");
    }
}

// Save & Apply Theme Change
const themeToggle = document.getElementById("checkbox");
if (themeToggle) {
    themeToggle.addEventListener("change", (e) => {
        const targetTheme = e.target.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", targetTheme);
        localStorage.setItem("theme", targetTheme);
        
        // Re-render charts to update colors for the new theme
        if (typeof renderDashboardCharts === 'function') {
            renderDashboardCharts();
        }
    });
}

// Load Data from Firestore
async function loadData() {
    try {
        const docRef = db.collection('database').doc('pegawai');
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            const data = docSnap.data();
            
            // Check if compressed
            if (data.compressed && typeof LZString !== 'undefined') {
                const decompressed = LZString.decompressFromUTF16(data.payload);
                pppkData = JSON.parse(decompressed);
            } else if (data.jsonString) {
                pppkData = JSON.parse(data.jsonString);
            } else {
                pppkData = [...initialMockData];
            }
        } else {
            pppkData = [...initialMockData];
            if (firebase.auth().currentUser) {
                await saveDataToFirebase();
            }
        }

        // Load History
        const historyRef = db.collection('database').doc('riwayat');
        const historySnap = await historyRef.get();
        if (historySnap.exists) {
            extensionHistory = JSON.parse(historySnap.data().jsonString || "[]");
        } else {
            extensionHistory = [];
        }

    } catch (e) {
        console.error("Error loading data from Firestore:", e);
        if (typeof window.appAlert === 'function') {
            window.appAlert("Gagal memuat data dari server. Menampilkan data lokal sementara.");
        }
        pppkData = [...initialMockData];
        extensionHistory = [];
    }
    
    // Clean up NIPs from leading quote immediately on load
    let needsSave = false;
    pppkData.forEach(emp => {
        if (emp["NIP BARU"] && typeof emp["NIP BARU"] === "string" && emp["NIP BARU"].startsWith("'")) {
            emp["NIP BARU"] = emp["NIP BARU"].substring(1);
            needsSave = true;
        }
        if (emp["NIP LAMA"] && typeof emp["NIP LAMA"] === "string" && emp["NIP LAMA"].startsWith("'")) {
            emp["NIP LAMA"] = emp["NIP LAMA"].trim().replace(/^'/, "");
            needsSave = true;
        }
    });
    
    if (needsSave && firebase.auth().currentUser) {
        await saveDataToFirebase();
    }

    filteredData = [...pppkData];
}

// Save Data to Firestore
async function saveDataToFirebase() {
    if (!firebase.auth().currentUser) return; // Prevent saving if not logged in

    try {
        const jsonString = JSON.stringify(pppkData);
        let payloadObj = {};
        
        if (typeof LZString !== 'undefined') {
            const compressed = LZString.compressToUTF16(jsonString);
            payloadObj = {
                compressed: true,
                payload: compressed,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
        } else {
            payloadObj = {
                compressed: false,
                jsonString: jsonString,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
        }
        
        await db.collection('database').doc('pegawai').set(payloadObj);

        // Save history
        await db.collection('database').doc('riwayat').set({
            jsonString: JSON.stringify(extensionHistory || []),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch(e) {
        if (typeof window.appAlert === 'function') {
            window.appAlert("Gagal menyimpan data ke server: " + e.message);
        }
        console.error("Firestore error:", e);
    }
}

// Contract Period Calculator (Dynamic Duration Blocks)
function calculateContractPeriod(item) {
    if (item && typeof item === "object" && item._periodCache) {
        return item._periodCache;
    }
    // Determine duration: 1 year for Paruh Waktu, 5 years for regular PPPK
    const contractYears = (item && typeof item === "object" && item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;

    // Check if status PPPK is Meninggal first (Pensiun evaluated later to retain dates)
    if (item && typeof item === "object") {
        if (item["STATUS_PPPK"] === "Meninggal") {
            return { awal: "-", akhir: "-", status: "Meninggal", daysLeft: 0, periodNum: 0, isBUP: false };
        }
    }

    const tmtCpnsStr = (item && typeof item === "object") ? item["TMT CPNS"] : item;
    if (!tmtCpnsStr || tmtCpnsStr === "-") {
        return { awal: "-", akhir: "-", status: "Kontrak Habis", daysLeft: 0, periodNum: 0 };
    }

    // Parse TMT CPNS
    const parts = tmtCpnsStr.split("-");
    let tmtDate;
    if (parts.length === 3) {
        tmtDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
        tmtDate = new Date(tmtCpnsStr);
    }

    if (isNaN(tmtDate.getTime())) {
        return { awal: "-", akhir: "-", status: "Kontrak Habis", daysLeft: 0, periodNum: 0 };
    }

    // Calculate Batas Usia Pensiun (BUP) if we have the full item object
    let retireEndDate = null;
    if (item && typeof item === "object" && item["TANGGAL LAHIR"]) {
        const bDayStr = item["TANGGAL LAHIR"];
        const bParts = bDayStr.split("-");
        let bDate;
        if (bParts.length === 3) {
            bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
        } else {
            bDate = new Date(bDayStr);
        }

        if (!isNaN(bDate.getTime())) {
            const kelompok = getKelompokPegawai(item);
            const bupYears = (kelompok === "Tenaga Guru") ? 60 : 58;
            const retireYear = bDate.getFullYear() + bupYears;
            const retireMonth = bDate.getMonth();
            // Last day of birth month in retirement year
            retireEndDate = new Date(retireYear, retireMonth + 1, 0);
        }
    }

    // Loop through N-year periods
    let start = new Date(tmtDate);
    let end = new Date(tmtDate);
    end.setFullYear(start.getFullYear() + contractYears);
    end.setDate(end.getDate() - 1);

    // Apply retirement cap on first period if needed
    if (retireEndDate && end > retireEndDate) {
        end = new Date(retireEndDate);
    }

    let periodIndex = 1;

    // Shift to find current period relative to systemDate
    while (systemDate > end && (!retireEndDate || start < retireEndDate)) {
        let nextStart = new Date(end);
        nextStart.setDate(nextStart.getDate() + 1);

        if (retireEndDate && nextStart >= retireEndDate) {
            break;
        }

        start = nextStart;
        end = new Date(start);
        end.setFullYear(start.getFullYear() + contractYears);
        end.setDate(end.getDate() - 1);

        if (retireEndDate && end > retireEndDate) {
            end = new Date(retireEndDate);
        }
        periodIndex++;
    }

    // Handle approval shift to next period
    if (item && typeof item === "object" && item["STATUS_PERPANJANGAN"] === "Disetujui") {
        const tempStart = new Date(end);
        tempStart.setDate(tempStart.getDate() + 1);

        if (!retireEndDate || tempStart < retireEndDate) {
            start = tempStart;
            end = new Date(start);
            end.setFullYear(start.getFullYear() + contractYears);
            end.setDate(end.getDate() - 1);

            if (retireEndDate && end > retireEndDate) {
                end = new Date(retireEndDate);
            }
            periodIndex++;
        }
    }

    // Days remaining until end of the active contract
    const msDiff = end.getTime() - systemDate.getTime();
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    // Calculate expected end (full N years minus 1 day) from start date
    const expectedEnd = new Date(start);
    expectedEnd.setFullYear(start.getFullYear() + contractYears);
    expectedEnd.setDate(expectedEnd.getDate() - 1);

    let isBUP = false;
    if (retireEndDate && (systemDate >= retireEndDate || end.getTime() === retireEndDate.getTime() || end.getTime() < expectedEnd.getTime())) {
        isBUP = true;
    }

    let status = "Kontrak Masih Berlaku";
    if (daysLeft <= 0 || (retireEndDate && systemDate >= retireEndDate)) {
        status = isBUP ? "Kontrak Habis (BUP)" : "Kontrak Habis";
    } else if (daysLeft < 365) {
        status = "Kontrak Hampir Habis";
    }

    if (item && typeof item === "object" && item["STATUS_PPPK"] === "Pensiun") {
        status = "Kontrak Habis (BUP)";
        isBUP = true;
    }

    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const result = {
        awal: formatDate(start),
        akhir: formatDate(end),
        daysLeft: daysLeft,
        periodNum: periodIndex,
        status: status,
        isBUP: isBUP
    };
    
    if (item && typeof item === "object") {
        item._periodCache = result;
    }
    return result;
}

// Render Dashboard Statistics & Warnings
function updateDashboard() {
    const filterDashboardSelect = document.getElementById("filter-dashboard-jenis");
    const filterDashboard = filterDashboardSelect ? filterDashboardSelect.value : "all";

    const filteredDashboardData = pppkData.filter(item => {
        const itemJenis = item["JENIS_PPPK"] || "PPPK";
        return filterDashboard === "all" || itemJenis === filterDashboard;
    });

    const total = filteredDashboardData.length;
    let warning = 0;
    let approved = 0;
    let drafts = 0;

    const filterJenisSelect = document.getElementById("filter-due-jenis-pppk");
    const filterJenis = filterJenisSelect ? filterJenisSelect.value : "all";

    const dueTableBody = document.getElementById("due-contracts-body");
    dueTableBody.innerHTML = "";

    let dueHtml = "";
    filteredDashboardData.forEach(item => {
        const period = calculateContractPeriod(item);
        
        // Count for warnings or expired contracts (shown in due/warning list)
        if (period.status === "Kontrak Hampir Habis" || period.status === "Kontrak Habis" || period.status === "Kontrak Habis (BUP)") {
            if (period.status === "Kontrak Hampir Habis") warning++;
            else if (period.status === "Kontrak Habis" || period.status === "Kontrak Habis (BUP)") drafts++;
            
            const itemJenis = item["JENIS_PPPK"] || "PPPK";
            if (filterJenis !== "all" && itemJenis !== filterJenis) {
                return; // Skip rendering row but preserve stats count
            }
            
            const isRetired = period.isBUP || item["STATUS_PPPK"] === "Pensiun";
            const isDeceased = item["STATUS_PPPK"] === "Meninggal";
            const isNotRenewed = item["STATUS_PPPK"] === "Tidak Diperpanjang";
            
            let statusText = "";
            if (isDeceased) {
                statusText = `<span class="badge badge-danger">Meninggal Dunia</span>`;
            } else if (isRetired) {
                statusText = `<span class="badge badge-danger">Batas Usia Pensiun</span>`;
            } else if (isNotRenewed) {
                statusText = `<span class="badge badge-danger">Tidak Diperpanjang</span>`;
            } else if (period.daysLeft <= 0) {
                statusText = `<span class="badge badge-danger">Habis (${Math.abs(period.daysLeft)} hari lalu)</span>`;
            } else {
                statusText = `<span class="badge badge-warning">Sisa ${period.daysLeft} hari</span>`;
            }

            let actionBtn = "";
            if (isDeceased) {
                actionBtn = `<span class="badge badge-secondary" style="opacity: 0.6;">Meninggal (Tidak Ada Aksi)</span>`;
            } else if (isRetired) {
                actionBtn = `<span class="badge badge-secondary" style="opacity: 0.6;">Pensiun (Tidak Bisa Diperpanjang)</span>`;
            } else if (isNotRenewed) {
                actionBtn = `<span class="badge badge-secondary" style="opacity: 0.6;">Diberhentikan (Tidak Diperpanjang)</span>`;
            } else {
                actionBtn = `
                    <button class="btn btn-sm btn-primary" onclick="openDetailModal('${item["PNS ID"]}', 'tab-kontrak-gaji')">
                        <i class="fa-solid fa-file-signature"></i> Proses
                    </button>
                `;
            }

            const isProcessable = (period.status === "Kontrak Hampir Habis" || period.status === "Kontrak Habis") && !isDeceased && !isRetired && !isNotRenewed && item["STATUS_PERPANJANGAN"] !== "Disetujui" && item["STATUS_PERPANJANGAN"] !== "Draf Perpanjangan";
            const isChecked = selectedDueRows.has(item["PNS ID"]) ? "checked" : "";
            const checkboxDisabledAttr = isProcessable ? "" : "disabled style='opacity: 0.4; cursor: not-allowed;'";

            dueHtml += `
            <tr>
                <td><input type="checkbox" class="due-row-checkbox" data-id="${item["PNS ID"]}" ${isChecked} ${checkboxDisabledAttr}></td>
                <td>
                    <div class="emp-name-wrapper">
                        <strong>${getFullname(item)}</strong>
                        <span>NIP. ${item["NIP BARU"]}</span>
                    </div>
                </td>
                <td>${formatIndoDate(period.awal)}</td>
                <td>${formatIndoDate(period.akhir)}</td>
                <td>${statusText}</td>
                <td><span class="badge badge-secondary">${item["STATUS_PPPK"] || "Aktif"}</span></td>
                <td>${formatIDR(item["GAJI"])}</td>
                <td>${actionBtn}</td>
            </tr>`;
        } else if (period.status === "Kontrak Masih Berlaku") {
            approved++;
        }
    });

    if (dueHtml === "") {
        dueHtml = `<tr><td colspan="8" class="text-center text-muted">Semua kontrak terpantau aman dan aktif.</td></tr>`;
    }
    dueTableBody.innerHTML = dueHtml;

    renderHistoryLog(); // Restore history log UI from current local data state


    // Due row selection event hooks
    document.querySelectorAll(".due-row-checkbox").forEach(chk => {
        chk.addEventListener("change", (e) => {
            const id = e.target.getAttribute("data-id");
            if (e.target.checked) {
                selectedDueRows.add(id);
            } else {
                selectedDueRows.delete(id);
            }
            updateDueBulkActionBar();
        });
    });

    document.getElementById("stat-total-pppk").innerText = total;
    document.getElementById("stat-warning-contract").innerText = warning;
    document.getElementById("stat-approved").innerText = approved;
    document.getElementById("stat-drafts").innerText = drafts;
    
    // Auto populate Unor Induk in filter dropdown
    updateUnorFilters();
    
    // Auto populate Jabatan in filter dropdown
    updateJabatanFilters();
    
    // Auto populate Perpanjangan Kontrak period dropdown filter
    populatePeriodFilter();

    // Render Dashboard Charts
    if (typeof Chart !== 'undefined') {
        renderDashboardCharts(filteredDashboardData);
    }
}

// Chart instances
let chartJabatanInstance = null;
let chartKontrakInstance = null;

// Render Chart.js Dashboard Data
function renderDashboardCharts(data = pppkData) {
    const ctxJabatan = document.getElementById('chart-jabatan');
    const ctxKontrak = document.getElementById('chart-kontrak');
    if (!ctxJabatan || !ctxKontrak) return;

    // Process data for Jabatan
    const jabatanCounts = {};
    data.forEach(item => {
        const title = item["JABATAN NAMA"] || "Tidak Diketahui";
        jabatanCounts[title] = (jabatanCounts[title] || 0) + 1;
    });
    
    const sortedJabatan = Object.entries(jabatanCounts).sort((a, b) => b[1] - a[1]);
    const topJabatan = sortedJabatan.slice(0, 5);
    const otherJabatan = sortedJabatan.slice(5).reduce((sum, item) => sum + item[1], 0);
    
    const jabatanLabels = topJabatan.map(j => j[0]);
    const jabatanData = topJabatan.map(j => j[1]);
    if (otherJabatan > 0) {
        jabatanLabels.push("Lainnya");
        jabatanData.push(otherJabatan);
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#4A4A4A';
    const gridColor = isDark ? '#3F4148' : '#E5E7EB';

    if (chartJabatanInstance) chartJabatanInstance.destroy();
    chartJabatanInstance = new Chart(ctxJabatan, {
        type: 'doughnut',
        data: {
            labels: jabatanLabels,
            datasets: [{
                data: jabatanData,
                backgroundColor: ['#10B981', '#485FC7', '#F59E0B', '#A855F7', '#EC4899', '#9CA3AF'],
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#1F2937' : '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: textColor, font: { family: 'Roboto', size: 11 }, padding: 15, boxWidth: 12 }
                },
                tooltip: {
                    bodyFont: { family: 'Roboto' }
                }
            },
            cutout: '70%'
        }
    });

    // Process data for Jadwal Perpanjangan (Bar Chart)
    const perpanjanganCounts = {};
    data.forEach(item => {
        const period = calculateContractPeriod(item);
        if (period.status !== "Kontrak Habis (BUP)" && !period.isBUP && period.awal !== "-") {
            let year;
            if (item["STATUS_PERPANJANGAN"] === "Disetujui") {
                year = period.awal.split("-")[0];
            } else {
                const nextStart = new Date(period.akhir);
                nextStart.setDate(nextStart.getDate() + 1);
                year = nextStart.getFullYear().toString();
            }
            perpanjanganCounts[year] = (perpanjanganCounts[year] || 0) + 1;
        }
    });

    const perpanjanganLabels = Object.keys(perpanjanganCounts).sort();
    const perpanjanganData = perpanjanganLabels.map(y => perpanjanganCounts[y]);

    if (chartKontrakInstance) chartKontrakInstance.destroy();
    chartKontrakInstance = new Chart(ctxKontrak, {
        type: 'bar',
        data: {
            labels: perpanjanganLabels.length > 0 ? perpanjanganLabels : ["Tidak Ada Data"],
            datasets: [{
                label: 'Jumlah Perpanjangan',
                data: perpanjanganLabels.length > 0 ? perpanjanganData : [0],
                backgroundColor: '#485FC7',
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { bodyFont: { family: 'Roboto' } }
            },
            scales: {
                x: { 
                    ticks: { color: textColor, font: { family: 'Roboto', size: 12 } },
                    grid: { display: false }
                },
                y: { 
                    ticks: { color: textColor, font: { family: 'Roboto' }, stepSize: 1 },
                    grid: { color: gridColor },
                    beginAtZero: true
                }
            }
        }
    });

    // Process data for Proyeksi Pensiun BUP (Line Chart)
    const bupCounts = {};
    data.forEach(item => {
        if (!item["TANGGAL LAHIR"] || item["STATUS_PPPK"] === "Meninggal") return;
        const bDayStr = item["TANGGAL LAHIR"];
        const bParts = bDayStr.split("-");
        let bDate;
        if (bParts.length === 3) {
            bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
        } else {
            bDate = new Date(bDayStr);
        }
        
        if (!isNaN(bDate.getTime())) {
            // Determine bupYears
            let bupYears = 58;
            if (typeof getKelompokPegawai === "function") {
                const kelompok = getKelompokPegawai(item);
                if (kelompok === "Tenaga Guru") bupYears = 60;
            } else {
                const jName = item["JABATAN NAMA"] ? item["JABATAN NAMA"].toUpperCase() : "";
                if (jName.includes("GURU") || jName.includes("KEPALA SEKOLAH")) bupYears = 60;
            }
            
            const retireYear = (bDate.getFullYear() + bupYears).toString();
            bupCounts[retireYear] = (bupCounts[retireYear] || 0) + 1;
        }
    });

    const bupLabels = Object.keys(bupCounts).sort();
    const bupData = bupLabels.map(y => bupCounts[y]);

    const ctxBup = document.getElementById('chart-bup');
    if (ctxBup) {
        if (window.chartBupInstance) window.chartBupInstance.destroy();
        window.chartBupInstance = new Chart(ctxBup, {
            type: 'line',
            data: {
                labels: bupLabels.length > 0 ? bupLabels : ["Tidak Ada Data"],
                datasets: [{
                    label: 'Proyeksi Pensiun (Orang)',
                    data: bupLabels.length > 0 ? bupData : [0],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { bodyFont: { family: 'Roboto' } }
                },
                scales: {
                    x: { 
                        ticks: { color: textColor, font: { family: 'Roboto', size: 12 } },
                        grid: { display: false }
                    },
                    y: { 
                        ticks: { color: textColor, font: { family: 'Roboto' }, stepSize: 1 },
                        grid: { color: gridColor },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Parse Unor Nama into Atasan and Induk
function getUnorParts(item) {
    let unorNama = "";
    if (typeof item === "object") {
        if (item._unorCache) return item._unorCache;
        unorNama = item["UNOR NAMA"] || "";
    } else {
        unorNama = item || "";
    }
    
    if (!unorNama || unorNama === "-") {
        return { atasan: "-", induk: "-" };
    }
    const parts = unorNama.split(/\s+-\s+/);
    let atasan = unorNama.trim();
    let induk = unorNama.trim();
    
    if (parts.length >= 2) {
        // Unor Induk selalu bagian paling KANAN (terakhir)
        induk = parts.pop().trim();
        // Unor Atasan adalah semua sisa bagian di sebelah KIRI, digabung kembali
        atasan = parts.join(" - ").trim();
    }
    
    // Fix anomaly: if induk is PEMERINTAH KABUPATEN HULU SUNGAI UTARA, copy from atasan
    if (induk.toUpperCase() === "PEMERINTAH KABUPATEN HULU SUNGAI UTARA") {
        induk = atasan;
    }
    
    const result = { atasan, induk };
    if (typeof item === "object") {
        item._unorCache = result;
    }
    return result;
}

// Populate Unor filters dynamically
function updateUnorFilters(data = pppkData) {
    const indukFilter = document.getElementById("filter-unor-induk");
    const atasanFilter = document.getElementById("filter-unor-atasan");
    if (!indukFilter || !atasanFilter) return;

    const selectedInduk = indukFilter.value || "all";
    const selectedAtasan = atasanFilter.value || "all";

    // 1. Populate Unor Induk list
    const uniqueInduks = new Set();
    if (selectedInduk !== "all") uniqueInduks.add(selectedInduk);
    
    data.forEach(item => {
        const parts = getUnorParts(item);
        if (parts.induk && parts.induk !== "-") {
            uniqueInduks.add(parts.induk);
        }
    });

    indukFilter.innerHTML = '<option value="all">Semua Unor Induk</option>';
    [...uniqueInduks].sort().forEach(induk => {
        indukFilter.innerHTML += `<option value="${induk}">${induk}</option>`;
    });
    indukFilter.value = selectedInduk;

    // 2. Populate Unor Atasan list based on selected Unor Induk
    const uniqueAtasans = new Set();
    if (selectedAtasan !== "all") uniqueAtasans.add(selectedAtasan);
    
    data.forEach(item => {
        const parts = getUnorParts(item);
        if (selectedInduk === "all" || parts.induk === selectedInduk) {
            if (parts.atasan && parts.atasan !== "-") {
                uniqueAtasans.add(parts.atasan);
            }
        }
    });

    atasanFilter.innerHTML = '<option value="all">Semua Unor Atasan</option>';
    [...uniqueAtasans].sort().forEach(atasan => {
        atasanFilter.innerHTML += `<option value="${atasan}">${atasan}</option>`;
    });

    if (selectedInduk === "all") {
        atasanFilter.value = "all";
        atasanFilter.disabled = true;
    } else {
        atasanFilter.disabled = false;
        atasanFilter.value = uniqueAtasans.has(selectedAtasan) ? selectedAtasan : "all";
    }
}

// Populate Jabatan filters dynamically
function updateJabatanFilters(data = pppkData) {
    const jabatanFilter = document.getElementById("filter-jabatan");
    if (!jabatanFilter) return;
    
    const selectedJabatan = jabatanFilter.value || "all";
    const uniqueJabatan = new Set();
    if (selectedJabatan !== "all") uniqueJabatan.add(selectedJabatan);
    
    data.forEach(item => {
        if (item["JABATAN NAMA"] && item["JABATAN NAMA"] !== "-") {
            uniqueJabatan.add(item["JABATAN NAMA"]);
        }
    });
    
    jabatanFilter.innerHTML = '<option value="all">Semua Jabatan</option>';
    [...uniqueJabatan].sort().forEach(jab => {
        jabatanFilter.innerHTML += `<option value="${jab}">${jab}</option>`;
    });
    
    jabatanFilter.value = selectedJabatan;
}

// Render PPPK Data Table with Filters & Pagination
function renderTable() {
    const tableBody = document.getElementById("main-pppk-body");
    tableBody.innerHTML = "";

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">Tidak ada data PPPK yang cocok dengan kriteria pencarian.</td></tr>`;
        document.getElementById("total-rows-count").innerText = 0;
        document.getElementById("pag-start").innerText = 0;
        document.getElementById("pag-end").innerText = 0;
        document.getElementById("pag-total").innerText = 0;
        return;
    }

    document.getElementById("total-rows-count").innerText = filteredData.length;

    // Calculate Pagination bounds
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
    
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, filteredData.length);
    const paginatedItems = filteredData.slice(startIdx, endIdx);

    document.getElementById("pag-start").innerText = startIdx + 1;
    document.getElementById("pag-end").innerText = endIdx;
    document.getElementById("pag-total").innerText = filteredData.length;
    document.getElementById("page-indicator").innerText = `Halaman ${currentPage} dari ${totalPages}`;

    document.getElementById("btn-prev-page").disabled = currentPage === 1;
    document.getElementById("btn-next-page").disabled = currentPage === totalPages;

    paginatedItems.forEach(item => {
        const period = calculateContractPeriod(item);
        const row = document.createElement("tr");

        let statusClass = "badge-success";
        if (period.status === "Kontrak Hampir Habis") statusClass = "badge-warning";
        else if (period.status === "Kontrak Habis" || period.status === "Kontrak Habis (BUP)") statusClass = "badge-danger";

        const isChecked = selectedRows.has(item["PNS ID"]) ? "checked" : "";

        let statusPppk = item["STATUS_PPPK"] || "Aktif";
        if (period.status === "Kontrak Habis (BUP)") {
            statusPppk = "Pensiun";
        }
        
        let statusPppkClass = "badge-secondary";
        if (statusPppk === "Aktif") statusPppkClass = "badge-success";
        else if (statusPppk === "Meninggal" || statusPppk === "Tidak Diperpanjang") statusPppkClass = "badge-danger";
        else if (statusPppk === "Pensiun") statusPppkClass = "badge-warning";

        const isProcessable = (period.status === "Kontrak Hampir Habis" || period.status === "Kontrak Habis") && statusPppk !== "Meninggal" && statusPppk !== "Pensiun" && statusPppk !== "Tidak Diperpanjang";
        const alreadyProcessed = (item["STATUS_PERPANJANGAN"] === "Disetujui" || item["STATUS_PERPANJANGAN"] === "Draf Perpanjangan");
        
        const checkboxDisabledAttr = "";
        
        let dateColumnsHtml = `
            <td>${formatIndoDate(period.awal)}</td>
            <td>${formatIndoDate(period.akhir)}</td>
        `;

        if (period.status === "Kontrak Habis (BUP)") {
            let tmtPensiunStr = "-";
            if (period.akhir && period.akhir !== "-") {
                const parts = period.akhir.split("-");
                if (parts.length === 3) {
                    let year = parseInt(parts[0]);
                    let month = parseInt(parts[1]);
                    month++;
                    if (month > 12) {
                        month = 1;
                        year++;
                    }
                    const nextMonthStr = `${year}-${String(month).padStart(2, '0')}-01`;
                    tmtPensiunStr = formatIndoDate(nextMonthStr);
                }
            }
            dateColumnsHtml = `
                <td colspan="2" class="text-center" style="font-weight: 500; color: #dc3545; background-color: rgba(220, 53, 69, 0.05);">
                    TMT Pensiun: ${tmtPensiunStr}
                </td>
            `;
        }

        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" data-id="${item["PNS ID"]}" ${isChecked} ${checkboxDisabledAttr}></td>
            <td>
                <div class="emp-name-wrapper">
                    <strong>${item["NIP BARU"]}</strong>
                </div>
            </td>
            <td>
                <div class="emp-name-wrapper">
                    <strong>${getFullname(item)}</strong>
                </div>
            </td>
            ${dateColumnsHtml}
            <td>${item["JABATAN NAMA"] || "-"}</td>
            <td><span class="badge ${statusClass}">${period.status}</span></td>
            <td><span class="badge ${statusPppkClass}">${statusPppk}</span></td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-secondary" onclick="openDetailModal('${item["PNS ID"]}', 'tab-personal')" title="Detail Profil">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    ${item["STATUS_PERPANJANGAN"] === "Disetujui" || item["STATUS_PERPANJANGAN"] === "Draf Perpanjangan" ? `
                        <button class="btn btn-sm btn-info" onclick="openSKPreviewModal('${item["PNS ID"]}')" title="Cetak Draf SK">
                            <i class="fa-solid fa-print"></i>
                        </button>
                    ` : ''}
                    ${statusPppk !== "Meninggal" && statusPppk !== "Pensiun" ? `
                        <button class="btn btn-sm btn-primary" style="background-color: #2b579a;" onclick="downloadWordContract('${item["PNS ID"]}')" title="Unduh & Cetak Kontrak (Word)">
                            <i class="fa-solid fa-file-word"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Row selection event hooks
    document.querySelectorAll(".row-checkbox").forEach(chk => {
        chk.addEventListener("change", (e) => {
            const id = e.target.getAttribute("data-id");
            if (e.target.checked) {
                selectedRows.add(id);
            } else {
                selectedRows.delete(id);
            }
            updateBulkActionBar();
        });
    });
}

// Bulk Actions Handler
function updateBulkActionBar() {
    const bulkBar = document.getElementById("bulk-actions-bar");
    const bulkCount = document.getElementById("bulk-selected-count");
    
    if (selectedRows.size > 0) {
        bulkBar.style.display = "flex";
        bulkCount.innerText = `${selectedRows.size} terpilih`;
    } else {
        bulkBar.style.display = "none";
    }
}

// Bulk Actions Handler for Due Contracts Tab
function updateDueBulkActionBar() {
    const bulkBarContainer = document.getElementById("due-bulk-actions-bar-container");
    const bulkCount = document.getElementById("due-bulk-selected-count");
    
    if (selectedDueRows.size > 0) {
        if (bulkBarContainer) bulkBarContainer.style.display = "block";
        if (bulkCount) bulkCount.innerText = `${selectedDueRows.size} terpilih`;
    } else {
        if (bulkBarContainer) bulkBarContainer.style.display = "none";
        const checkAllDue = document.getElementById("check-all-due");
        if (checkAllDue) checkAllDue.checked = false;
    }
}

// Setup Event Listeners
function setupListeners() {
    // A11y Fix: Auto-assign 'for' attributes to labels
    document.querySelectorAll('.form-group').forEach(group => {
        const label = group.querySelector('label');
        const input = group.querySelector('input, select, textarea');
        if (label && input && input.id && !label.getAttribute('for')) {
            label.setAttribute('for', input.id);
        }
    });

    // Mobile Menu Toggle
    const btnMobileMenu = document.getElementById("btn-mobile-menu");
    if (btnMobileMenu) {
        btnMobileMenu.addEventListener("click", () => {
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) {
                sidebar.classList.toggle("open");
            }
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector(".sidebar");
            const btnMobileMenu = document.getElementById("btn-mobile-menu");
            if (sidebar && sidebar.classList.contains("open")) {
                if (!sidebar.contains(e.target) && btnMobileMenu && !btnMobileMenu.contains(e.target)) {
                    sidebar.classList.remove("open");
                }
            }
        }
    });

    // Check All Checkbox
    const checkAll = document.getElementById("check-all-pppk");
    if (checkAll) {
        checkAll.addEventListener("change", (e) => {
            const rowCheckboxes = document.querySelectorAll(".row-checkbox");
            if (e.target.checked) {
                rowCheckboxes.forEach(chk => {
                    if (!chk.disabled) {
                        const id = chk.getAttribute("data-id");
                        selectedRows.add(id);
                        chk.checked = true;
                    }
                });
            } else {
                rowCheckboxes.forEach(chk => {
                    const id = chk.getAttribute("data-id");
                    selectedRows.delete(id);
                    chk.checked = false;
                });
            }
            updateBulkActionBar();
        });
    }

    // Check All Checkbox for Due Contracts
    const checkAllDue = document.getElementById("check-all-due");
    if (checkAllDue) {
        checkAllDue.addEventListener("change", (e) => {
            const rowCheckboxes = document.querySelectorAll(".due-row-checkbox");
            if (e.target.checked) {
                rowCheckboxes.forEach(chk => {
                    if (!chk.disabled) {
                        const id = chk.getAttribute("data-id");
                        selectedDueRows.add(id);
                        chk.checked = true;
                    }
                });
            } else {
                rowCheckboxes.forEach(chk => {
                    const id = chk.getAttribute("data-id");
                    selectedDueRows.delete(id);
                    chk.checked = false;
                });
            }
            updateDueBulkActionBar();
        });
    }

    // Pagination Listeners
    document.getElementById("btn-prev-page").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    document.getElementById("btn-next-page").addEventListener("click", () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Search Trigger (Real-time and filter input)
    const searchInput = document.getElementById("global-search");
    let searchDebounceTimeout;
    searchInput.addEventListener("input", () => {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });

    // Filters Listeners
    document.getElementById("filter-status").addEventListener("change", applyFilters);
    document.getElementById("filter-unor-induk").addEventListener("change", () => {
        updateUnorFilters();
        applyFilters();
    });
    document.getElementById("filter-unor-atasan").addEventListener("change", applyFilters);
    document.getElementById("filter-periode").addEventListener("change", applyFilters);
    const filterJabatan = document.getElementById("filter-jabatan");
    if (filterJabatan) filterJabatan.addEventListener("change", applyFilters);
    document.getElementById("filter-status-pppk").addEventListener("change", applyFilters);
    
    const filterJenisPppk = document.getElementById("filter-jenis-pppk");
    if (filterJenisPppk) filterJenisPppk.addEventListener("change", applyFilters);
    
    // Dashboard and Due Contracts Filters
    const filterDashboardJenis = document.getElementById("filter-dashboard-jenis");
    if (filterDashboardJenis) filterDashboardJenis.addEventListener("change", updateDashboard);

    const dueFilterJenis = document.getElementById("filter-due-jenis-pppk");
    if (dueFilterJenis) dueFilterJenis.addEventListener("change", updateDashboard);
    
    // Toggle Advanced Filters
    const btnToggleFilters = document.getElementById("btn-toggle-filters");
    const advancedFilters = document.getElementById("advanced-filters");
    if (btnToggleFilters && advancedFilters) {
        btnToggleFilters.addEventListener("click", () => {
            if (advancedFilters.style.display === "none") {
                advancedFilters.style.display = "flex";
                btnToggleFilters.style.backgroundColor = "var(--text-secondary)";
            } else {
                advancedFilters.style.display = "none";
                btnToggleFilters.style.backgroundColor = "var(--primary-color)";
            }
        });
    }
    
    document.getElementById("btn-reset-filters").addEventListener("click", () => {
        document.getElementById("global-search").value = "";
        document.getElementById("filter-status").value = "all";
        if (filterJenisPppk) filterJenisPppk.value = "all";
        document.getElementById("filter-unor-induk").value = "all";
        updateUnorFilters();
        document.getElementById("filter-unor-atasan").value = "all";
        document.getElementById("filter-unor-atasan").disabled = true;
        document.getElementById("filter-periode").value = "all";
        if (filterJabatan) filterJabatan.value = "all";
        document.getElementById("filter-status-pppk").value = "all";
        applyFilters();
    });

    // Modal Edit Tab Switcher
    const modalTabs = document.querySelectorAll(".tab-btn");
    modalTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            modalTabs.forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            
            const targetContentId = e.target.getAttribute("data-modal-tab");
            document.querySelectorAll(".modal-tab-content").forEach(content => {
                content.classList.remove("active");
            });
            document.getElementById(`modal-${targetContentId}`).classList.add("active");
        });
    });

    // Detail Modal Buttons
    document.getElementById("btn-close-detail-modal").addEventListener("click", closeDetailModal);
    document.getElementById("btn-cancel-detail").addEventListener("click", closeDetailModal);
    
    const filterDueJenisPppk = document.getElementById("filter-due-jenis-pppk");
    if (filterDueJenisPppk) {
        filterDueJenisPppk.addEventListener("change", updateDashboard);
    }
    document.getElementById("btn-save-detail").addEventListener("click", saveEmployeeDetail);
    document.getElementById("btn-execute-extension").addEventListener("click", executeExtension);
    document.getElementById("btn-print-sk").addEventListener("click", () => {
        if (currentEditingItem) {
            closeDetailModal();
            openSKPreviewModal(currentEditingItem["PNS ID"]);
        }
    });
    const btnDownloadDocx = document.getElementById("btn-download-docx");
    if (btnDownloadDocx) {
        btnDownloadDocx.addEventListener("click", () => {
            if (currentEditingItem) {
                downloadWordContract(currentEditingItem["PNS ID"]);
            }
        });
    }

    // Import Modal Buttons
    document.getElementById("btn-import-trigger").addEventListener("click", openImportModal);
    document.getElementById("btn-close-import-modal").addEventListener("click", closeImportModal);
    document.getElementById("btn-cancel-import").addEventListener("click", closeImportModal);
    
    const fileInput = document.getElementById("file-input");
    const dropzone = document.getElementById("import-dropzone");
    
    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleFileSelect);
    
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    document.getElementById("btn-remove-file").addEventListener("click", removeSelectedImportFile);
    document.getElementById("btn-process-import").addEventListener("click", processDataImport);

    // Export Action
    document.getElementById("btn-export").addEventListener("click", exportToCSV);

    // Clear All Action with Custom Modal
    const clearAllModal = document.getElementById("clear-all-modal");
    
    document.getElementById("btn-clear-all").addEventListener("click", () => {
        if (clearAllModal) {
            document.getElementById("clear-confirm-password").value = "";
            clearAllModal.classList.add("open");
        }
    });

    document.getElementById("btn-close-clear-modal").addEventListener("click", () => {
        clearAllModal.classList.remove("open");
    });
    
    document.getElementById("btn-cancel-clear-modal").addEventListener("click", () => {
        clearAllModal.classList.remove("open");
    });

    document.getElementById("btn-execute-clear-all").addEventListener("click", () => {
        const storedPw = localStorage.getItem("delete_password") || "admin123";
        const pw = document.getElementById("clear-confirm-password").value;
        
        if (pw === storedPw) {
            pppkData = [];
            localStorage.removeItem("pppk_data");
            selectedRows.clear();
            updateBulkActionBar();
            applyFilters();
            updateDashboard();
            clearAllModal.classList.remove("open");
            window.appAlert("Seluruh data pegawai berhasil dihapus.");
        } else {
            window.appAlert("Password salah. Penghapusan data dibatalkan.");
        }
    });

    // Save Password Settings Action
    document.getElementById("btn-save-password").addEventListener("click", () => {
        const storedPw = localStorage.getItem("delete_password") || "admin123";
        const oldPw = document.getElementById("cfg-old-password").value;
        const newPw = document.getElementById("cfg-new-password").value.trim();
        const confirmPw = document.getElementById("cfg-confirm-password").value.trim();

        if (oldPw !== storedPw) {
            window.appAlert("Password saat ini salah.");
            return;
        }
        if (newPw === "") {
            window.appAlert("Password baru tidak boleh kosong.");
            return;
        }
        if (newPw !== confirmPw) {
            window.appAlert("Konfirmasi password baru tidak cocok.");
            return;
        }

        localStorage.setItem("delete_password", newPw);
        document.getElementById("cfg-old-password").value = "";
        document.getElementById("cfg-new-password").value = "";
        document.getElementById("cfg-confirm-password").value = "";
        window.appAlert("Password penghapusan data berhasil diperbarui.");
    });

    // Save Bupati Config Action
    document.getElementById("btn-save-bupati").addEventListener("click", () => {
        const nameVal = document.getElementById("cfg-nama-bupati").value.trim().toUpperCase();
        const jabVal = document.getElementById("cfg-jabatan-bupati").value;
        if (nameVal === "") {
            window.appAlert("Nama Bupati / Pj. Bupati tidak boleh kosong.");
            return;
        }
        localStorage.setItem("bupati_nama", nameVal);
        localStorage.setItem("bupati_jabatan", jabVal);
        window.appAlert("Data Pihak Pertama (Bupati) berhasil disimpan.");
    });

    // Bulk Approve Trigger
    document.getElementById("btn-bulk-approve").addEventListener("click", processBulkApproval);

    // Bulk Merge Contracts Trigger
    const btnBulkMerge = document.getElementById("btn-bulk-merge");
    if (btnBulkMerge) {
        btnBulkMerge.addEventListener("click", () => {
            if (selectedRows.size === 0) {
                window.appAlert("Silakan pilih minimal satu pegawai untuk melakukan penggabungan kontrak.");
                return;
            }
            
            // Map selected ids to employee items
            bulkMergeItems = Array.from(selectedRows).map(id => pppkData.find(p => p["PNS ID"] === id)).filter(Boolean);
            dueBulkMergeItems = null; // reset
            currentEditingItem = null; // unset single edit item

            // Pre-fill the print modal contract date with system date by default
            const printTglKontrak = document.getElementById("print-tgl-kontrak");
            if (printTglKontrak) {
                const formatDateObj = (d) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };
                printTglKontrak.value = formatDateObj(systemDate);
            }

            const printOptionsModal = document.getElementById("print-options-modal");
            if (printOptionsModal) {
                printOptionsModal.classList.add("open");
            }
        });
    }

    // Due Bulk Approve Trigger
    const btnDueBulkApprove = document.getElementById("btn-due-bulk-approve");
    if (btnDueBulkApprove) {
        btnDueBulkApprove.addEventListener("click", processDueBulkApproval);
    }

    // Due Bulk Merge Trigger
    const btnDueBulkMerge = document.getElementById("btn-due-bulk-merge");
    if (btnDueBulkMerge) {
        btnDueBulkMerge.addEventListener("click", () => {
            if (selectedDueRows.size === 0) {
                window.appAlert("Silakan pilih minimal satu pegawai untuk melakukan penggabungan kontrak.");
                return;
            }
            
            // Map selected ids to employee items
            dueBulkMergeItems = Array.from(selectedDueRows).map(id => pppkData.find(p => p["PNS ID"] === id)).filter(Boolean);
            bulkMergeItems = null; // reset
            currentEditingItem = null; // unset single edit item

            // Pre-fill the print modal contract date with system date by default
            const printTglKontrak = document.getElementById("print-tgl-kontrak");
            if (printTglKontrak) {
                const formatDateObj = (d) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };
                printTglKontrak.value = formatDateObj(systemDate);
            }

            const printOptionsModal = document.getElementById("print-options-modal");
            if (printOptionsModal) {
                printOptionsModal.classList.add("open");
            }
        });
    }

    // SK Modal Close
    document.getElementById("btn-close-sk-modal").addEventListener("click", () => {
        document.getElementById("sk-modal").classList.remove("open");
    });

    // Template F4 Upload Config Listeners
    const templateF4FileInput = document.getElementById("template-f4-file-input");
    const templateF4Dropzone = document.getElementById("template-f4-dropzone");
    const btnSaveTemplateF4 = document.getElementById("btn-save-template-f4");
    const btnDeleteTemplateF4 = document.getElementById("btn-delete-template-f4");
    const btnRemoveTemplateF4 = document.getElementById("btn-remove-template-f4");

    if (templateF4Dropzone && templateF4FileInput) {
        templateF4Dropzone.addEventListener("click", () => templateF4FileInput.click());
        templateF4FileInput.addEventListener("change", handleTemplateF4Select);

        templateF4Dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            templateF4Dropzone.classList.add("dragover");
        });
        templateF4Dropzone.addEventListener("dragleave", () => templateF4Dropzone.classList.remove("dragover"));
        templateF4Dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            templateF4Dropzone.classList.remove("dragover");
            if (e.dataTransfer.files.length > 0) {
                templateF4FileInput.files = e.dataTransfer.files;
                handleTemplateF4Select();
            }
        });
    }

    if (btnSaveTemplateF4) btnSaveTemplateF4.addEventListener("click", saveTemplateF4Config);
    if (btnDeleteTemplateF4) btnDeleteTemplateF4.addEventListener("click", deleteTemplateF4Config);
    if (btnRemoveTemplateF4) btnRemoveTemplateF4.addEventListener("click", removeSelectedTemplateF4File);

    // Template A4 Upload Config Listeners
    const templateA4FileInput = document.getElementById("template-a4-file-input");
    const templateA4Dropzone = document.getElementById("template-a4-dropzone");
    const btnSaveTemplateA4 = document.getElementById("btn-save-template-a4");
    const btnDeleteTemplateA4 = document.getElementById("btn-delete-template-a4");
    const btnRemoveTemplateA4 = document.getElementById("btn-remove-template-a4");

    if (templateA4Dropzone && templateA4FileInput) {
        templateA4Dropzone.addEventListener("click", () => templateA4FileInput.click());
        templateA4FileInput.addEventListener("change", handleTemplateA4Select);

        templateA4Dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            templateA4Dropzone.classList.add("dragover");
        });
        templateA4Dropzone.addEventListener("dragleave", () => templateA4Dropzone.classList.remove("dragover"));
        templateA4Dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            templateA4Dropzone.classList.remove("dragover");
            if (e.dataTransfer.files.length > 0) {
                templateA4FileInput.files = e.dataTransfer.files;
                handleTemplateA4Select();
            }
        });
    }

    if (btnSaveTemplateA4) btnSaveTemplateA4.addEventListener("click", saveTemplateA4Config);
    if (btnDeleteTemplateA4) btnDeleteTemplateA4.addEventListener("click", deleteTemplateA4Config);
    if (btnRemoveTemplateA4) btnRemoveTemplateA4.addEventListener("click", removeSelectedTemplateA4File);

    // Template Paruh Waktu F4 Upload Config Listeners
    const templateParuhF4FileInput = document.getElementById("template-paruh-f4-file-input");
    const templateParuhF4Dropzone = document.getElementById("template-paruh-f4-dropzone");
    const btnSaveTemplateParuhF4 = document.getElementById("btn-save-template-paruh-f4");
    const btnDeleteTemplateParuhF4 = document.getElementById("btn-delete-template-paruh-f4");
    const btnRemoveTemplateParuhF4 = document.getElementById("btn-remove-template-paruh-f4");

    if (templateParuhF4Dropzone && templateParuhF4FileInput) {
        templateParuhF4Dropzone.addEventListener("click", () => templateParuhF4FileInput.click());
        templateParuhF4FileInput.addEventListener("change", handleTemplateParuhF4Select);
        templateParuhF4Dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            templateParuhF4Dropzone.classList.add("dragover");
        });
        templateParuhF4Dropzone.addEventListener("dragleave", () => templateParuhF4Dropzone.classList.remove("dragover"));
        templateParuhF4Dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            templateParuhF4Dropzone.classList.remove("dragover");
            if (e.dataTransfer.files.length > 0) {
                templateParuhF4FileInput.files = e.dataTransfer.files;
                handleTemplateParuhF4Select();
            }
        });
    }

    if (btnSaveTemplateParuhF4) btnSaveTemplateParuhF4.addEventListener("click", saveTemplateParuhF4Config);
    if (btnDeleteTemplateParuhF4) btnDeleteTemplateParuhF4.addEventListener("click", deleteTemplateParuhF4Config);
    if (btnRemoveTemplateParuhF4) btnRemoveTemplateParuhF4.addEventListener("click", removeSelectedTemplateParuhF4File);

    // Template Paruh Waktu A4 Upload Config Listeners
    const templateParuhA4FileInput = document.getElementById("template-paruh-a4-file-input");
    const templateParuhA4Dropzone = document.getElementById("template-paruh-a4-dropzone");
    const btnSaveTemplateParuhA4 = document.getElementById("btn-save-template-paruh-a4");
    const btnDeleteTemplateParuhA4 = document.getElementById("btn-delete-template-paruh-a4");
    const btnRemoveTemplateParuhA4 = document.getElementById("btn-remove-template-paruh-a4");

    if (templateParuhA4Dropzone && templateParuhA4FileInput) {
        templateParuhA4Dropzone.addEventListener("click", () => templateParuhA4FileInput.click());
        templateParuhA4FileInput.addEventListener("change", handleTemplateParuhA4Select);
        templateParuhA4Dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            templateParuhA4Dropzone.classList.add("dragover");
        });
        templateParuhA4Dropzone.addEventListener("dragleave", () => templateParuhA4Dropzone.classList.remove("dragover"));
        templateParuhA4Dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            templateParuhA4Dropzone.classList.remove("dragover");
            if (e.dataTransfer.files.length > 0) {
                templateParuhA4FileInput.files = e.dataTransfer.files;
                handleTemplateParuhA4Select();
            }
        });
    }

    if (btnSaveTemplateParuhA4) btnSaveTemplateParuhA4.addEventListener("click", saveTemplateParuhA4Config);
    if (btnDeleteTemplateParuhA4) btnDeleteTemplateParuhA4.addEventListener("click", deleteTemplateParuhA4Config);
    if (btnRemoveTemplateParuhA4) btnRemoveTemplateParuhA4.addEventListener("click", removeSelectedTemplateParuhA4File);

    // Print Options Modal Listeners
    const printOptionsModal = document.getElementById("print-options-modal");
    const btnPrintOptionsTrigger = document.getElementById("btn-print-options-trigger");
    const btnClosePrintOptions = document.getElementById("btn-close-print-options");
    const btnCancelPrintOptions = document.getElementById("btn-cancel-print-options");
    const btnDownloadPrintDocx = document.getElementById("btn-download-print-docx");

    if (btnPrintOptionsTrigger) {
        btnPrintOptionsTrigger.addEventListener("click", () => {
            if (currentEditingItem) {
                printOptionsModal.classList.add("open");
            }
        });
    }

    if (btnClosePrintOptions) {
        btnClosePrintOptions.addEventListener("click", () => {
            printOptionsModal.classList.remove("open");
        });
    }

    if (btnCancelPrintOptions) {
        btnCancelPrintOptions.addEventListener("click", () => {
            printOptionsModal.classList.remove("open");
        });
    }

    if (btnDownloadPrintDocx) {
        btnDownloadPrintDocx.addEventListener("click", () => {
            const paperSize = document.querySelector('input[name="print-template-size"]:checked').value;
            const scope = document.querySelector('input[name="print-scope"]:checked').value;
            const customTgl = document.getElementById("print-tgl-kontrak") ? document.getElementById("print-tgl-kontrak").value : "";

            if (bulkMergeItems && bulkMergeItems.length > 0) {
                downloadMergedContracts(bulkMergeItems, paperSize, scope, customTgl);
                printOptionsModal.classList.remove("open");
            } else if (dueBulkMergeItems && dueBulkMergeItems.length > 0) {
                downloadMergedContracts(dueBulkMergeItems, paperSize, scope, customTgl);
                dueBulkMergeItems = null;
                selectedDueRows.clear();
                updateDueBulkActionBar();
                printOptionsModal.classList.remove("open");
            } else if (currentEditingItem) {
                downloadWordContractWithOptions(currentEditingItem["PNS ID"], paperSize, scope, false);
                printOptionsModal.classList.remove("open");
            }
        });
    }
}

// Sidebar Navigation Switching Tabs
function setupTabSwitcher() {
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            menuItems.forEach(mi => mi.classList.remove("active"));
            
            const targetTab = item.getAttribute("data-tab");
            item.classList.add("active");
            
            // Clear selections when switching tabs
            selectedRows.clear();
            selectedDueRows.clear();
            updateBulkActionBar();
            updateDueBulkActionBar();
            const checkAll = document.getElementById("check-all-pppk");
            if (checkAll) checkAll.checked = false;
            const checkAllDue = document.getElementById("check-all-due");
            if (checkAllDue) checkAllDue.checked = false;

            document.querySelectorAll(".tab-content").forEach(content => {
                content.classList.remove("active");
            });
            document.getElementById(`tab-${targetTab}`).classList.add("active");
            
            // Set Header Titles
            const titleEl = document.getElementById("page-title");
            const subtitleEl = document.getElementById("page-subtitle");
            
            if (targetTab === "dashboard") {
                titleEl.innerText = "Dashboard Analisis";
                subtitleEl.innerText = "Ringkasan status perpanjangan kontrak kerja PPPK";
                document.querySelector(".search-box").style.display = "none";
                document.getElementById("btn-import-trigger").style.display = "none";
                document.getElementById("btn-export").style.display = "none";
                document.getElementById("btn-clear-all").style.display = "none";
            } else if (targetTab === "pegawai") {
                titleEl.innerText = "Data Pegawai PPPK";
                subtitleEl.innerText = "Manajemen profil lengkap kepegawaian, filter data, dan status keaktifan";
                document.querySelector(".search-box").style.display = "flex";
                document.getElementById("btn-import-trigger").style.display = "inline-flex";
                document.getElementById("btn-export").style.display = "inline-flex";
                document.getElementById("btn-clear-all").style.display = "inline-flex";
            } else if (targetTab === "perpanjangan") {
                titleEl.innerText = "Perpanjangan Kontrak";
                subtitleEl.innerText = "Pemrosesan perpanjangan masa kontrak PPPK dan pemantauan BUP";
                document.querySelector(".search-box").style.display = "flex";
                document.getElementById("btn-import-trigger").style.display = "none";
                document.getElementById("btn-export").style.display = "none";
                document.getElementById("btn-clear-all").style.display = "none";
            } else if (targetTab === "riwayat") {
                titleEl.innerText = "Log Administrasi Kontrak";
                subtitleEl.innerText = "Daftar perpanjangan kerja PPPK yang telah diterbitkan SK-nya";
                document.querySelector(".search-box").style.display = "flex";
                document.getElementById("btn-import-trigger").style.display = "none";
                document.getElementById("btn-export").style.display = "none";
                document.getElementById("btn-clear-all").style.display = "none";
            } else if (targetTab === "pengaturan") {
                titleEl.innerText = "Pengaturan Sistem";
                subtitleEl.innerText = "Konfigurasi kata sandi administrasi, template Word, dan data Pihak Pertama";
                document.querySelector(".search-box").style.display = "none";
                document.getElementById("btn-import-trigger").style.display = "none";
                document.getElementById("btn-export").style.display = "none";
                document.getElementById("btn-clear-all").style.display = "none";
            }
            
            currentPage = 1;
            selectedRows.clear();
            updateBulkActionBar();
            
            updateDashboard();
            renderTable();
        });
    });
}

// Filter Logic implementation
function applyFilters() {
    const searchVal = document.getElementById("global-search").value.toLowerCase();
    const statusVal = document.getElementById("filter-status").value;
    const indukVal = document.getElementById("filter-unor-induk").value;
    const atasanVal = document.getElementById("filter-unor-atasan").value;
    const periodeVal = document.getElementById("filter-periode").value;
    const jabatanVal = document.getElementById("filter-jabatan") ? document.getElementById("filter-jabatan").value : "all";
    const statusPppkVal = document.getElementById("filter-status-pppk").value;
    const jenisPppkVal = document.getElementById("filter-jenis-pppk") ? document.getElementById("filter-jenis-pppk").value : "all";

    filteredData = pppkData.filter(item => {
        const period = calculateContractPeriod(item);
        
        // Search Matching
        const matchesSearch = getFullname(item).toLowerCase().includes(searchVal) || 
                              item["NIP BARU"].includes(searchVal) ||
                              item["PNS ID"].toLowerCase().includes(searchVal);
        
        // Status Matching
        const matchesStatus = (statusVal === "all" || period.status === statusVal);
        
        // Unor Induk and Atasan Matching
        const unorParts = getUnorParts(item);
        const matchesInduk = (indukVal === "all" || unorParts.induk === indukVal);
        const matchesAtasan = (atasanVal === "all" || unorParts.atasan === atasanVal);
        
        // Period Matching
        let matchesPeriod = true;
        if (periodeVal === "BUP") {
            matchesPeriod = (period.isBUP === true);
        } else if (periodeVal !== "all") {
            let nextStartStr = "-";
            if (period.awal !== "-") {
                if (item["STATUS_PERPANJANGAN"] === "Disetujui") {
                    nextStartStr = period.awal;
                } else {
                    const nextStart = new Date(period.akhir);
                    nextStart.setDate(nextStart.getDate() + 1);
                    const formatDate = (d) => {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                    };
                    nextStartStr = formatDate(nextStart);
                }
            }
            matchesPeriod = (nextStartStr === periodeVal);
        }

        // Status PPPK Matching
        const itemStatusPppk = item["STATUS_PPPK"] || "Aktif";
        const matchesStatusPppk = (statusPppkVal === "all" || itemStatusPppk === statusPppkVal);

        // Jabatan Matching
        const itemJabatan = item["JABATAN NAMA"] || "-";
        const matchesJabatan = (jabatanVal === "all" || itemJabatan === jabatanVal);
        
        // Jenis PPPK Matching
        const itemJenisPppk = item["JENIS_PPPK"] || "PPPK";
        const matchesJenis = (jenisPppkVal === "all" || itemJenisPppk === jenisPppkVal);

        return matchesSearch && matchesStatus && matchesInduk && matchesAtasan && matchesPeriod && matchesStatusPppk && matchesJabatan && matchesJenis;
    });
    
    // Dynamically update dropdown options to only show available choices in the filtered data
    updateUnorFilters(filteredData);
    updateJabatanFilters(filteredData);
    populatePeriodFilter(filteredData);

    currentPage = 1;
    renderTable();
}

// Helper: Formatter Rupiah IDR
function formatIDR(value) {
    if (value === "" || value === null || value === undefined || isNaN(value) || value === 0) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(value);
}

// Helper: Format any date string to YYYY-MM-DD for input type="date"
function formatDateForInput(dateStr) {
    if (!dateStr || dateStr === "-" || dateStr.trim() === "") return "";
    
    // Clean string (e.g. remove leading/trailing single quotes if any)
    let cleanStr = dateStr.trim().replace(/^['"]|['"]$/g, "");
    
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
        return cleanStr;
    }
    
    // If it's DD/MM/YYYY
    const partsSlash = cleanStr.split("/");
    if (partsSlash.length === 3) {
        let d = partsSlash[0].padStart(2, '0');
        let m = partsSlash[1].padStart(2, '0');
        let y = partsSlash[2];
        if (y.length === 2) y = "20" + y; // handle 2-digit years
        return `${y}-${m}-${d}`;
    }

    // If it's DD-MM-YYYY
    const partsDash = cleanStr.split("-");
    if (partsDash.length === 3 && partsDash[2].length === 4) {
        let d = partsDash[0].padStart(2, '0');
        let m = partsDash[1].padStart(2, '0');
        let y = partsDash[2];
        return `${y}-${m}-${d}`;
    }
    
    // Try to parse using Javascript Date
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    
    return "";
}

// Helper: Format Date strings to Indonesian Standard
function formatIndoDate(dateStr) {
    if (!dateStr || dateStr === "-") return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Helper: Join names with titles
function getFullname(item) {
    const depan = item["GELAR DEPAN"] && item["GELAR DEPAN"] !== "-" ? item["GELAR DEPAN"] + " " : "";
    const belakang = item["GELAR BELAKANG"] && item["GELAR BELAKANG"] !== "-" ? ", " + item["GELAR BELAKANG"] : "";
    return `${depan}${item["NAMA"]}${belakang}`;
}

// Open Edit Profile & Contract Modal
function openDetailModal(id, defaultTab = "tab-personal") {
    currentEditingItem = pppkData.find(item => item["PNS ID"] === id);
    if (!currentEditingItem) return;

    // Load data values into fields
    document.getElementById("m-nama").value = currentEditingItem["NAMA"] || "";
    document.getElementById("m-gelar-depan").value = currentEditingItem["GELAR DEPAN"] || "";
    document.getElementById("m-gelar-belakang").value = currentEditingItem["GELAR BELAKANG"] || "";
    document.getElementById("m-nik").value = currentEditingItem["NIK"] || "";
    document.getElementById("m-tempat-lahir").value = currentEditingItem["TEMPAT LAHIR NAMA"] || "";
    document.getElementById("m-tanggal-lahir").value = formatDateForInput(currentEditingItem["TANGGAL LAHIR"]);
    document.getElementById("m-jenis-kelamin").value = currentEditingItem["JENIS KELAMIN"] || "L";
    document.getElementById("m-agama").value = currentEditingItem["AGAMA NAMA"] || "";
    document.getElementById("m-status-kawin").value = currentEditingItem["JENIS KAWIN NAMA"] || "";
    document.getElementById("m-no-hp").value = currentEditingItem["NOMOR HP"] || "";
    document.getElementById("m-email").value = currentEditingItem["EMAIL"] || "";
    document.getElementById("m-email-gov").value = currentEditingItem["EMAIL GOV"] || "";
    document.getElementById("m-alamat").value = currentEditingItem["ALAMAT"] || "";

    document.getElementById("m-nip-baru").value = currentEditingItem["NIP BARU"] || "";
    document.getElementById("m-nip-lama").value = currentEditingItem["NIP LAMA"] || "";
    document.getElementById("m-pns-id").value = currentEditingItem["PNS ID"] || "";
    document.getElementById("m-jenis-pegawai").value = currentEditingItem["JENIS PEGAWAI NAMA"] || "PPPK";
    document.getElementById("m-tmt-cpns").value = formatDateForInput(currentEditingItem["TMT CPNS"]);
    document.getElementById("m-sk-cpns").value = currentEditingItem["NOMOR SK CPNS"] || "";
    document.getElementById("m-tgl-sk-cpns").value = formatDateForInput(currentEditingItem["TANGGAL SK CPNS"]);
    document.getElementById("m-kedudukan-hukum").value = currentEditingItem["KEDUDUKAN HUKUM NAMA"] || "";
    document.getElementById("m-status-pppk").value = currentEditingItem["STATUS_PPPK"] || "Aktif";
    document.getElementById("m-mk-tahun").value = currentEditingItem["MK TAHUN"] || 0;
    document.getElementById("m-mk-bulan").value = currentEditingItem["MK BULAN"] || 0;

    document.getElementById("m-jabatan").value = currentEditingItem["JABATAN NAMA"] || "";
    document.getElementById("m-jenis-jabatan").value = currentEditingItem["JENIS JABATAN NAMA"] || "";
    document.getElementById("m-tmt-jabatan").value = formatDateForInput(currentEditingItem["TMT JABATAN"]);
    document.getElementById("m-golongan").value = currentEditingItem["GOL AKHIR NAMA"] || "";
    document.getElementById("m-unor").value = currentEditingItem["UNOR NAMA"] || "";
    document.getElementById("m-instansi-induk").value = currentEditingItem["INSTANSI INDUK NAMA"] || "";
    document.getElementById("m-instansi-kerja").value = currentEditingItem["INSTANSI KERJA NAMA"] || "";
    document.getElementById("m-tingkat-pendidikan").value = currentEditingItem["TINGKAT PENDIDIKAN NAMA"] || "";
    document.getElementById("m-pendidikan").value = currentEditingItem["PENDIDIKAN NAMA"] || "";
    document.getElementById("m-tahun-lulus").value = currentEditingItem["TAHUN LULUS"] || "";
    document.getElementById("m-lokasi-kerja").value = currentEditingItem["LOKASI KERJA NAMA"] || "";

    // Load contract fields
    const period = calculateContractPeriod(currentEditingItem);
    document.getElementById("m-no-kontrak").value = currentEditingItem["NOMOR_KONTRAK"] || "";
    document.getElementById("m-awal-kontrak").value = formatIndoDate(period.awal);
    document.getElementById("m-akhir-kontrak").value = formatIndoDate(period.akhir);
    document.getElementById("m-gaji").value = currentEditingItem["GAJI"] || "";

    // Prepopulate perpanjangan/extension input fields
    let nextStart = null;
    let nextEnd = null;

    if (period.akhir && period.akhir !== "-") {
        nextStart = new Date(period.akhir);
        if (!isNaN(nextStart.getTime())) {
            nextStart.setDate(nextStart.getDate() + 1); // 1 day after old end date
            
            nextEnd = new Date(nextStart);
            const contractYears1 = (currentEditingItem["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
            nextEnd.setFullYear(nextStart.getFullYear() + contractYears1);
            nextEnd.setDate(nextEnd.getDate() - 1);
            
            // Calculate BUP cap
            let retireEndDate = null;
            if (currentEditingItem["TANGGAL LAHIR"]) {
                const bDayStr = currentEditingItem["TANGGAL LAHIR"];
                const bParts = bDayStr.split("-");
                let bDate;
                if (bParts.length === 3) {
                    bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
                } else {
                    bDate = new Date(bDayStr);
                }

                if (!isNaN(bDate.getTime())) {
                    const kelompok = getKelompokPegawai(currentEditingItem);
                    const bupYears = (kelompok === "Tenaga Guru") ? 60 : 58;
                    const retireYear = bDate.getFullYear() + bupYears;
                    const retireMonth = bDate.getMonth();
                    retireEndDate = new Date(retireYear, retireMonth + 1, 0);
                }
            }

            if (retireEndDate && nextEnd > retireEndDate) {
                nextEnd.setTime(retireEndDate.getTime());
            }
        }
    }

    const formatDate = (d) => {
        if (!d || isNaN(d.getTime())) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const formattedNextStart = nextStart ? formatDate(nextStart) : "";
    const formattedNextEnd = nextEnd ? formatDate(nextEnd) : "";

    const finalStart = currentEditingItem["NEW_AWAL_KONTRAK"] || formattedNextStart;
    const finalEnd = currentEditingItem["NEW_AKHIR_KONTRAK"] || formattedNextEnd;

    document.getElementById("ext-awal-kontrak").value = formatDateForInput(finalStart);
    document.getElementById("ext-akhir-kontrak").value = formatDateForInput(finalEnd);
    document.getElementById("ext-gaji").value = currentEditingItem["NEW_GAJI"] || Math.round(Number(currentEditingItem["GAJI"] || 3000000) * 1.1); // default 10% increase
    document.getElementById("ext-no-kontrak").value = currentEditingItem["NEW_NOMOR_KONTRAK"] || `${currentEditingItem["NOMOR_KONTRAK"] || 'SPK/PPPK'}-Perpanjangan`;
    document.getElementById("ext-no-sk").value = currentEditingItem["NEW_NOMOR_SK"] || "";
    document.getElementById("ext-tgl-sk").value = formatDateForInput(currentEditingItem["NEW_TANGGAL_SK"] || formatDate(systemDate));

    // Setup action buttons display based on perpanjangan status and contract status
    const btnExecute = document.getElementById("btn-execute-extension");
    const btnPrint = document.getElementById("btn-print-sk");
    const btnPrintOptionsTrigger = document.getElementById("btn-print-options-trigger");
    const extSection = document.querySelector(".extension-form-section");

    if (btnPrintOptionsTrigger) {
        btnPrintOptionsTrigger.style.display = "inline-flex";
    }

    const statusPppkVal = currentEditingItem["STATUS_PPPK"] || "Aktif";
    const isExtensionAllowed = (period.status === "Kontrak Hampir Habis" || period.status === "Kontrak Habis") && statusPppkVal !== "Meninggal" && statusPppkVal !== "Pensiun" && statusPppkVal !== "Tidak Diperpanjang" && statusPppkVal !== "Habis Kontrak";
    const alreadyProcessed = (currentEditingItem["STATUS_PERPANJANGAN"] === "Disetujui" || currentEditingItem["STATUS_PERPANJANGAN"] === "Draf Perpanjangan");

    if (alreadyProcessed) {
        btnExecute.style.display = "none";
        btnPrint.style.display = "inline-flex";
        if (extSection) extSection.style.display = "block";
    } else if (isExtensionAllowed) {
        btnExecute.style.display = "inline-flex";
        btnPrint.style.display = "none";
        if (extSection) extSection.style.display = "block";
    } else {
        // Not allowed to extend (either BUP, Meninggal, or Kontrak Masih Berlaku)
        btnExecute.style.display = "none";
        btnPrint.style.display = "none";
        if (extSection) extSection.style.display = "none";
    }

    // Set Active Tab
    const tabTrigger = document.querySelector(`.tab-btn[data-modal-tab="${defaultTab}"]`);
    if (tabTrigger) tabTrigger.click();

    document.getElementById("detail-modal").classList.add("open");
}

function closeDetailModal() {
    document.getElementById("detail-modal").classList.remove("open");
    currentEditingItem = null;
}

// Save profile fields from edit modal
function saveEmployeeDetail() {
    if (!currentEditingItem) return;

    // Fetch personal fields
    currentEditingItem["NAMA"] = document.getElementById("m-nama").value.trim().toUpperCase();
    currentEditingItem["GELAR DEPAN"] = document.getElementById("m-gelar-depan").value.trim();
    currentEditingItem["GELAR BELAKANG"] = document.getElementById("m-gelar-belakang").value.trim();
    currentEditingItem["NIK"] = document.getElementById("m-nik").value.trim();
    currentEditingItem["TEMPAT LAHIR NAMA"] = document.getElementById("m-tempat-lahir").value.trim().toUpperCase();
    currentEditingItem["TANGGAL LAHIR"] = document.getElementById("m-tanggal-lahir").value;
    currentEditingItem["JENIS KELAMIN"] = document.getElementById("m-jenis-kelamin").value;
    currentEditingItem["AGAMA NAMA"] = document.getElementById("m-agama").value.trim().toUpperCase();
    currentEditingItem["JENIS KAWIN NAMA"] = document.getElementById("m-status-kawin").value.trim().toUpperCase();
    currentEditingItem["NOMOR HP"] = document.getElementById("m-no-hp").value.trim();
    currentEditingItem["EMAIL"] = document.getElementById("m-email").value.trim();
    currentEditingItem["EMAIL GOV"] = document.getElementById("m-email-gov").value.trim();
    currentEditingItem["ALAMAT"] = document.getElementById("m-alamat").value.trim();

    // Kepegawaian
    currentEditingItem["NIP BARU"] = document.getElementById("m-nip-baru").value.trim();
    currentEditingItem["NIP LAMA"] = document.getElementById("m-nip-lama").value.trim();
    currentEditingItem["TMT CPNS"] = document.getElementById("m-tmt-cpns").value;
    currentEditingItem["NOMOR SK CPNS"] = document.getElementById("m-sk-cpns").value.trim();
    currentEditingItem["TANGGAL SK CPNS"] = document.getElementById("m-tgl-sk-cpns").value;
    currentEditingItem["KEDUDUKAN HUKUM NAMA"] = document.getElementById("m-kedudukan-hukum").value.trim().toUpperCase();
    currentEditingItem["STATUS_PPPK"] = document.getElementById("m-status-pppk").value;
    currentEditingItem["MK TAHUN"] = parseInt(document.getElementById("m-mk-tahun").value) || 0;
    currentEditingItem["MK BULAN"] = parseInt(document.getElementById("m-mk-bulan").value) || 0;

    currentEditingItem["JABATAN NAMA"] = document.getElementById("m-jabatan").value.trim().toUpperCase();
    currentEditingItem["JENIS JABATAN NAMA"] = document.getElementById("m-jenis-jabatan").value.trim().toUpperCase();
    currentEditingItem["TMT JABATAN"] = document.getElementById("m-tmt-jabatan").value;
    currentEditingItem["GOL AKHIR NAMA"] = document.getElementById("m-golongan").value.trim();
    currentEditingItem["UNOR NAMA"] = document.getElementById("m-unor").value.trim().toUpperCase();
    currentEditingItem["INSTANSI INDUK NAMA"] = document.getElementById("m-instansi-induk").value.trim().toUpperCase();
    currentEditingItem["INSTANSI KERJA NAMA"] = document.getElementById("m-instansi-kerja").value.trim().toUpperCase();
    currentEditingItem["TINGKAT PENDIDIKAN NAMA"] = document.getElementById("m-tingkat-pendidikan").value.trim().toUpperCase();
    currentEditingItem["PENDIDIKAN NAMA"] = document.getElementById("m-pendidikan").value.trim().toUpperCase();
    currentEditingItem["TAHUN LULUS"] = parseInt(document.getElementById("m-tahun-lulus").value) || 0;
    currentEditingItem["LOKASI KERJA NAMA"] = document.getElementById("m-lokasi-kerja").value.trim().toUpperCase();

    // Contract active & Gaji
    currentEditingItem["NOMOR_KONTRAK"] = document.getElementById("m-no-kontrak").value.trim();
    currentEditingItem["GAJI"] = parseFloat(document.getElementById("m-gaji").value) || 0;

    // Cache perpanjangan details if user modified them but hasn't finalized yet
    currentEditingItem["NEW_NOMOR_KONTRAK"] = document.getElementById("ext-no-kontrak").value.trim();
    currentEditingItem["NEW_NOMOR_SK"] = document.getElementById("ext-no-sk").value.trim();
    currentEditingItem["NEW_TANGGAL_SK"] = document.getElementById("ext-tgl-sk").value;
    currentEditingItem["NEW_GAJI"] = parseFloat(document.getElementById("ext-gaji").value) || 0;
    currentEditingItem["NEW_AWAL_KONTRAK"] = document.getElementById("ext-awal-kontrak").value;
    currentEditingItem["NEW_AKHIR_KONTRAK"] = document.getElementById("ext-akhir-kontrak").value;
    
    if (currentEditingItem["STATUS_PERPANJANGAN"] === "Belum Diproses" && currentEditingItem["NEW_NOMOR_SK"] !== "") {
        currentEditingItem["STATUS_PERPANJANGAN"] = "Draf Perpanjangan";
    }

    // Clear caches
    delete currentEditingItem._periodCache;
    delete currentEditingItem._unorCache;

    saveDataToFirebase();
    closeDetailModal();
    
    updateDashboard();
    renderTable();
    window.appAlert("Data profil berhasil disimpan.");
}

// Finalize and process the contract extension
function executeExtension() {
    if (!currentEditingItem) return;

    const newNoKontrak = document.getElementById("ext-no-kontrak").value.trim();
    const newNoSK = document.getElementById("ext-no-sk").value.trim();
    const newTglSK = document.getElementById("ext-tgl-sk").value;
    const newGaji = parseFloat(document.getElementById("ext-gaji").value) || 0;

    if (!newNoKontrak || !newNoSK || !newTglSK || newGaji <= 0) {
        window.appAlert("Mohon isi semua data Perpanjangan Kontrak (Nomor Kontrak Baru, Nomor SK, Tanggal SK, dan Gaji Baru) dengan benar.");
        return;
    }

    // Set status to approved
    currentEditingItem["STATUS_PERPANJANGAN"] = "Disetujui";
    
    // Clear caches
    delete currentEditingItem._periodCache;
    delete currentEditingItem._unorCache;

    // Save new values
    currentEditingItem["NEW_NOMOR_KONTRAK"] = newNoKontrak;
    currentEditingItem["NEW_NOMOR_SK"] = newNoSK;
    currentEditingItem["NEW_TANGGAL_SK"] = newTglSK;
    currentEditingItem["NEW_GAJI"] = newGaji;
    currentEditingItem["NEW_AWAL_KONTRAK"] = document.getElementById("ext-awal-kontrak").value;
    currentEditingItem["NEW_AKHIR_KONTRAK"] = document.getElementById("ext-akhir-kontrak").value;

    // Log to history
    logHistory(currentEditingItem);

    saveDataToFirebase();
    closeDetailModal();
    
    updateDashboard();
    renderTable();
    window.appAlert("Kontrak PPPK berhasil diperpanjang.");
}

// Render the entire history log from local state
function renderHistoryLog() {
    const historyBody = document.getElementById("history-log-body");
    if (!historyBody) return;
    
    let historyHtml = "";
    
    pppkData.forEach(item => {
        if (item["STATUS_PERPANJANGAN"] === "Disetujui") {
            historyHtml = getLogHistoryHtml(item) + historyHtml; 
        }
    });
    
    if (historyHtml === "") {
        historyBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Belum ada riwayat perpanjangan yang diproses.</td></tr>';
    } else {
        historyBody.innerHTML = historyHtml;
    }
}

// Get HTML string for a history log item
function getLogHistoryHtml(item) {
    const todayStr = formatIndoDate(systemDate.toISOString().split("T")[0]);

    // Calculate dates directly from item instead of DOM
    const period = calculateContractPeriod(item);
    let nextStartStr = "-";
    let nextEndStr = "-";

    if (period.akhir && period.akhir !== "-") {
        const nextStart = new Date(period.akhir);
        if (!isNaN(nextStart.getTime())) {
            nextStart.setDate(nextStart.getDate() + 1);
            
            const nextEnd = new Date(nextStart);
            const contractYears2 = (item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
            nextEnd.setFullYear(nextStart.getFullYear() + contractYears2);
            nextEnd.setDate(nextEnd.getDate() - 1);
            
            // BUP cap
            let retireEndDate = null;
            if (item["TANGGAL LAHIR"]) {
                const bDayStr = item["TANGGAL LAHIR"];
                const bParts = bDayStr.split("-");
                let bDate;
                if (bParts.length === 3) {
                    bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
                } else {
                    bDate = new Date(bDayStr);
                }

                if (!isNaN(bDate.getTime())) {
                    const kelompok = getKelompokPegawai(item);
                    const bupYears = (kelompok === "Tenaga Guru") ? 60 : 58;
                    const retireYear = bDate.getFullYear() + bupYears;
                    const retireMonth = bDate.getMonth();
                    retireEndDate = new Date(retireYear, retireMonth + 1, 0);
                }
            }

            if (retireEndDate && nextEnd > retireEndDate) {
                nextEnd.setTime(retireEndDate.getTime());
            }

            const formatDate = (d) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            };

            nextStartStr = formatDate(nextStart);
            nextEndStr = formatDate(nextEnd);
        }
    }

    const contractYears = (item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
    return `<tr>
        <td>${todayStr}</td>
        <td>
            <div class="emp-name-wrapper">
                <strong>${getFullname(item)}</strong>
                <span>NIP: ${item["NIP BARU"]}</span>
            </div>
        </td>
        <td>${item["NEW_NOMOR_KONTRAK"]}</td>
        <td>${item["NEW_NOMOR_SK"]}</td>
        <td>${formatIDR(item["NEW_GAJI"])}</td>
        <td>${contractYears} Tahun (${formatIndoDate(nextStartStr)} s.d. ${formatIndoDate(nextEndStr)})</td>
        <td>Administrator</td>
    </tr>`;
}

// Add logs to history tab dynamically for single items
function logHistory(item) {
    const historyBody = document.getElementById("history-log-body");
    if (historyBody.innerHTML.includes("Belum ada riwayat")) {
        historyBody.innerHTML = "";
    }
    historyBody.insertAdjacentHTML('afterbegin', getLogHistoryHtml(item));
}

// Process Multi/Bulk Approval
async function processBulkApproval() {
    if (selectedRows.size === 0) return;

    const processableIds = [];
    selectedRows.forEach(id => {
        const item = pppkData.find(p => p["PNS ID"] === id);
        if (item && item["STATUS_PERPANJANGAN"] !== "Disetujui") {
            const period = calculateContractPeriod(item);
            const statusPppk = item["STATUS_PPPK"] || "Aktif";
            const isProcessable = (period.status === "Kontrak Hampir Habis" || period.status === "Kontrak Habis") && statusPppk !== "Meninggal" && statusPppk !== "Pensiun" && statusPppk !== "Tidak Diperpanjang";
            if (isProcessable) {
                processableIds.push(id);
            }
        }
    });

    if (processableIds.length === 0) {
        window.appAlert("Tidak ada pegawai terpilih yang memenuhi syarat untuk perpanjangan kontrak (hanya untuk pegawai dengan status Kontrak Hampir Habis atau Kontrak Habis yang belum diproses).");
        return;
    }

    const confirmed = await window.appConfirm(`Apakah Anda yakin ingin memperpanjang kontrak untuk ${processableIds.length} pegawai terpilih secara massal?`);
    if (confirmed) {
        processableIds.forEach(id => {
            const item = pppkData.find(p => p["PNS ID"] === id);
            const period = calculateContractPeriod(item);
            
            const nextStart = new Date(period.akhir);
            nextStart.setDate(nextStart.getDate() + 1); // 1 day after old end date

            // Calculate BUP cap
            let retireEndDate = null;
            if (item["TANGGAL LAHIR"]) {
                const bDayStr = item["TANGGAL LAHIR"];
                const bParts = bDayStr.split("-");
                let bDate;
                if (bParts.length === 3) {
                    bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
                } else {
                    bDate = new Date(bDayStr);
                }

                if (!isNaN(bDate.getTime())) {
                    const kelompok = getKelompokPegawai(item);
                    const bupYears = (kelompok === "Tenaga Guru") ? 60 : 58;
                    const retireYear = bDate.getFullYear() + bupYears;
                    const retireMonth = bDate.getMonth();
                    retireEndDate = new Date(retireYear, retireMonth + 1, 0);
                }
            }

            const nextEnd = new Date(nextStart);
            const contractYears3 = (item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
            nextEnd.setFullYear(nextStart.getFullYear() + contractYears3);
            nextEnd.setDate(nextEnd.getDate() - 1);

            if (retireEndDate && nextEnd > retireEndDate) {
                nextEnd.setTime(retireEndDate.getTime());
            }

            const formatDate = (d) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            };

            item["STATUS_PERPANJANGAN"] = "Disetujui";
            
            // Clear caches
            delete item._periodCache;
            delete item._unorCache;

            item["NEW_NOMOR_KONTRAK"] = `${item["NOMOR_KONTRAK"] || 'SPK/PPPK'}-Perpanjangan-Massal`;
            item["NEW_NOMOR_SK"] = `SK/PPPK/MASSAL/${new Date().getFullYear()}/${item["PNS ID"].substring(1, 6)}`;
            item["NEW_TANGGAL_SK"] = formatDate(systemDate);
            item["NEW_GAJI"] = Math.round(Number(item["GAJI"] || 3000000) * 1.1); // automatic 10% raise
            
            logHistory(item);
        });

        selectedRows.clear();
        updateBulkActionBar();
        saveDataToFirebase();
        updateDashboard();
        renderTable();
        window.appAlert("Kontrak massal berhasil diproses.");
    }
}

// Process Multi/Bulk Approval on Due Contracts Tab
async function processDueBulkApproval() {
    if (selectedDueRows.size === 0) return;

    const processableIds = [];
    selectedDueRows.forEach(id => {
        const item = pppkData.find(p => p["PNS ID"] === id);
        if (item && item["STATUS_PERPANJANGAN"] !== "Disetujui") {
            const period = calculateContractPeriod(item);
            const statusPppk = item["STATUS_PPPK"] || "Aktif";
            const isProcessable = (period.status === "Kontrak Hampir Habis" || period.status === "Kontrak Habis") && statusPppk !== "Meninggal" && statusPppk !== "Pensiun" && statusPppk !== "Tidak Diperpanjang";
            if (isProcessable) {
                processableIds.push(id);
            }
        }
    });

    if (processableIds.length === 0) {
        window.appAlert("Tidak ada pegawai terpilih yang memenuhi syarat untuk perpanjangan kontrak (hanya untuk pegawai dengan status Kontrak Hampir Habis atau Kontrak Habis yang belum diproses).");
        return;
    }

    const confirmed = await window.appConfirm(`Apakah Anda yakin ingin membuat draf kontrak untuk ${processableIds.length} pegawai terpilih secara massal?`);
    if (confirmed) {
        processableIds.forEach(id => {
            const item = pppkData.find(p => p["PNS ID"] === id);
            const period = calculateContractPeriod(item);
            
            const nextStart = new Date(period.akhir);
            nextStart.setDate(nextStart.getDate() + 1); // 1 day after old end date

            // Calculate BUP cap
            let retireEndDate = null;
            if (item["TANGGAL LAHIR"]) {
                const bDayStr = item["TANGGAL LAHIR"];
                const bParts = bDayStr.split("-");
                let bDate;
                if (bParts.length === 3) {
                    bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
                } else {
                    bDate = new Date(bDayStr);
                }

                if (!isNaN(bDate.getTime())) {
                    const kelompok = getKelompokPegawai(item);
                    const bupYears = (kelompok === "Tenaga Guru") ? 60 : 58;
                    const retireYear = bDate.getFullYear() + bupYears;
                    const retireMonth = bDate.getMonth();
                    retireEndDate = new Date(retireYear, retireMonth + 1, 0);
                }
            }

            const nextEnd = new Date(nextStart);
            const contractYears4 = (item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
            nextEnd.setFullYear(nextStart.getFullYear() + contractYears4);
            nextEnd.setDate(nextEnd.getDate() - 1);

            if (retireEndDate && nextEnd > retireEndDate) {
                nextEnd.setTime(retireEndDate.getTime());
            }

            const formatDate = (d) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            };

            item["STATUS_PERPANJANGAN"] = "Disetujui";
            
            // Clear caches
            delete item._periodCache;
            delete item._unorCache;

            item["NEW_NOMOR_KONTRAK"] = `${item["NOMOR_KONTRAK"] || 'SPK/PPPK'}-Perpanjangan-Massal`;
            item["NEW_NOMOR_SK"] = `SK/PPPK/MASSAL/${new Date().getFullYear()}/${item["PNS ID"].substring(1, 6)}`;
            item["NEW_TANGGAL_SK"] = formatDate(systemDate);
            item["NEW_GAJI"] = Number(item["GAJI"] || 0); // No automatic 10% raise
            
            logHistory(item);
        });

        selectedDueRows.clear();
        updateDueBulkActionBar();
        saveDataToFirebase();
        updateDashboard();
        renderTable();
        window.appAlert("Kontrak massal berhasil diproses.");
    }
}

// Open SK Document Modal and populate values
function openSKPreviewModal(id) {
    const item = pppkData.find(p => p["PNS ID"] === id);
    if (!item) return;

    const period = calculateContractPeriod(item);
    const formatFullDate = (dStr) => formatIndoDate(dStr);

    document.getElementById("sk-print-no-sk").innerText = item["NEW_NOMOR_SK"] || "NOMOR SK BELUM DITERBITKAN";
    document.getElementById("sk-print-nama").innerText = getFullname(item);
    document.getElementById("sk-print-nip").innerText = item["NIP BARU"] || "-";
    document.getElementById("sk-print-pendidikan").innerText = `${item["TINGKAT PENDIDIKAN NAMA"]} - ${item["PENDIDIKAN NAMA"]}`;
    document.getElementById("sk-print-jabatan").innerText = item["JABATAN NAMA"] || "-";
    document.getElementById("sk-print-unor").innerText = item["UNOR NAMA"] || "-";
    document.getElementById("sk-print-no-kontrak").innerText = item["NEW_NOMOR_KONTRAK"] || "-";
    
    // Dates
    let nextStartStr, nextEndStr;
    if (item["STATUS_PERPANJANGAN"] === "Disetujui") {
        nextStartStr = period.awal;
        nextEndStr = period.akhir;
    } else {
        const nextStart = new Date(period.akhir);
        nextStart.setDate(nextStart.getDate() + 1); // 1 day after old end date
        
        // Calculate BUP cap
        let retireEndDate = null;
        if (item["TANGGAL LAHIR"]) {
            const bDayStr = item["TANGGAL LAHIR"];
            const bParts = bDayStr.split("-");
            let bDate;
            if (bParts.length === 3) {
                bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
            } else {
                bDate = new Date(bDayStr);
            }

            if (!isNaN(bDate.getTime())) {
                const kelompok = getKelompokPegawai(item);
                const bupYears = (kelompok === "Tenaga Guru") ? 60 : 58;
                const retireYear = bDate.getFullYear() + bupYears;
                const retireMonth = bDate.getMonth();
                retireEndDate = new Date(retireYear, retireMonth + 1, 0);
            }
        }

        const nextEnd = new Date(nextStart);
        const contractYears5 = (item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
        nextEnd.setFullYear(nextStart.getFullYear() + contractYears5);
        nextEnd.setDate(nextEnd.getDate() - 1);

        if (retireEndDate && nextEnd > retireEndDate) {
            nextEnd.setTime(retireEndDate.getTime());
        }

        const formatDateStr = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
        nextStartStr = formatDateStr(nextStart);
        nextEndStr = formatDateStr(nextEnd);
    }

    document.getElementById("sk-print-tmt-awal").innerText = formatFullDate(nextStartStr);
    document.getElementById("sk-print-tmt-akhir").innerText = formatFullDate(nextEndStr);
    document.getElementById("sk-print-gaji").innerText = formatIDR(item["NEW_GAJI"] || item["GAJI"]);
    document.getElementById("sk-print-tgl-sk").innerText = formatFullDate(item["NEW_TANGGAL_SK"] || new Date().toISOString().split("T")[0]);

    // Dynamic Bupati details
    document.getElementById("sk-print-jabatan-bupati").innerText = localStorage.getItem("bupati_jabatan") || "Bupati";
    document.getElementById("sk-print-nama-bupati").innerText = localStorage.getItem("bupati_nama") || "DR. H. MOCHAMAD RIDWAN KAMIL, S.T., M.U.D.";

    document.getElementById("sk-modal").classList.add("open");
}

// Import Modal Handlers
let importFileContent = null;

function openImportModal() {
    document.getElementById("import-modal").classList.add("open");
}

function closeImportModal() {
    document.getElementById("import-modal").classList.remove("open");
    removeSelectedImportFile();
}

function handleFileSelect() {
    const fileInput = document.getElementById("file-input");
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        document.getElementById("import-filename").innerText = file.name;
        document.getElementById("import-filesize").innerText = `${(file.size / 1024).toFixed(2)} KB`;
        
        document.getElementById("import-dropzone").style.display = "none";
        document.getElementById("import-file-details").style.display = "flex";
        
        const nameLower = file.name.toLowerCase();
        const isExcel = nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls");
        
        const reader = new FileReader();
        reader.onload = (e) => {
            importFileContent = e.target.result;
            document.getElementById("btn-process-import").disabled = false;
        };
        
        if (isExcel) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }
}

function removeSelectedImportFile() {
    document.getElementById("file-input").value = "";
    importFileContent = null;
    document.getElementById("btn-process-import").disabled = true;
    document.getElementById("import-dropzone").style.display = "flex";
    document.getElementById("import-file-details").style.display = "none";
}

// Sanitize imported date values to standard YYYY-MM-DD
function sanitizeImportedDate(dateVal) {
    if (!dateVal) return "";
    let str = String(dateVal).trim().replace(/^['"]|['"]$/g, "");
    if (str === "" || str === "-" || str === "0") return "";

    // 1. Already standard YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
    }

    // 2. Parse Slash Dates (DD/MM/YYYY or YYYY/MM/DD)
    const partsSlash = str.split("/");
    if (partsSlash.length === 3) {
        if (partsSlash[0].length === 4) {
            // YYYY/MM/DD
            let y = partsSlash[0];
            let m = partsSlash[1].padStart(2, '0');
            let d = partsSlash[2].padStart(2, '0');
            return `${y}-${m}-${d}`;
        } else {
            // DD/MM/YYYY or DD/MM/YY
            let d = partsSlash[0].padStart(2, '0');
            let m = partsSlash[1].padStart(2, '0');
            let y = partsSlash[2];
            if (y.length === 2) y = "20" + y;
            return `${y}-${m}-${d}`;
        }
    }

    // 3. Parse Dash Dates (DD-MM-YYYY or YYYY-MM-DD variation)
    const partsDash = str.split("-");
    if (partsDash.length === 3) {
        if (partsDash[0].length === 4) {
            // YYYY-MM-DD
            let y = partsDash[0];
            let m = partsDash[1].padStart(2, '0');
            let d = partsDash[2].padStart(2, '0');
            return `${y}-${m}-${d}`;
        } else {
            // DD-MM-YYYY or DD-MM-YY
            let d = partsDash[0].padStart(2, '0');
            let m = partsDash[1].padStart(2, '0');
            let y = partsDash[2];
            if (y.length === 2) y = "20" + y;
            return `${y}-${m}-${d}`;
        }
    }

    // 4. Excel serial date number
    if (/^\d+(\.\d+)?$/.test(str)) {
        const serial = parseFloat(str);
        const dateObj = new Date(Math.round((serial - 25569) * 86400 * 1000));
        if (!isNaN(dateObj.getTime())) {
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
    }

    // 5. Try JavaScript default parser
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
        const y = parsedDate.getFullYear();
        const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    return "";
}

// Parse Excel file content
function parseExcel(arrayBuffer) {
    if (typeof XLSX === "undefined") {
        throw new Error("Library SheetJS (XLSX) tidak terdeteksi. Pastikan koneksi internet aktif untuk memuat library.");
    }
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    // Convert to JSON array of objects
    return XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
}

// Process actual import from file content (supporting JSON / CSV / Excel)
function processDataImport() {
    if (!importFileContent) return;

    try {
        let imported = [];
        const fileInput = document.getElementById("file-input");
        const nameLower = fileInput.files[0].name.toLowerCase();
        const isCSV = nameLower.endsWith(".csv");
        const isExcel = nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls");

        if (isExcel) {
            imported = parseExcel(importFileContent);
        } else if (isCSV) {
            imported = parseCSV(importFileContent);
        } else {
            imported = JSON.parse(importFileContent);
        }

        if (!Array.isArray(imported)) {
            throw new Error("Format data harus berupa array pegawai.");
        }

        // Get the selected import method and jenis PPPK
        const importMode = document.querySelector('input[name="import-mode"]:checked').value;
        const importJenis = document.querySelector('input[name="import-jenis"]:checked').value;

        // Standardize imported records to make sure our default fields exist and are sanitized
        const standardized = imported.map((emp, index) => {
            let nipBaru = emp["NIP BARU"] || emp["NIP"] || `19900000000000000${index}`;
            let nipLama = emp["NIP LAMA"] || "-";
            if (typeof nipBaru === "string") nipBaru = nipBaru.trim().replace(/^'/, "");
            if (typeof nipLama === "string") nipLama = nipLama.trim().replace(/^'/, "");
            
            let jk = emp["JENIS KELAMIN"] || "L";
            if (typeof jk === "string") {
                const jkU = jk.toUpperCase();
                if (jkU === "F" || jkU.includes("PEREMPUAN") || jkU.includes("WANITA")) jk = "P";
                else if (jkU === "M" || jkU.includes("LAKI") || jkU.includes("PRIA")) jk = "L";
            }

            return {
                ...emp,
                "PNS ID": emp["PNS ID"] || `I${Date.now()}${index}`,
                "NIP BARU": nipBaru,
                "NIP LAMA": nipLama,
                "NAMA": emp["NAMA"] || "PEGAWAI BARU",
                "TANGGAL LAHIR": sanitizeImportedDate(emp["TANGGAL LAHIR"]),
                "TMT CPNS": sanitizeImportedDate(emp["TMT CPNS"]) || "2021-01-01",
                "TANGGAL SK CPNS": sanitizeImportedDate(emp["TANGGAL SK CPNS"]),
                "TMT JABATAN": sanitizeImportedDate(emp["TMT JABATAN"]),
                "GAJI": emp["GAJI"] ? parseFloat(emp["GAJI"]) : "",
                "NOMOR_KONTRAK": emp["NOMOR_KONTRAK"] || `SPK/${index}/2021`,
                "STATUS_PERPANJANGAN": emp["STATUS_PERPANJANGAN"] || "Belum Diproses",
                "STATUS_PPPK": emp["STATUS_PPPK"] || "Aktif",
                "JENIS_PPPK": emp["JENIS_PPPK"] || importJenis,
                "JENIS KELAMIN": jk
            };
        });

        if (importMode === "overwrite") {
            pppkData = standardized;
        } else {
            // Append and merge (by PNS ID)
            const existingMap = new Map(pppkData.map(emp => [emp["PNS ID"], emp]));
            standardized.forEach(emp => {
                existingMap.set(emp["PNS ID"], emp);
            });
            pppkData = Array.from(existingMap.values());
        }
        
        saveDataToFirebase();
        
        closeImportModal();
        applyFilters();
        updateDashboard();
        window.appAlert(`Berhasil mengimpor ${standardized.length} data PPPK.`);
    } catch (e) {
        window.appAlert("Gagal mengimpor file: " + e.message);
    }
}

// Basic CSV Parser
function parseCSV(text) {
    const lines = text.split("\n").filter(l => l.trim() !== "");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const currentline = lines[i].split(",");
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            const val = currentline[j] ? currentline[j].trim().replace(/^["']|["']$/g, "") : "";
            obj[headers[j]] = val;
        }
        results.push(obj);
    }
    return results;
}

// Export Local PPPK Data to CSV
function exportToCSV() {
    if (filteredData.length === 0) {
        window.appAlert("Tidak ada data untuk diekspor.");
        return;
    }

    // Base headers
    const baseHeaders = Object.keys(pppkData[0]);
    
    // Extra computed headers
    const extraHeaders = [
        "ALAMAT_SURAT",
        "JABATAN_SURAT",
        "KELOMPOK_PEGAWAI",
        "FUNGSI_PEGAWAI",
        "SASARAN_PELAYANAN",
        "GOLONGAN_SURAT",
        "TEMPAT_TGL_LAHIR",
        "PENDIDIKAN_LULUS",
        "TMT_AWAL_BARU",
        "TMT_AKHIR_BARU",
        "GAJI_BARU",
        "GAJI_BARU_ANGKA",
        "GAJI_TERBILANG",
        "KONTRAK_HARI",
        "KONTRAK_TANGGAL_TERBILANG",
        "KONTRAK_BULAN",
        "KONTRAK_TAHUN_TERBILANG",
        "NAMA_BUPATI",
        "JABATAN_BUPATI"
    ];

    const allHeaders = [...baseHeaders, ...extraHeaders];
    
    // Map data to lines
    const csvRows = [];
    csvRows.push(allHeaders.join(","));

    filteredData.forEach(item => {
        const computed = getComputedValues(item);
        const values = allHeaders.map(header => {
            let val = "";
            if (extraHeaders.includes(header)) {
                val = computed[header] === undefined || computed[header] === null ? "" : String(computed[header]);
            } else {
                val = item[header] === undefined || item[header] === null ? "" : String(item[header]);
            }
            
            // Prevent Excel from corrupting long numbers (NIP, NIK, BPJS) or dropping leading zeros (No. HP)
            if (/^\d{10,}$/.test(val) || /^0\d+$/.test(val)) {
                val = "'" + val;
            }
            
            const escaped = val.replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_perpanjangan_pppk_${systemDate.toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper to convert number to Indonesian words (Terbilang)
function terbilang(angka) {
    const bilne = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    angka = Math.floor(angka);
    if (angka < 12) {
        return bilne[angka];
    } else if (angka < 20) {
        return (terbilang(angka - 10) + " Belas").trim();
    } else if (angka < 100) {
        return (terbilang(angka / 10) + " Puluh " + terbilang(angka % 10)).trim();
    } else if (angka < 200) {
        return ("Seratus " + terbilang(angka - 100)).trim();
    } else if (angka < 1000) {
        return (terbilang(angka / 100) + " Ratus " + terbilang(angka % 100)).trim();
    } else if (angka < 2000) {
        return ("Seribu " + terbilang(angka - 1000)).trim();
    } else if (angka < 1000000) {
        return (terbilang(angka / 1000) + " Ribu " + terbilang(angka % 1000)).trim();
    } else if (angka < 1000000000) {
        return (terbilang(angka / 1000000) + " Juta " + terbilang(angka % 1000000)).trim();
    } else if (angka < 1000000000000) {
        return (terbilang(angka / 1000000000) + " Milyar " + terbilang(angka % 1000000000)).trim();
    }
    return "";
}

function getIndoDayName(date) {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
}

function getIndoMonthName(date) {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return months[date.getMonth()];
}

// Compute extra variables for SK / Word template
function getComputedValues(item) {
    const period = calculateContractPeriod(item);
    
    // Determine whether to print active or extension contract TMT dates
    let startFormatted = "";
    let endFormatted = "";
    
    const isMasihBerlaku = (period.status === "Kontrak Masih Berlaku");
    
    if (isMasihBerlaku) {
        // Use the current active contract dates
        startFormatted = period.awal;
        endFormatted = period.akhir;
    } else {
        // Use saved custom extension dates if available, otherwise calculate defaults
        if (item["NEW_AWAL_KONTRAK"] && item["NEW_AKHIR_KONTRAK"]) {
            startFormatted = item["NEW_AWAL_KONTRAK"];
            endFormatted = item["NEW_AKHIR_KONTRAK"];
        } else {
            // Use the next extension dates (1 day after old end date)
            let nextStart = null;
            if (period.akhir && period.akhir !== "-") {
                nextStart = new Date(period.akhir);
                if (!isNaN(nextStart.getTime())) {
                    nextStart.setDate(nextStart.getDate() + 1);
                }
            }
            
            let nextEnd = null;
            if (nextStart) {
                nextEnd = new Date(nextStart);
                const contractYears6 = (item["JENIS_PPPK"] === "PPPK Paruh Waktu") ? 1 : 5;
                nextEnd.setFullYear(nextStart.getFullYear() + contractYears6);
                nextEnd.setDate(nextEnd.getDate() - 1);
                
                // Apply Batas Usia Pensiun (BUP) cap
                let retireEndDate = null;
                if (item["TANGGAL LAHIR"]) {
                    const bDayStr = item["TANGGAL LAHIR"];
                    const bParts = bDayStr.split("-");
                    let bDate;
                    if (bParts.length === 3) {
                        bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
                    } else {
                        bDate = new Date(bDayStr);
                    }

                    if (!isNaN(bDate.getTime())) {
                        const kelompok = getKelompokPegawai(item);
                        const bupYears = (kelompok === "Tenaga Guru") ? 60 : 58;
                        const retireYear = bDate.getFullYear() + bupYears;
                        const retireMonth = bDate.getMonth();
                        retireEndDate = new Date(retireYear, retireMonth + 1, 0);
                    }
                }

                if (retireEndDate && nextEnd > retireEndDate) {
                    nextEnd.setTime(retireEndDate.getTime());
                }
            }
            
            const formatDateObj = (d) => {
                if (!d || isNaN(d.getTime())) return "";
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            };
            
            startFormatted = nextStart ? formatDateObj(nextStart) : "";
            endFormatted = nextEnd ? formatDateObj(nextEnd) : "";
        }
    }

    // Default contract signing date calculation
    let tglKontrakStr = "";
    const formatDateObj = (d) => {
        if (!d || isNaN(d.getTime())) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    
    if (isMasihBerlaku) {
        tglKontrakStr = item["TANGGAL SK CPNS"] || item["NEW_TANGGAL_SK"] || formatDateObj(systemDate);
    } else {
        tglKontrakStr = item["NEW_TANGGAL_SK"] || formatDateObj(systemDate);
    }
    // Clean up input value (ensure yyyy-mm-dd)
    if (tglKontrakStr.includes("/")) {
        const parts = tglKontrakStr.split("/");
        if (parts.length === 3) {
            tglKontrakStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    const tglKontrak = new Date(tglKontrakStr);

    // Gaji Pokok Baru mapping
    let gajiBaru;
    if (isMasihBerlaku) {
        gajiBaru = item["GAJI"] || 0;
    } else {
        gajiBaru = item["NEW_GAJI"] || item["GAJI"] || 0;
    }

    // Nomor Kontrak Baru mapping
    let noKontrakBaru;
    if (isMasihBerlaku) {
        noKontrakBaru = item["NOMOR_KONTRAK"] || "";
    } else {
        noKontrakBaru = item["NEW_NOMOR_KONTRAK"] || "";
    }

    const formatIDRVal = (val) => {
        if (!val || isNaN(val)) return "-";
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    // Tempat Tanggal Lahir
    const tglLahirFormatted = formatIndoDate(item["TANGGAL LAHIR"]);
    const tempatTglLahir = `${item["TEMPAT LAHIR NAMA"] || ""}, ${tglLahirFormatted}`;

    // Pendidikan
    const pendidikanLulus = `${item["PENDIDIKAN NAMA"] || ""}, Tahun : ${item["TAHUN LULUS"] || ""}`;

    const kelompok = getKelompokPegawai(item);
    let fungsi = "PPPK Fungsional";
    let sasaran = "Masyarakat";

    if (kelompok === "Tenaga Guru") {
        fungsi = "PPPK Fungsional Guru";
        sasaran = "Anak Didik";
    } else if (kelompok === "Tenaga Kesehatan") {
        fungsi = "PPPK Fungsional Kesehatan";
        sasaran = "Pasien";
    }

    return {
        "_RAW_TMT_AWAL": startFormatted,
        "_RAW_TMT_AKHIR": endFormatted,
        "_RAW_TGL_KONTRAK": tglKontrakStr,
        "ALAMAT_SURAT": item["ALAMAT"] || "",
        "JABATAN_SURAT": item["JABATAN NAMA"] || "",
        "KELOMPOK_PEGAWAI": kelompok,
        "FUNGSI_PEGAWAI": fungsi,
        "SASARAN_PELAYANAN": sasaran,
        "GOLONGAN_SURAT": item["GOL AKHIR NAMA"] || "",
        "TEMPAT_TGL_LAHIR": tempatTglLahir,
        "PENDIDIKAN_LULUS": pendidikanLulus,
        "TMT_AWAL_BARU": formatIndoDate(startFormatted),
        "TMT_AKHIR_BARU": formatIndoDate(endFormatted),
        "GAJI_BARU": formatIDRVal(gajiBaru),
        "GAJI_BARU_ANGKA": gajiBaru,
        "GAJI_TERBILANG": gajiBaru > 0 ? (terbilang(gajiBaru) + " Rupiah").trim() : "-",
        "KONTRAK_HARI": !isNaN(tglKontrak.getTime()) ? getIndoDayName(tglKontrak) : "",
        "KONTRAK_TANGGAL_TERBILANG": !isNaN(tglKontrak.getTime()) ? terbilang(tglKontrak.getDate()) : "",
        "KONTRAK_BULAN": !isNaN(tglKontrak.getTime()) ? getIndoMonthName(tglKontrak) : "",
        "KONTRAK_TAHUN_TERBILANG": !isNaN(tglKontrak.getTime()) ? terbilang(tglKontrak.getFullYear()) : "",
        "NAMA_BUPATI": localStorage.getItem("bupati_nama") || "DR. H. MOCHAMAD RIDWAN KAMIL, S.T., M.U.D.",
        "JABATAN_BUPATI": localStorage.getItem("bupati_jabatan") || "Bupati",
        
        // Unor / Unit Kerja variables mapping
        "UNOR_NAMA": item["UNOR NAMA"] || "",
        "UNOR": item["UNOR NAMA"] || "",
        "UNIT_KERJA": item["UNOR NAMA"] || "",
        
        // Additional template matching variables as per variable table
        "NO_KONTRAK_BARU": noKontrakBaru,
        "NO_SK_BARU": item["NEW_NOMOR_SK"] || "",
        "TGL_SK_BARU": formatIndoDate(item["NEW_TANGGAL_SK"]) || "",
        "NAMA_PEGAWAI": getFullname(item),
        "NIP_BARU": item["NIP BARU"] || "",
        "NIK_PEGAWAI": item["NIK"] || "",
        "ALAMAT": item["ALAMAT"] || "",
        "JABATAN": item["JABATAN NAMA"] || "",
        "GOLONGAN": item["GOL AKHIR NAMA"] || ""
    };
}

// Classify employees into 3 groups based on job name
function getKelompokPegawai(item) {
    const jabatan = (item["JABATAN NAMA"] || "").toUpperCase();
    if (jabatan.includes("GURU")) {
        return "Tenaga Guru";
    }
    const kesehatanKeywords = ["DOKTER", "PERAWAT", "BIDAN", "APOTEKER", "KESEHATAN", "NUTRISIONIS", "EPIDEMIOLOG", "SANITARIAN", "PEREKAM MEDIS", "TERAPIS", "PERAWAT GIGI", "ASISTEN APOTEKER", "PRANATA LABORATORIUM KESEHATAN"];
    if (kesehatanKeywords.some(kw => jabatan.includes(kw))) {
        return "Tenaga Kesehatan";
    }
    return "Tenaga Teknis";
}

// Helper: Sync templates to Firebase
async function syncTemplateToFirebase() {
    try {
        const payload = {};
        const keys = [
            "docx_template_f4", "docx_template_f4_name", "docx_template_f4_size",
            "docx_template_a4", "docx_template_a4_name", "docx_template_a4_size",
            "docx_template_paruh_f4", "docx_template_paruh_f4_name", "docx_template_paruh_f4_size",
            "docx_template_paruh_a4", "docx_template_paruh_a4_name", "docx_template_paruh_a4_size"
        ];
        keys.forEach(k => {
            const v = localStorage.getItem(k);
            if (v) payload[k] = v;
        });
        await db.collection('pengaturan').doc('templates').set(payload);
    } catch(e) {
        console.error("Template sync error:", e);
    }
}

// Helper: Fetch templates from Firebase to LocalStorage
async function syncTemplatesFromFirebase() {
    try {
        const snap = await db.collection('pengaturan').doc('templates').get();
        if (snap.exists) {
            const data = snap.data();
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    localStorage.setItem(key, data[key]);
                }
            }
        }
    } catch(e) {
        console.error("Firestore template load error:", e);
    }
}

// Load F4 and A4 DOCX templates status on startup
async function loadTemplateConfig() {
    await syncTemplatesFromFirebase();
    // F4 template loading
    const savedTemplateF4 = localStorage.getItem("docx_template_f4");
    const savedNameF4 = localStorage.getItem("docx_template_f4_name");
    const savedSizeF4 = localStorage.getItem("docx_template_f4_size");

    const dropzoneF4 = document.getElementById("template-f4-dropzone");
    const fileDetailsF4 = document.getElementById("template-f4-file-details");
    const filenameF4El = document.getElementById("template-f4-filename");
    const filesizeF4El = document.getElementById("template-f4-filesize");
    const btnSaveF4 = document.getElementById("btn-save-template-f4");
    const btnDeleteF4 = document.getElementById("btn-delete-template-f4");

    if (savedTemplateF4 && dropzoneF4 && fileDetailsF4) {
        tempTemplateF4Base64 = savedTemplateF4;
        tempTemplateF4Name = savedNameF4 || "template_f4.docx";
        tempTemplateF4Size = parseInt(savedSizeF4) || 0;

        filenameF4El.innerText = tempTemplateF4Name;
        filesizeF4El.innerText = `${(tempTemplateF4Size / 1024).toFixed(2)} KB`;

        dropzoneF4.style.display = "none";
        fileDetailsF4.style.display = "flex";
        if (btnSaveF4) btnSaveF4.disabled = true;
        if (btnDeleteF4) btnDeleteF4.style.display = "inline-flex";
    } else {
        if (dropzoneF4) dropzoneF4.style.display = "flex";
        if (fileDetailsF4) fileDetailsF4.style.display = "none";
        if (btnSaveF4) btnSaveF4.disabled = true;
        if (btnDeleteF4) btnDeleteF4.style.display = "none";
    }

    // A4 template loading
    const savedTemplateA4 = localStorage.getItem("docx_template_a4");
    const savedNameA4 = localStorage.getItem("docx_template_a4_name");
    const savedSizeA4 = localStorage.getItem("docx_template_a4_size");

    const dropzoneA4 = document.getElementById("template-a4-dropzone");
    const fileDetailsA4 = document.getElementById("template-a4-file-details");
    const filenameA4El = document.getElementById("template-a4-filename");
    const filesizeA4El = document.getElementById("template-a4-filesize");
    const btnSaveA4 = document.getElementById("btn-save-template-a4");
    const btnDeleteA4 = document.getElementById("btn-delete-template-a4");

    if (savedTemplateA4 && dropzoneA4 && fileDetailsA4) {
        tempTemplateA4Base64 = savedTemplateA4;
        tempTemplateA4Name = savedNameA4 || "template_a4.docx";
        tempTemplateA4Size = parseInt(savedSizeA4) || 0;

        filenameA4El.innerText = tempTemplateA4Name;
        filesizeA4El.innerText = `${(tempTemplateA4Size / 1024).toFixed(2)} KB`;

        dropzoneA4.style.display = "none";
        fileDetailsA4.style.display = "flex";
        if (btnSaveA4) btnSaveA4.disabled = true;
        if (btnDeleteA4) btnDeleteA4.style.display = "inline-flex";
    } else {
        if (dropzoneA4) dropzoneA4.style.display = "flex";
        if (fileDetailsA4) fileDetailsA4.style.display = "none";
        if (btnSaveA4) btnSaveA4.disabled = true;
        if (btnDeleteA4) btnDeleteA4.style.display = "none";
    }

    // Paruh Waktu F4 template loading
    const savedTemplateParuhF4 = localStorage.getItem("docx_template_paruh_f4");
    const dropzoneParuhF4 = document.getElementById("template-paruh-f4-dropzone");
    const fileDetailsParuhF4 = document.getElementById("template-paruh-f4-file-details");
    const filenameParuhF4El = document.getElementById("template-paruh-f4-filename");
    const filesizeParuhF4El = document.getElementById("template-paruh-f4-filesize");
    const btnSaveParuhF4 = document.getElementById("btn-save-template-paruh-f4");
    const btnDeleteParuhF4 = document.getElementById("btn-delete-template-paruh-f4");

    if (savedTemplateParuhF4 && dropzoneParuhF4 && fileDetailsParuhF4) {
        tempTemplateParuhF4Base64 = savedTemplateParuhF4;
        filenameParuhF4El.innerText = localStorage.getItem("docx_template_paruh_f4_name") || "template_paruh_f4.docx";
        filesizeParuhF4El.innerText = `${(parseInt(localStorage.getItem("docx_template_paruh_f4_size") || 0) / 1024).toFixed(2)} KB`;
        dropzoneParuhF4.style.display = "none";
        fileDetailsParuhF4.style.display = "flex";
        if (btnSaveParuhF4) btnSaveParuhF4.disabled = true;
        if (btnDeleteParuhF4) btnDeleteParuhF4.style.display = "inline-flex";
    }

    // Paruh Waktu A4 template loading
    const savedTemplateParuhA4 = localStorage.getItem("docx_template_paruh_a4");
    const dropzoneParuhA4 = document.getElementById("template-paruh-a4-dropzone");
    const fileDetailsParuhA4 = document.getElementById("template-paruh-a4-file-details");
    const filenameParuhA4El = document.getElementById("template-paruh-a4-filename");
    const filesizeParuhA4El = document.getElementById("template-paruh-a4-filesize");
    const btnSaveParuhA4 = document.getElementById("btn-save-template-paruh-a4");
    const btnDeleteParuhA4 = document.getElementById("btn-delete-template-paruh-a4");

    if (savedTemplateParuhA4 && dropzoneParuhA4 && fileDetailsParuhA4) {
        tempTemplateParuhA4Base64 = savedTemplateParuhA4;
        filenameParuhA4El.innerText = localStorage.getItem("docx_template_paruh_a4_name") || "template_paruh_a4.docx";
        filesizeParuhA4El.innerText = `${(parseInt(localStorage.getItem("docx_template_paruh_a4_size") || 0) / 1024).toFixed(2)} KB`;
        dropzoneParuhA4.style.display = "none";
        fileDetailsParuhA4.style.display = "flex";
        if (btnSaveParuhA4) btnSaveParuhA4.disabled = true;
        if (btnDeleteParuhA4) btnDeleteParuhA4.style.display = "inline-flex";
    }
}

// Handle template F4 file selection
function handleTemplateF4Select() {
    const fileInput = document.getElementById("template-f4-file-input");
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!file.name.toLowerCase().endsWith(".docx")) {
            window.appAlert("Hanya berkas .docx (Word) yang diperbolehkan.");
            fileInput.value = "";
            return;
        }

        document.getElementById("template-f4-filename").innerText = file.name;
        document.getElementById("template-f4-filesize").innerText = `${(file.size / 1024).toFixed(2)} KB`;
        
        document.getElementById("template-f4-dropzone").style.display = "none";
        document.getElementById("template-f4-file-details").style.display = "flex";
        document.getElementById("btn-save-template-f4").disabled = false;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            tempTemplateF4Base64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Remove the currently selected/un-saved file from the dropzone
function removeSelectedTemplateF4File() {
    document.getElementById("template-f4-file-input").value = "";
    tempTemplateF4Base64 = null;
    document.getElementById("btn-save-template-f4").disabled = true;
    document.getElementById("template-f4-dropzone").style.display = "flex";
    document.getElementById("template-f4-file-details").style.display = "none";
}

// Save template Base64 into localStorage
function saveTemplateF4Config() {
    if (!tempTemplateF4Base64) return;
    
    const fileInput = document.getElementById("template-f4-file-input");
    const name = fileInput.files.length > 0 ? fileInput.files[0].name : (localStorage.getItem("docx_template_f4_name") || "template_f4.docx");
    const size = fileInput.files.length > 0 ? fileInput.files[0].size : (localStorage.getItem("docx_template_f4_size") || "0");

    localStorage.setItem("docx_template_f4", tempTemplateF4Base64);
    localStorage.setItem("docx_template_f4_name", name);
    localStorage.setItem("docx_template_f4_size", size);
    
    document.getElementById("btn-save-template-f4").disabled = true;
    document.getElementById("btn-delete-template-f4").style.display = "inline-flex";
    syncTemplateToFirebase();
    window.appAlert("Template Word F4 berhasil disimpan ke sistem.");
}

// Delete template configuration from localStorage
async function deleteTemplateF4Config() {
    if (await window.appConfirm("Apakah Anda yakin ingin menghapus template Word F4 dari sistem?")) {
        localStorage.removeItem("docx_template_f4");
        localStorage.removeItem("docx_template_f4_name");
        localStorage.removeItem("docx_template_f4_size");
        
        tempTemplateF4Base64 = null;
        document.getElementById("template-f4-file-input").value = "";
        
        document.getElementById("template-f4-dropzone").style.display = "flex";
        document.getElementById("template-f4-file-details").style.display = "none";
        document.getElementById("btn-save-template-f4").disabled = true;
        document.getElementById("btn-delete-template-f4").style.display = "none";
        
        syncTemplateToFirebase();
        window.appAlert("Template Word F4 berhasil dihapus.");
    }
}

// Handle template A4 file selection
function handleTemplateA4Select() {
    const fileInput = document.getElementById("template-a4-file-input");
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!file.name.toLowerCase().endsWith(".docx")) {
            window.appAlert("Hanya berkas .docx (Word) yang diperbolehkan.");
            fileInput.value = "";
            return;
        }

        document.getElementById("template-a4-filename").innerText = file.name;
        document.getElementById("template-a4-filesize").innerText = `${(file.size / 1024).toFixed(2)} KB`;
        
        document.getElementById("template-a4-dropzone").style.display = "none";
        document.getElementById("template-a4-file-details").style.display = "flex";
        document.getElementById("btn-save-template-a4").disabled = false;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            tempTemplateA4Base64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Remove the currently selected/un-saved file from the dropzone
function removeSelectedTemplateA4File() {
    document.getElementById("template-a4-file-input").value = "";
    tempTemplateA4Base64 = null;
    document.getElementById("btn-save-template-a4").disabled = true;
    document.getElementById("template-a4-dropzone").style.display = "flex";
    document.getElementById("template-a4-file-details").style.display = "none";
}

// Save template Base64 into localStorage
function saveTemplateA4Config() {
    if (!tempTemplateA4Base64) return;
    
    const fileInput = document.getElementById("template-a4-file-input");
    const name = fileInput.files.length > 0 ? fileInput.files[0].name : (localStorage.getItem("docx_template_a4_name") || "template_a4.docx");
    const size = fileInput.files.length > 0 ? fileInput.files[0].size : (localStorage.getItem("docx_template_a4_size") || "0");

    localStorage.setItem("docx_template_a4", tempTemplateA4Base64);
    localStorage.setItem("docx_template_a4_name", name);
    localStorage.setItem("docx_template_a4_size", size);
    
    document.getElementById("btn-save-template-a4").disabled = true;
    document.getElementById("btn-delete-template-a4").style.display = "inline-flex";
    syncTemplateToFirebase();
    window.appAlert("Template Word A4 berhasil disimpan ke sistem.");
}

// Delete template configuration from localStorage
async function deleteTemplateA4Config() {
    if (await window.appConfirm("Apakah Anda yakin ingin menghapus template Word A4 dari sistem?")) {
        localStorage.removeItem("docx_template_a4");
        localStorage.removeItem("docx_template_a4_name");
        localStorage.removeItem("docx_template_a4_size");
        
        tempTemplateA4Base64 = null;
        document.getElementById("template-a4-file-input").value = "";
        
        document.getElementById("template-a4-dropzone").style.display = "flex";
        document.getElementById("template-a4-file-details").style.display = "none";
        document.getElementById("btn-save-template-a4").disabled = true;
        document.getElementById("btn-delete-template-a4").style.display = "none";
        
        syncTemplateToFirebase();
        window.appAlert("Template Word A4 berhasil dihapus.");
    }
}

// Handle template Paruh Waktu F4 file selection
function handleTemplateParuhF4Select() {
    const fileInput = document.getElementById("template-paruh-f4-file-input");
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!file.name.toLowerCase().endsWith(".docx")) {
            window.appAlert("Hanya berkas .docx (Word) yang diperbolehkan.");
            fileInput.value = "";
            return;
        }
        document.getElementById("template-paruh-f4-filename").innerText = file.name;
        document.getElementById("template-paruh-f4-filesize").innerText = `${(file.size / 1024).toFixed(2)} KB`;
        document.getElementById("template-paruh-f4-dropzone").style.display = "none";
        document.getElementById("template-paruh-f4-file-details").style.display = "flex";
        document.getElementById("btn-save-template-paruh-f4").disabled = false;
        const reader = new FileReader();
        reader.onload = (e) => { tempTemplateParuhF4Base64 = e.target.result; };
        reader.readAsDataURL(file);
    }
}

function removeSelectedTemplateParuhF4File() {
    document.getElementById("template-paruh-f4-file-input").value = "";
    tempTemplateParuhF4Base64 = null;
    document.getElementById("btn-save-template-paruh-f4").disabled = true;
    document.getElementById("template-paruh-f4-dropzone").style.display = "flex";
    document.getElementById("template-paruh-f4-file-details").style.display = "none";
}

function saveTemplateParuhF4Config() {
    if (!tempTemplateParuhF4Base64) return;
    const fileInput = document.getElementById("template-paruh-f4-file-input");
    const name = fileInput.files.length > 0 ? fileInput.files[0].name : (localStorage.getItem("docx_template_paruh_f4_name") || "template_paruh_f4.docx");
    const size = fileInput.files.length > 0 ? fileInput.files[0].size : (localStorage.getItem("docx_template_paruh_f4_size") || "0");
    localStorage.setItem("docx_template_paruh_f4", tempTemplateParuhF4Base64);
    localStorage.setItem("docx_template_paruh_f4_name", name);
    localStorage.setItem("docx_template_paruh_f4_size", size);
    document.getElementById("btn-save-template-paruh-f4").disabled = true;
    document.getElementById("btn-delete-template-paruh-f4").style.display = "inline-flex";
    syncTemplateToFirebase();
    window.appAlert("Template Word Paruh Waktu F4 berhasil disimpan.");
}

async function deleteTemplateParuhF4Config() {
    if (await window.appConfirm("Apakah Anda yakin ingin menghapus template Word Paruh Waktu F4?")) {
        localStorage.removeItem("docx_template_paruh_f4");
        localStorage.removeItem("docx_template_paruh_f4_name");
        localStorage.removeItem("docx_template_paruh_f4_size");
        tempTemplateParuhF4Base64 = null;
        document.getElementById("template-paruh-f4-file-input").value = "";
        document.getElementById("template-paruh-f4-dropzone").style.display = "flex";
        document.getElementById("template-paruh-f4-file-details").style.display = "none";
        document.getElementById("btn-save-template-paruh-f4").disabled = true;
        document.getElementById("btn-delete-template-paruh-f4").style.display = "none";
        syncTemplateToFirebase();
        window.appAlert("Template Word Paruh Waktu F4 berhasil dihapus.");
    }
}

// Handle template Paruh Waktu A4 file selection
function handleTemplateParuhA4Select() {
    const fileInput = document.getElementById("template-paruh-a4-file-input");
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!file.name.toLowerCase().endsWith(".docx")) {
            window.appAlert("Hanya berkas .docx (Word) yang diperbolehkan.");
            fileInput.value = "";
            return;
        }
        document.getElementById("template-paruh-a4-filename").innerText = file.name;
        document.getElementById("template-paruh-a4-filesize").innerText = `${(file.size / 1024).toFixed(2)} KB`;
        document.getElementById("template-paruh-a4-dropzone").style.display = "none";
        document.getElementById("template-paruh-a4-file-details").style.display = "flex";
        document.getElementById("btn-save-template-paruh-a4").disabled = false;
        const reader = new FileReader();
        reader.onload = (e) => { tempTemplateParuhA4Base64 = e.target.result; };
        reader.readAsDataURL(file);
    }
}

function removeSelectedTemplateParuhA4File() {
    document.getElementById("template-paruh-a4-file-input").value = "";
    tempTemplateParuhA4Base64 = null;
    document.getElementById("btn-save-template-paruh-a4").disabled = true;
    document.getElementById("template-paruh-a4-dropzone").style.display = "flex";
    document.getElementById("template-paruh-a4-file-details").style.display = "none";
}

function saveTemplateParuhA4Config() {
    if (!tempTemplateParuhA4Base64) return;
    const fileInput = document.getElementById("template-paruh-a4-file-input");
    const name = fileInput.files.length > 0 ? fileInput.files[0].name : (localStorage.getItem("docx_template_paruh_a4_name") || "template_paruh_a4.docx");
    const size = fileInput.files.length > 0 ? fileInput.files[0].size : (localStorage.getItem("docx_template_paruh_a4_size") || "0");
    localStorage.setItem("docx_template_paruh_a4", tempTemplateParuhA4Base64);
    localStorage.setItem("docx_template_paruh_a4_name", name);
    localStorage.setItem("docx_template_paruh_a4_size", size);
    document.getElementById("btn-save-template-paruh-a4").disabled = true;
    document.getElementById("btn-delete-template-paruh-a4").style.display = "inline-flex";
    syncTemplateToFirebase();
    window.appAlert("Template Word Paruh Waktu A4 berhasil disimpan.");
}

async function deleteTemplateParuhA4Config() {
    if (await window.appConfirm("Apakah Anda yakin ingin menghapus template Word Paruh Waktu A4?")) {
        localStorage.removeItem("docx_template_paruh_a4");
        localStorage.removeItem("docx_template_paruh_a4_name");
        localStorage.removeItem("docx_template_paruh_a4_size");
        tempTemplateParuhA4Base64 = null;
        document.getElementById("template-paruh-a4-file-input").value = "";
        document.getElementById("template-paruh-a4-dropzone").style.display = "flex";
        document.getElementById("template-paruh-a4-file-details").style.display = "none";
        document.getElementById("btn-save-template-paruh-a4").disabled = true;
        document.getElementById("btn-delete-template-paruh-a4").style.display = "none";
        syncTemplateToFirebase();
        window.appAlert("Template Word Paruh Waktu A4 berhasil dihapus.");
    }
}

// Redirect downloadWordContract to show print options modal
function downloadWordContract(id) {
    const item = pppkData.find(p => p["PNS ID"] === id);
    if (!item) return;
    
    // Clear bulk merge queues to prevent accidental bulk printing
    if (typeof bulkMergeItems !== "undefined") bulkMergeItems = null;
    if (typeof dueBulkMergeItems !== "undefined") dueBulkMergeItems = null;
    
    currentEditingItem = item; // set as active editing item
    
    // Pre-fill the print modal contract date based on default values
    const data = getComputedValues(item);
    const printTglKontrak = document.getElementById("print-tgl-kontrak");
    if (printTglKontrak) {
        printTglKontrak.value = data._RAW_TGL_KONTRAK || "";
    }
    
    const printOptionsModal = document.getElementById("print-options-modal");
    if (printOptionsModal) {
        printOptionsModal.classList.add("open");
    }
}

// Helper to safely enforce page sizes without triggering Word corruption bugs on internal section breaks
function enforcePageSizeProps(docXml, props) {
    docXml = docXml.replace(/<w:pgSz[^>]*\/>/gi, "");
    docXml = docXml.replace(/<w:pgSz[^>]*>[\s\S]*?<\/w:pgSz>/gi, "");
    docXml = docXml.replace(/<w:pgMar[^>]*\/>/gi, "");
    docXml = docXml.replace(/<w:pgMar[^>]*>[\s\S]*?<\/w:pgMar>/gi, "");
    docXml = docXml.replace(/<w:sectPr([^>]*)>([\s\S]*?)<\/w:sectPr>/gi, function(m, a, c) {
        const getElem = (regex) => { let match = c.match(regex); return match ? match[0] : ""; };
        const headers = c.match(/<w:headerReference[^>]*(\/>|>[\s\S]*?<\/w:headerReference>)/gi) || [];
        const footers = c.match(/<w:footerReference[^>]*(\/>|>[\s\S]*?<\/w:footerReference>)/gi) || [];
        const type = getElem(/<w:type[^>]*(\/>|>[\s\S]*?<\/w:type>)/i);
        let rest = c.replace(/<w:headerReference[^>]*(\/>|>[\s\S]*?<\/w:headerReference>)/gi, "");
        rest = rest.replace(/<w:footerReference[^>]*(\/>|>[\s\S]*?<\/w:footerReference>)/gi, "");
        rest = rest.replace(/<w:type[^>]*(\/>|>[\s\S]*?<\/w:type>)/gi, "");
        return `<w:sectPr${a}>${headers.join("")}${footers.join("")}${type}${props}${rest}</w:sectPr>`;
    }).replace(/<w:sectPr([^>]*?)\/>/gi, '<w:sectPr$1>' + props + '</w:sectPr>');
    return docXml;
}

// Decode Base64 and run Docxtemplater to generate and download the .docx file with options (paperSize, scope, asPdf)
function downloadWordContractWithOptions(id, paperSize, scope, asPdf = false) {
    const item = pppkData.find(p => p["PNS ID"] === id);
    if (!item) return;

    let savedTemplate = null;
    let templateNameLabel = "";
    
    const isParuhWaktu = item["JENIS_PPPK"] === "PPPK Paruh Waktu";

    if (paperSize === "f4") {
        savedTemplate = localStorage.getItem(isParuhWaktu ? "docx_template_paruh_f4" : "docx_template_f4");
        templateNameLabel = isParuhWaktu ? "Paruh Waktu F4" : "F4";
    } else {
        savedTemplate = localStorage.getItem(isParuhWaktu ? "docx_template_paruh_a4" : "docx_template_a4");
        templateNameLabel = isParuhWaktu ? "Paruh Waktu A4" : "A4";
    }

    if (!savedTemplate) {
        window.appAlert(`Silakan unggah template kontrak ${templateNameLabel} terlebih dahulu di menu Pengaturan.`);
        const settingsTabItem = document.querySelector('.menu-item[data-tab="pengaturan"]');
        if (settingsTabItem) settingsTabItem.click();
        return;
    }

    try {
        const base64Str = savedTemplate.split(",")[1];
        const binaryString = atob(base64Str);
        const zip = new PizZip(binaryString, { binary: true });
        
        let rawXml = zip.file("word/document.xml").asText();

        // Enforce page size across all sections (Fix for F4 templates mutating to A4 on second page)
        if (paperSize === "f4") {
            // Legal (8.5 x 14 inches) = 12240 x 20160 twips, with exact requested margins
            const f4Props = '<w:pgSz w:w="12240" w:h="20160"/><w:pgMar w:top="850" w:right="850" w:bottom="2551" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>';
            rawXml = enforcePageSizeProps(rawXml, f4Props);
        } else if (paperSize === "a4") {
            // A4 = 21cm x 29.7cm = 11906 x 16838 twips
            const a4Props = '<w:pgSz w:w="11906" w:h="16838"/>';
            rawXml = enforcePageSizeProps(rawXml, a4Props);
        }
        
        // Validate template has the required scope tags
        if (scope !== "all") {
            if (!rawXml.includes("perjanjian") || !rawXml.includes("tandatangan")) {
                window.appAlert("GAGAL: Template Anda belum mendukung fitur ini! Anda harus menambahkan tag {{#perjanjian}}...{{/perjanjian}} dan {{#tandatangan}}...{{/tandatangan}} di dalam template Word Anda terlebih dahulu.");
                return;
            }
            // Aggressively remove ALL types of page breaks to prevent blank pages when sections are hidden
            rawXml = rawXml.replace(/<w:br[^>]*w:type="page"[^>]*\/>/gi, "");
            rawXml = rawXml.replace(/<w:br[^>]*w:type="page"[^>]*>[\s\S]*?<\/w:br>/gi, "");
            rawXml = rawXml.replace(/<w:pageBreakBefore[^>]*\/>/gi, "");
            rawXml = rawXml.replace(/<w:pageBreakBefore[^>]*>[\s\S]*?<\/w:pageBreakBefore>/gi, "");
            rawXml = rawXml.replace(/<w:lastRenderedPageBreak[^>]*\/>/gi, "");
            rawXml = rawXml.replace(/<w:type\s+w:val="(nextPage|evenPage|oddPage)"\s*\/>/gi, '<w:type w:val="continuous"/>');
            rawXml = rawXml.replace(/<w:type\s+w:val="(nextPage|evenPage|oddPage)"\s*>[\s\S]*?<\/w:type>/gi, '<w:type w:val="continuous"/>');
        }
        
        zip.file("word/document.xml", rawXml);
        
        const doc = new window.docxtemplater(zip, {
            delimiters: { start: "{{", end: "}}" },
            paragraphLoop: true,
            linebreaks: true
        });

        // Set conditional scoping variables (using arrays for reliable block rendering in docxtemplater)
        const showPerjanjian = (scope === "all" || scope === "perjanjian") ? [{}] : false;
        const showTandaTangan = (scope === "all" || scope === "tandatangan") ? [{}] : false;

        const data = getComputedValues(item);
        
        // Override with custom contract signing date selected by the user in the print options modal
        const userTglKontrak = document.getElementById("print-tgl-kontrak") ? document.getElementById("print-tgl-kontrak").value : "";
        
        if (userTglKontrak) {
            const customDate = new Date(userTglKontrak);
            if (!isNaN(customDate.getTime())) {
                data["KONTRAK_HARI"] = getIndoDayName(customDate);
                data["KONTRAK_TANGGAL_TERBILANG"] = terbilang(customDate.getDate());
                data["KONTRAK_BULAN"] = getIndoMonthName(customDate);
                data["KONTRAK_TAHUN_TERBILANG"] = terbilang(customDate.getFullYear());
            }
        }

        // Inject block visibility scope variables (both lowercase and uppercase for safety)
        data.perjanjian = showPerjanjian;
        data.PERJANJIAN = showPerjanjian;
        data.tandatangan = showTandaTangan;
        data.TANDATANGAN = showTandaTangan;

        doc.render(data);

        if (scope !== "all") {
            let compiledXml = doc.getZip().file("word/document.xml").asText();
            let bodyMatch = compiledXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
            if (bodyMatch) {
                let bodyContent = bodyMatch[1];
                
                // Strip leading empty paragraphs (paragraphs without text or images)
                while (true) {
                    const match = bodyContent.match(/^\s*<w:p\b[^>]*>([\s\S]*?)<\/w:p>/);
                    if (!match) break;
                    const pContent = match[1];
                    const hasText = /<w:t\b[^>]*>([^<]+)<\/w:t>/.test(pContent);
                    const hasImage = /<w:drawing|<v:shape|<w:pict|<w:object/.test(pContent);
                    if (!hasText && !hasImage) {
                        bodyContent = bodyContent.substring(match[0].length);
                    } else {
                        break;
                    }
                }
                
                // Strip trailing empty paragraphs
                let finalSectPr = "";
                bodyContent = bodyContent.replace(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>\s*$/, function(m) {
                    finalSectPr = m;
                    return "";
                });
                
                while (true) {
                    const match = bodyContent.match(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>\s*$/);
                    if (!match) break;
                    const pContent = match[1];
                    const hasText = /<w:t\b[^>]*>([^<]+)<\/w:t>/.test(pContent);
                    const hasImage = /<w:drawing|<v:shape|<w:pict|<w:object/.test(pContent);
                    if (!hasText && !hasImage) {
                        bodyContent = bodyContent.substring(0, bodyContent.length - match[0].length);
                    } else {
                        break;
                    }
                }
                bodyContent += finalSectPr;
                
                compiledXml = compiledXml.replace(/(<w:body>)([\s\S]*?)(<\/w:body>)/, `$1${bodyContent}$3`);
                doc.getZip().file("word/document.xml", compiledXml);
            }
        }

        const out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        const filename = `Kontrak_PPPK_${paperSize.toUpperCase()}_${scope.toUpperCase()}_${item["NIP BARU"]}_${item["NAMA"].replace(/\s+/g, "_")}.docx`;
        saveAs(out, filename);
    } catch (error) {
        console.error(error);
        window.appAlert("Gagal memproses template Word: " + error.message);
    }
}

// Compile docxtemplater for multiple employees and merge them client-side into 1 file
async function downloadMergedContracts(items, paperSize, scope, customTglKontrak) {
    if (!items || items.length === 0) return;

    // Check for mixed "Jenis PPPK"
    const firstJenis = items[0]["JENIS_PPPK"] || "PPPK";
    const hasMixedTypes = items.some(item => (item["JENIS_PPPK"] || "PPPK") !== firstJenis);

    if (hasMixedTypes) {
        window.appAlert("PERINGATAN: Anda memilih campuran antara PPPK Reguler dan PPPK Paruh Waktu. Cetak Massal hanya akan menggunakan template dari tipe data pertama (" + firstJenis + "). Harap filter data Anda berdasarkan Jenis PPPK terlebih dahulu.");
        return;
    }

    const isParuhWaktu = firstJenis === "PPPK Paruh Waktu";

    let savedTemplate = null;
    let templateNameLabel = "";
    if (paperSize === "f4") {
        savedTemplate = localStorage.getItem(isParuhWaktu ? "docx_template_paruh_f4" : "docx_template_f4");
        templateNameLabel = isParuhWaktu ? "Paruh Waktu F4" : "F4";
    } else {
        savedTemplate = localStorage.getItem(isParuhWaktu ? "docx_template_paruh_a4" : "docx_template_a4");
        templateNameLabel = isParuhWaktu ? "Paruh Waktu A4" : "A4";
    }

    if (!savedTemplate) {
        window.appAlert(`Silakan unggah template kontrak ${templateNameLabel} terlebih dahulu di menu Pengaturan.`);
        const settingsTabItem = document.querySelector('.menu-item[data-tab="pengaturan"]');
        if (settingsTabItem) settingsTabItem.click();
        return;
    }

    // Show a loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "merge-loading";
    loadingDiv.style.position = "fixed";
    loadingDiv.style.top = "0";
    loadingDiv.style.left = "0";
    loadingDiv.style.width = "100%";
    loadingDiv.style.height = "100%";
    loadingDiv.style.backgroundColor = "rgba(15, 23, 42, 0.6)";
    loadingDiv.style.backdropFilter = "blur(4px)";
    loadingDiv.style.color = "#fff";
    loadingDiv.style.display = "flex";
    loadingDiv.style.flexDirection = "column";
    loadingDiv.style.alignItems = "center";
    loadingDiv.style.justifyContent = "center";
    loadingDiv.style.zIndex = "9999";
    loadingDiv.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 30px; border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); color: var(--text-primary);">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 36px; margin-bottom: 15px; color: var(--primary-color);"></i>
            <div style="font-weight: 600; font-size: 15px;">Menggabungkan ${items.length} Kontrak PPPK...</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Proses ini menggabungkan dokumen secara client-side dengan perataan halaman penuh.</div>
        </div>
    `;
    document.body.appendChild(loadingDiv);

    // Yield main thread so the browser can paint the loading overlay before heavy AST cloning freezes it!
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        const base64Str = savedTemplate.split(",")[1];
        let modifiedTemplateZipBuffer = atob(base64Str);
        const zip = new PizZip(modifiedTemplateZipBuffer, { binary: true });
        
        let docXml = zip.file("word/document.xml").asText();
        
        // 1. Enforce Page Size
        if (paperSize === "f4") {
            const f4Props = '<w:pgSz w:w="12240" w:h="20160"/><w:pgMar w:top="850" w:right="850" w:bottom="2551" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>';
            docXml = enforcePageSizeProps(docXml, f4Props);
        } else if (paperSize === "a4") {
            const a4Props = '<w:pgSz w:w="11906" w:h="16838"/>';
            docXml = enforcePageSizeProps(docXml, a4Props);
        }

        // 2. Validate template has the required scope tags for all users
        if (scope !== "all") {
            if (!docXml.includes("perjanjian") || !docXml.includes("tandatangan")) {
                window.appAlert("GAGAL: Template Anda belum mendukung fitur ini! Anda harus menambahkan tag {{#perjanjian}}...{{/perjanjian}} dan {{#tandatangan}}...{{/tandatangan}} di dalam template Word Anda terlebih dahulu.");
                document.body.removeChild(loadingDiv);
                return;
            }
            // --- ADVANCED SLICING REMOVED ---
            // Manual XML slicing (especially for scope==="tandatangan") was causing XTTemplateError
            // because if the user placed tags inside complex tables, cutting at root elements could orphan {{/perjanjian}} tags.
            // Docxtemplater natively handles hiding blocks perfectly when data.perjanjian = false, so manual slicing is unsafe.
            
            if (scope === "perjanjian") {
                let perjanEnd = docXml.indexOf("{{/perjanjian}}");
                if (perjanEnd !== -1) {
                    // --- CLEANUP TRAILING PAGE BREAKS ---
                    // To prevent double page breaks (blank pages), we strip any manual Page Breaks
                    // or Next Page Section Breaks located exactly at the end of the agreement block.
                    let searchStart = Math.max(0, perjanEnd - 4000);
                    let chunk = docXml.substring(searchStart, perjanEnd);
                    
                    // 1. Remove manual Page Breaks (Ctrl+Enter)
                    chunk = chunk.replace(/<w:br[^>]*w:type="page"[^>]*\/>/gi, "");
                    
                    // 2. Convert Section Breaks to Continuous to preserve layout but avoid page jump
                    chunk = chunk.replace(/(<w:sectPr[^>]*>[\s\S]{0,500}?)<w:type\s+w:val="nextPage"\s*\/>([\s\S]{0,500}?<\/w:sectPr>)/gi, '$1<w:type w:val="continuous"/>$2');
                    
                    // Apply chunk back
                    docXml = docXml.substring(0, searchStart) + chunk + docXml.substring(perjanEnd);
                    // ------------------------------------
                }
            }
            // ------------------------------
        }

        // 3. Extract finalSectPr to act as an isolating section break between loop iterations
        let finalSectPr = "";
        // Use a safe regex with fixed bounds to prevent Catastrophic Backtracking
        docXml.replace(/<w:sectPr([^>]*)>[\s\S]{0,3000}?<\/w:sectPr>\s*<\/w:body>/, function(match) {
            finalSectPr = match.replace("</w:body>", "").trim();
        });
        
        let loopSectPr = finalSectPr;
        if (loopSectPr) {
            loopSectPr = loopSectPr.replace(/<w:headerReference[^>]*\/>/g, "");
            loopSectPr = loopSectPr.replace(/<w:footerReference[^>]*\/>/g, "");
            loopSectPr = loopSectPr.replace(/<w:type[^>]*\/>/g, "");
            loopSectPr = loopSectPr.replace(/<w:type[^>]*>[\s\S]*?<\/w:type>/g, "");
            loopSectPr = loopSectPr.replace(/<w:sectPr([^>]*)>/, '<w:sectPr$1><w:type w:val="nextPage"/>');
        } else {
            loopSectPr = '<w:sectPr><w:type w:val="nextPage"/></w:sectPr>';
        }

        // Wrap the entire body content inside a docxtemplater loop {#employees}...{/employees}
        // Using robust regex to handle potential <w:body w:someAttr="..."> namespaces
        const BOUNDARY_TAG = `<w:bookmarkStart w:id="999999" w:name="DOCX_BOUNDARY"/>`;
        docXml = docXml.replace(/(<w:body[^>]*>)/, "$1<w:p><w:r><w:t>{{#employees}}</w:t></w:r></w:p>");
        docXml = docXml.replace(/(<w:sectPr[^>]*>[\s\S]{0,3000}?<\/w:sectPr>\s*<\/w:body>|<\/w:body>)/, function(match) {
            // Place loop sectPr BEFORE the {/employees} tag so Docxtemplater duplicates it between employees
            // Use a block-level bookmark as the boundary so splitting it leaves no empty paragraphs behind!
            return `<w:p><w:pPr>${loopSectPr}</w:pPr></w:p>${BOUNDARY_TAG}<w:p><w:r><w:t>{{/employees}}</w:t></w:r></w:p>` + match;
        });

        zip.file("word/document.xml", docXml);
        
        // 4. Prepare bulk data array for Docxtemplater
        const employeesData = [];
        
        // Use custom signing date from modal if exists, otherwise fallback to item's default
        const tglKontrak = document.getElementById("bulk-print-tgl-kontrak") ? document.getElementById("bulk-print-tgl-kontrak").value : "";
        
        for (const item of items) {
            const data = getComputedValues(item);
            
            if (tglKontrak) {
                const customDate = new Date(tglKontrak);
                if (!isNaN(customDate.getTime())) {
                    data["KONTRAK_HARI"] = getIndoDayName(customDate);
                    data["KONTRAK_TANGGAL_TERBILANG"] = terbilang(customDate.getDate());
                    data["KONTRAK_BULAN"] = getIndoMonthName(customDate);
                    data["KONTRAK_TAHUN_TERBILANG"] = terbilang(customDate.getFullYear());
                }
            }

            const showPerjanjian = (scope === "all" || scope === "perjanjian") ? [{}] : false;
            const showTandaTangan = (scope === "all" || scope === "tandatangan") ? [{}] : false;
            
            data.perjanjian = showPerjanjian;
            data.PERJANJIAN = showPerjanjian;
            data.tandatangan = showTandaTangan;
            data.TANDATANGAN = showTandaTangan;
            
            employeesData.push(data);
        }
        
        // 5. Native Render Loop - Let Docxtemplater handle all AST cloning, structural offsets, and Relationship generation natively!
        const doc = new window.docxtemplater(zip, {
            delimiters: { start: "{{", end: "}}" },
            paragraphLoop: true,
            linebreaks: true
        });

        doc.render({ employees: employeesData });
        
        // 6. Post-Process: Numbering Fix, Boundary Removal, and Section Break Clean-up
        let renderedXml = doc.getZip().file("word/document.xml").asText();
        let numXml = doc.getZip().file("word/numbering.xml") ? doc.getZip().file("word/numbering.xml").asText() : null;
        let stylesXml = doc.getZip().file("word/styles.xml") ? doc.getZip().file("word/styles.xml").asText() : null;
        
        let newRenderedXml = renderedXml;
        
        if (numXml) {
            // Find max IDs in numbering.xml to generate safe offsets for clones
            let maxAbstractNumId = 0;
            let maxNumId = 0;
            
            [...numXml.matchAll(/<w:abstractNum[^>]*w:abstractNumId="([0-9]+)"/gi)].forEach(m => {
                let val = parseInt(m[1], 10);
                if (val > maxAbstractNumId) maxAbstractNumId = val;
            });
            
            [...numXml.matchAll(/<w:num[^>]*w:numId="([0-9]+)"/gi)].forEach(m => {
                let val = parseInt(m[1], 10);
                if (val > maxNumId) maxNumId = val;
            });
            
            const OFFSET_ABSTRACT = maxAbstractNumId + 10;
            const OFFSET_NUM = maxNumId + 10;
            
            // Extract the original numbering definitions
            let abstractBlock = "";
            [...numXml.matchAll(/<w:abstractNum(?:>|\s[^>]*>)[\s\S]{0,5000}?<\/w:abstractNum>/gi)].forEach(m => {
                abstractBlock += m[0];
            });
            
            let numBlock = "";
            [...numXml.matchAll(/<w:num(?:>|\s[^>]*>)[\s\S]{0,1000}?<\/w:num>/gi)].forEach(m => {
                numBlock += m[0];
            });

            // Extract style-based numbering
            let styleNumMap = {};
            if (stylesXml) {
                let styleMatches = [...stylesXml.matchAll(/<w:style[^>]*w:styleId="([^"]+)"[\s\S]{0,5000}?<\/w:style>/gi)];
                for (let m of styleMatches) {
                    let styleId = m[1];
                    let numMatch = m[0].match(/<w:numId\s+w:val="([0-9]+)"/i);
                    let ilvlMatch = m[0].match(/<w:ilvl\s+w:val="([0-9]+)"/i);
                    if (numMatch) {
                        styleNumMap[styleId] = { numId: numMatch[1], ilvl: ilvlMatch ? ilvlMatch[1] : "0" };
                    }
                }
            }
            
            let pStyleRegexes = Object.keys(styleNumMap).map(id => ({
                id: id,
                regex: new RegExp(`<w:pStyle\\s+w:val="${id}"\\s*\\/?>`, "i"),
                info: styleNumMap[id]
            }));
            
            // Split the document into employee sections using our injected boundary tag
            let parts = renderedXml.split(/<w:bookmarkStart[^>]*w:name="DOCX_BOUNDARY"[^>]*\/>/);
            newRenderedXml = parts[0];
            
            let newAbstractBlocks = [];
            let newNumBlocks = [];
            
            for (let i = 1; i < parts.length; i++) {
                if (parts[i].trim() === "") {
                    newRenderedXml += parts[i];
                    continue;
                }
                
                let curOffsetAbstract = i * OFFSET_ABSTRACT;
                let curOffsetNum = i * OFFSET_NUM;
                
                // Clone abstract block
                let curAbstract = abstractBlock;
                curAbstract = curAbstract.replace(/w:abstractNumId="([0-9]+)"/gi, (m, id) => `w:abstractNumId="${parseInt(id) + curOffsetAbstract}"`);
                curAbstract = curAbstract.replace(/<w:numStyleLink[^>]*\/>/gi, ""); // Remove style links completely to prevent Word style conflicts
                curAbstract = curAbstract.replace(/<w:numStyleLink[^>]*>[\s\S]{0,100}?<\/w:numStyleLink>/gi, "");
                curAbstract = curAbstract.replace(/<w:styleLink[^>]*\/>/gi, "");
                curAbstract = curAbstract.replace(/<w:styleLink[^>]*>[\s\S]{0,100}?<\/w:styleLink>/gi, "");
                curAbstract = curAbstract.replace(/<w:pStyle[^>]*\/>/gi, ""); // Prevent multiple lists linked to same style error
                curAbstract = curAbstract.replace(/<w:pStyle[^>]*>[\s\S]{0,100}?<\/w:pStyle>/gi, "");
                
                // Randomize nsid so Word completely isolates this list!
                curAbstract = curAbstract.replace(/<w:nsid\s+w:val="([A-F0-9]+)"\s*\/>/gi, () => {
                    let randHex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
                    return `<w:nsid w:val="${randHex}"/>`;
                });
                curAbstract = curAbstract.replace(/<w:nsid\s+w:val="([A-F0-9]+)"\s*>[\s\S]{0,100}?<\/w:nsid>/gi, () => {
                    let randHex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
                    return `<w:nsid w:val="${randHex}"/>`;
                });
                
                newAbstractBlocks.push(curAbstract);
                
                // Clone num block
                let curNum = numBlock;
                curNum = curNum.replace(/w:numId="([0-9]+)"/gi, (m, id) => `w:numId="${parseInt(id) + curOffsetNum}"`);
                curNum = curNum.replace(/<w:abstractNumId\s+w:val="([0-9]+)"/gi, (m, id) => `<w:abstractNumId w:val="${parseInt(id) + curOffsetAbstract}"`);
                newNumBlocks.push(curNum);
                
                // Update the numIds inside the document part
                let curPart = parts[i];
                
                // 1. Replace existing inline numIds
                curPart = curPart.replace(/<w:numId\s+w:val="([0-9]+)"/gi, (m, id) => `<w:numId w:val="${parseInt(id) + curOffsetNum}"`);
                
                // 2. Inject numPr for paragraphs that inherit numbering from a style
                if (pStyleRegexes.length > 0) {
                    curPart = curPart.replace(/(<w:pPr[^>]*>)([\s\S]{0,1000}?)<\/w:pPr>/gi, (match, pPrOpen, pPrContent) => {
                        if (!pPrContent.includes("<w:numPr")) {
                            for (let s of pStyleRegexes) {
                                if (s.regex.test(pPrContent)) {
                                    let targetOffsetNum = parseInt(s.info.numId) + curOffsetNum;
                                    let newPPrContent = pPrContent.replace(s.regex, (m) => {
                                        return `${m}<w:numPr><w:ilvl w:val="${s.info.ilvl}"/><w:numId w:val="${targetOffsetNum}"/></w:numPr>`;
                                    });
                                    return `${pPrOpen}${newPPrContent}</w:pPr>`;
                                }
                            }
                        }
                        return match;
                    });
                }
                
                newRenderedXml += curPart;
            }
            
            // Append the cloned numbering blocks to numbering.xml
            if (newAbstractBlocks.length > 0) {
                let insertAbstractPos = numXml.lastIndexOf("</w:abstractNum>") + 16;
                numXml = numXml.substring(0, insertAbstractPos) + newAbstractBlocks.join("") + numXml.substring(insertAbstractPos);
                
                let insertNumPos = numXml.lastIndexOf("</w:num>") + 8;
                numXml = numXml.substring(0, insertNumPos) + newNumBlocks.join("") + numXml.substring(insertNumPos);
                
                // Remove numIdMacAtCleanup to prevent Word from imposing a limit on our injected numIds
                numXml = numXml.replace(/<w:numIdMacAtCleanup[^>]*\/>/gi, "");
                
                doc.getZip().file("word/numbering.xml", numXml);
            }
        } else {
            // No numbering.xml, just remove the boundary tag
            newRenderedXml = renderedXml.split(/<w:bookmarkStart[^>]*w:name="DOCX_BOUNDARY"[^>]*\/>/).join("");
        }
        
        // Remove the final section break since it causes a blank page (100% Catastrophic-Backtracking Proof)
        let injectedBreak = `<w:p><w:pPr>${loopSectPr}</w:pPr></w:p>`;
        let breakIndex = newRenderedXml.lastIndexOf(injectedBreak);
        if (breakIndex !== -1) {
            newRenderedXml = newRenderedXml.substring(0, breakIndex) + newRenderedXml.substring(breakIndex + injectedBreak.length);
        } else {
            // Fallback: Safe, strictly-bounded regex if Docxtemplater mutated whitespaces
            let fallbackRegex = /<w:p>\s*<w:pPr>\s*<w:sectPr[^>]*>[\s\S]{0,300}?<w:type w:val="nextPage"\/>[\s\S]{0,300}?<\/w:sectPr>\s*<\/w:pPr>\s*<\/w:p>/gi;
            let matches = [...newRenderedXml.matchAll(fallbackRegex)];
            if (matches.length > 0) {
                let lastMatch = matches[matches.length - 1];
                newRenderedXml = newRenderedXml.substring(0, lastMatch.index) + newRenderedXml.substring(lastMatch.index + lastMatch[0].length);
            }
        }
        
        doc.getZip().file("word/document.xml", newRenderedXml);

        // 7. Trigger download
        const mergedBlob = doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        
        if (document.body.contains(loadingDiv)) {
            document.body.removeChild(loadingDiv);
        }
        
        const filename = `Kontrak_Gabungan_${items.length}_Pegawai_${paperSize.toUpperCase()}_${scope.toUpperCase()}_${new Date().toISOString().split("T")[0]}.docx`;
        saveAs(mergedBlob, filename);
        
        // Clear selection
        const printOptionsModal = document.getElementById("bulk-print-options-modal");
        if (printOptionsModal) {
            printOptionsModal.classList.remove("open");
        }
        
        if (typeof dueBulkMergeItems !== "undefined") dueBulkMergeItems = null;
        if (typeof bulkMergeItems !== "undefined") bulkMergeItems = null;
        
        selectedRows.clear();
        updateBulkActionBar();
        renderTable();
        
        if (typeof window.appAlert === 'function') {
            window.appAlert(`Berhasil menggabungkan dan mengunduh kontrak untuk ${items.length} pegawai.`);
        } else {
            alert(`Berhasil menggabungkan dan mengunduh kontrak untuk ${items.length} pegawai.`);
        }
    } catch (error) {
        if (document.body.contains(loadingDiv)) {
            document.body.removeChild(loadingDiv);
        }
        console.error(error);
        if (typeof window.appAlert === 'function') {
            window.appAlert("Gagal menggabungkan file kontrak: " + (error.message || JSON.stringify(error)));
        } else {
            alert("Gagal menggabungkan file kontrak: " + (error.message || JSON.stringify(error)));
        }
    }
}

// Populate Perpanjangan Kontrak period filter dynamically
function populatePeriodFilter(data = pppkData) {
    const filterPeriode = document.getElementById("filter-periode");
    if (!filterPeriode) return;

    const selectedVal = filterPeriode.value || "all";

    // Get all unique perpanjangan dates
    const uniqueDates = new Set();
    if (selectedVal !== "all" && selectedVal !== "BUP") {
        uniqueDates.add(selectedVal);
    }
    
    data.forEach(item => {
        const period = calculateContractPeriod(item);
        if (period.status !== "Kontrak Habis (BUP)" && !period.isBUP && period.awal !== "-") {
            // Calculate next start date (TMT perpanjangan baru)
            let nextStartStr;
            if (item["STATUS_PERPANJANGAN"] === "Disetujui") {
                nextStartStr = period.awal;
            } else {
                const nextStart = new Date(period.akhir);
                nextStart.setDate(nextStart.getDate() + 1);
                const formatDate = (d) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };
                nextStartStr = formatDate(nextStart);
            }
            uniqueDates.add(nextStartStr);
        }
    });

    // Group unique dates by year
    const sortedDates = [...uniqueDates].sort();
    const groupsByYear = {};
    sortedDates.forEach(dateStr => {
        const year = dateStr.split("-")[0];
        if (!groupsByYear[year]) {
            groupsByYear[year] = [];
        }
        groupsByYear[year].push(dateStr);
    });

    // Build options list
    filterPeriode.innerHTML = '<option value="all">Semua Perpanjangan</option>';
    
    // Add retired/BUP option to the period filter as requested
    filterPeriode.innerHTML += '<option value="BUP">Kontrak Habis (BUP)</option>';

    Object.keys(groupsByYear).sort().forEach(year => {
        const dates = groupsByYear[year];
        if (dates.length === 1) {
            // Only one date in this year
            const dateStr = dates[0];
            const dateParts = dateStr.split("-");
            const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            const formattedDate = `${parseInt(dateParts[2])} ${months[parseInt(dateParts[1]) - 1]}`;
            filterPeriode.innerHTML += `<option value="${dateStr}">Perpanjangan Periode ${year} (${formattedDate})</option>`;
        } else {
            // Multiple dates in this year - label with Tahap 1, Tahap 2, etc.
            dates.forEach((dateStr, index) => {
                const dateParts = dateStr.split("-");
                const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                const formattedDate = `${parseInt(dateParts[2])} ${months[parseInt(dateParts[1]) - 1]}`;
                filterPeriode.innerHTML += `<option value="${dateStr}">Perpanjangan Periode ${year} - Tahap ${index + 1} (${formattedDate})</option>`;
            });
        }
    });

    // Restore selected value if it still exists
    const options = Array.from(filterPeriode.options).map(o => o.value);
    if (options.includes(selectedVal)) {
        filterPeriode.value = selectedVal;
    } else {
        filterPeriode.value = "all";
    }
}
