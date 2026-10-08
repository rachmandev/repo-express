# 🌀 swirl-mirror — Debian-Style File Repository & Auto-Discovery

<p align="left">
  <a href="https://github.com/rachmandev/swirl-mirror/stargazers"><img src="https://img.shields.io/github/stars/rachmandev/swirl-mirror?style=flat-square&logo=github&color=D70A53" alt="Stars"></a>
  <a href="https://github.com/rachmandev/swirl-mirror/network/members"><img src="https://img.shields.io/github/forks/rachmandev/swirl-mirror?style=flat-square&logo=git&color=D70A53" alt="Forks"></a>
  <a href="https://github.com/rachmandev/swirl-mirror/releases"><img src="https://img.shields.io/github/v/release/rachmandev/swirl-mirror?style=flat-square&color=D70A53" alt="Release"></a>
  <a href="https://github.com/rachmandev/swirl-mirror/releases"><img src="https://img.shields.io/github/downloads/rachmandev/swirl-mirror/total?style=flat-square&color=D70A53" alt="Downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=flat-square" alt="License: AGPL-3.0"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Runtime-Bun_1.4+-000000?style=flat-square&logo=bun" alt="Bun"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Framework-Express_5-gray?style=flat-square&logo=express" alt="Express 5"></a>
  <a href="docker-compose.yml"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
</p>

> **💡 Solusi Praktis Berbagi Berkas di Lingkungan Lab & Jaringan Lokal**  
> Proyek ini dibuat berawal dari kebutuhan nyata di lingkungan lab: ketika ingin memindahkan atau menyalin berkas antar-komputer seringkali ribet harus colok-cabut flashdisk atau harddisk eksternal secara bergantian.  
>  
> Sebenarnya sudah ada protokol seperti **FTP** atau file sharing jaringan lainnya, namun seringkali kurang praktis dan kurang ramah bagi banyak pengguna karena harus menginstal aplikasi pihak ketiga (seperti FileZilla), konfigurasi koneksi, hingga pengaturan port.  
>  
> Demi **kenyamanan dan kemudahan maksimal bagi pengguna (*user-friendly*)**, dengan **swirl-mirror** siapa pun cukup membuka browser dan mengetikkan **IP atau domain internal** di address bar (misal: `http://192.168.1.50:3000` atau `http://repo.lab.internal`) — **langsung selesai!** Siapa saja bisa langsung menjelajah, mempratinjau, dan mengunduh berkas tanpa perlu instalasi aplikasi tambahan apa pun.  
>  
> Terinspirasi dari tampilan repositori mirror resmi **Debian** (`Index of /...`), **swirl-mirror** hadir sebagai server repositori berkas lokal yang ringan, instan, otomatis mendeteksi berkas baru (*real-time auto-discovery*), dan siap pakai.

Server repositori berkas dengan antarmuka bergaya **Debian Mirror** dan fitur **Real-Time Auto Discovery** otomatis untuk file & folder. Dibangun menggunakan **Express 5** dan runtime **Bun**. Dikhususkan untuk menyimpan dan mendistribusikan file gambar, video, dokumen, image OS, virtual appliance, dan arsip terkompresi (**JPG, JPEG, PNG, WEBP, MP4, MKV, PDF, TXT, DOC, DOCX, ISO, IMG, DMG, OVA, ZIP, RAR**).

---

## ✨ Fitur Utama

- 🐧 **Konsep & Tampilan Debian Mirror**:
  - Logo swirl resmi Debian dan aksen warna khas Debian (`#D70A53`).
  - Header `Index of /path...` dengan navigasi breadcrumbs interaktif dan `Parent Directory` (`../`).
  - Footer autentik `Apache/2.4.62 (Debian) Server at <host> Port <port>`.
  - Mode tampilan ganda: **Modern** (dark/light mode, badge tipe berkas, hover preview gambar) & **Klasik** (Apache mirror retro).
- 🔍 **Real-Time Auto Discovery**:
  - Setiap berkas dan folder yang ditambahkan, diubah, atau dihapus langsung terdeteksi seketika tanpa perlu restart server.
