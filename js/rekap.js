const DB_STORAGE_KEY = 'SLIP_GAJI_DATABASE_V1';
    const SESSION_STORAGE_KEY = 'ACTIVE_PAYROLL_SESSION_V1';
    const SETTINGS_STORAGE_KEY = 'PAYROLL_SYSTEM_SETTINGS_V1';

    // Master 3 Unit Usaha
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

    // Master Pengguna Akun & Password
    const SYSTEM_USERS = [
      {
        username: 'direktur',
        aliases: ['direktur', 'swanto', 'admin'],
        password: 'swanto123',
        name: 'Ir. Swanto',
        role: 'Direktur Utama',
        roleType: 'director',
        defaultUnit: 'ALL',
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

    function getCurrentSession() {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.error("Error reading session", e);
      }
      return {
        username: 'direktur',
        name: 'Ir. Swanto',
        role: 'Direktur Utama',
        roleType: 'director',
        activeUnit: 'ALL'
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
      const userEl = document.getElementById('headerUserName');
      const roleEl = document.getElementById('headerUserRole');
      const badgeEl = document.getElementById('activeUnitBadge');
      const filterUnitSelect = document.getElementById('filterUnit');

      if (userEl) userEl.innerText = session.name || 'User';
      if (roleEl) roleEl.innerText = session.role || 'PIC';

      if (session.activeUnit && session.activeUnit !== 'ALL' && BUSINESS_UNITS[session.activeUnit]) {
        const u = BUSINESS_UNITS[session.activeUnit];
        if (badgeEl) badgeEl.innerText = u.badge;
        if (filterUnitSelect && (session.roleType !== 'director' || !filterUnitSelect.value || filterUnitSelect.value === 'ALL')) {
          filterUnitSelect.value = session.activeUnit;
        }
      } else {
        if (badgeEl) badgeEl.innerText = '👑 Semua Unit Usaha';
        if (filterUnitSelect && session.roleType === 'director') {
          // If director, default to ALL or keep current filter
        }
      }

      renderPayrollReport();
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

    function loginAsPic(picKey, destination = 'rekap') {
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

    function quickLoginAndEnter(username, password, destination = 'rekap') {
      const success = processLogin(username, password, false);
      if (success) {
        closeFrontGate();
        sessionStorage.setItem('GATE_PASSED', 'true');
        if (destination === 'slip') {
          window.location.href = 'index.html';
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

    function openLoginModal() {
      openFrontGate();
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
        alert(`✅ Selamat datang, ${foundUser.name}!\nMasuk sebagai: ${foundUser.role}`);
      }
      return true;
    }

    function formatRupiah(number) {
      if (isNaN(number)) return "0";
      return new Intl.NumberFormat('id-ID').format(Math.round(number));
    }

    function parseRupiah(str) {
      if (!str) return 0;
      const clean = str.toString().replace(/[^0-9-]/g, '');
      const val = parseInt(clean, 10);
      return isNaN(val) ? 0 : val;
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
      } catch (e) {
        console.error("Error saving database", e);
      }
    }

    // Populate Period Dropdown
    function populatePeriodOptions() {
      const records = getDatabaseRecords();
      const select = document.getElementById('filterPeriod');
      const currentVal = select.value;
      
      const periods = new Set();
      records.forEach(r => {
        if (r.payPeriod) periods.add(r.payPeriod);
      });

      let html = '<option value="ALL">Semua Periode</option>';
      periods.forEach(p => {
        html += `<option value="${p}">${p}</option>`;
      });
      select.innerHTML = html;

      if (periods.size > 0 && currentVal !== 'ALL') {
        select.value = Array.from(periods)[0];
      }
    }

    // Render Full Payroll Report
    function renderPayrollReport() {
      const records = getDatabaseRecords();
      const unitFilter = document.getElementById('filterUnit') ? document.getElementById('filterUnit').value : 'ALL';
      const periodFilter = document.getElementById('filterPeriod').value;
      const divisiFilter = document.getElementById('filterDivisi').value;
      const search = document.getElementById('searchInput').value.toLowerCase().trim();

      const filtered = records.filter(r => {
        const matchUnit = (unitFilter === 'ALL' || r.unitId === unitFilter || (r.companyName && r.companyName.toLowerCase().includes(unitFilter.replace(/_/g, ' '))));
        const matchPeriod = (periodFilter === 'ALL' || r.payPeriod === periodFilter);
        const matchDivisi = (divisiFilter === 'ALL' || (r.empDivisi && r.empDivisi.toLowerCase().includes(divisiFilter.toLowerCase())));
        const matchSearch = (!search || 
          (r.empName && r.empName.toLowerCase().includes(search)) ||
          (r.empId && r.empId.toLowerCase().includes(search)) ||
          (r.empJabatan && r.empJabatan.toLowerCase().includes(search)) ||
          (r.unitUsaha && r.unitUsaha.toLowerCase().includes(search))
        );
        return matchUnit && matchPeriod && matchDivisi && matchSearch;
      });

      // Update Formal Meta Header & Signatures based on selected Unit
      const cfg = getSettings();
      let checkerName = (cfg.signerName || 'Hendra Wijaya, S.E.').trim();

      // Aturan Khusus: Nama Adis Setiawan Dikosongkan di setiap Unit Usaha, KECUALI Unit Shop And Drive
      if (unitFilter !== 'shop_and_drive_gw') {
        if (/adis/i.test(checkerName) || /setiawan/i.test(checkerName)) {
          checkerName = '';
        }
      }

      if (unitFilter !== 'ALL' && BUSINESS_UNITS[unitFilter]) {
        const u = BUSINESS_UNITS[unitFilter];
        document.getElementById('reportCompanyName').innerText = u.name;
        document.getElementById('reportCompanyAddress').innerText = u.address;
        document.getElementById('sigDibuat').innerText = `( ${u.picName} )`;
        document.getElementById('sigDiperiksa').innerText = checkerName ? `( ${checkerName} )` : '(                                        )';
      } else if (filtered.length > 0 && filtered[0].companyName) {
        const sample = filtered[0];
        document.getElementById('reportCompanyName').innerText = unitFilter === 'ALL' ? "KONSOLIDASI 3 UNIT USAHA" : (sample.companyName || "PT. MAJU BERSAMA SUKSES");
        document.getElementById('reportCompanyAddress').innerText = unitFilter === 'ALL' ? "Shop & Drive Grand Wisata • Snaprint GW • Snaprint Zamrud" : (sample.companyAddress || "Bekasi");
        document.getElementById('sigDibuat').innerText = unitFilter === 'ALL' ? "( Staff Keuangan / PIC Terkait )" : `( ${sample.picName || 'Staff Payroll'} )`;
        document.getElementById('sigDiperiksa').innerText = checkerName ? `( ${checkerName} )` : '(                                        )';
      } else {
        document.getElementById('reportCompanyName').innerText = "KONSOLIDASI 3 UNIT USAHA";
        document.getElementById('reportCompanyAddress').innerText = "Shop & Drive Grand Wisata • Snaprint GW • Snaprint Zamrud";
        document.getElementById('sigDibuat').innerText = "( Staff Keuangan / PIC Terkait )";
        document.getElementById('sigDiperiksa').innerText = checkerName ? `( ${checkerName} )` : '(                                        )';
      }

      if (filtered.length > 0) {
        const sample = filtered[0];
        document.getElementById('reportPeriodText').innerText = periodFilter === 'ALL' ? (sample.payPeriod || 'September 2026') : periodFilter;
        document.getElementById('reportPayDateText').innerText = sample.payDate || '25 September 2026';
      }
      document.getElementById('sigDisetujui').innerText = "( Ir. Swanto )";

      const tbody = document.getElementById('payrollTableBody');

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="20" style="text-align: center; padding: 2.5rem; color: #94a3b8; font-size: 0.85rem;">
              Belum ada data slip gaji tersimpan untuk filter yang dipilih. Klik <strong>"📝 Pembuat Slip Gaji"</strong> untuk mulai input atau klik <strong>"💡 Isi Contoh Data"</strong> di atas.
            </td>
          </tr>
        `;
        updateSummaryStats(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        return;
      }

      let sumHariKerja = 0;
      let sumHariMerah = 0;
      let sumGajiPokok = 0;
      let sumTunjJabatan = 0;
      let sumTunjMakan = 0;
      let sumTunjTransport = 0;
      let sumInsentifMerah = 0;
      let sumInsentifLain = 0;
      let sumTotalBruto = 0;
      let sumPph21 = 0;
      let sumBpjs = 0;
      let sumCicilan = 0;
      let sumPotLain = 0;
      let sumTotalPotongan = 0;
      let sumNetGaji = 0;

      let html = '';

      filtered.forEach((r, idx) => {
        const hariMasuk = r.hariKerja || 0;
        const hariMerah = r.hariTanggalMerah || 0;
        const gp = r.gajiPokok || 0;
        const tj = r.tunjanganJabatan || 0;
        const tm = r.totalMakan || (hariMasuk * (r.rateMakanPerHari || 25000));
        const tt = r.totalTransport || (hariMasuk * (r.rateTransportPerHari || 15000));
        const im = r.totalMerah || (hariMerah * 75000);
        const il = r.insentifLain || 0;
        const bruto = r.totalPenghasilan || (gp + tj + tm + tt + im + il);

        const pph21 = r.potonganPph21 || 0;
        const bpjs = r.iuranBpjs || 0;
        const cicilan = r.cicilanPinjaman || 0;
        const potLain = r.potonganLain || 0;
        const potongan = r.totalPotongan || (pph21 + bpjs + cicilan + potLain);
        const thp = r.netGaji || (bruto - potongan);

        sumHariKerja += hariMasuk;
        sumHariMerah += hariMerah;
        sumGajiPokok += gp;
        sumTunjJabatan += tj;
        sumTunjMakan += tm;
        sumTunjTransport += tt;
        sumInsentifMerah += im;
        sumInsentifLain += il;
        sumTotalBruto += bruto;
        sumPph21 += pph21;
        sumBpjs += bpjs;
        sumCicilan += cicilan;
        sumPotLain += potLain;
        sumTotalPotongan += potongan;
        sumNetGaji += thp;

        const unitTag = r.unitUsaha ? `<div style="font-size: 0.68rem; color: #0284c7; font-weight: 700;">${r.unitUsaha}</div>` : '';

        html += `
          <tr>
            <td class="col-center"><strong>${idx + 1}</strong></td>
            <td class="col-center"><code>${r.empId || '-'}</code></td>
            <td>
              <div class="cell-name">${r.empName}</div>
              ${unitTag}
              <div class="cell-jabatan">${r.empStatus || 'Tetap'}</div>
            </td>
            <td>
              <div>${r.empJabatan || '-'}</div>
              <div class="cell-jabatan">${r.empDivisi || '-'}</div>
            </td>
            <td class="col-center"><span class="badge-ptkp">${r.empPtkp || 'TK/0'}</span></td>
            <td class="col-center"><span class="badge-present">${hariMasuk}</span></td>
            <td class="col-center" style="color: #86198f; font-weight: 700;">${hariMerah}</td>
            <td class="col-right">${formatRupiah(gp)}</td>
            <td class="col-right">${formatRupiah(tj)}</td>
            <td class="col-right">${formatRupiah(tm)}</td>
            <td class="col-right">${formatRupiah(tt)}</td>
            <td class="col-right" style="color: #86198f;">${formatRupiah(im)}</td>
            <td class="col-right" style="color: #0f766e; font-weight: 600;">${formatRupiah(il)}</td>
            <td class="col-right col-bold" style="background: #eff6ff; color: #1e40af;">${formatRupiah(bruto)}</td>
            <td class="col-right" style="color: #991b1b;">${formatRupiah(pph21)}</td>
            <td class="col-right">${formatRupiah(bpjs)}</td>
            <td class="col-right" style="color: #b45309;">${formatRupiah(cicilan)}</td>
            <td class="col-right">${formatRupiah(potLain)}</td>
            <td class="col-right col-bold" style="background: #fef2f2; color: #991b1b;">${formatRupiah(potongan)}</td>
            <td class="col-right col-bold" style="background: #f0fdf4; color: #15803d; font-size: 0.8rem;">${formatRupiah(thp)}</td>
            <td style="font-size: 0.72rem; white-space: nowrap;">${r.empRekening || '-'}</td>
            <td class="col-center no-print col-action" style="white-space: nowrap;">
              <button class="btn btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-weight: 700;" onclick="openEditRecordModal('${r.id}')" title="Koreksi &amp; Perbaiki Kesalahan Input Data Karyawan (Khusus Direktur)">✏️ Edit</button>
              <a href="index.html?loadId=${r.id}" class="btn btn-sm btn-edit-sm" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" title="Buka / Edit di Formulir Slip Gaji">👁️ Slip</a>
              <a href="index.html?loadId=${r.id}&print=1" class="btn btn-sm btn-success" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" title="Cetak Slip Gaji Karyawan Ini Langsung">🖨️ Cetak</a>
              <button class="btn btn-sm btn-danger-sm" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" onclick="deleteRecord('${r.id}', '${r.empName}')" title="Hapus dari Database">🗑️</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;

      updateSummaryStats(
        filtered.length, sumHariKerja, sumHariMerah, sumGajiPokok, sumTunjJabatan,
        sumTunjMakan, sumTunjTransport, sumInsentifMerah, sumInsentifLain, sumTotalBruto,
        sumPph21, sumBpjs, sumCicilan, sumPotLain, sumTotalPotongan, sumNetGaji
      );
    }

    function updateSummaryStats(count, hariKerja, hariMerah, gp, tj, tm, tt, im, il, bruto, pph21, bpjs, cicilan, potLain, totalPot, netGaji) {
      document.getElementById('statTotalEmployees').innerText = count + " Orang";
      document.getElementById('statTotalBruto').innerText = "Rp " + formatRupiah(bruto);
      document.getElementById('statTotalPph21').innerText = "Rp " + formatRupiah(pph21);
      document.getElementById('statTotalDeduction').innerText = "Rp " + formatRupiah((bpjs || 0) + (cicilan || 0) + (potLain || 0));
      document.getElementById('statTotalNet').innerText = "Rp " + formatRupiah(netGaji);

      document.getElementById('footTotalCount').innerText = count;
      document.getElementById('footHariKerja').innerText = hariKerja;
      document.getElementById('footHariMerah').innerText = hariMerah;
      document.getElementById('footGajiPokok').innerText = "Rp " + formatRupiah(gp);
      document.getElementById('footTunjJabatan').innerText = "Rp " + formatRupiah(tj);
      document.getElementById('footTunjMakan').innerText = "Rp " + formatRupiah(tm);
      document.getElementById('footTunjTransport').innerText = "Rp " + formatRupiah(tt);
      document.getElementById('footInsentifMerah').innerText = "Rp " + formatRupiah(im);
      if (document.getElementById('footInsentifLain')) {
        document.getElementById('footInsentifLain').innerText = "Rp " + formatRupiah(il || 0);
      }
      document.getElementById('footTotalBruto').innerText = "Rp " + formatRupiah(bruto);
      document.getElementById('footPph21').innerText = "Rp " + formatRupiah(pph21);
      document.getElementById('footBpjs').innerText = "Rp " + formatRupiah(bpjs);
      document.getElementById('footCicilan').innerText = "Rp " + formatRupiah(cicilan);
      document.getElementById('footPotLain').innerText = "Rp " + formatRupiah(potLain);
      document.getElementById('footTotalPotongan').innerText = "Rp " + formatRupiah(totalPot);
      document.getElementById('footNetGaji').innerText = "Rp " + formatRupiah(netGaji);

      let terbilangText = "Nol Rupiah";
      if (netGaji > 0) {
        terbilangText = terbilang(netGaji).trim() + " Rupiah";
      }
      document.getElementById('rekapTerbilangText').innerText = terbilangText;
    }

    function deleteRecord(id, name) {
      if (confirm(`Yakin ingin menghapus data karyawan "${name}" dari rekapitulasi gaji?`)) {
        let records = getDatabaseRecords();
        records = records.filter(r => r.id !== id);
        saveDatabaseRecords(records);
        populatePeriodOptions();
        renderPayrollReport();
      }
    }

    // =========================================================================
    // FITUR KOREKSI & PERBAIKAN INPUT DATA (AKUN DIREKTUR: IR. SWANTO)
    // =========================================================================
    const TER_A_EDIT = [
      { max: 5400000, rate: 0.00 }, { max: 5650000, rate: 0.0025 }, { max: 5950000, rate: 0.005 },
      { max: 6300000, rate: 0.0075 }, { max: 6750000, rate: 0.01 }, { max: 7500000, rate: 0.0125 },
      { max: 8550000, rate: 0.015 }, { max: 9650000, rate: 0.0175 }, { max: 10050000, rate: 0.02 },
      { max: 10350000, rate: 0.03 }, { max: 10700000, rate: 0.04 }, { max: 11050000, rate: 0.05 },
      { max: 11600000, rate: 0.06 }, { max: 12500000, rate: 0.07 }, { max: 13750000, rate: 0.08 },
      { max: 15100000, rate: 0.09 }, { max: 16950000, rate: 0.10 }, { max: 19750000, rate: 0.11 },
      { max: 24150000, rate: 0.12 }, { max: 26450000, rate: 0.13 }, { max: 28000000, rate: 0.14 },
      { max: 30050000, rate: 0.15 }, { max: 32400000, rate: 0.16 }, { max: 35400000, rate: 0.17 },
      { max: 39100000, rate: 0.18 }, { max: 43850000, rate: 0.19 }, { max: 47800000, rate: 0.20 },
      { max: 51400000, rate: 0.21 }, { max: 56300000, rate: 0.22 }, { max: 62200000, rate: 0.23 },
      { max: 68600000, rate: 0.24 }, { max: 77500000, rate: 0.25 }, { max: 89000000, rate: 0.26 },
      { max: 103000000, rate: 0.27 }, { max: 125000000, rate: 0.28 }, { max: 157000000, rate: 0.29 },
      { max: 206000000, rate: 0.30 }, { max: 337000000, rate: 0.31 }, { max: 454000000, rate: 0.32 },
      { max: 1414000000, rate: 0.33 }, { max: Infinity, rate: 0.34 }
    ];

    const TER_B_EDIT = [
      { max: 6200000, rate: 0.00 }, { max: 6500000, rate: 0.0025 }, { max: 6850000, rate: 0.005 },
      { max: 7300000, rate: 0.0075 }, { max: 9200000, rate: 0.01 }, { max: 10750000, rate: 0.015 },
      { max: 11250000, rate: 0.02 }, { max: 11600000, rate: 0.03 }, { max: 12600000, rate: 0.04 },
      { max: 13600000, rate: 0.05 }, { max: 14950000, rate: 0.06 }, { max: 16400000, rate: 0.07 },
      { max: 18450000, rate: 0.08 }, { max: 21850000, rate: 0.09 }, { max: 26000000, rate: 0.10 },
      { max: 27700000, rate: 0.11 }, { max: 29350000, rate: 0.12 }, { max: 31450000, rate: 0.13 },
      { max: 33950000, rate: 0.14 }, { max: 37100000, rate: 0.15 }, { max: 41100000, rate: 0.16 },
      { max: 45800000, rate: 0.17 }, { max: 49500000, rate: 0.18 }, { max: 53800000, rate: 0.19 },
      { max: 58500000, rate: 0.20 }, { max: 64000000, rate: 0.21 }, { max: 71000000, rate: 0.22 },
      { max: 80000000, rate: 0.23 }, { max: 93000000, rate: 0.24 }, { max: 109000000, rate: 0.25 },
      { max: 129000000, rate: 0.26 }, { max: 162000000, rate: 0.27 }, { max: 211000000, rate: 0.28 },
      { max: 342000000, rate: 0.29 }, { max: 459000000, rate: 0.30 }, { max: 1419000000, rate: 0.31 },
      { max: Infinity, rate: 0.34 }
    ];

    const TER_C_EDIT = [
      { max: 6600000, rate: 0.00 }, { max: 6950000, rate: 0.0025 }, { max: 7350000, rate: 0.005 },
      { max: 7800000, rate: 0.0075 }, { max: 8850000, rate: 0.01 }, { max: 9800000, rate: 0.0125 },
      { max: 10950000, rate: 0.015 }, { max: 11200000, rate: 0.0175 }, { max: 12050000, rate: 0.02 },
      { max: 12950000, rate: 0.03 }, { max: 14150000, rate: 0.04 }, { max: 15550000, rate: 0.05 },
      { max: 17050000, rate: 0.06 }, { max: 19500000, rate: 0.07 }, { max: 22700000, rate: 0.08 },
      { max: 26600000, rate: 0.09 }, { max: 28100000, rate: 0.10 }, { max: 30100000, rate: 0.11 },
      { max: 32600000, rate: 0.12 }, { max: 35400000, rate: 0.13 }, { max: 38900000, rate: 0.14 },
      { max: 43000000, rate: 0.15 }, { max: 47400000, rate: 0.16 }, { max: 51200000, rate: 0.17 },
      { max: 55800000, rate: 0.18 }, { max: 60400000, rate: 0.19 }, { max: 66700000, rate: 0.20 },
      { max: 74500000, rate: 0.21 }, { max: 83200000, rate: 0.22 }, { max: 95600000, rate: 0.23 },
      { max: 110000000, rate: 0.24 }, { max: 134000000, rate: 0.25 }, { max: 169000000, rate: 0.26 },
      { max: 220000000, rate: 0.27 }, { max: 405000000, rate: 0.28 }, { max: 515000000, rate: 0.29 },
      { max: 740000000, rate: 0.30 }, { max: 1410000000, rate: 0.31 }, { max: Infinity, rate: 0.34 }
    ];

    function getPtkpCategory(ptkpStatus) {
      if (['TK/0', 'TK/1', 'K/0'].includes(ptkpStatus)) return 'A';
      if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(ptkpStatus)) return 'B';
      if (['K/3'].includes(ptkpStatus)) return 'C';
      return 'A';
    }

    function calculateEditPph21(bruto, ptkpStatus) {
      const cat = getPtkpCategory(ptkpStatus);
      let table = TER_A_EDIT;
      if (cat === 'B') table = TER_B_EDIT;
      if (cat === 'C') table = TER_C_EDIT;
      const bracket = table.find(b => bruto <= b.max);
      const rate = bracket ? bracket.rate : 0;
      return Math.round(bruto * rate);
    }

    function openDirectorQuickEditPicker() {
      if (!verifyDirectorPermission()) return;
      const records = getDatabaseRecords();
      if (records.length === 0) {
        alert("Database slip gaji masih kosong. Silakan isi data contoh atau input data terlebih dahulu.");
        return;
      }
      openEditRecordModal(records[0].id);
    }

    function openEditRecordModal(recordId) {
      if (!verifyDirectorPermission()) return;

      const records = getDatabaseRecords();
      const rec = records.find(r => r.id === recordId);
      if (!rec) {
        alert("Data karyawan tidak ditemukan di database!");
        return;
      }

      document.getElementById('editRecordId').value = rec.id;
      document.getElementById('editBadgeRecordId').innerText = `ID: ${rec.id}`;

      // Section 1
      const unitKey = rec.unitId || (rec.unitUsaha && rec.unitUsaha.toLowerCase().includes('snaprint') ? (rec.unitUsaha.toLowerCase().includes('zamrud') ? 'snaprint_zamrud' : 'snaprint_gw') : 'shop_and_drive_gw');
      document.getElementById('editUnitId').value = unitKey;
      document.getElementById('editPayPeriod').value = rec.payPeriod || 'September 2026';
      document.getElementById('editPayDate').value = rec.payDate || '25 September 2026';

      // Section 2
      document.getElementById('editEmpName').value = rec.empName || '';
      document.getElementById('editEmpId').value = rec.empId || '';
      document.getElementById('editEmpJabatan').value = rec.empJabatan || '';
      document.getElementById('editEmpDivisi').value = rec.empDivisi || 'Operasional';
      document.getElementById('editEmpStatus').value = rec.empStatus || 'Karyawan Tetap';
      document.getElementById('editEmpPtkp').value = rec.empPtkp || 'TK/0';
      document.getElementById('editEmpNpwp').value = rec.empNpwp || '';
      document.getElementById('editEmpRekening').value = rec.empRekening || '';

      // Section 3
      document.getElementById('editHariKerja').value = rec.hariKerja !== undefined ? rec.hariKerja : 24;
      document.getElementById('editHariTanggalMerah').value = rec.hariTanggalMerah || 0;
      document.getElementById('editRateMakan').value = formatRupiah(rec.rateMakanPerHari || 25000);
      document.getElementById('editRateTransport').value = formatRupiah(rec.rateTransportPerHari || 15000);
      document.getElementById('editGajiPokok').value = formatRupiah(rec.gajiPokok || 0);
      document.getElementById('editTunjanganJabatan').value = formatRupiah(rec.tunjanganJabatan || 0);
      document.getElementById('editInsentifLain').value = formatRupiah(rec.insentifLain || 0);
      document.getElementById('editKetInsentifLain').value = rec.ketInsentifLain || '';

      // Section 4
      const pphMode = rec.pph21Mode || (rec.potonganPph21 > 0 ? 'auto' : 'none');
      document.getElementById('editPph21Mode').value = pphMode;
      document.getElementById('editPotonganPph21').value = formatRupiah(rec.potonganPph21 || 0);
      document.getElementById('editIuranBpjs').value = formatRupiah(rec.iuranBpjs || 0);
      document.getElementById('editCicilanPinjaman').value = formatRupiah(rec.cicilanPinjaman || 0);
      document.getElementById('editPotonganLain').value = formatRupiah(rec.potonganLain || 0);

      toggleEditPph21Mode();
      calcEditTotals();

      document.getElementById('editRecordModal').classList.add('show');
    }

    function closeEditRecordModal() {
      const modal = document.getElementById('editRecordModal');
      if (modal) modal.classList.remove('show');
    }

    function onEditUnitChange(unitKey) {
      calcEditTotals();
    }

    function toggleEditPph21Mode() {
      const mode = document.getElementById('editPph21Mode').value;
      const inputPph = document.getElementById('editPotonganPph21');
      if (mode === 'auto') {
        inputPph.readOnly = true;
        inputPph.style.background = '#f8fafc';
        calcEditTotals();
      } else if (mode === 'manual') {
        inputPph.readOnly = false;
        inputPph.style.background = '#ffffff';
        inputPph.focus();
      } else {
        inputPph.readOnly = true;
        inputPph.value = '0';
        inputPph.style.background = '#f8fafc';
        calcEditTotals();
      }
    }

    function formatAndCalcEdit(input) {
      const cursor = input.selectionStart;
      const prevLen = input.value.length;
      const num = parseRupiah(input.value);
      input.value = formatRupiah(num);
      const newLen = input.value.length;
      input.setSelectionRange(cursor + (newLen - prevLen), cursor + (newLen - prevLen));
      calcEditTotals();
    }

    function calcEditTotals() {
      const gp = parseRupiah(document.getElementById('editGajiPokok').value);
      const tj = parseRupiah(document.getElementById('editTunjanganJabatan').value);
      const hm = parseInt(document.getElementById('editHariKerja').value, 10) || 0;
      const hrMerah = parseInt(document.getElementById('editHariTanggalMerah').value, 10) || 0;
      const rm = parseRupiah(document.getElementById('editRateMakan').value);
      const rt = parseRupiah(document.getElementById('editRateTransport').value);
      const tm = hm * rm;
      const tt = hm * rt;
      const im = hrMerah * 75000;
      const il = parseRupiah(document.getElementById('editInsentifLain').value);

      const bruto = gp + tj + tm + tt + im + il;

      const pphMode = document.getElementById('editPph21Mode').value;
      let pph21 = 0;
      if (pphMode === 'auto') {
        const ptkp = document.getElementById('editEmpPtkp').value;
        pph21 = calculateEditPph21(bruto, ptkp);
        document.getElementById('editPotonganPph21').value = formatRupiah(pph21);
      } else if (pphMode === 'manual') {
        pph21 = parseRupiah(document.getElementById('editPotonganPph21').value);
      } else {
        pph21 = 0;
      }

      const bpjs = parseRupiah(document.getElementById('editIuranBpjs').value);
      const cicilan = parseRupiah(document.getElementById('editCicilanPinjaman').value);
      const potLain = parseRupiah(document.getElementById('editPotonganLain').value);

      const totalPotongan = pph21 + bpjs + cicilan + potLain;
      const thp = bruto - totalPotongan;

      document.getElementById('editPreviewBruto').innerText = 'Rp ' + formatRupiah(bruto);
      document.getElementById('editPreviewPotongan').innerText = 'Rp ' + formatRupiah(totalPotongan);
      document.getElementById('editPreviewTHP').innerText = 'Rp ' + formatRupiah(thp);
    }

    function saveEditRecord() {
      if (!verifyDirectorPermission()) return;

      const recordId = document.getElementById('editRecordId').value;
      const empName = document.getElementById('editEmpName').value.trim();
      if (!empName) {
        alert("Nama Karyawan wajib diisi!");
        document.getElementById('editEmpName').focus();
        return;
      }

      let records = getDatabaseRecords();
      const idx = records.findIndex(r => r.id === recordId);
      if (idx === -1) {
        alert("Data yang akan diedit tidak ditemukan di database.");
        return;
      }

      const unitKey = document.getElementById('editUnitId').value;
      const unitInfo = BUSINESS_UNITS[unitKey] || BUSINESS_UNITS['shop_and_drive_gw'];

      const gp = parseRupiah(document.getElementById('editGajiPokok').value);
      const tj = parseRupiah(document.getElementById('editTunjanganJabatan').value);
      const hm = parseInt(document.getElementById('editHariKerja').value, 10) || 0;
      const hrMerah = parseInt(document.getElementById('editHariTanggalMerah').value, 10) || 0;
      const rm = parseRupiah(document.getElementById('editRateMakan').value);
      const rt = parseRupiah(document.getElementById('editRateTransport').value);
      const tm = hm * rm;
      const tt = hm * rt;
      const im = hrMerah * 75000;
      const il = parseRupiah(document.getElementById('editInsentifLain').value);
      const ketIl = document.getElementById('editKetInsentifLain').value.trim();

      const bruto = gp + tj + tm + tt + im + il;

      const pphMode = document.getElementById('editPph21Mode').value;
      const pph21 = parseRupiah(document.getElementById('editPotonganPph21').value);
      const bpjs = parseRupiah(document.getElementById('editIuranBpjs').value);
      const cicilan = parseRupiah(document.getElementById('editCicilanPinjaman').value);
      const potLain = parseRupiah(document.getElementById('editPotonganLain').value);
      const totalPotongan = pph21 + bpjs + cicilan + potLain;
      const thp = bruto - totalPotongan;

      records[idx] = {
        ...records[idx],
        unitId: unitKey,
        unitUsaha: unitInfo.name,
        picName: unitInfo.picName,
        companyName: unitInfo.name,
        companyAddress: unitInfo.address,
        payPeriod: document.getElementById('editPayPeriod').value.trim() || 'September 2026',
        payDate: document.getElementById('editPayDate').value.trim() || '25 September 2026',
        empName: empName,
        empId: document.getElementById('editEmpId').value.trim(),
        empJabatan: document.getElementById('editEmpJabatan').value.trim(),
        empDivisi: document.getElementById('editEmpDivisi').value.trim() || 'Operasional',
        empStatus: document.getElementById('editEmpStatus').value.trim() || 'Karyawan Tetap',
        empPtkp: document.getElementById('editEmpPtkp').value,
        empNpwp: document.getElementById('editEmpNpwp').value.trim(),
        empRekening: document.getElementById('editEmpRekening').value.trim(),
        hariKerja: hm,
        hariTanggalMerah: hrMerah,
        rateMakanPerHari: rm,
        rateTransportPerHari: rt,
        totalMakan: tm,
        totalTransport: tt,
        totalMerah: im,
        gajiPokok: gp,
        tunjanganJabatan: tj,
        insentifLain: il,
        ketInsentifLain: ketIl,
        pph21Mode: pphMode,
        potonganPph21: pph21,
        iuranBpjs: bpjs,
        cicilanPinjaman: cicilan,
        potonganLain: potLain,
        totalPenghasilan: bruto,
        totalPotongan: totalPotongan,
        netGaji: thp,
        updatedAt: new Date().toLocaleString('id-ID') + ' (Direktur: Ir. Swanto)'
      };

      saveDatabaseRecords(records);
      populatePeriodOptions();
      renderPayrollReport();
      closeEditRecordModal();
      alert(`✅ Koreksi Berhasil!\nData slip gaji karyawan "${empName}" telah diperbaiki & disimpan ke database oleh Direktur (Ir. Swanto).`);
    }

    function openCurrentEditInSlipForm() {
      const recordId = document.getElementById('editRecordId').value;
      if (recordId) {
        window.location.href = `index.html?loadId=${recordId}`;
      }
    }

    function clearAllData() {
      if (confirm("Peringatan: Seluruh data rekapitulasi gaji akan dihapus. Lanjutkan?")) {
        saveDatabaseRecords([]);
        populatePeriodOptions();
        renderPayrollReport();
      }
    }

    // Export CSV / Excel with Unit Usaha Column
    function exportToCSV() {
      const records = getDatabaseRecords();
      if (records.length === 0) {
        alert("Belum ada data untuk diekspor.");
        return;
      }

      let csv = "No,Tanggal Simpan,Unit Usaha,PIC Unit,Periode,NIK,Nama Karyawan,Jabatan,Divisi,Status,Status PTKP,NPWP,Hari Masuk,Hari Tgl Merah,Gaji Pokok,Tunjangan Jabatan,Tunjangan Makan,Tunjangan Transport,Insentif Tgl Merah,Insentif Lain,Keterangan Insentif,TOTAL GAJI BRUTO,Potongan PPh 21,Iuran BPJS,Cicilan Kasbon,Potongan Lain,TOTAL POTONGAN,GAJI BERSIH (THP),No Rekening\n";

      records.forEach((r, idx) => {
        const hm = r.hariKerja || 0;
        const hrMerah = r.hariTanggalMerah || 0;
        const gp = r.gajiPokok || 0;
        const tj = r.tunjanganJabatan || 0;
        const tm = r.totalMakan || (hm * (r.rateMakanPerHari || 25000));
        const tt = r.totalTransport || (hm * (r.rateTransportPerHari || 15000));
        const im = r.totalMerah || (hrMerah * 75000);
        const il = r.insentifLain || 0;
        const bruto = r.totalPenghasilan || (gp + tj + tm + tt + im + il);
        const pph21 = r.potonganPph21 || 0;
        const bpjs = r.iuranBpjs || 0;
        const cicilan = r.cicilanPinjaman || 0;
        const potLain = r.potonganLain || 0;
        const totalPot = r.totalPotongan || (pph21 + bpjs + cicilan + potLain);
        const thp = r.netGaji || (bruto - totalPot);

        csv += `"${idx+1}","${r.savedAt || ''}","${r.unitUsaha || r.companyName || ''}","${r.picName || ''}","${r.payPeriod || ''}","${r.empId || ''}","${r.empName || ''}","${r.empJabatan || ''}","${r.empDivisi || ''}","${r.empStatus || ''}","${r.empPtkp || 'TK/0'}","${r.empNpwp || '-'}","${hm}","${hrMerah}","${gp}","${tj}","${tm}","${tt}","${im}","${il}","${(r.ketInsentifLain || '').replace(/"/g, '""')}","${bruto}","${pph21}","${bpjs}","${cicilan}","${potLain}","${totalPot}","${thp}","${r.empRekening || ''}"\n`;
      });

      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rekapitulasi_Daftar_Gaji_3_Unit_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Seed Sample Data representing all 3 Business Units
    function loadSampleDataIfEmpty() {
      const sample = [
        // Unit 1: Shop And Drive Grand Wisata (PIC: Adis Setiawan)
        {
          id: 'SAMPLE_SND_1',
          savedAt: new Date().toLocaleString('id-ID'),
          unitId: 'shop_and_drive_gw',
          unitUsaha: 'Shop And Drive Grand Wisata',
          picName: 'Adis Setiawan',
          companyName: 'Shop And Drive Grand Wisata',
          companyAddress: 'Kawasan Niaga Grand Wisata Blok AA No. 10, Bekasi',
          payPeriod: 'September 2026',
          payDate: '25 September 2026',
          empName: 'Budi Santoso',
          empId: 'SND-001',
          empJabatan: 'Mekanik Senior',
          empDivisi: 'Operasional',
          empStatus: 'Karyawan Tetap',
          empPtkp: 'TK/0',
          empNpwp: '09.123.456.7-012.000',
          hariKerja: 24,
          empKeteranganHadir: 'Hadir Penuh (24 Hari)',
          empRekening: 'BCA - 1234567890 (Budi)',
          gajiPokok: 4500000,
          tunjanganJabatan: 400000,
          rateMakanPerHari: 25000,
          rateTransportPerHari: 15000,
          hariTanggalMerah: 2,
          totalMakan: 600000,
          totalTransport: 360000,
          totalMerah: 150000,
          insentifLain: 0,
          ketInsentifLain: '',
          totalPenghasilan: 6010000,
          potonganPph21: 45075,
          iuranBpjs: 150000,
          cicilanPinjaman: 200000,
          potonganLain: 0,
          totalPotongan: 395075,
          netGaji: 5614925
        },
        {
          id: 'SAMPLE_SND_2',
          savedAt: new Date().toLocaleString('id-ID'),
          unitId: 'shop_and_drive_gw',
          unitUsaha: 'Shop And Drive Grand Wisata',
          picName: 'Adis Setiawan',
          companyName: 'Shop And Drive Grand Wisata',
          companyAddress: 'Kawasan Niaga Grand Wisata Blok AA No. 10, Bekasi',
          payPeriod: 'September 2026',
          payDate: '25 September 2026',
          empName: 'Ahmad Fauzi',
          empId: 'SND-002',
          empJabatan: 'Teknisi Aki & Oli',
          empDivisi: 'Operasional',
          empStatus: 'Karyawan Tetap',
          empPtkp: 'K/1',
          empNpwp: '07.345.678.9-014.000',
          hariKerja: 24,
          empKeteranganHadir: 'Hadir Penuh',
          empRekening: 'BNI - 0234567891 (Ahmad)',
          gajiPokok: 4800000,
          tunjanganJabatan: 350000,
          rateMakanPerHari: 25000,
          rateTransportPerHari: 15000,
          hariTanggalMerah: 1,
          totalMakan: 600000,
          totalTransport: 360000,
          totalMerah: 75000,
          insentifLain: 200000,
          ketInsentifLain: 'Insentif Servis',
          totalPenghasilan: 6385000,
          potonganPph21: 0,
          iuranBpjs: 140000,
          cicilanPinjaman: 0,
          potonganLain: 0,
          totalPotongan: 140000,
          netGaji: 6245000
        },

        // Unit 2: Snaprint Grand Wisata (PIC: Eki Dwi Saputra)
        {
          id: 'SAMPLE_SNP_GW_1',
          savedAt: new Date().toLocaleString('id-ID'),
          unitId: 'snaprint_gw',
          unitUsaha: 'Snaprint Grand Wisata',
          picName: 'Eki Dwi Saputra',
          companyName: 'Snaprint Grand Wisata',
          companyAddress: 'Ruko Grand Wisata Blok AA No. 12, Bekasi',
          payPeriod: 'September 2026',
          payDate: '25 September 2026',
          empName: 'Siti Nurhaliza, S.Ds.',
          empId: 'SNP-GW01',
          empJabatan: 'Graphic Designer & Operator',
          empDivisi: 'Operasional',
          empStatus: 'Karyawan Tetap',
          empPtkp: 'TK/1',
          empNpwp: '08.234.567.8-013.000',
          hariKerja: 25,
          empKeteranganHadir: 'Hadir Penuh',
          empRekening: 'Mandiri - 1370009876543 (Siti)',
          gajiPokok: 5200000,
          tunjanganJabatan: 500000,
          rateMakanPerHari: 25000,
          rateTransportPerHari: 20000,
          hariTanggalMerah: 1,
          totalMakan: 625000,
          totalTransport: 500000,
          totalMerah: 75000,
          insentifLain: 350000,
          ketInsentifLain: 'Bonus Desain Kilat',
          totalPenghasilan: 7250000,
          potonganPph21: 54375,
          iuranBpjs: 160000,
          cicilanPinjaman: 0,
          potonganLain: 0,
          totalPotongan: 214375,
          netGaji: 7035625
        },
        {
          id: 'SAMPLE_SNP_GW_2',
          savedAt: new Date().toLocaleString('id-ID'),
          unitId: 'snaprint_gw',
          unitUsaha: 'Snaprint Grand Wisata',
          picName: 'Eki Dwi Saputra',
          companyName: 'Snaprint Grand Wisata',
          companyAddress: 'Ruko Grand Wisata Blok AA No. 12, Bekasi',
          payPeriod: 'September 2026',
          payDate: '25 September 2026',
          empName: 'Dewi Lestari',
          empId: 'SNP-GW02',
          empJabatan: 'Staff Kasir & Customer Service',
          empDivisi: 'Keuangan & Akuntansi',
          empStatus: 'Karyawan Tetap',
          empPtkp: 'TK/0',
          empNpwp: '06.456.789.0-015.000',
          hariKerja: 24,
          empKeteranganHadir: 'Hadir Penuh',
          empRekening: 'BCA - 5432109876 (Dewi)',
          gajiPokok: 4300000,
          tunjanganJabatan: 250000,
          rateMakanPerHari: 25000,
          rateTransportPerHari: 15000,
          hariTanggalMerah: 0,
          totalMakan: 600000,
          totalTransport: 360000,
          totalMerah: 0,
          insentifLain: 150000,
          ketInsentifLain: 'Insentif Penjualan',
          totalPenghasilan: 5660000,
          potonganPph21: 14150,
          iuranBpjs: 130000,
          cicilanPinjaman: 100000,
          potonganLain: 0,
          totalPotongan: 244150,
          netGaji: 5415850
        },

        // Unit 3: Snaprint Zamrud (PIC: M. Rengga Swana Herlambang)
        {
          id: 'SAMPLE_SNP_ZMR_1',
          savedAt: new Date().toLocaleString('id-ID'),
          unitId: 'snaprint_zamrud',
          unitUsaha: 'Snaprint Zamrud',
          picName: 'M. Rengga Swana Herlambang',
          companyName: 'Snaprint Zamrud',
          companyAddress: 'Dukuh Zamrud Blok M No. 12, Mustikajaya, Kota Bekasi',
          payPeriod: 'September 2026',
          payDate: '25 September 2026',
          empName: 'Rian Kurniawan',
          empId: 'SNP-ZM01',
          empJabatan: 'Operator Mesin Digital Printing',
          empDivisi: 'Operasional',
          empStatus: 'Karyawan Tetap',
          empPtkp: 'K/1',
          empNpwp: '05.567.890.1-016.000',
          hariKerja: 26,
          empKeteranganHadir: 'Hadir Penuh',
          empRekening: 'BRI - 001234567890123 (Rian)',
          gajiPokok: 4600000,
          tunjanganJabatan: 300000,
          rateMakanPerHari: 25000,
          rateTransportPerHari: 20000,
          hariTanggalMerah: 3,
          totalMakan: 650000,
          totalTransport: 520000,
          totalMerah: 225000,
          insentifLain: 300000,
          ketInsentifLain: 'Insentif Lembur Produksi',
          totalPenghasilan: 6595000,
          potonganPph21: 0,
          iuranBpjs: 140000,
          cicilanPinjaman: 100000,
          potonganLain: 0,
          totalPotongan: 240000,
          netGaji: 6355000
        },
        {
          id: 'SAMPLE_SNP_ZMR_2',
          savedAt: new Date().toLocaleString('id-ID'),
          unitId: 'snaprint_zamrud',
          unitUsaha: 'Snaprint Zamrud',
          picName: 'M. Rengga Swana Herlambang',
          companyName: 'Snaprint Zamrud',
          companyAddress: 'Dukuh Zamrud Blok M No. 12, Mustikajaya, Kota Bekasi',
          payPeriod: 'September 2026',
          payDate: '25 September 2026',
          empName: 'Indah Permata',
          empId: 'SNP-ZM02',
          empJabatan: 'Staff Finishing & Packing',
          empDivisi: 'Operasional',
          empStatus: 'Karyawan Kontrak (PKWT)',
          empPtkp: 'TK/0',
          empNpwp: '04.678.901.2-017.000',
          hariKerja: 24,
          empKeteranganHadir: 'Hadir Penuh',
          empRekening: 'BCA - 6789012345 (Indah)',
          gajiPokok: 4200000,
          tunjanganJabatan: 200000,
          rateMakanPerHari: 25000,
          rateTransportPerHari: 15000,
          hariTanggalMerah: 1,
          totalMakan: 600000,
          totalTransport: 360000,
          totalMerah: 75000,
          insentifLain: 0,
          ketInsentifLain: '',
          totalPenghasilan: 5435000,
          potonganPph21: 13588,
          iuranBpjs: 120000,
          cicilanPinjaman: 0,
          potonganLain: 0,
          totalPotongan: 133588,
          netGaji: 5301412
        }
      ];

      const existing = getDatabaseRecords();
      if (existing.length === 0) {
        saveDatabaseRecords(sample);
      } else {
        if (confirm("Tambahkan 6 data karyawan contoh (3 Unit Usaha) ke database?")) {
          saveDatabaseRecords([...sample, ...existing]);
        }
      }
      populatePeriodOptions();
      renderPayrollReport();
    }

    // =========================================================================
    // GLOBAL SETTINGS & BACKUP/RESTORE SYSTEM (PROTECTED BY DIREKTUR: IR. SWANTO)
    // =========================================================================
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
      if (typeof showToast === 'function') {
        showToast("⚠️ Akses Ditolak: Hanya Direktur (Ir. Swanto) yang berhak melihat pengaturan!", false);
      }
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
        if (typeof showToast === 'function') {
          showToast("✅ Otorisasi Direktur Terverifikasi! Membuka Pengaturan...", true);
        }
        openSettingsModal(true);
      } else {
        if (typeof showToast === 'function') {
          showToast("❌ Password / PIN Direktur salah! Akses ditolak.", false);
        } else {
          alert("❌ Password / PIN Direktur salah! Akses ditolak.");
        }
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

      const pinInput = document.getElementById('cfgDirectorAuthPin');
      if (pinInput) pinInput.value = "";

      document.getElementById('settingsModal').classList.add('show');
    }

    function closeSettingsModal() {
      document.getElementById('settingsModal').classList.remove('show');
    }

    function closeModalOnBackdrop(e) {
      if (e.target.id === 'settingsModal') {
        closeSettingsModal();
      } else if (e.target.id === 'editRecordModal') {
        closeEditRecordModal();
      } else if (e.target.id === 'directorAuthNoteModal') {
        closeDirectorAuthNote();
      } else if (e.target.id === 'loginModal') {
        closeLoginModal();
      }
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
        defaultPphMode: 'auto',
        defaultPaper: 'a4',
        defaultOrientation: 'portrait'
      };

      saveSettings(newSettings);
      applySettingsToReport(newSettings);
      closeSettingsModal();
      alert("✅ Izin Direktur (Ir. Swanto) Terverifikasi. Pengaturan sistem berhasil disimpan & diterapkan ke seluruh laporan!");
    }

    function applySettingsToReport(cfg = null) {
      if (!cfg) cfg = getSettings();
      const filterUnitEl = document.getElementById('filterUnit');
      const unitFilter = filterUnitEl ? filterUnitEl.value : 'ALL';
      let checkerName = (cfg.signerName || 'Hendra Wijaya, S.E.').trim();
      if (unitFilter !== 'shop_and_drive_gw' && (/adis/i.test(checkerName) || /setiawan/i.test(checkerName))) {
        checkerName = '';
      }
      if (document.getElementById('sigDiperiksa')) document.getElementById('sigDiperiksa').innerText = checkerName ? `( ${checkerName} )` : '(                                        )';
      if (document.getElementById('sigDisetujui')) document.getElementById('sigDisetujui').innerText = `( ${cfg.directorName || 'Ir. Swanto'} )`;
    }

    function resetSettingsToDefault() {
      // Validasi Otorisasi Direktur
      if (!verifyDirectorPermission()) {
        return;
      }

      if (confirm("Izin Direktur (Ir. Swanto) Terkonfirmasi. Kembalikan seluruh pengaturan sistem ke standar awal?")) {
        saveSettings(DEFAULT_SETTINGS);
        openSettingsModal();
        applySettingsToReport(DEFAULT_SETTINGS);
        alert("Pengaturan telah dikembalikan ke standar awal oleh Direktur.");
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
              saveSettings(parsed.settings);
            }
            applySettingsToReport();
            populatePeriodOptions();
            renderPayrollReport();
            closeSettingsModal();
            alert(`Backup berhasil dipulihkan! (${(parsed.records || []).length} slip gaji dimuat)`);
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

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      applySettingsToReport();
      applySessionToUI();
      const records = getDatabaseRecords();
      if (records.length === 0) {
        loadSampleDataIfEmpty();
      } else {
        populatePeriodOptions();
        renderPayrollReport();
      }

      const params = new URLSearchParams(window.location.search);
      let picParam = params.get('pic') || window.location.hash.replace('#', '');
      if (picParam) {
        picParam = picParam.toLowerCase();
        if (picParam === 'swanto') picParam = 'direktur';
        if (['adis', 'eki', 'rengga', 'direktur'].includes(picParam)) {
          openFrontGate(picParam);
        }
      } else if (params.get('gate') === '1') {
        openFrontGate();
      }
    });

    // =========================================================================
    // MODAL PRATINJAU CETAK (PRINT PREVIEW) - KERTAS FOLIO / F4 LANDSCAPE
    // =========================================================================
    function openPrintPreviewModal() {
      // Pastikan data rekapitulasi ter-render paling mutakhir
      renderPayrollReport();

      const filterUnitEl = document.getElementById('filterUnit');
      const unitText = filterUnitEl ? filterUnitEl.options[filterUnitEl.selectedIndex].text : 'Semua Unit';
      const periodEl = document.getElementById('filterPeriod');
      const periodText = (periodEl && periodEl.value !== 'ALL') ? periodEl.value : 'Semua Periode';
      
      const totalEmpEl = document.getElementById('statTotalEmployees');
      const totalNetEl = document.getElementById('statTotalNet');

      if (document.getElementById('prevModalUnit')) document.getElementById('prevModalUnit').innerText = unitText;
      if (document.getElementById('prevModalPeriod')) document.getElementById('prevModalPeriod').innerText = periodText;
      if (document.getElementById('prevModalTotalEmp')) document.getElementById('prevModalTotalEmp').innerText = totalEmpEl ? totalEmpEl.innerText : '0 Orang';
      if (document.getElementById('prevModalTotalNet')) document.getElementById('prevModalTotalNet').innerText = totalNetEl ? totalNetEl.innerText : 'Rp 0';

      // Render clone dokumen rekap ke lembar pratinjau kertas Folio
      const reportCard = document.querySelector('.report-card');
      const previewContainer = document.getElementById('previewDocumentSheet');
      if (reportCard && previewContainer) {
        const clone = reportCard.cloneNode(true);
        // Hapus kolom tombol aksi agar tampilan pratinjau bersih 100% sama dengan hasil cetak
        const actionCols = clone.querySelectorAll('.col-action');
        actionCols.forEach(el => el.remove());
        
        // Hapus box shadow dan margin pembungkus pada hasil clone
        clone.style.boxShadow = 'none';
        clone.style.border = 'none';
        clone.style.margin = '0';
        clone.style.padding = '0';

        previewContainer.innerHTML = '';
        previewContainer.appendChild(clone);
      }

      const modal = document.getElementById('printPreviewModal');
      if (modal) {
        modal.classList.add('show');
      }
    }

    function closePrintPreviewModal() {
      const modal = document.getElementById('printPreviewModal');
      if (modal) {
        modal.classList.remove('show');
      }
    }

    function executePrint() {
      closePrintPreviewModal();
      // Jeda kecil agar backdrop modal tertutup sempurna sebelum dialog print printer browser muncul
      setTimeout(() => {
        window.print();
      }, 250);
    }

    // Shortcut Keyboard Ctrl+P untuk Buka Pratinjau & Cetak Rekap
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openPrintPreviewModal();
      }
    });