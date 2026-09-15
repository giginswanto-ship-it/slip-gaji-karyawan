# Sistem Slip Gaji & Rekapitulasi Penggajian Karyawan

Aplikasi web modern berbasis HTML5, Tailwind CSS, dan JavaScript Vanilla untuk pembuatan **Slip Gaji Karyawan** dan **Rekapitulasi Daftar Gaji (Payroll Master Sheet)** lengkap dengan perhitungan otomatis **PPh 21 TER (PP 58/2023 & PMK 168/2023)** dan **Status PTKP**.

---

## 🌟 Fitur Utama

1. **Aplikasi Cetak Slip Gaji (`index.html`)**:
   - Perhitungan otomatis Gaji Pokok, Tunjangan Jabatan, Tunjangan Makan, dan Tunjangan Transport.
   - Pemotongan otomatis Tunjangan Makan & Transport jika karyawan libur/tidak hadir.
   - Insentif lembur / tanggal merah (Rp 75.000 / hari).
   - Perhitungan **PPh 21 TER** otomatis berdasarkan Status PTKP (TK/0 s.d K/3 - Kategori TER A, B, C).
   - Pengelolaan pinjaman / kasbon karyawan (Total pinjaman, cicilan bulanan, sisa saldo).
   - Konversi nominal gaji ke ejaan huruf (*Terbilang* otomatis).
   - Pengaturan tata letak cetak dokumen (**Portrait** standar & Landscape, pilihan ukuran A4 / F4).
   - Database internal berbasis browser (`LocalStorage`) untuk simpan, perbarui, dan hapus data slip.

2. **Rekapitulasi Daftar Gaji Semua Karyawan (`rekap_gaji.html`)**:
   - Master sheet rekapitulasi penggajian seluruh karyawan per periode.
   - Kartu statistik ringkasan total (Total Karyawan, Total Gaji Bruto, Total PPh 21, Total Potongan BPJS/Kasbon, Total THP).
   - Filter data berdasarkan Periode Gaji dan Divisi/Departemen.
   - Kolom tanda tangan pengesahan formal (Dibuat oleh Payroll, Diperiksa oleh Finance, Disetujui oleh Direktur).
   - Ekspor data ke format **Excel (.XLS / CSV)** dengan 1 klik.
   - Format cetak laporan **A4 Landscape**.

3. **Template & Petunjuk**:
   - `Template_Slip_Gaji_Excel.xls`: Template master Excel siap pakai dengan formula SUM dan perhitungan THP.
   - `PETUNJUK_PENGGUNAAN.txt`: Panduan operasional lengkap aplikasi.

---

## 🚀 Cara Menjalankan

Cukup klik dua kali (*double click*) pada salah satu file batch launcher berikut:
- **`Buka_Slip_Gaji.bat`** -> Membuka aplikasi input & cetak Slip Gaji Karyawan di browser.
- **`Buka_Rekap_Gaji.bat`** -> Membuka halaman Rekapitulasi Daftar Gaji Semua Karyawan di browser.

Atau langsung buka file `index.html` dan `rekap_gaji.html` menggunakan browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox).

---

## 💻 Lisensi & Pembuat
Dibuat untuk kebutuhan operasional penggajian karyawan.
GitHub: [@giginswanto-ship-it](https://github.com/giginswanto-ship-it)