- 🎯 **Format Berkas yang Didukung**:
  - 🖼️ **Gambar (`.jpg`, `.jpeg`, `.png`, `.webp`)**: Foto, tangkapan layar, diagram (dengan preview thumbnail saat hover).
  - 🎥 **Video (`.mp4`, `.mkv`)**: Rekaman video, media streaming.
  - 📄 **Dokumen (`.pdf`, `.txt`, `.doc`, `.docx`)**: Catatan, manual, dokumen kantor, log.
  - 💿 **Image & VM (`.iso`, `.img`, `.dmg`, `.ova`)**: Image CD/DVD/OS, Apple Disk Image (macOS), dan Virtual Appliance (VirtualBox, VMware, Proxmox).
  - 📦 **Arsip (`.zip`, `.rar`)**: Berkas terkompresi ZIP dan WinRAR.
  - *Format berkas di luar daftar ini otomatis ditolak saat diunggah.*
- 📥 **Upload Berkas Fleksibel**:
  - Drag & drop berkas langsung ke browser Web UI.
  - Tombol **+ Unggah Berkas** & **+ Folder Baru**.
  - Upload via terminal: `curl -T file.iso http://localhost:3000/isos/file.iso`.
- 🔄 **Resumable Downloads (HTTP Range Requests)**:
  - Dukungan penuh HTTP 206 Partial Content untuk file besar (ISO dan OVA), memungkinkan download dilanjutkan jika terputus.
- 💻 **Dukungan Terminal & API**:
  - Akses via `curl`: Otomatis menampilkan tabel teks ASCII bersih ala terminal Linux.
  - JSON API: Mendukung query `?format=json`, `/api/status`, dan `/api/tree`.
- 🛡️ **Keamanan**:
  - Proteksi anti-directory traversal (`..` attack).
  - Berkas tersembunyi (*dotfiles*) otomatis diabaikan.

---

## 🚀 Cara Menjalankan

### 1. Menjalankan dengan Docker Compose (Rekomendasi)
Penyimpanan berkas langsung di-mount ke host di folder `./storage`:

```bash
# Jalankan di latar belakang (detached mode)
docker compose up -d --build

# Melihat log server
docker compose logs -f

# Menghentikan server
docker compose down
```

### 2. Menggunakan Docker Image dari GHCR
Anda juga dapat langsung menarik (*pull*) image siap pakai dari GitHub Container Registry tanpa perlu build manual:

```bash
# Tarik image dari GHCR
docker pull ghcr.io/rachmandev/swirl-mirror:latest

# Jalankan container
docker run -d \
  --name swirl-mirror \
  -p 3000:3000 \
  -v $(pwd)/storage:/app/storage \
  --env-file .env \
  ghcr.io/rachmandev/swirl-mirror:latest
```

### 3. Menjalankan secara Langsung (Native Bun)
```bash
# Mode development (live-reload)
bun run dev

# Mode production
bun run start
```

Server aktif di: **http://localhost:3000/**

### 4. Konfigurasi (`.env`)

Semua konfigurasi dan kredensial sensitif disimpan di dalam file `.env` (file ini otomatis diabaikan oleh Git via `.gitignore`). Template tersedia di `.env.example`.

Salin template untuk memulai:
```bash
cp .env.example .env
```

| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | `3000` | Port HTTP server |
| `HOST` | `0.0.0.0` | Bind IP interface |
| `DISPLAY_HOST` | `localhost` | Host yang ditampilkan pada footer / link |
| `STORAGE_DIR` | `./storage` | Folder root penyimpanan berkas |
| `TITLE` | `Debian File Repository` | Judul mirror di header |
| `ADMIN_USERNAME` | `admin` | Username login admin pengelola |
| `ADMIN_PASSWORD` | `admin123` | Password login admin (wajib diganti di produksi) |
| `SESSION_SECRET` | *(64-hex string)* | Kunci HMAC-SHA256 untuk cookie sesi (generate via `openssl rand -hex 32`) |

---

## 🔐 Sistem Autentikasi & Keamanan

- **Akses Publik (Read-Only)**: Siapa saja dapat menjelajahi direktori dan mengunduh berkas tanpa perlu login.
- **Akses Admin (Write-Access)**: Operasi unggah berkas (`PUT`), buat folder (`/api/mkdir`), dan hapus berkas (`DELETE`) hanya dapat dilakukan setelah login sebagai admin di `/login`.
- **Sesi Cookie**: Sesi diamankan menggunakan token bertanda tangan kriptografis HMAC-SHA256 (`HttpOnly`, `SameSite=Lax`, masa berlaku 8 jam).


