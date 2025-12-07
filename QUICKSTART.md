# 🎯 Quick Start Guide

## Setup Cepat dalam 5 Menit

### 1️⃣ Clone & Install (1 menit)
```bash
cd backend
npm install
```

### 2️⃣ Setup Database (2 menit)
```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE edulite_db;
EXIT;
```

### 3️⃣ Konfigurasi Environment (30 detik)
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL Anda
```

### 4️⃣ Seed Data (30 detik)
```bash
npm run seed
```

### 5️⃣ Jalankan Server (10 detik)
```bash
npm run dev
```

## ✅ Testing API

### Login sebagai SuperAdmin
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@edulite.id","password":"admin123"}'
```

Copy `access_token` dari response, lalu test endpoint lain:

```bash
# Ganti YOUR_TOKEN dengan access_token yang didapat
curl -X GET http://localhost:4000/api/schools \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎉 Selesai!

Server berjalan di: http://localhost:4000

**Default Login:**
- SuperAdmin: `superadmin@edulite.id` / `admin123`
- School Admin: `admin@sdn1-jakarta.edulite.id` / `admin123`
- Teacher: `budi.guru@sdn1-jakarta.edulite.id` / `guru123`

Lihat `SETUP.md` untuk panduan lengkap dan `README.md` untuk dokumentasi API.
