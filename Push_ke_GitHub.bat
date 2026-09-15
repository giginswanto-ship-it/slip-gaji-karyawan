@echo off
title Push ke GitHub - dutaglobaltech enterprise
color 0A
echo ================================================================
echo   SINKRONISASI & PUSH KE GITHUB: giginswanto-ship-it
echo   Repository: slip-gaji-karyawan
echo   dev by dutaglobaltech enterprise
echo ================================================================
echo.
cd /d "%~dp0"

echo [1/3] Menambahkan semua perubahan file...
git add .
git commit -m "Update slip gaji karyawan - dev by dutaglobaltech enterprise"
echo.

echo [2/3] Memeriksa remote origin GitHub...
git remote -v
echo.

echo [3/3] Melakukan Push ke GitHub (branch main)...
git push -u origin main

echo.
echo ================================================================
if %ERRORLEVEL% EQU 0 (
    echo   [SUKSES] Berhasil di-push ke GitHub!
    echo   URL: https://github.com/giginswanto-ship-it/slip-gaji-karyawan
) else (
    echo   [CATATAN] Jika otentikasi diperlukan, silakan login melalui
    echo   jendela browser / masukkan Personal Access Token (PAT) GitHub Anda.
)
echo ================================================================
echo.
pause