---

## 📁 Struktur Direktori Repositori

Letakkan berkas ke dalam folder `./storage`:

```text
storage/
├── README.txt
├── docs/
│   └── panduan.txt
├── images/
│   └── debian-sample.png
├── isos/
│   └── mini-debian.iso
└── vms/
    └── debian-server.ova
```

Semua subfolder dan berkas baru yang Anda buat langsung muncul di browser secara instan!

---

## 💻 Contoh Penggunaan Terminal

### 1. Melihat Indeks via cURL
```bash
curl http://localhost:3000/
```
*Output ASCII:*
```text
Index of /
==============================================================================
Type   Name                                  Last Modified             Size
------------------------------------------------------------------------------
[DIR]  docs/                                 2026-10-04 22:51             -
[DIR]  images/                               2026-10-04 22:51             -
[DIR]  isos/                                 2026-10-04 22:51             -
[DIR]  vms/                                  2026-10-04 22:51             -
[TEX]  README.txt                            2026-10-04 22:51         699 B
==============================================================================
Apache/2.4.62 (Debian) Server at localhost Port 3000
Total: 4 directories, 1 files (699 B)
```

### 2. Mengunggah Berkas via Terminal
```bash
# Upload berkas ISO
curl -T debian-12.iso http://localhost:3000/isos/debian-12.iso

# Upload berkas gambar PNG
curl -T diagram.png http://localhost:3000/images/diagram.png

# Upload berkas OVA
curl -T backup-vm.ova http://localhost:3000/vms/backup-vm.ova
```

### 3. Mengunduh Berkas dengan Kemampuan Resume
```bash
curl -C - -O http://localhost:3000/isos/mini-debian.iso
```

### 4. API Endpoints
```bash
# Mendapatkan data direktori dalam format JSON
curl http://localhost:3000/?format=json

# Status dan statistik repositori
curl http://localhost:3000/api/status

# Pohon berkas lengkap (recursive tree)
curl http://localhost:3000/api/tree

# Membuat folder baru
curl -X POST http://localhost:3000/api/mkdir \
  -H 'Content-Type: application/json' \
  -d '{"path": "/isos/debian-13"}'

# Menghapus berkas
curl -X DELETE http://localhost:3000/docs/panduan.txt
```

---

## 💖 Dukungan & Donasi

Jika proyek **swirl-mirror** ini bermanfaat dan membantu mempermudah aktivitas berbagi berkas di lab atau lingkungan kerja Anda, pertimbangkan untuk memberikan donasi atau traktiran kopi untuk mendukung pengembangan proyek ini:

<p align="left">
  <a href="https://saweria.co/rachmandev" target="_blank">
    <img src="https://img.shields.io/badge/Saweria-Dukung_Karya-FAAE2B?style=for-the-badge&logo=ko-fi&logoColor=black" alt="Saweria" />
  </a>
  &nbsp;
  <a href="https://trakteer.id/rachmandev" target="_blank">
    <img src="https://img.shields.io/badge/Trakteer-Traktir_Kopi-be1e2d?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white" alt="Trakteer" />
  </a>
  &nbsp;
  <a href="https://www.buymeacoffee.com/rachmandev" target="_blank">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
  &nbsp;
  <a href="https://paypal.me/rachmandev" target="_blank">
    <img src="https://img.shields.io/badge/PayPal-Donasi-00457C?style=for-the-badge&logo=paypal&logoColor=white" alt="PayPal" />
  </a>
  &nbsp;
  <a href="https://github.com/sponsors/rachmandev" target="_blank">
    <img src="https://img.shields.io/badge/GitHub_Sponsors-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white" alt="GitHub Sponsors" />
  </a>
</p>

Dukungan juga sangat berarti dengan memberikan ⭐ **Star** dan 🍴 **Fork** pada repositori ini di GitHub! Terima kasih banyak! 🙌

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi open source **[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)**.

```text
swirl-mirror — Debian-Style File Repository & Auto-Discovery
Copyright (C) 2026 Rachman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

