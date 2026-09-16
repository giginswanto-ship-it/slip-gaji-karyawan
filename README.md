# Sistem Slip Gaji & Rekapitulasi Penggajian Karyawan
> **dev by dutaglobaltech enterprise**

Aplikasi web modern berbasis HTML5, CSS3, dan JavaScript Vanilla untuk pembuatan **Slip Gaji Karyawan** dan **Rekapitulasi Daftar Gaji 3 Unit Usaha** lengkap dengan perhitungan otomatis **PPh 21 TER (PP 58/2023 & PMK 168/2023)**, **Status PTKP**, dan sistem otorisasi **Direktur ( Ir. Swanto )**.

---

## 🏢 3 Unit Usaha & Hak Akses Pengguna

| Role / Jabatan | Nama Lengkap | Username | Password | Unit Usaha | Hak Akses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Direktur Utama** | **Ir. Swanto** | `direktur` *(alias: `swanto`)* | `swanto123` | Semua Unit Usaha (Konsolidasi) | **Penuh** (Slip Gaji, Rekapitulasi 3 Unit, & Edit Pengaturan Sistem) |
| **PIC Unit 1** | **Adis Setiawan** | `adis` | `adis123` | **Shop And Drive Grand Wisata** | Pembuatan Slip Gaji & Rekap Unit 1 |
| **PIC Unit 2** | **Eki Dwi Saputra** | `eki` | `eki123` | **Snaprint Grand Wisata** | Pembuatan Slip Gaji & Rekap Unit 2 |
| **PIC Unit 3** | **M. Rengga Swana Herlambang** | `rengga` | `rengga123` | **Snaprint Zamrud** | Pembuatan Slip Gaji & Rekap Unit 3 |

---

## 🔒 Kebijakan Keamanan & Otorisasi Direktur

- **Proteksi Melihat & Mengubah Pengaturan**: Seluruh Pengaturan Sistem (Melihat & Mengubah Nama/Profil Perusahaan, Tarif Tunjangan Dasar, Format Kertas, Reset Sistem, serta Pemulihan Cadangan Data *Restore JSON*) **HANYA BISA DILIHAT & DIUBAH OLEH DIREKTUR ( Ir. Swanto )**.
- **Pemberitahuan Sistem (Note Resmi)**: Jika pengguna non-direktur atau tanpa otorisasi mencoba membuka/melihat pengaturan, sistem secara otomatis menolak dan memunculkan dialog peringatan resmi:
  > ⛔ **AKSES DITOLAK!**  
  > *Seluruh Pengaturan hanya boleh dilihat dan diubah Oleh Direktur ( Ir. Swanto ).*  
  > **⚠️ HARUS IZIN DIREKTUR !**
- **Opsi Buka Cepat**: Form peringatan dilengkapi kolom input PIN Direktur (`swanto123` / `swanto` / `123456`) untuk pembukaan langsung di tempat oleh Direktur.

---

## 🌟 Fitur Utama

1. **Aplikasi Cetak Slip Gaji (`index.html`)**:
   - Pemilihan unit usaha & PIC penandatangan otomatis.
   - Perhitungan otomatis Gaji Pokok, Tunjangan Jabatan, Tunjangan Makan, dan Tunjangan Transport.
   - Pemotongan otomatis Tunjangan Makan & Transport jika karyawan libur/tidak hadir.
   - Insentif lembur / tanggal merah (Rp 75.000 / hari).
   - Perhitungan **PPh 21 TER** otomatis berdasarkan Status PTKP (TK/0 s.d K/3 - Kategori TER A, B, C).
   - Pengelolaan pinjaman / kasbon karyawan (Total pinjaman, cicilan bulanan, sisa saldo).
   - Konversi nominal gaji ke ejaan huruf (*Terbilang* otomatis).
   - Pengaturan tata letak cetak dokumen (**Portrait** standar & Landscape, pilihan ukuran A4 / F4 / A5 / Struk).
   - Database internal berbasis browser (`LocalStorage`) untuk simpan, perbarui, dan filter data slip per unit usaha.
   - **Mode Koreksi & Edit Khusus Direktur**: Direktur dapat memuat dan mengedit kembali slip gaji yang telah tersimpan untuk memperbaiki kesalahan input tanpa membuat data duplikat.

2. **Rekapitulasi Daftar Gaji Semua Unit (`rekap_gaji.html`)**:
   - Master sheet rekapitulasi penggajian seluruh karyawan per periode dan per unit usaha.
   - **Fitur Edit & Koreksi Langsung (Khusus Akun Direktur)**: Tombol `✏️ Edit` pada setiap baris tabel dan tombol `✏️ Koreksi Input Data` di toolbar untuk membuka form modal koreksi data karyawan (Unit, NIK, Nama, Hari Kerja, Gaji Pokok, Tunjangan, PPh 21 TER, BPJS, Pinjaman, dll) secara instan dan langsung memperbarui database & rekapitulasi.
   - Kartu statistik ringkasan total (Total Karyawan, Total Gaji Bruto, Total PPh 21, Total Potongan BPJS/Kasbon, Total THP).
   - Filter data berdasarkan Unit Usaha, Periode Gaji, dan Divisi/Departemen.
   - Kolom tanda tangan pengesahan formal dinamis sesuai unit:
     - **Dibuat Oleh**: PIC Unit terkait (`Adis Setiawan` / `Eki Dwi Saputra` / `M. Rengga Swana Herlambang`).
     - **Diperiksa Oleh**: Manager Keuangan (`Hendra Wijaya, S.E.`).
     - **Disetujui Oleh**: Direktur (`Ir. Swanto`).
   - Ekspor data ke format **Excel (.XLS / CSV)** dengan kolom Unit Usaha.
   - Format cetak laporan **A4 Landscape**.

---

## 🚀 Cara Menjalankan & Jendela Login PIC

Cukup klik dua kali (*double click*) pada salah satu file batch launcher sesuai PIC / Kebutuhan:
- **`Buka_Login_PIC_Adis.bat`** -> 🚗 Langsung ke Jendela Login **PIC Adis Setiawan** (*Shop And Drive GW*).
- **`Buka_Login_PIC_Eki.bat`** -> 🖨️ Langsung ke Jendela Login **PIC Eki Dwi Saputra** (*Snaprint GW*).
- **`Buka_Login_PIC_Rengga.bat`** -> 🏢 Langsung ke Jendela Login **PIC M. Rengga Swana H.** (*Snaprint Zamrud*).
- **`Buka_Login_Direktur_Swanto.bat`** -> 👑 Langsung ke Jendela Login **Direktur Utama Ir. Swanto**.
- **`Buka_Slip_Gaji.bat`** -> Membuka aplikasi input & cetak Slip Gaji Karyawan di browser.
- **`Buka_Rekap_Gaji.bat`** -> Membuka halaman Rekapitulasi Daftar Gaji Semua Karyawan di browser.

Atau langsung buka file `index.html` dan `rekap_gaji.html` menggunakan browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox).

---

## 💻 Lisensi, Pimpinan & Pengembang
- **Direktur**: `Ir. Swanto`
- **Developer**: `dev by dutaglobaltech enterprise`
- **GitHub**: [@giginswanto-ship-it](https://github.com/giginswanto-ship-it)


