# 🌀 swirl-mirror — Debian-Style File Repository & Auto-Discovery

> **💡 Solusi Praktis Berbagi Berkas di Lingkungan Lab & Jaringan Lokal**  
> Proyek ini dibuat berawal dari kebutuhan di lingkungan lab: ketika ingin memindahkan atau menyalin berkas antar-komputer seringkali ribet harus colok-cabut flashdisk atau harddisk eksternal secara bergantian.  
> Terinspirasi dari repositori mirror resmi **Debian** (`Index of /...`), **swirl-mirror** hadir sebagai server repositori berkas lokal yang ringan, cepat, dan siap pakai tanpa ribet!

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

### 2. Menjalankan secara Langsung (Native Bun)
```bash
# Mode development (live-reload)
bun run dev

# Mode production
bun run start
```

Server aktif di: **http://localhost:3000/**

### 3. Konfigurasi (`.env`)

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
