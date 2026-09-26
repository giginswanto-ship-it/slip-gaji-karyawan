const DB_STORAGE_KEY = 'SLIP_GAJI_DATABASE_V1';
    const SESSION_STORAGE_KEY = 'ACTIVE_PAYROLL_SESSION_V1';

    // =========================================================================
    // DATA MASTER 3 UNIT USAHA & PENGGUNA (USERS & PIC)
    // =========================================================================
    const BUSINESS_UNITS = {
      'shop_and_drive_gw': {
        id: 'shop_and_drive_gw',
        name: 'Shop And Drive Grand Wisata',
        shortName: 'Shop And Drive GW',
        address: 'Kawasan Niaga Grand Wisata Blok AA No. 10, Bekasi',
        city: 'Bekasi',
        picName: 'Adis Setiawan',
        picRole: 'PIC / Kepala Cabang',
        directorName: 'Ir. Swanto',
        badge: '🚗 Shop And Drive GW'
      },
      'snaprint_gw': {
        id: 'snaprint_gw',
        name: 'Snaprint Grand Wisata',
        shortName: 'Snaprint GW',
        address: 'Ruko Grand Wisata Blok AA No. 12, Bekasi',
        city: 'Bekasi',
        picName: 'Eki Dwi Saputra',
        picRole: 'PIC / Unit Manager',
        directorName: 'Ir. Swanto',
        badge: '🖨️ Snaprint GW'
      },
      'snaprint_zamrud': {
        id: 'snaprint_zamrud',
        name: 'Snaprint Zamrud',
        shortName: 'Snaprint Zamrud',
        address: 'Dukuh Zamrud Blok M No. 12, Mustikajaya, Kota Bekasi',
        city: 'Bekasi',
        picName: 'M. Rengga Swana Herlambang',
        picRole: 'PIC / Unit Manager',
        directorName: 'Ir. Swanto',
        badge: '🏢 Snaprint Zamrud'
      }
    };

    const SYSTEM_USERS = [
      {
        username: 'direktur',
        aliases: ['direktur', 'swanto', 'admin'],
        password: 'swanto123',
        name: 'Ir. Swanto',
        role: 'Direktur Utama (Semua Unit Usaha)',
        roleType: 'director',
        defaultUnit: 'shop_and_drive_gw',
        allowedUnits: ['ALL', 'shop_and_drive_gw', 'snaprint_gw', 'snaprint_zamrud'],
        canEditSettings: true
      },
      {
        username: 'adis',
        aliases: ['adis', 'shopdrive_gw', 'adis_gw'],
        password: 'adis123',
        name: 'Adis Setiawan',
        role: 'PIC Shop And Drive Grand Wisata',
        roleType: 'pic',
        defaultUnit: 'shop_and_drive_gw',
        allowedUnits: ['shop_and_drive_gw'],
        canEditSettings: false
      },
      {
        username: 'eki',
        aliases: ['eki', 'snaprint_gw', 'eki_gw'],
        password: 'eki123',
        name: 'Eki Dwi Saputra',
        role: 'PIC Snaprint Grand Wisata',
        roleType: 'pic',
        defaultUnit: 'snaprint_gw',
        allowedUnits: ['snaprint_gw'],
        canEditSettings: false
      },
      {
        username: 'rengga',
        aliases: ['rengga', 'snaprint_zamrud', 'rengga_zamrud'],
        password: 'rengga123',
        name: 'M. Rengga Swana Herlambang',
        role: 'PIC Snaprint Zamrud',
        roleType: 'pic',
        defaultUnit: 'snaprint_zamrud',
        allowedUnits: ['snaprint_zamrud'],
        canEditSettings: false
      }
    ];

    // =========================================================================
    // SESSION & AUTHENTICATION HANDLERS
    // =========================================================================
    function getCurrentSession() {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.error("Error reading session", e);
      }
      // Default: Adis Setiawan (Shop And Drive GW)
      return {
        username: 'adis',
        name: 'Adis Setiawan',
        role: 'PIC Shop And Drive Grand Wisata',
        roleType: 'pic',
        activeUnit: 'shop_and_drive_gw'
      };
    }

    function saveCurrentSession(sessionData) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        applySessionToUI();
      } catch (e) {
        console.error("Error saving session", e);
      }
    }

    function applySessionToUI() {
      const session = getCurrentSession();
      const activeUnitKey = session.activeUnit || 'shop_and_drive_gw';
      const unitInfo = BUSINESS_UNITS[activeUnitKey] || BUSINESS_UNITS['shop_and_drive_gw'];

      // Header labels
      const userEl = document.getElementById('headerUserName');
      const roleEl = document.getElementById('headerUserRole');
      const badgeEl = document.getElementById('activeUnitBadge');
      
      if (userEl) userEl.innerText = session.name || 'User';
      if (roleEl) roleEl.innerText = session.role || 'PIC';
      if (badgeEl) badgeEl.innerText = unitInfo.badge || unitInfo.shortName;

      // Update Form Unit Usaha Selector if available
      const selectUnit = document.getElementById('selectUnitUsaha');
      if (selectUnit) {
        selectUnit.value = activeUnitKey;
      }
      
      const labelPic = document.getElementById('labelPicUnit');
      if (labelPic) {
        labelPic.innerText = `PIC: ${unitInfo.picName}`;
      }

      // Populate company & signer data
      if (document.getElementById('companyName')) document.getElementById('companyName').value = unitInfo.name;
      if (document.getElementById('companyAddress')) document.getElementById('companyAddress').value = unitInfo.address;
      if (document.getElementById('signerCity')) document.getElementById('signerCity').value = unitInfo.city;
      if (document.getElementById('signerName')) document.getElementById('signerName').value = unitInfo.picName;

      updateSlip();
    }

    function onUnitUsahaSelectChange(unitKey) {
      const unitInfo = BUSINESS_UNITS[unitKey];
      if (!unitInfo) return;

      const session = getCurrentSession();
      session.activeUnit = unitKey;
      saveCurrentSession(session);

      showToast(`Unit Usaha beralih ke: "${unitInfo.name}" (PIC: ${unitInfo.picName})`, true);
    }

    function selectPicLoginTab(picKey) {
      const allPics = ['adis', 'eki', 'rengga', 'direktur'];
      if (!allPics.includes(picKey)) picKey = 'adis';

      allPics.forEach(k => {
        const btn = document.getElementById('picTabBtn_' + k);
        const win = document.getElementById('picWindow_' + k);
        if (btn) {
          btn.className = 'pic-tab-btn' + (k === picKey ? ` active-tab-${k}` : '');
        }
        if (win) {
          if (k === picKey) {
            win.classList.add('active');
          } else {
            win.classList.remove('active');
          }
        }
      });

      setTimeout(() => {
        const passInput = document.getElementById('frontPass_' + picKey);
        if (passInput) {
          passInput.focus();
          passInput.select();
        }
      }, 100);
    }

    function loginAsPic(picKey, destination = 'slip') {
      const passEl = document.getElementById('frontPass_' + picKey);
      const pass = passEl ? passEl.value.trim() : '';
      quickLoginAndEnter(picKey, pass, destination);
    }

    function togglePassVisibility(inputId, btnEl) {
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        if (btnEl) btnEl.innerText = '🔒';
      } else {
        input.type = 'password';
        if (btnEl) btnEl.innerText = '👁️';
      }
    }

    function openFrontGate(specificPic = null) {
      const gate = document.getElementById('frontLoginGate');
      if (gate) {
        gate.style.display = 'flex';
      }
      if (specificPic) {
        selectPicLoginTab(specificPic);
      }
    }

    function closeFrontGate() {
      const gate = document.getElementById('frontLoginGate');
      if (gate) {
        gate.style.display = 'none';
        sessionStorage.setItem('GATE_PASSED', 'true');
      }
    }

    function quickLoginAndEnter(username, password, destination = 'slip') {
      const success = processLogin(username, password, false);
      if (success) {
        closeFrontGate();
        sessionStorage.setItem('GATE_PASSED', 'true');
        if (destination === 'rekap') {
          window.location.href = 'rekap_gaji.html';
        }
      }
    }

    function handleFrontGateSubmit(e) {
      e.preventDefault();
      const user = document.getElementById('frontGateUser').value.trim().toLowerCase();
      const pass = document.getElementById('frontGatePass').value.trim();
      const target = document.getElementById('frontGateTarget').value;
      quickLoginAndEnter(user, pass, target);
    }

    function openLoginModal(specificPic = null) {
      openFrontGate(specificPic);
    }

    function closeLoginModal() {
      const modal = document.getElementById('loginModal');
      if (modal) modal.classList.remove('show');
    }

    function quickFillLogin(username, password) {
      document.getElementById('loginUsername').value = username;
      document.getElementById('loginPassword').value = password;
      processLogin(username, password);
    }

    function handleLoginSubmit(e) {
      e.preventDefault();
      const user = document.getElementById('loginUsername').value.trim().toLowerCase();
      const pass = document.getElementById('loginPassword').value.trim();
      processLogin(user, pass);
    }

    function processLogin(username, password, showWelcomeToast = true) {
      const userLower = username.toLowerCase();
      const foundUser = SYSTEM_USERS.find(u => 
        (u.username.toLowerCase() === userLower || (u.aliases && u.aliases.includes(userLower))) &&
        u.password === password
      );

      if (!foundUser) {
        alert("⛔ Login Gagal: Username atau Password tidak sesuai!\n\nSilakan periksa kembali daftar username & password di halaman muka.");
        return false;
      }

      const activeUnit = foundUser.defaultUnit || 'shop_and_drive_gw';
      const newSession = {
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
        roleType: foundUser.roleType,
        activeUnit: activeUnit
      };

      saveCurrentSession(newSession);
      closeLoginModal();
      closeFrontGate();
      if (showWelcomeToast) {
        showToast(`Selamat datang, ${foundUser.name}! (${foundUser.role})`, true);
      }
      return true;
    }

    // Helper function to format numbers with thousands separator (Indonesian format ".")
    function formatRupiah(number) {
      if (isNaN(number)) return "0";
      return new Intl.NumberFormat('id-ID').format(Math.round(number));
    }

    // Parse string formatted number back to integer
    function parseRupiah(str) {
      if (!str) return 0;
      const clean = str.toString().replace(/[^0-9-]/g, '');
      const val = parseInt(clean, 10);
      return isNaN(val) ? 0 : val;
    }

    // Show Toast Notification
    function showToast(message, isSuccess = true) {
      const toast = document.getElementById('toastBox');
      document.getElementById('toastMsg').innerText = message;
      document.getElementById('toastIcon').innerText = isSuccess ? '✅' : '⚠️';
      toast.className = 'toast-box show' + (isSuccess ? ' success' : '');
      setTimeout(() => {
        toast.className = 'toast-box';
      }, 3000);
    }

    // =========================================================================
    // ATURAN RESMI TARIF EFEKTIF RATA-RATA (TER) PPh 21 - PP 58/2023 & PMK 168/2023
    // =========================================================================
    // TER Kategori A (TK/0, TK/1, K/0)
    const TER_A = [
      { max: 5400000, rate: 0.00 },
      { max: 5650000, rate: 0.0025 },
      { max: 5950000, rate: 0.005 },
      { max: 6300000, rate: 0.0075 },
      { max: 6750000, rate: 0.01 },
      { max: 7500000, rate: 0.0125 },
      { max: 8550000, rate: 0.015 },
      { max: 9650000, rate: 0.0175 },
      { max: 10050000, rate: 0.02 },
      { max: 10350000, rate: 0.0225 },
      { max: 10700000, rate: 0.025 },
      { max: 11050000, rate: 0.03 },
      { max: 11600000, rate: 0.035 },
      { max: 12500000, rate: 0.04 },
      { max: 13750000, rate: 0.05 },
      { max: 15100000, rate: 0.06 },
      { max: 16950000, rate: 0.07 },
      { max: 19750000, rate: 0.08 },
      { max: 24150000, rate: 0.09 },
      { max: 26450000, rate: 0.10 },
      { max: 28000000, rate: 0.11 },
      { max: 30050000, rate: 0.12 },
      { max: 32400000, rate: 0.13 },
      { max: 35400000, rate: 0.14 },
      { max: 39100000, rate: 0.15 },
      { max: 43850000, rate: 0.16 },
      { max: 47800000, rate: 0.17 },
      { max: 51400000, rate: 0.18 },
      { max: 56300000, rate: 0.19 },
      { max: 62200000, rate: 0.20 },
      { max: 68600000, rate: 0.21 },
      { max: 77500000, rate: 0.22 },
      { max: 89000000, rate: 0.23 },
      { max: 101900000, rate: 0.24 },
      { max: 120000000, rate: 0.25 },
      { max: 140000000, rate: 0.26 },
      { max: 170000000, rate: 0.27 },
      { max: 200000000, rate: 0.28 },
      { max: 250000000, rate: 0.29 },
      { max: 350000000, rate: 0.30 },
      { max: 500000000, rate: 0.31 },
      { max: 750000000, rate: 0.32 },
      { max: 1400000000, rate: 0.33 },
      { max: Infinity, rate: 0.34 }
    ];

    // TER Kategori B (TK/2, TK/3, K/1, K/2)
    const TER_B = [
      { max: 6200000, rate: 0.00 },
      { max: 6500000, rate: 0.0025 },
      { max: 6850000, rate: 0.005 },
      { max: 7300000, rate: 0.0075 },
      { max: 9200000, rate: 0.01 },
      { max: 10750000, rate: 0.015 },
      { max: 11250000, rate: 0.02 },
      { max: 11600000, rate: 0.025 },
      { max: 12600000, rate: 0.03 },
      { max: 13600000, rate: 0.04 },
      { max: 14950000, rate: 0.05 },
      { max: 16400000, rate: 0.06 },
      { max: 18450000, rate: 0.07 },
      { max: 21850000, rate: 0.08 },
      { max: 26000000, rate: 0.09 },
      { max: 27700000, rate: 0.10 },
      { max: 29350000, rate: 0.11 },
      { max: 31450000, rate: 0.12 },
      { max: 33950000, rate: 0.13 },
      { max: 37100000, rate: 0.14 },
      { max: 41100000, rate: 0.15 },
      { max: 45800000, rate: 0.16 },
      { max: 49500000, rate: 0.17 },
      { max: 53800000, rate: 0.18 },
      { max: 58500000, rate: 0.19 },
      { max: 64000000, rate: 0.20 },
      { max: 71000000, rate: 0.21 },
      { max: 80000000, rate: 0.22 },
      { max: 93000000, rate: 0.23 },
      { max: 109000000, rate: 0.24 },
      { max: 129000000, rate: 0.25 },
      { max: 150000000, rate: 0.26 },
      { max: 180000000, rate: 0.27 },
      { max: 215000000, rate: 0.28 },
      { max: 270000000, rate: 0.29 },
      { max: 365000000, rate: 0.30 },
      { max: 520000000, rate: 0.31 },
      { max: 770000000, rate: 0.32 },
      { max: 1405000000, rate: 0.33 },
      { max: Infinity, rate: 0.34 }
    ];

    // TER Kategori C (K/3)
    const TER_C = [
      { max: 6600000, rate: 0.00 },
      { max: 6950000, rate: 0.0025 },
      { max: 7350000, rate: 0.005 },
      { max: 7800000, rate: 0.0075 },
      { max: 8850000, rate: 0.01 },
      { max: 9800000, rate: 0.0125 },
      { max: 10950000, rate: 0.015 },
      { max: 11200000, rate: 0.0175 },
      { max: 12050000, rate: 0.02 },
      { max: 12950000, rate: 0.03 },
      { max: 14150000, rate: 0.04 },
      { max: 15550000, rate: 0.05 },
      { max: 17050000, rate: 0.06 },
      { max: 19500000, rate: 0.07 },
      { max: 22700000, rate: 0.08 },
      { max: 26600000, rate: 0.09 },
      { max: 28100000, rate: 0.10 },
      { max: 30100000, rate: 0.11 },
      { max: 32600000, rate: 0.12 },
      { max: 35400000, rate: 0.13 },
      { max: 38900000, rate: 0.14 },
      { max: 43000000, rate: 0.15 },
      { max: 47400000, rate: 0.16 },
      { max: 51200000, rate: 0.17 },
      { max: 55800000, rate: 0.18 },
      { max: 60400000, rate: 0.19 },
      { max: 66700000, rate: 0.20 },
      { max: 74500000, rate: 0.21 },
      { max: 83200000, rate: 0.22 },
      { max: 95600000, rate: 0.23 },
      { max: 110000000, rate: 0.24 },
      { max: 134000000, rate: 0.25 },
      { max: 169000000, rate: 0.26 },
      { max: 220000000, rate: 0.27 },
      { max: 405000000, rate: 0.28 },
      { max: 515000000, rate: 0.29 },
      { max: 740000000, rate: 0.30 },
      { max: 1410000000, rate: 0.31 },
      { max: Infinity, rate: 0.34 }
    ];

    function getPtkpInfo(ptkpStatus) {
      const map = {
        'TK/0': { category: 'A', nominal: 54000000, label: 'TK/0 (Rp 54 Jt)' },
        'TK/1': { category: 'A', nominal: 58500000, label: 'TK/1 (Rp 58.5 Jt)' },
        'TK/2': { category: 'B', nominal: 63000000, label: 'TK/2 (Rp 63 Jt)' },
        'TK/3': { category: 'B', nominal: 67500000, label: 'TK/3 (Rp 67.5 Jt)' },
        'K/0':  { category: 'A', nominal: 58500000, label: 'K/0 (Rp 58.5 Jt)' },
        'K/1':  { category: 'B', nominal: 63000000, label: 'K/1 (Rp 63 Jt)' },
        'K/2':  { category: 'B', nominal: 67500000, label: 'K/2 (Rp 67.5 Jt)' },
        'K/3':  { category: 'C', nominal: 72000000, label: 'K/3 (Rp 72 Jt)' }
      };
      return map[ptkpStatus] || { category: 'A', nominal: 54000000, label: 'TK/0 (Rp 54 Jt)' };
    }

    function calculatePph21(bruto, ptkpStatus) {
      const ptkp = getPtkpInfo(ptkpStatus);
      let table = TER_A;
      if (ptkp.category === 'B') table = TER_B;
      if (ptkp.category === 'C') table = TER_C;

      const bracket = table.find(b => bruto <= b.max);
      const rate = bracket ? bracket.rate : 0;
      const pph21 = Math.round(bruto * rate);

      return {
        pph21: pph21,
        category: ptkp.category,
        rate: rate,
        ratePct: (rate * 100).toFixed(2).replace(/\.00$/, '').replace(/\.([1-9])0$/, '.$1'),
        ptkpNominal: ptkp.nominal,
        ptkpLabel: ptkp.label
      };
    }

    function togglePph21Mode() {
      const mode = document.getElementById('pph21Mode').value;
      const inputPph21 = document.getElementById('potonganPph21');
      if (mode === 'auto') {
        inputPph21.readOnly = true;
        inputPph21.style.background = '#f8fafc';
      } else if (mode === 'manual') {
        inputPph21.readOnly = false;
        inputPph21.style.background = '#ffffff';
        inputPph21.focus();
      } else { // 'none'
        inputPph21.readOnly = true;
        inputPph21.value = '0';
        inputPph21.style.background = '#f8fafc';
      }
      calcAllowancesAndTotals();
    }

    // =========================================================================
    // DATABASE FUNCTIONS (INSERT / SELECT / DELETE / EXPORT)
    // =========================================================================
    function getDatabaseRecords() {
      try {
        const raw = localStorage.getItem(DB_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error("Error reading database", e);
        return [];
      }
    }

    function saveDatabaseRecords(records) {
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(records));
        updateDatabaseBadge();
      } catch (e) {
        console.error("Error saving database", e);
      }
    }

    function updateDatabaseBadge() {
      const records = getDatabaseRecords();
      const badge = document.getElementById('dbBadgeCount');
      if (badge) badge.innerText = records.length;
    }

    let currentEditingRecordId = null;

    function exitEditMode() {
      currentEditingRecordId = null;
      const banner = document.getElementById('editModeBanner');
      if (banner) banner.style.display = 'none';
      showToast("Mode koreksi selesai. Kembali ke formulir input baru.", false);
    }

    // INSERT / SIMPAN / PERBARUI KE DATABASE
    function saveToDatabase() {
      const empName = document.getElementById('empName').value.trim();
      if (!empName) {
        alert("Mohon masukkan Nama Karyawan sebelum menyimpan ke database!");
        document.getElementById('empName').focus();
        return;
      }

      const session = getCurrentSession();
      const ptkpStatus = document.getElementById('empPtkp').value;
      const pph21Mode = document.getElementById('pph21Mode').value;
      const unitKey = document.getElementById('selectUnitUsaha') ? document.getElementById('selectUnitUsaha').value : (session.activeUnit || 'shop_and_drive_gw');
      const unitInfo = BUSINESS_UNITS[unitKey] || BUSINESS_UNITS['shop_and_drive_gw'];

      const recordId = currentEditingRecordId ? currentEditingRecordId : ('SLIP_' + Date.now());

      const record = {
        id: recordId,
        savedAt: new Date().toLocaleString('id-ID'),
        unitId: unitKey,
        unitUsaha: unitInfo.name,
        picName: unitInfo.picName,
        companyName: document.getElementById('companyName').value,
        companyAddress: document.getElementById('companyAddress').value,
        payPeriod: document.getElementById('payPeriod').value,
        payDate: document.getElementById('payDate').value,
        empName: empName,
        empId: document.getElementById('empId').value,
        empJabatan: document.getElementById('empJabatan').value,
        empDivisi: document.getElementById('empDivisi').value,
        empStatus: document.getElementById('empStatus').value,
        empMasaKerja: document.getElementById('empMasaKerja').value,
        empPtkp: ptkpStatus,
        empNpwp: document.getElementById('empNpwp').value,
        hariKerja: parseInt(document.getElementById('hariKerja').value, 10) || 0,
        empKeteranganHadir: document.getElementById('empKeteranganHadir').value,
        empRekening: document.getElementById('empRekening').value,
        empBpjsNo: document.getElementById('empBpjsNo').value,
        gajiPokok: parseRupiah(document.getElementById('gajiPokok').value),
        tunjanganJabatan: parseRupiah(document.getElementById('tunjanganJabatan').value),
        rateMakanPerHari: parseRupiah(document.getElementById('rateMakanPerHari').value),
        rateTransportPerHari: parseRupiah(document.getElementById('rateTransportPerHari').value),
        hariTanggalMerah: parseInt(document.getElementById('hariTanggalMerah').value, 10) || 0,
        insentifLain: parseRupiah(document.getElementById('insentifLain') ? document.getElementById('insentifLain').value : 0),
        ketInsentifLain: document.getElementById('ketInsentifLain') ? document.getElementById('ketInsentifLain').value : "",
        pph21Mode: pph21Mode,
        potonganPph21: parseRupiah(document.getElementById('potonganPph21').value),
        iuranBpjs: parseRupiah(document.getElementById('iuranBpjs').value),
        totalPinjaman: parseRupiah(document.getElementById('totalPinjaman').value),
        cicilanPinjaman: parseRupiah(document.getElementById('cicilanPinjaman').value),
        cicilanKe: document.getElementById('cicilanKe').value,
        tenorBulan: document.getElementById('tenorBulan').value,
        potonganLain: parseRupiah(document.getElementById('potonganLain').value),
        signerCity: document.getElementById('signerCity').value,
        signerName: document.getElementById('signerName').value
      };

      // Computed Totals
      record.totalMakan = record.hariKerja * record.rateMakanPerHari;
      record.totalTransport = record.hariKerja * record.rateTransportPerHari;
      record.totalMerah = record.hariTanggalMerah * 75000;
      record.insentifLain = record.insentifLain || 0;
      record.totalPenghasilan = record.gajiPokok + record.tunjanganJabatan + record.totalMakan + record.totalTransport + record.totalMerah + record.insentifLain;
      record.totalPotongan = record.iuranBpjs + record.potonganPph21 + record.cicilanPinjaman + record.potonganLain;
      record.netGaji = record.totalPenghasilan - record.totalPotongan;

      let records = getDatabaseRecords();

      if (currentEditingRecordId) {
        // Mode Update / Koreksi
        const idx = records.findIndex(r => r.id === currentEditingRecordId);
        if (idx !== -1) {
          records[idx] = { 
            ...records[idx],
            ...record, 
            updatedAt: new Date().toLocaleString('id-ID') + ' (Direktur: Ir. Swanto)' 
          };
          saveDatabaseRecords(records);
          updateDatabaseBadge();
          showToast(`✅ Data "${empName}" Berhasil Diperbarui oleh Direktur (Ir. Swanto)!`, true);
          exitEditMode();
          return;
        }
      }

      // Add to beginning of array
      records.unshift(record);
      saveDatabaseRecords(records);
      updateDatabaseBadge();

      showToast(`Data Slip Gaji "${empName}" [${unitInfo.shortName}] Berhasil Disimpan!`, true);
    }

    // LOAD DATA FROM DATABASE TO FORM & PREVIEW (MODE KOREKSI DIREKTUR)
    function loadRecordToForm(id) {
      const records = getDatabaseRecords();
      const rec = records.find(r => r.id === id);
      if (!rec) return;

      currentEditingRecordId = id;
      const banner = document.getElementById('editModeBanner');
      if (banner) {
        banner.style.display = 'flex';
        document.getElementById('editModeDetail').innerText = `Sedang mengoreksi data: ${rec.empName} (NIK: ${rec.empId || '-'} | Unit: ${rec.unitUsaha || rec.companyName})`;
      }

      if (rec.unitId && document.getElementById('selectUnitUsaha')) {
        document.getElementById('selectUnitUsaha').value = rec.unitId;
      }

      document.getElementById('companyName').value = rec.companyName || "";
      document.getElementById('companyAddress').value = rec.companyAddress || "";
      document.getElementById('payPeriod').value = rec.payPeriod || "";
      document.getElementById('payDate').value = rec.payDate || "";
      document.getElementById('empName').value = rec.empName || "";
      document.getElementById('empId').value = rec.empId || "";
      document.getElementById('empJabatan').value = rec.empJabatan || "";
      document.getElementById('empDivisi').value = rec.empDivisi || "Operasional";
      document.getElementById('empStatus').value = rec.empStatus || "Karyawan Tetap";
      document.getElementById('empMasaKerja').value = rec.empMasaKerja || "";
      
      if (rec.empPtkp && document.getElementById('empPtkp')) {
        document.getElementById('empPtkp').value = rec.empPtkp;
      }
      if (rec.empNpwp && document.getElementById('empNpwp')) {
        document.getElementById('empNpwp').value = rec.empNpwp;
      }

      document.getElementById('hariKerja').value = rec.hariKerja !== undefined ? rec.hariKerja : 24;
      document.getElementById('empKeteranganHadir').value = rec.empKeteranganHadir || "";
      document.getElementById('empRekening').value = rec.empRekening || "";
      document.getElementById('empBpjsNo').value = rec.empBpjsNo || "";

      document.getElementById('gajiPokok').value = formatRupiah(rec.gajiPokok || 0);
      document.getElementById('tunjanganJabatan').value = formatRupiah(rec.tunjanganJabatan || 0);
      document.getElementById('rateMakanPerHari').value = formatRupiah(rec.rateMakanPerHari || 25000);
      document.getElementById('rateTransportPerHari').value = formatRupiah(rec.rateTransportPerHari || 15000);
      document.getElementById('hariTanggalMerah').value = rec.hariTanggalMerah || 0;
      
      if (document.getElementById('insentifLain')) {
        document.getElementById('insentifLain').value = formatRupiah(rec.insentifLain || 0);
      }
      if (document.getElementById('ketInsentifLain')) {
        document.getElementById('ketInsentifLain').value = rec.ketInsentifLain || "";
      }

      if (rec.pph21Mode && document.getElementById('pph21Mode')) {
        document.getElementById('pph21Mode').value = rec.pph21Mode;
      }
      if (rec.potonganPph21 !== undefined && document.getElementById('potonganPph21')) {
        document.getElementById('potonganPph21').value = formatRupiah(rec.potonganPph21);
      }

      document.getElementById('iuranBpjs').value = formatRupiah(rec.iuranBpjs || 0);
      document.getElementById('totalPinjaman').value = formatRupiah(rec.totalPinjaman || 0);
      document.getElementById('cicilanPinjaman').value = formatRupiah(rec.cicilanPinjaman || 0);
      document.getElementById('cicilanKe').value = rec.cicilanKe || "1";
      document.getElementById('tenorBulan').value = rec.tenorBulan || "1";
      document.getElementById('potonganLain').value = formatRupiah(rec.potonganLain || 0);

      document.getElementById('signerCity').value = rec.signerCity || "Bekasi";
      document.getElementById('signerName').value = rec.signerName || "PIC Unit";

      calcAllowancesAndTotals();
      closeDatabaseModal();
      showToast(`✏️ Data "${rec.empName}" Dimuat ke Formulir (Mode Koreksi Aktif)`, true);
    }

    // DELETE SINGLE RECORD
    function deleteRecord(id, name) {
      if (confirm(`Yakin ingin menghapus data slip gaji "${name}" dari database?`)) {
        let records = getDatabaseRecords();
        records = records.filter(r => r.id !== id);
        saveDatabaseRecords(records);
        renderDatabaseTable();
        showToast(`Data slip "${name}" telah dihapus.`);
      }
    }

    // CLEAR ALL RECORDS
    function clearAllDatabase() {
      const records = getDatabaseRecords();
      if (records.length === 0) {
        alert("Database saat ini masih kosong.");
        return;
      }
      if (confirm("Peringatan: Yakin ingin MENGHAPUS SEMUA DATA slip gaji di database? Tindakan ini tidak dapat dibatalkan.")) {
        saveDatabaseRecords([]);
        renderDatabaseTable();
        showToast("Seluruh database telah dikosongkan.");
      }
    }

    // EXPORT DATABASE TO CSV / EXCEL
    function exportDatabaseToExcel() {
      const records = getDatabaseRecords();
      if (records.length === 0) {
        alert("Belum ada data slip gaji tersimpan di database untuk diekspor.");
        return;
      }

      let csv = "No,Tanggal Simpan,Unit Usaha,PIC Unit,Periode,NIK,Nama Karyawan,Jabatan,Divisi,Status,Status PTKP,NPWP,Hari Masuk,Gaji Pokok,Tunjangan Jabatan,Tunjangan Makan,Tunjangan Transport,Insentif Tgl Merah,Insentif Lain,Keterangan Insentif,TOTAL PENERIMAAN,Potongan PPh 21,Iuran BPJS,Cicilan Pinjaman,Potongan Lain,TOTAL POTONGAN,GAJI BERSIH (THP),No Rekening\n";

      records.forEach((r, idx) => {
        csv += `"${idx+1}","${r.savedAt}","${r.unitUsaha || r.companyName || '-'}","${r.picName || '-'}","${r.payPeriod}","${r.empId}","${r.empName}","${r.empJabatan}","${r.empDivisi}","${r.empStatus}","${r.empPtkp || 'TK/0'}","${r.empNpwp || '-'}","${r.hariKerja}","${r.gajiPokok}","${r.tunjanganJabatan}","${r.totalMakan}","${r.totalTransport}","${r.totalMerah}","${r.insentifLain || 0}","${(r.ketInsentifLain || '').replace(/"/g, '""')}","${r.totalPenghasilan}","${r.potonganPph21 || 0}","${r.iuranBpjs}","${r.cicilanPinjaman}","${r.potonganLain}","${r.totalPotongan}","${r.netGaji}","${r.empRekening}"\n`;
      });

      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rekap_Database_Slip_Gaji_3_Unit_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // RENDER DATABASE TABLE & STATS
    function renderDatabaseTable(filterQuery = '') {
      const records = getDatabaseRecords();
      const tbody = document.getElementById('dbTableBody');
      const search = filterQuery.toLowerCase().trim();
      const unitFilter = document.getElementById('dbFilterUnit') ? document.getElementById('dbFilterUnit').value : 'ALL';

      // Stats
      document.getElementById('dbTotalRecords').innerText = records.length + " Slip";
      const uniqueEmps = new Set(records.map(r => r.empName)).size;
      document.getElementById('dbTotalEmployees').innerText = uniqueEmps + " Orang";
      const totalPayroll = records.reduce((sum, r) => sum + (r.netGaji || 0), 0);
      document.getElementById('dbTotalPayroll').innerText = "Rp " + formatRupiah(totalPayroll);

      const filtered = records.filter(r => {
        const matchUnit = (unitFilter === 'ALL' || r.unitId === unitFilter || (r.unitUsaha && r.unitUsaha.toLowerCase().includes(unitFilter.toLowerCase())));
        const matchSearch = (!search || 
          (r.empName && r.empName.toLowerCase().includes(search)) ||
          (r.empId && r.empId.toLowerCase().includes(search)) ||
          (r.empJabatan && r.empJabatan.toLowerCase().includes(search)) ||
          (r.unitUsaha && r.unitUsaha.toLowerCase().includes(search)) ||
          (r.payPeriod && r.payPeriod.toLowerCase().includes(search)) ||
          (r.empPtkp && r.empPtkp.toLowerCase().includes(search))
        );
        return matchUnit && matchSearch;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center; padding: 2rem; color: #94a3b8;">
              ${records.length === 0 ? 'Belum ada data slip gaji tersimpan di database. Klik tombol "💾 Simpan ke Database" untuk mulai menyimpan data.' : 'Tidak ada data yang sesuai dengan pencarian / filter unit.'}
            </td>
          </tr>
        `;
        return;
      }

      let html = '';
      filtered.forEach((r, idx) => {
        html += `
          <tr>
            <td><strong>${idx + 1}</strong></td>
            <td>
              <strong style="color: #1e3a8a;">${r.empName}</strong>
              <div style="font-size: 0.72rem; color: #64748b;">PTKP: <strong style="color: #1e40af;">${r.empPtkp || 'TK/0'}</strong></div>
            </td>
            <td>
              <span class="badge-info" style="background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 700;">
                ${r.unitUsaha || r.companyName || 'Unit Usaha'}
              </span>
            </td>
            <td><code>${r.empId || '-'}</code></td>
            <td>
              <div>${r.empJabatan || '-'}</div>
              <span style="font-size: 0.72rem; color: #64748b;">${r.empDivisi || ''}</span>
            </td>
            <td><span class="badge-info" style="background: #e2e8f0; color: #334155;">${r.payPeriod || '-'}</span></td>
            <td style="font-weight: 600; color: #1e40af;">${r.hariKerja || 0} Hari</td>
            <td style="font-weight: 700; color: #15803d; font-size: 0.9rem;">Rp ${formatRupiah(r.netGaji || 0)}</td>
            <td style="font-size: 0.75rem; color: #64748b;">${r.savedAt || '-'}</td>
            <td style="text-align: center; white-space: nowrap;">
              <button class="btn btn-sm" style="padding: 0.32rem 0.65rem; font-size: 0.75rem; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-weight: 700;" onclick="loadRecordToForm('${r.id}')" title="Koreksi / Perbaiki Kesalahan Input Data (Khusus Direktur)">
                ✏️ Edit
              </button>
              <button class="btn btn-sm btn-load-sm" onclick="loadRecordToForm('${r.id}')" title="Buka data ke formulir">
                👁️ Buka
              </button>
              <button class="btn btn-sm btn-success" style="padding: 0.32rem 0.65rem; font-size: 0.75rem;" onclick="loadRecordAndPrint('${r.id}')" title="Cetak slip karyawan ini langsung">
                🖨️ Cetak
              </button>
              <button class="btn btn-sm btn-danger-sm" onclick="deleteRecord('${r.id}', '${r.empName}')" title="Hapus dari database">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    }

    function loadRecordAndPrint(id) {
      loadRecordToForm(id);
      setTimeout(() => {
        triggerPrint();
      }, 250);
    }

    function filterDatabaseTable() {
      const q = document.getElementById('dbSearchInput').value;
      renderDatabaseTable(q);
    }

    function openDatabaseModal() {
      renderDatabaseTable();
      document.getElementById('dbModal').classList.add('show');
    }

    function closeDatabaseModal() {
      document.getElementById('dbModal').classList.remove('show');
    }

    // =========================================================================
    // GLOBAL SETTINGS & BACKUP/RESTORE SYSTEM (PROTECTED BY DIREKTUR: IR. SWANTO)
    // =========================================================================
    const SETTINGS_STORAGE_KEY = 'PAYROLL_SYSTEM_SETTINGS_V1';

    const DEFAULT_SETTINGS = {
      companyName: "PT. MAJU BERSAMA SUKSES",
      companyAddress: "Jl. Jenderal Sudirman No. 88, Jakarta",
      companyCity: "Jakarta",
      defaultPeriod: "September 2026",
      defaultPayDate: "25 September 2026",
      signerName: "Hendra Wijaya, S.E.",
      signerRole: "Manager Keuangan & Akuntansi",
      makerName: "Siti Rahmawati, S.E.",
      makerRole: "Staff Keuangan & Penggajian",
      directorName: "Ir. Swanto",
      directorRole: "Direktur Utama",
      directorPin: "swanto",
      defaultWorkDays: 24,
      defaultMakanRate: 25000,
      defaultTransportRate: 15000,
      defaultMerahRate: 75000,
      defaultPtkp: "TK/0",
      defaultPphMode: "auto",
      defaultPaper: "a4",
      defaultOrientation: "portrait"
    };

    function getSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      } catch (e) {
        console.error("Error reading settings", e);
        return { ...DEFAULT_SETTINGS };
      }
    }

    function saveSettings(settings) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        return true;
      } catch (e) {
        console.error("Error saving settings", e);
        return false;
      }
    }

    // =========================================================================
    // VERIFIKASI OTORISASI DIREKTUR (IR. SWANTO)
    // =========================================================================
    function isDirectorSession() {
      try {
        const session = getCurrentSession();
        return session && (session.roleType === 'director' || session.username === 'direktur' || session.username === 'swanto');
      } catch (e) {
        return false;
      }
    }

    function checkDirectorPin(pin) {
      if (!pin) return false;
      const enteredPin = String(pin).trim().toLowerCase();
      const cfg = getSettings();
      const validPins = ['swanto', 'swanto123', 'swanto2026', '123456', 'direktur'];
      if (cfg.directorPin && !validPins.includes(cfg.directorPin.toLowerCase())) {
        validPins.push(cfg.directorPin.toLowerCase());
      }
      return validPins.includes(enteredPin);
    }

    function verifyDirectorPermission() {
      if (isDirectorSession()) {
        return true;
      }
      const pinInput = document.getElementById('cfgDirectorAuthPin');
      const enteredPin = pinInput ? pinInput.value.trim().toLowerCase() : "";
      
      if (checkDirectorPin(enteredPin)) {
        return true;
      }

      // Jika tidak diisi atau salah, munculkan Modal Note Peringatan
      showDirectorAuthNote();
      return false;
    }

    function showDirectorAuthNote() {
      const modal = document.getElementById('directorAuthNoteModal');
      const pinField = document.getElementById('noteDirectorAuthPin');
      if (pinField) {
        pinField.value = "";
        pinField.style.borderColor = "#cbd5e1";
      }
      if (modal) {
        modal.classList.add('show');
        setTimeout(() => {
          if (pinField) pinField.focus();
        }, 150);
      } else {
        alert("⛔ AKSES DITOLAK!\n\nSeluruh Pengaturan hanya boleh dilihat Oleh Direktur ( Ir. Swanto ).\n\n⚠️ HARUS IZIN DIREKTUR!");
      }
      showToast("⚠️ Akses Ditolak: Hanya Direktur (Ir. Swanto) yang berhak melihat pengaturan!", false);
    }

    function closeDirectorAuthNote() {
      const modal = document.getElementById('directorAuthNoteModal');
      if (modal) modal.classList.remove('show');
    }

    function unlockSettingsWithPin() {
      const pinInput = document.getElementById('noteDirectorAuthPin');
      const enteredPin = pinInput ? pinInput.value.trim() : "";
      if (checkDirectorPin(enteredPin)) {
        closeDirectorAuthNote();
        showToast("✅ Otorisasi Direktur Terverifikasi! Membuka Pengaturan...", true);
        openSettingsModal(true);
      } else {
        showToast("❌ Password / PIN Direktur salah! Akses ditolak.", false);
        if (pinInput) {
          pinInput.style.borderColor = "#dc2626";
          pinInput.focus();
        }
      }
    }

    function openSettingsModal(bypassAuth = false) {
      // Pembatasan: Seluruh Pengaturan HANYA BISA DILIHAT oleh Direktur (Ir. Swanto)
      if (!bypassAuth && !isDirectorSession()) {
        showDirectorAuthNote();
        return;
      }

      const cfg = getSettings();
      document.getElementById('cfgCompanyName').value = cfg.companyName;
      document.getElementById('cfgCompanyAddress').value = cfg.companyAddress;
      document.getElementById('cfgCompanyCity').value = cfg.companyCity;
      document.getElementById('cfgSignerName').value = cfg.signerName;
      document.getElementById('cfgSignerRole').value = cfg.signerRole || "Manager Keuangan";
      document.getElementById('cfgMakerName').value = cfg.makerName || "Staff Payroll";
      document.getElementById('cfgDirectorName').value = cfg.directorName || "Ir. Swanto";
      document.getElementById('cfgDefaultWorkDays').value = cfg.defaultWorkDays || 24;
      document.getElementById('cfgDefaultMakanRate').value = formatRupiah(cfg.defaultMakanRate || 25000);
      document.getElementById('cfgDefaultTransportRate').value = formatRupiah(cfg.defaultTransportRate || 15000);
      document.getElementById('cfgDefaultMerahRate').value = formatRupiah(cfg.defaultMerahRate || 75000);
      document.getElementById('cfgDefaultPtkp').value = cfg.defaultPtkp || 'TK/0';
      document.getElementById('cfgDefaultPphMode').value = cfg.defaultPphMode || 'auto';

      const pinInput = document.getElementById('cfgDirectorAuthPin');
      if (pinInput) pinInput.value = "";

      document.getElementById('settingsModal').classList.add('show');
    }

    function closeSettingsModal() {
      document.getElementById('settingsModal').classList.remove('show');
    }

    function saveSettingsFromModal() {
      // Validasi Otorisasi Direktur
      if (!verifyDirectorPermission()) {
        return;
      }

      const cfg = getSettings();
      const newSettings = {
        companyName: document.getElementById('cfgCompanyName').value.trim() || DEFAULT_SETTINGS.companyName,
        companyAddress: document.getElementById('cfgCompanyAddress').value.trim() || DEFAULT_SETTINGS.companyAddress,
        companyCity: document.getElementById('cfgCompanyCity').value.trim() || DEFAULT_SETTINGS.companyCity,
        signerName: document.getElementById('cfgSignerName').value.trim() || DEFAULT_SETTINGS.signerName,
        signerRole: document.getElementById('cfgSignerRole').value.trim() || DEFAULT_SETTINGS.signerRole,
        makerName: document.getElementById('cfgMakerName').value.trim() || DEFAULT_SETTINGS.makerName,
        directorName: "Ir. Swanto",
        directorRole: "Direktur Utama",
        directorPin: cfg.directorPin || "swanto",
        defaultWorkDays: parseInt(document.getElementById('cfgDefaultWorkDays').value, 10) || 24,
        defaultMakanRate: parseRupiah(document.getElementById('cfgDefaultMakanRate').value) || 25000,
        defaultTransportRate: parseRupiah(document.getElementById('cfgDefaultTransportRate').value) || 15000,
        defaultMerahRate: parseRupiah(document.getElementById('cfgDefaultMerahRate').value) || 75000,
        defaultPtkp: document.getElementById('cfgDefaultPtkp').value,
        defaultPphMode: document.getElementById('cfgDefaultPphMode').value,
        defaultPaper: currentPaper,
        defaultOrientation: currentOrientation
      };

      saveSettings(newSettings);
      applySettingsToUI(newSettings);
      closeSettingsModal();
      showToast("✅ Izin Direktur (Ir. Swanto) Terverifikasi. Pengaturan berhasil disimpan!", true);
    }

    function applySettingsToUI(cfg = null) {
      if (!cfg) cfg = getSettings();
      const session = getCurrentSession();
      const activeUnitKey = session.activeUnit || 'shop_and_drive_gw';
      const unitInfo = BUSINESS_UNITS[activeUnitKey] || BUSINESS_UNITS['shop_and_drive_gw'];

      // Always respect active business unit info & PIC
      if (document.getElementById('companyName')) document.getElementById('companyName').value = unitInfo.name;
      if (document.getElementById('companyAddress')) document.getElementById('companyAddress').value = unitInfo.address;
      if (document.getElementById('signerCity')) document.getElementById('signerCity').value = unitInfo.city;
      if (document.getElementById('signerName')) document.getElementById('signerName').value = unitInfo.picName;

      // Rate defaults jika field masih bernilai default
      if (document.getElementById('rateMakanPerHari') && (!document.getElementById('rateMakanPerHari').value || document.getElementById('rateMakanPerHari').value === "0")) {
        document.getElementById('rateMakanPerHari').value = formatRupiah(cfg.defaultMakanRate);
      }
      if (document.getElementById('rateTransportPerHari') && (!document.getElementById('rateTransportPerHari').value || document.getElementById('rateTransportPerHari').value === "0")) {
        document.getElementById('rateTransportPerHari').value = formatRupiah(cfg.defaultTransportRate);
      }

      updateSlip();
    }

    function resetSettingsToDefault() {
      // Validasi Otorisasi Direktur
      if (!verifyDirectorPermission()) {
        return;
      }

      if (confirm("Izin Direktur (Ir. Swanto) Terkonfirmasi. Kembalikan seluruh pengaturan sistem ke standar awal?")) {
        saveSettings(DEFAULT_SETTINGS);
        openSettingsModal();
        applySettingsToUI(DEFAULT_SETTINGS);
        showToast("Pengaturan telah dikembalikan ke standar awal oleh Direktur.", false);
      }
    }

    // EXPORT FULL BACKUP JSON
    function exportBackupJSON() {
      const records = getDatabaseRecords();
      const settings = getSettings();
      const payload = {
        app: "Sistem Slip Gaji & Rekapitulasi Karyawan",
        developer: "dev by dutaglobaltech enterprise",
        director: "Ir. Swanto",
        exportedAt: new Date().toISOString(),
        version: "1.0",
        settings: settings,
        records: records
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `Backup_Payroll_Database_${new Date().toISOString().slice(0,10)}.json`);
      dlAnchorElem.click();
      showToast("File backup JSON berhasil didownload!", true);
    }

    // IMPORT BACKUP JSON
    function importBackupJSON(event) {
      // Validasi Otorisasi Direktur
      if (!verifyDirectorPermission()) {
        event.target.value = "";
        return;
      }

      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && (Array.isArray(parsed.records) || parsed.settings)) {
            if (Array.isArray(parsed.records)) {
              saveDatabaseRecords(parsed.records);
            }
            if (parsed.settings) {
              parsed.settings.directorName = "Ir. Swanto";
              saveSettings(parsed.settings);
            }
            applySettingsToUI();
            updateDatabaseBadge();
            renderDatabaseTable();
            closeSettingsModal();
            showToast(`Backup berhasil dipulihkan dengan izin Direktur! (${(parsed.records || []).length} slip gaji dimuat)`, true);
          } else {
            alert("Format file JSON tidak valid.");
          }
        } catch (err) {
          alert("Gagal membaca file JSON: " + err.message);
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }

    function closeModalOnBackdrop(e) {
      if (e.target.id === 'dbModal') {
        closeDatabaseModal();
      } else if (e.target.id === 'settingsModal') {
        closeSettingsModal();
      } else if (e.target.id === 'directorAuthNoteModal') {
        closeDirectorAuthNote();
      } else if (e.target.id === 'loginModal') {
        closeLoginModal();
      }
    }

    // =========================================================================
    // UI & SLIP CALCULATIONS & PRINT ORIENTATION
    // =========================================================================
    let currentPaper = 'a4';
    let currentOrientation = 'portrait';

    function setOrientation(orient) {
      currentOrientation = orient;
      
      const btnPortrait = document.getElementById('btnOrientPortrait');
      const btnLandscape = document.getElementById('btnOrientLandscape');
      const orientBadge = document.getElementById('currentOrientBadge');
      const body = document.body;

      if (btnPortrait) btnPortrait.classList.remove('active');
      if (btnLandscape) btnLandscape.classList.remove('active');
      body.classList.remove('orient-portrait', 'orient-landscape');

      if (orient === 'portrait') {
        if (btnPortrait) btnPortrait.classList.add('active');
        body.classList.add('orient-portrait');
        if (orientBadge) orientBadge.innerText = 'Portrait (Tegak)';
      } else {
        if (btnLandscape) btnLandscape.classList.add('active');
        body.classList.add('orient-landscape');
        if (orientBadge) orientBadge.innerText = 'Landscape (Mendatar)';
      }

      applyPrintPageCSS();
      updateSlip();
    }

    function applyPrintPageCSS() {
      let pageCSS = '';
      const orient = currentOrientation;

      if (currentPaper === 'a4') {
        pageCSS = `@page { size: A4 ${orient}; margin: 8mm 10mm; }`;
      } else if (currentPaper === 'a4-half') {
        pageCSS = `@page { size: A4 portrait; margin: 5mm 8mm; }`;
      } else if (currentPaper === 'a5') {
        pageCSS = `@page { size: A5 ${orient}; margin: 6mm 8mm; }`;
      } else if (currentPaper === 'f4') {
        pageCSS = `@page { size: 215mm 330mm ${orient}; margin: 8mm 10mm; }`;
      } else if (currentPaper === 'receipt') {
        pageCSS = `@page { size: 80mm auto portrait; margin: 2mm; }`;
      }

      let styleEl = document.getElementById('dynamicPrintPageStyle');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamicPrintPageStyle';
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `@media print { ${pageCSS} }`;
    }

    function setPaperSize(size) {
      currentPaper = size;
      const body = document.body;

      body.classList.remove('mode-a4', 'mode-a4-half', 'mode-a5', 'mode-f4', 'mode-receipt');
      body.classList.remove('print-a4', 'print-a4-half', 'print-a5', 'print-f4', 'print-receipt');
      
      document.getElementById('btnPaperA4').classList.remove('active');
      document.getElementById('btnPaperA4Half').classList.remove('active');
      document.getElementById('btnPaperA5').classList.remove('active');
      document.getElementById('btnPaperF4').classList.remove('active');
      document.getElementById('btnPaperReceipt').classList.remove('active');

      const labels = {
        'a4': 'A4 Full Page (1 Lembar)',
        'a4-half': 'A4 Bagi Dua (2 Slip Kembar)',
        'a5': 'Kertas A5 (Setengah A4)',
        'f4': 'F4 / Folio (HVS Kantor)',
        'receipt': 'Struk Thermal 80mm'
      };

      document.getElementById('currentPaperLabel').innerText = labels[size] || 'A4';

      if (size === 'a4') {
        body.classList.add('mode-a4', 'print-a4');
        document.getElementById('btnPaperA4').classList.add('active');
      } else if (size === 'a4-half') {
        body.classList.add('mode-a4-half', 'print-a4-half');
        document.getElementById('btnPaperA4Half').classList.add('active');
      } else if (size === 'a5') {
        body.classList.add('mode-a5', 'print-a5');
        document.getElementById('btnPaperA5').classList.add('active');
      } else if (size === 'f4') {
        body.classList.add('mode-f4', 'print-f4');
        document.getElementById('btnPaperF4').classList.add('active');
      } else if (size === 'receipt') {
        body.classList.add('mode-receipt', 'print-receipt');
        document.getElementById('btnPaperReceipt').classList.add('active');
      }

      applyPrintPageCSS();
      updateSlip();
    }

    function triggerPrint() {
      // Pastikan modal ditutup agar cetakan bersih
      if (document.getElementById('dbModal')) {
        document.getElementById('dbModal').classList.remove('show');
      }
      // Sinkronkan seluruh data dan perhitungan
      updateSlip();
      calcAllowancesAndTotals();
      
      // Berikan delay kecil untuk browser rendering layout sebelum print dialog muncul
      setTimeout(() => {
        window.print();
      }, 100);
    }

    function setJabatan(jabatanName, defaultDivisi) {
      document.getElementById('empJabatan').value = jabatanName;
      if (defaultDivisi) {
        const divSelect = document.getElementById('empDivisi');
        for (let i = 0; i < divSelect.options.length; i++) {
          if (divSelect.options[i].value.toLowerCase().includes(defaultDivisi.toLowerCase().substring(0, 4))) {
            divSelect.selectedIndex = i;
            break;
          }
        }
      }
      updateSlip();
    }

    function formatAndCalc(inputElem) {
      const rawValue = parseRupiah(inputElem.value);
      inputElem.value = formatRupiah(rawValue);
      calcAllowancesAndTotals();
    }

    function calcAllowancesAndTotals() {
      const hariKerja = parseInt(document.getElementById('hariKerja').value, 10) || 0;
      const rateMakan = parseRupiah(document.getElementById('rateMakanPerHari').value);
      const rateTransport = parseRupiah(document.getElementById('rateTransportPerHari').value);
      
      const totalMakan = hariKerja * rateMakan;
      const totalTransport = hariKerja * rateTransport;

      document.getElementById('formTotalMakan').innerText = "Rp " + formatRupiah(totalMakan);
      document.getElementById('formTotalTransport').innerText = "Rp " + formatRupiah(totalTransport);

      const displayCounters = document.querySelectorAll('.displayHariKerja');
      displayCounters.forEach(el => el.innerText = hariKerja);

      const daysMerah = parseInt(document.getElementById('hariTanggalMerah').value, 10) || 0;
      const totalMerah = daysMerah * 75000;
      document.getElementById('totalInsentifMerah').value = formatRupiah(totalMerah);

      updateCalculations();
    }

    function terbilang(bilangan) {
      const angka = [
        "", "Satu", "Dua", "Tiga", "Empat", "Lima", 
        "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
      ];
      bilangan = Math.floor(Math.abs(bilangan));
      
      if (bilangan < 12) {
        return " " + angka[bilangan];
      } else if (bilangan < 20) {
        return terbilang(bilangan - 10) + " Belas";
      } else if (bilangan < 100) {
        return terbilang(Math.floor(bilangan / 10)) + " Puluh" + terbilang(bilangan % 10);
      } else if (bilangan < 200) {
        return " Seratus" + terbilang(bilangan - 100);
      } else if (bilangan < 1000) {
        return terbilang(Math.floor(bilangan / 100)) + " Ratus" + terbilang(bilangan % 100);
      } else if (bilangan < 2000) {
        return " Seribu" + terbilang(bilangan - 1000);
      } else if (bilangan < 1000000) {
        return terbilang(Math.floor(bilangan / 1000)) + " Ribu" + terbilang(bilangan % 1000);
      } else if (bilangan < 1000000000) {
        return terbilang(Math.floor(bilangan / 1000000)) + " Juta" + terbilang(bilangan % 1000000);
      } else if (bilangan < 1000000000000) {
        return terbilang(Math.floor(bilangan / 1000000000)) + " Miliar" + terbilang(bilangan % 1000000000);
      } else {
        return " Angka Terlalu Besar";
      }
    }

    function updateCalculations() {
      const hariKerja = parseInt(document.getElementById('hariKerja').value, 10) || 0;
      const rateMakan = parseRupiah(document.getElementById('rateMakanPerHari').value);
      const rateTransport = parseRupiah(document.getElementById('rateTransportPerHari').value);
      
      const gajiPokok = parseRupiah(document.getElementById('gajiPokok').value);
      const tunjanganJabatan = parseRupiah(document.getElementById('tunjanganJabatan').value);
      const tunjanganMakan = hariKerja * rateMakan;
      const tunjanganTransport = hariKerja * rateTransport;
      const hariMerah = parseInt(document.getElementById('hariTanggalMerah').value, 10) || 0;
      const insentifMerah = hariMerah * 75000;
      const insentifLain = parseRupiah(document.getElementById('insentifLain') ? document.getElementById('insentifLain').value : 0);
      const ketInsentifLain = document.getElementById('ketInsentifLain') ? document.getElementById('ketInsentifLain').value.trim() : "";

      const totalPenghasilan = gajiPokok + tunjanganJabatan + tunjanganMakan + tunjanganTransport + insentifMerah + insentifLain;

      // PPh 21 Calculation based on PTKP & TER (PP 58/2023)
      const ptkpStatus = document.getElementById('empPtkp') ? document.getElementById('empPtkp').value : 'TK/0';
      const pph21Mode = document.getElementById('pph21Mode') ? document.getElementById('pph21Mode').value : 'auto';
      const ptkpInfo = getPtkpInfo(ptkpStatus);

      let pph21Amount = 0;
      let pph21RateNote = '';

      if (pph21Mode === 'auto') {
        const pphResult = calculatePph21(totalPenghasilan, ptkpStatus);
        pph21Amount = pphResult.pph21;
        pph21RateNote = `TER Kat. ${pphResult.category} - ${pphResult.ratePct}%`;
        
        if (document.getElementById('potonganPph21')) {
          document.getElementById('potonganPph21').value = formatRupiah(pph21Amount);
        }
        if (document.getElementById('formPph21Bruto')) {
          document.getElementById('formPph21Bruto').innerText = "Rp " + formatRupiah(totalPenghasilan);
        }
        if (document.getElementById('formPph21RateText')) {
          document.getElementById('formPph21RateText').innerText = pphResult.ratePct + "%";
        }
        if (document.getElementById('formPph21KatDesc')) {
          document.getElementById('formPph21KatDesc').innerText = `Kat ${pphResult.category} - ${ptkpInfo.label}`;
        }
        if (document.getElementById('formPph21CategoryBadge')) {
          document.getElementById('formPph21CategoryBadge').innerText = `Kat ${pphResult.category} (${pphResult.ratePct}%)`;
        }
      } else if (pph21Mode === 'manual') {
        pph21Amount = parseRupiah(document.getElementById('potonganPph21').value);
        pph21RateNote = 'Manual Input';
        if (document.getElementById('formPph21CategoryBadge')) {
          document.getElementById('formPph21CategoryBadge').innerText = 'Manual';
        }
      } else { // 'none'
        pph21Amount = 0;
        pph21RateNote = 'Bebas Pajak (0%)';
        if (document.getElementById('potonganPph21')) {
          document.getElementById('potonganPph21').value = '0';
        }
        if (document.getElementById('formPph21CategoryBadge')) {
          document.getElementById('formPph21CategoryBadge').innerText = 'Non-Pajak';
        }
      }

      const bpjs = parseRupiah(document.getElementById('iuranBpjs').value);
      const totalPinjaman = parseRupiah(document.getElementById('totalPinjaman').value);
      const cicilan = parseRupiah(document.getElementById('cicilanPinjaman').value);
      const potonganLain = parseRupiah(document.getElementById('potonganLain').value);

      const cicilanKe = document.getElementById('cicilanKe').value || "1";
      const tenorBulan = document.getElementById('tenorBulan').value || "1";

      let sisaPinjaman = 0;
      if (totalPinjaman > 0) {
        sisaPinjaman = Math.max(0, totalPinjaman - cicilan);
      }
      document.getElementById('formSisaPinjaman').innerText = "Rp " + formatRupiah(sisaPinjaman);

      const totalPotongan = bpjs + pph21Amount + cicilan + potonganLain;
      const netGaji = totalPenghasilan - totalPotongan;

      let terbilangKalimat = "";
      if (netGaji <= 0) {
        terbilangKalimat = "Nol Rupiah";
      } else {
        terbilangKalimat = terbilang(netGaji).trim() + " Rupiah";
      }

      document.getElementById('summaryGross').innerText = "Rp " + formatRupiah(totalPenghasilan);
      document.getElementById('summaryDeduction').innerText = "Rp " + formatRupiah(totalPotongan);
      document.getElementById('summaryNet').innerText = "Rp " + formatRupiah(netGaji);
      document.getElementById('summaryTerbilang').innerText = terbilangKalimat;

      document.getElementById('viewGajiPokok').innerText = "Rp " + formatRupiah(gajiPokok);
      document.getElementById('viewTunjanganJabatan').innerText = "Rp " + formatRupiah(tunjanganJabatan);
      document.getElementById('viewTunjanganMakan').innerText = "Rp " + formatRupiah(tunjanganMakan);
      document.getElementById('viewRateMakan').innerText = formatRupiah(rateMakan);
      document.getElementById('viewTunjanganTransport').innerText = "Rp " + formatRupiah(tunjanganTransport);
      document.getElementById('viewRateTransport').innerText = formatRupiah(rateTransport);

      const countEls = document.querySelectorAll('.viewCountHariKerja');
      countEls.forEach(el => el.innerText = hariKerja);

      document.getElementById('viewHariMerah').innerText = hariMerah;
      document.getElementById('viewInsentifMerah').innerText = "Rp " + formatRupiah(insentifMerah);

      // Insentif Lain Preview Slip 1
      const rowInsLain = document.getElementById('rowInsentifLain');
      if (rowInsLain) {
        if (insentifLain > 0) {
          rowInsLain.style.display = '';
          document.getElementById('viewInsentifLain').innerText = "Rp " + formatRupiah(insentifLain);
          const viewKet = document.getElementById('viewKetInsentifLain');
          if (viewKet) viewKet.innerText = ketInsentifLain ? `(${ketInsentifLain})` : "";
        } else {
          rowInsLain.style.display = 'none';
        }
      }

      document.getElementById('viewTotalPenghasilan').innerText = "Rp " + formatRupiah(totalPenghasilan);

      document.getElementById('viewIuranBpjs').innerText = "Rp " + formatRupiah(bpjs);
      document.getElementById('viewPph21').innerText = "Rp " + formatRupiah(pph21Amount);
      document.getElementById('viewPph21Note').innerText = `(${pph21RateNote})`;
      document.getElementById('viewCicilanPinjaman').innerText = "Rp " + formatRupiah(cicilan);
      
      const loanDetailEl = document.getElementById('viewLoanDetail');
      if (totalPinjaman > 0 || cicilan > 0) {
        loanDetailEl.style.display = 'block';
        document.getElementById('viewTotalPinjaman').innerText = "Rp " + formatRupiah(totalPinjaman);
        document.getElementById('viewCicilanKe').innerText = cicilanKe;
        document.getElementById('viewTenor').innerText = tenorBulan;
        document.getElementById('viewSisaPinjaman').innerText = "Rp " + formatRupiah(sisaPinjaman);
      } else {
        loanDetailEl.style.display = 'none';
      }

      const rowPotonganLain = document.getElementById('rowPotonganLain');
      if (potonganLain > 0) {
        rowPotonganLain.style.display = '';
        document.getElementById('viewPotonganLain').innerText = "Rp " + formatRupiah(potonganLain);
      } else {
        rowPotonganLain.style.display = 'none';
      }

      document.getElementById('viewTotalPotongan').innerText = "Rp " + formatRupiah(totalPotongan);
      document.getElementById('viewThp').innerText = "Rp " + formatRupiah(netGaji);
      document.getElementById('viewTerbilang').innerText = terbilangKalimat;

      if (document.getElementById('viewGajiPokok2')) {
        document.getElementById('viewGajiPokok2').innerText = "Rp " + formatRupiah(gajiPokok);
        document.getElementById('viewTunjanganJabatan2').innerText = "Rp " + formatRupiah(tunjanganJabatan);
        document.getElementById('viewTunjanganMakan2').innerText = "Rp " + formatRupiah(tunjanganMakan);
        document.getElementById('viewTunjanganTransport2').innerText = "Rp " + formatRupiah(tunjanganTransport);
        
        const countEls2 = document.querySelectorAll('.viewCountHariKerja2');
        countEls2.forEach(el => el.innerText = hariKerja);

        document.getElementById('viewHariMerah2').innerText = hariMerah;
        document.getElementById('viewInsentifMerah2').innerText = "Rp " + formatRupiah(insentifMerah);

        // Insentif Lain Preview Slip 2 (Arsip)
        const rowInsLain2 = document.getElementById('rowInsentifLain2');
        if (rowInsLain2) {
          if (insentifLain > 0) {
            rowInsLain2.style.display = '';
            document.getElementById('viewInsentifLain2').innerText = "Rp " + formatRupiah(insentifLain);
            const viewKet2 = document.getElementById('viewKetInsentifLain2');
            if (viewKet2) viewKet2.innerText = ketInsentifLain ? `(${ketInsentifLain})` : "";
          } else {
            rowInsLain2.style.display = 'none';
          }
        }

        document.getElementById('viewTotalPenghasilan2').innerText = "Rp " + formatRupiah(totalPenghasilan);
        document.getElementById('viewIuranBpjs2').innerText = "Rp " + formatRupiah(bpjs);
        document.getElementById('viewPph21_2').innerText = "Rp " + formatRupiah(pph21Amount);
        document.getElementById('viewPph21Note2').innerText = `(${pph21RateNote})`;
        document.getElementById('viewCicilanPinjaman2').innerText = "Rp " + formatRupiah(cicilan);
        document.getElementById('viewTotalPotongan2').innerText = "Rp " + formatRupiah(totalPotongan);
        document.getElementById('viewThp2').innerText = "Rp " + formatRupiah(netGaji);
        document.getElementById('viewHariKerja2').innerText = hariKerja + " Hari";
      }

      updateSlipInfoText();
    }

    function updateSlipInfoText() {
      const compName = document.getElementById('companyName').value || "NAMA PERUSAHAAN";
      const compAddr = document.getElementById('companyAddress').value || "";
      const period = document.getElementById('payPeriod').value || "-";
      const empName = document.getElementById('empName').value || "Nama Karyawan";
      const empId = document.getElementById('empId').value || "-";
      const empJab = document.getElementById('empJabatan').value || "-";
      const empDiv = document.getElementById('empDivisi').value || "-";
      const empStat = document.getElementById('empStatus').value || "-";
      const empPtkp = document.getElementById('empPtkp') ? document.getElementById('empPtkp').value : 'TK/0';
      const ptkpInfo = getPtkpInfo(empPtkp);
      const empNpwp = document.getElementById('empNpwp') ? document.getElementById('empNpwp').value : "";
      const hariKerja = document.getElementById('hariKerja').value || "0";
      const ketHadir = document.getElementById('empKeteranganHadir').value || "";
      const hariMerah = document.getElementById('hariTanggalMerah').value || "0";

      const city = document.getElementById('signerCity').value || "Kota";
      const date = document.getElementById('payDate').value || "";
      const signer = document.getElementById('signerName').value || "Pimpinan";

      document.getElementById('viewCompany').innerText = compName;
      document.getElementById('viewAddress').innerText = compAddr;
      document.getElementById('viewPeriode').innerText = period;
      document.getElementById('viewEmpName').innerText = empName;
      document.getElementById('viewEmpId').innerText = empId;
      document.getElementById('viewEmpJabatan').innerText = empJab;
      document.getElementById('viewEmpDivisi').innerText = empDiv;
      document.getElementById('viewEmpStatus').innerText = empStat;
      document.getElementById('viewEmpPtkp').innerText = `${empPtkp} (${ptkpInfo.label} - Kat ${ptkpInfo.category})`;

      document.getElementById('viewHariKerja').innerText = hariKerja + " Hari";
      document.getElementById('viewKetHadir').innerText = ketHadir ? `(${ketHadir})` : "";
      document.getElementById('viewHariMerahInfo').innerText = hariMerah + " Hari";

      const rek = document.getElementById('empRekening').value || "";
      const bpjsNo = document.getElementById('empBpjsNo').value || "";
      let rekText = rek;
      if (empNpwp) {
        rekText = rekText ? `${rekText} | NPWP: ${empNpwp}` : `NPWP: ${empNpwp}`;
      }
      if (bpjsNo) {
        rekText = rekText ? `${rekText} | BPJS: ${bpjsNo}` : `BPJS: ${bpjsNo}`;
      }
      document.getElementById('viewEmpRekening').innerText = rekText || "-";

      document.getElementById('viewSigReceiver').innerText = "( " + empName + " )";
      document.getElementById('viewSigCity').innerText = city;
      document.getElementById('viewSigDate').innerText = date;
      document.getElementById('viewSigPemberi').innerText = "( " + signer + " )";

      if (document.getElementById('viewCompany2')) {
        document.getElementById('viewCompany2').innerText = compName;
        document.getElementById('viewAddress2').innerText = compAddr;
        document.getElementById('viewPeriode2').innerText = period;
        document.getElementById('viewEmpName2').innerText = empName;
        document.getElementById('viewEmpId2').innerText = empId;
        document.getElementById('viewEmpJabatan2').innerText = empJab;
        document.getElementById('viewEmpDivisi2').innerText = empDiv;
        document.getElementById('viewEmpPtkp2').innerText = `${empPtkp} (Kat ${ptkpInfo.category})`;
        document.getElementById('viewSigReceiver2').innerText = "( " + empName + " )";
        document.getElementById('viewSigCity2').innerText = city;
        document.getElementById('viewSigDate2').innerText = date;
        document.getElementById('viewSigPemberi2').innerText = "( " + signer + " )";
      }
    }

    function updateSlip() {
      updateSlipInfoText();
      calcAllowancesAndTotals();
    }

    function resetForm() {
      if (confirm("Reset form ke data awal?")) {
        const cfg = getSettings();
        document.getElementById('empName').value = "";
        document.getElementById('empId').value = "";
        document.getElementById('empJabatan').value = "";
        document.getElementById('empMasaKerja').value = "";
        document.getElementById('empPtkp').value = cfg.defaultPtkp || "TK/0";
        document.getElementById('empNpwp').value = "";
        document.getElementById('empRekening').value = "";
        document.getElementById('empBpjsNo').value = "";
        document.getElementById('hariKerja').value = cfg.defaultWorkDays || "24";
        document.getElementById('empKeteranganHadir').value = `Hadir Penuh (${cfg.defaultWorkDays || 24} Hari)`;
        document.getElementById('gajiPokok').value = "0";
        document.getElementById('rateMakanPerHari').value = formatRupiah(cfg.defaultMakanRate || 25000);
        document.getElementById('rateTransportPerHari').value = formatRupiah(cfg.defaultTransportRate || 15000);
        document.getElementById('tunjanganJabatan').value = "0";
        document.getElementById('hariTanggalMerah').value = "0";
        document.getElementById('totalInsentifMerah').value = "0";
        if (document.getElementById('insentifLain')) document.getElementById('insentifLain').value = "0";
        if (document.getElementById('ketInsentifLain')) document.getElementById('ketInsentifLain').value = "";
        document.getElementById('pph21Mode').value = cfg.defaultPphMode || "auto";
        document.getElementById('potonganPph21').value = "0";
        document.getElementById('iuranBpjs').value = "0";
        document.getElementById('totalPinjaman').value = "0";
        document.getElementById('cicilanPinjaman').value = "0";
        document.getElementById('cicilanKe').value = "1";
        document.getElementById('tenorBulan').value = "1";
        document.getElementById('potonganLain').value = "0";
        exitEditMode();
        calcAllowancesAndTotals();
        showToast("Form berhasil di-reset dengan pengaturan default.", false);
      }
    }

    // Handle incoming URL parameters (e.g. ?pic=adis, ?loadId=XYZ&print=1)
    function handleUrlParameters() {
      try {
        const params = new URLSearchParams(window.location.search);
        const loadId = params.get('loadId');
        const doPrint = params.get('print');
        
        let picParam = params.get('pic') || window.location.hash.replace('#', '');
        if (picParam) {
          picParam = picParam.toLowerCase();
          if (picParam === 'swanto') picParam = 'direktur';
          if (['adis', 'eki', 'rengga', 'direktur'].includes(picParam)) {
            openFrontGate(picParam);
          }
        }

        if (loadId) {
          loadRecordToForm(loadId);
          if (doPrint === '1' || doPrint === 'true') {
            setTimeout(() => {
              triggerPrint();
            }, 500);
          }
        }
      } catch (err) {
        console.error("Error reading URL parameters", err);
      }
    }

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      const cfg = getSettings();
      applySettingsToUI(cfg);
      applySessionToUI();
      calcAllowancesAndTotals();
      setPaperSize(cfg.defaultPaper || 'a4');
      setOrientation(cfg.defaultOrientation || 'portrait');
      updateDatabaseBadge();
      handleUrlParameters();

      const params = new URLSearchParams(window.location.search);
      if (params.get('loadId') || params.get('gate') === '0') {
        closeFrontGate();
      }
    });

    // Shortcut Keyboard Ctrl+P untuk Cetak Slip
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerPrint();
      }
    });