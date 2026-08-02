# 🛠️ KerjaIn - Platform Layanan Jasa & Pekerja Harian Terintegrasi

![KerjaIn Banner](https://img.shields.io/badge/KerjaIn-Platform_Jasa_Harian-blue?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=nodedotjs)
![ExpressJS](https://img.shields.io/badge/Express.js-v5.0-lightgrey?style=for-the-badge&logo=express)
![React](https://img.shields.io/badge/React-v19.0-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue?style=for-the-badge&logo=postgresql)

**KerjaIn** adalah platform digital berbasis web yang menghubungkan **Pemberi Kerja (Client)** dengan **Pekerja Lepas / Harian (Worker)** secara *real-time*. Dilengkapi dengan sistem verifikasi identitas KYC (KTP & Selfie), lokasi berbasis peta (*Leaflet Interactive Map*), sistem dompet digital & *escrow payment* (Midtrans Payment Gateway), serta tombol darurat **Panic SOS** untuk keamanan kerja di lapangan.

---

## 📋 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Teknologi & Arsitektur](#-teknologi--arsitektur)
3. [Credentials & Konfigurasi Environment](#-credentials--konfigurasi-environment)
   - [Backend (.env)](#1-backend-env)
   - [Frontend (.env)](#2-frontend-env)
   - [Cara Mendapatkan API Keys & Credentials](#3-cara-mendapatkan-api-keys--credentials)
4. [Akun Pengujian Default (Test Credentials)](#-akun-pengujian-default-test-credentials)
5. [🧪 Panduan Pengujian Aplikasi untuk Juri](#-panduan-pengujian-aplikasi-untuk-juri)
   - [Skenario 1: Pengujian Role Client (Pemberi Kerja)](#skenario-1-pengujian-role-client-pemberi-kerja)
   - [Skenario 2: Pengujian Role Worker (Pekerja) & Fitur Panic SOS](#skenario-2-pengujian-role-worker-pekerja--fitur-panic-sos)
   - [Skenario 3: Pengujian Role Administrator & Moderasi](#skenario-3-pengujian-role-administrator--moderasi)
6. [Alur & Flow Sistem (System Flow)](#-alur--flow-sistem-system-flow)
   - [Flow 1: Registrasi & Verifikasi Identitas (KYC)](#1-flow-registrasi--verifikasi-identitas-kyc)
   - [Flow 2: Siklus Pekerjaan & Escrow (Job Lifecycle)](#2-flow-siklus-pekerjaan--escrow-job-lifecycle)
   - [Flow 3: Pembayaran & Top-Up (Midtrans Gateway)](#3-flow-pembayaran--top-up-midtrans-gateway)
   - [Flow 4: Pencairan Saldo (Withdrawal)](#4-flow-pencairan-saldo-withdrawal)
   - [Flow 5: Fitur Darurat Panic SOS](#5-flow-fitur-darurat-panic-sos)
7. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
8. [Ringkasan API Endpoints](#-ringkasan-api-endpoints)

---

## ✨ Fitur Utama

- 👥 **Multi-Role User Management**: Mendukung 3 tipe pengguna: **Admin**, **Client (Pemberi Kerja)**, dan **Worker (Pekerja)**.
- 🆔 **Verifikasi Identitas / KYC**: Pengunggahan dokumen KTP dan Swafoto (Selfie) yang diverifikasi langsung oleh Admin sebelum Worker dapat mengambil pekerjaan.
- 📍 **Location-Based Job Matching**: Pemetaan lokasi pekerjaan dan lokasi pekerja menggunakan **Leaflet Maps** & Geolocation.
- 💳 **Integrasi Payment Gateway (Midtrans Snap)**: Top-up saldo aman menggunakan Transfer Bank (BCA, Mandiri, BRI, BNI), QRIS, E-Wallet, dan Kartu Kredit.
- 🔒 **Sistem Escrow / Rekening Bersama**: Saldo Client ditahan sementara saat menugaskan Worker dan otomatis diteruskan ke dompet Worker saat pekerjaan disetujui.
- 🚨 **Fitur Panic / SOS Button**: Notifikasi bahaya darurat real-time yang mengirimkan posisi GPS Worker ke Admin saat keadaan darurat di lokasi kerja.
- 🏦 **Pencairan Saldo (Withdrawal)**: Pengajuan penarikan dana Worker ke rekening bank lokal dengan persetujuan Admin.
- 🚩 **Sistem Pelaporan & Moderasi (Reports)**: Fitur pelaporan penyalahgunaan pekerjaan atau perilaku pengguna untuk ditindaklanjuti Admin.

---

## 🏗️ Teknologi & Arsitektur

### **Frontend**
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Custom Tokens
- **State Management**: Redux Toolkit & React Context
- **Routing**: React Router DOM v7
- **Peta & Peta Interaktif**: Leaflet & React-Leaflet
- **Komponen UI & Ikon**: Lucide React, SweetAlert2 (Swal)

### **Backend**
- **Runtime**: Node.js (v18+)
- **Framework API**: Express.js v5 (ES Modules)
- **Database**: PostgreSQL (Sequelize ORM)
- **Keamanan & Autentikasi**: Argon2 (Password Hashing), JSON Web Token (JWT)
- **Integrasi**: Midtrans Client SDK, Axios (ImgBB API)

---

## 🔐 Credentials & Konfigurasi Environment

Berikut adalah konfigurasi parameter environment `.env` yang digunakan oleh sistem `backend` dan `frontend`:

### 1. Backend (`backend/.env`)

```env
# Server Config
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database Connection (PostgreSQL)
DB_URL=postgresql://postgres:postgres@localhost:5432/kerjain
DB_SSL=false

# Autentikasi JWT
JWT_SECRET=rahasia-super-aman-ganti-dengan-string-acak-panjang

# Payment Gateway (Midtrans)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Cloud Image Upload (ImgBB API)
IMGDB_KEY=your_imgbb_api_key_here
```

| Variabel | Deskripsi | Keterangan |
| :--- | :--- | :--- |
| `PORT` | Port server Express running | `5000` |
| `NODE_ENV` | Mode aplikasi (`development` / `production`) | `development` |
| `CORS_ORIGIN` | URL Frontend yang diizinkan mengakses API | `http://localhost:5173` |
| `DB_URL` | Connection String PostgreSQL | Neon PostgreSQL / Supabase / Local |
| `DB_SSL` | Aktifkan SSL DB | `true` untuk Cloud DB (Neon), `false` untuk Local |
| `JWT_SECRET` | Secret key untuk enkripsi token JWT login | Key string rahasia |
| `MIDTRANS_SERVER_KEY` | Server Key dari Dashboard Midtrans Sandbox | Digunakan untuk otorisasi Snap & Webhook |
| `MIDTRANS_CLIENT_KEY` | Client Key dari Dashboard Midtrans Sandbox | Digunakan untuk widget pembayar di Frontend |
| `MIDTRANS_IS_PRODUCTION` | Mode Midtrans Gateway | `false` untuk mode Sandbox testing |
| `IMGDB_KEY` | API Key ImgBB | API Key untuk pengunggahan dokumen KTP & Foto |

---

### 2. Frontend (`frontend/.env`)

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000

# Mocking Data Option (Set false untuk menggunakan Backend Server)
VITE_USE_MOCK=false

# Midtrans Client Key (Client side Snap integration)
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxx
```

---

### 3. Cara Mendapatkan API Keys & Credentials

#### A. Midtrans Payment Gateway (Sandbox/Testing)
1. Login ke [Dashboard Midtrans Sandbox](https://dashboard.sandbox.midtrans.com).
2. Pilih menu **SETTINGS** -> **Access Keys**.
3. Dapatkan **Server Key** dan **Client Key**.

#### B. ImgBB API Key (Image Upload Hosting)
1. Buat akun di [ImgBB API](https://api.imgbb.com/).
2. Klik **Get API Key** untuk menyalin kunci API 32 karakter.

---

## 🔑 Akun Pengujian Default (Test Credentials)

Gunakan akun-akun berikut yang telah disiapkan untuk melakukan pengujian langsung pada aplikasi:

| Role / Peran | Email Login | Password | Status & Keterangan Pengujian |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `admin123` | Full Access: Verifikasi KYC, Monitoring SOS, Approval Withdrawal |
| **Client (Pemberi Kerja)** | `client@gmail.com` | `password123` | Budi Santoso: Pembuat Job, Top-up Saldo Midtrans, Hire Worker |
| **Client 2** | `client2@mail.com` | `password123` | Siti Rahma (Sidoarjo): Klien Alternatif |
| **Worker (Pekerja)** | `worker@gmail.com` | `password123` | Andi Tukang: **Terverifikasi KYC**, Melamar Job, Fitur Panic SOS |
| **Worker 2** | `worker1@mail.com` | `password123` | Ahmad Fauzi: Pekerja Harian Harian Terverifikasi |
| **Worker 3 (Belum Verified)** | `worker2@mail.com` | `password123` | Dewi Lestari: Dapat diuji untuk alur Upload & Verifikasi KYC |

---

## 🧪 Panduan Pengujian Aplikasi untuk Juri

Untuk mempermudah Dewan Juri dalam menguji seluruh fungsi dan fitur unggulan **KerjaIn**, berikut adalah alur skenario pengujian rekomendasi:

### Skenario 1: Pengujian Role Client (Pemberi Kerja)
1. **Login sebagai Client**:
   - Masuk menggunakan email: `client@gmail.com` dan password: `password123`.
2. **Top-Up Saldo via Midtrans Snap Widget**:
   - Buka menu **Dompet / Wallet**.
   - Masukkan nominal Top-Up (misal: Rp 100.000) dan klik **Top Up Sekarang**.
   - Pop-up Midtrans Snap akan muncul. Anda dapat memilih metode pembayaran **Virtual Account / QRIS** (Gunakan [Midtrans Payment Simulator](https://simulator.sandbox.midtrans.com) untuk menyelesaikan pembayaran dummy).
3. **Membuat Lowongan Pekerjaan Baru (Post Job)**:
   - Pilih menu **Buat Pekerjaan / Post Job**.
   - Isi judul, deskripsi, pilih kategori (misal: *Perbaikan Rumah*), tentukan budget, dan tentukan lokasi titik pekerjaan pada **Peta Interaktif Leaflet**.
   - Klik **Publikasikan Pekerjaan**.
4. **Menugaskan Worker (Escrow Hold Saldo)**:
   - Lihat daftar pelamar pada pekerjaan yang dibuat.
   - Klik **Pilih / Hire Worker**. Saldo Client akan dipotong dan ditahan secara aman di dalam sistem *Escrow*.

---

### Skenario 2: Pengujian Role Worker (Pekerja) & Fitur Panic SOS
1. **Login sebagai Worker**:
   - Masuk menggunakan email: `worker@gmail.com` dan password: `password123`.
2. **Eksplorasi Pasar Kerja & Peta Geolocation**:
   - Buka menu **Cari Pekerjaan / Peta Kerja**.
   - Peta akan menampilkan marker pekerjaan terdekat berdasarkan koordinat GPS.
   - Pilih salah satu pekerjaan dan klik **Lamar Pekerjaan**.
3. **Penyelesaian Pekerjaan**:
   - Buka menu **Pekerjaan Aktif**.
   - Setelah ditugaskan oleh Client, ubah status pekerjaan menjadi **Selesai / Complete**.
4. **Pengujian Tombol Darurat (Panic SOS Button)** 🚨:
   - Pada posisi halaman Worker atau Pekerjaan Aktif, tekan dan tahan tombol **PANIC / SOS** selama 3 detik.
   - Sinyal darurat beserta koordinat lokasi GPSWorker saat ini akan terdeteksi dan dikirim secara real-time ke sistem.
5. **Pengajuan Penarikan Saldo (Withdrawal)**:
   - Setelah Client menyetujui hasil kerja, saldo Escrow masuk ke Dompet Worker.
   - Buka menu **Wallet** -> **Tarik Saldo**, masukkan rekening bank dan nominal penarikan.

---

### Skenario 3: Pengujian Role Administrator & Moderasi
1. **Login sebagai Administrator**:
   - Masuk menggunakan email: `admin@gmail.com` dan password: `admin123`.
2. **Monitoring Real-time Emergency (Panic SOS Logs)**:
   - Buka menu **Panic / Emergency Alert**.
   - Peta Admin akan menampilkan marker darurat merah menyala beserta data Worker yang memicu sinyal Panic.
   - Klik **Tandai Selesai / Resolve** untuk menutup status darurat.
3. **Verifikasi Dokumen KYC (KTP & Swafoto)**:
   - Buka menu **Verifikasi KYC**.
   - Admin dapat melihat foto KTP dan Swafoto yang diunggah oleh `worker2@mail.com`.
   - Klik **Setujui (Approve)** atau **Tolak (Reject)**.
4. **Persetujuan Penarikan Dana (Withdrawal Approval)**:
   - Buka menu **Pencairan Saldo**.
   - Tinjau pengajuan penarikan dana dari Worker dan klik **Disetujui / Approve**.

---

## 🔄 Alur & Flow Sistem (System Flow)

### 1. Flow Registrasi & Verifikasi Identitas (KYC)

```mermaid
sequenceDiagram
    autonumber
    actor Worker
    participant Frontend
    participant Backend (ImgBB API)
    participant Database
    actor Admin

    Worker->>Frontend: Register Account (Role: Worker)
    Frontend->>Backend (ImgBB API): POST /user/register
    Backend (ImgBB API)->>Database: Simpan Data User (status verify: Pending)
    Worker->>Frontend: Upload Foto KTP & Swafoto KYC
    Frontend->>Backend (ImgBB API): POST /verify/request (Multipart/Form Data)
    Backend (ImgBB API)->>Backend (ImgBB API): Upload Foto ke ImgBB CDN API
    Backend (ImgBB API)->>Database: Simpan URL KTP & Swafoto di tabel Verifies
    Admin->>Frontend: Buka Menu Moderasi KYC
    Admin->>Frontend: Setuju / Tolak Permohonan Verifikasi
    Frontend->>Backend (ImgBB API): PUT /verify/status/:id
    Backend (ImgBB API)->>Database: Update status user -> Verified
    Backend (ImgBB API)-->>Worker: Kirim Notifikasi Akun Terverifikasi
```

---

### 2. Flow Siklus Pekerjaan & Escrow (Job Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    actor Client
    actor Worker
    participant Server & DB

    Client->>Server & DB: 1. Buat Pekerjaan Baru (POST /job)
    Worker->>Server & DB: 2. Cari & Melamar Pekerjaan (POST /job/apply)
    Client->>Server & DB: 3. Memilih Worker (POST /job/hire)
    Note over Client,Server & DB: Saldo Client dipotong & ditahan di Escrow
    Worker->>Server & DB: 4. Mulai & Menyelesaikan Pekerjaan (PUT /job/status -> Complete)
    Client->>Server & DB: 5. Verifikasi Hasil & Approve Job (PUT /job/approve)
    Note over Server & DB,Worker: Saldo Escrow dicairkan ke Dompet (Wallet) Worker
    Client->>Server & DB: 6. Memberikan Rating & Ulasan
```

---

### 3. Flow Pembayaran & Top-Up (Midtrans Gateway)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend
    participant Backend
    participant Midtrans API
    participant Database

    User->>Frontend: Input Jumlah Top-Up Saldo
    Frontend->>Backend: POST /payment/topup
    Backend->>Midtrans API: Request Snap Token (Create Transaction)
    Midtrans API-->>Backend: Return Snap Token & Redirect URL
    Backend-->>Frontend: Return Snap Token
    Frontend->>User: Tampilkan Pop-Up Midtrans Snap Widget
    User->>Midtrans API: Selesaikan Pembayaran (VA / QRIS / E-Wallet)
    Midtrans API->>Backend: HTTP Webhook Notification (POST /payment/notification)
    Backend->>Backend: Verifikasi Signature Key Midtrans
    Backend->>Database: Update Status Payment (Success) & Tambahkan Saldo User
    Backend-->>Midtrans API: 200 OK Response
```

---

### 4. Flow Pencairan Saldo (Withdrawal)

```mermaid
sequenceDiagram
    autonumber
    actor Worker
    participant Frontend
    participant Backend & DB
    actor Admin

    Worker->>Frontend: Ajukan Penarikan Saldo (Bank, No. Rekening, Jumlah)
    Frontend->>Backend & DB: POST /payment/withdraw
    Note over Backend & DB: Saldo sementara ditahan (Hold Balance)
    Admin->>Frontend: Lihat Daftar Pengajuan Withdrawal
    Admin->>Backend & DB: Transfer Manual / Disetujui (PUT /payment/withdraw/:id)
    Backend & DB->>Backend & DB: Status -> Success, Potong Saldo Utama Worker
    Backend & DB-->>Worker: Kirim Notifikasi Dana Telah Ditransfer
```

---

### 5. Flow Fitur Darurat Panic SOS

```mermaid
sequenceDiagram
    autonumber
    actor Worker
    participant Mobile/Frontend GPS
    participant Backend & DB
    actor Admin Dashboard

    Worker->>Mobile/Frontend GPS: Tekan Tombol PANIC SOS (Tahan 3 Detik)
    Mobile/Frontend GPS->>Mobile/Frontend GPS: Ambil Koordinat Lat & Long Real-time
    Mobile/Frontend GPS->>Backend & DB: POST /panic (Lat, Long, JobID, Deskripsi)
    Backend & DB->>Database: Simpan Log Alert Panic (Status: ACTIVE)
    Backend & DB-->>Admin Dashboard: Emit Broadcast Alert & Pin Marker Merah di Peta
    Admin Dashboard->>Admin Dashboard: Bunyi Sirine Alarm & Peta Geolocation Darurat
    Admin Dashboard->>Backend & DB: Selesaikan Kasus Darurat (PUT /panic/resolve/:id)
```

---

## 📂 Struktur Direktori Proyek

```
KerjaIn/
├── backend/
│   ├── controller/          # Logic Controller API (User, Job, Payment, Verify, Panic, dll)
│   ├── db/                  # Konfigurasi Koneksi Database Sequelize (db.js)
│   ├── middleware/          # Middleware Express (Auth Token JWT, Role Check)
│   ├── model/               # Model Database Sequelize (User, Job, Worker, Verify, Panic, Payment, dll)
│   ├── route/               # Routing Express API
│   ├── main.js              # Server Entrypoint Express.js
│   └── seedData.js          # Script Seeder Data Pengujian
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Komponen UI Reusable (Navbar, Sidebar, Map, Cards, Modal)
│   │   ├── pages/           # Halaman Aplikasi (Admin, Auth, Client, Worker)
│   │   ├── services/        # Modul HTTP Request Axios API Client
│   │   ├── App.jsx          # Root Component & Routes Navigation
│   │   └── main.jsx         # React Entry Point
│   └── vite.config.js       # Konfigurasi Vite & Tailwind CSS
│
└── README.md                # Dokumentasi Utama Proyek
```

---

## 🌐 Ringkasan API Endpoints

### 🔑 Autentikasi & Pengguna (`/user`)
- `POST /user/register` - Pendaftaran pengguna baru
- `POST /user/login` - Authentikasi & penerbitan Token JWT
- `GET /user/profile` - Mengambil detail profil user yang sedang login

### 🆔 Verifikasi KYC (`/verify`)
- `POST /verify/request` - Mengunggah berkas KTP & Selfie (Upload ke ImgBB)
- `GET /verify/pending` - (Admin) Mengambil daftar pengajuan KYC pending
- `PUT /verify/status/:id` - (Admin) Menyetujui atau menolak verifikasi KYC

### 💼 Kelola Pekerjaan (`/job`)
- `GET /job` - Mengambil daftar semua pekerjaan aktif (dengan filter kategori/lokasi)
- `POST /job` - (Client) Membuat lowongan pekerjaan baru
- `POST /job/apply` - (Worker) Melamar pekerjaan
- `POST /job/hire` - (Client) Menugaskan pekerja terpilih (Hold Escrow)
- `PUT /job/status/:id` - Memperbarui status pekerjaan (In Progress -> Completed)
- `PUT /job/approve/:id` - (Client) Konfirmasi pekerjaan selesai (Release Escrow Saldo)

### 💳 Pembayaran & Dompet (`/payment`)
- `POST /payment/topup` - Generate Midtrans Snap Token untuk pengisian saldo
- `POST /payment/notification` - Webhook callback dari Midtrans
- `POST /payment/withdraw` - (Worker) Mengajukan penarikan saldo ke bank

### 🚨 Darurat Panic SOS (`/panic`)
- `POST /panic` - (Worker) Mengirim sinyal darurat beserta koordinat GPS
- `GET /panic/active` - (Admin) Mengambil daftar status darurat yang sedang aktif
- `PUT /panic/resolve/:id` - (Admin) Menandai status darurat telah ditangani

---

## 📄 Lisensi & Hak Cipta

Diproduksi untuk keperluan pengujian dan kompetisi proyek **KerjaIn**. Seluruh kode sumber dilindungi hak cipta di bawah lisensi ISC.
