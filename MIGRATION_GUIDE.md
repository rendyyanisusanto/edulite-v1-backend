# Cara Menjalankan Migration Counseling Followups

## File yang Sudah Dibuat

✅ **Migration File**: `src/migrations/012-create-counseling-followups-table.js`

## Cara Menjalankan Migration

### Opsi 1: Menggunakan npm run migrate (Recommended)

```bash
cd /home/rendy/Documents/projects/edulite/edulite-v1-backend
npm run migrate
```

**Catatan**: Jika ada error pada migration lain (seperti students table), migration baru tetap akan dijalankan jika tabel belum ada.

### Opsi 2: Menjalankan SQL Langsung ke Database

Jika `npm run migrate` gagal karena issue pada migration lain, jalankan SQL ini langsung:

```bash
# Masuk ke MySQL
mysql -u root -p edulite_v1

# Lalu jalankan SQL berikut:
```

```sql
CREATE TABLE counseling_followups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  followup_by INT NOT NULL,
  followup_date DATETIME NOT NULL,
  notes TEXT,
  status ENUM('DONE', 'PENDING') NOT NULL DEFAULT 'PENDING' COMMENT 'DONE, PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_session_id (session_id),
  INDEX idx_followup_by (followup_by),
  INDEX idx_followup_date (followup_date),
  INDEX idx_status (status),
  
  FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (followup_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catat migration sebagai sudah dijalankan
INSERT INTO SequelizeMigrations (name, timestamp) 
VALUES ('012-create-counseling-followups-table', 12);
```

### Opsi 3: Menggunakan File SQL yang Sudah Ada

```bash
cd /home/rendy/Documents/projects/edulite/edulite-v1-backend
mysql -u root -p edulite_v1 < database/migrations/004_create_counseling_followups_table.sql

# Lalu catat migration:
mysql -u root -p edulite_v1 -e "INSERT INTO SequelizeMigrations (name, timestamp) VALUES ('012-create-counseling-followups-table', 12);"
```

## Verifikasi Migration Berhasil

Setelah menjalankan migration, cek apakah tabel sudah dibuat:

```bash
mysql -u root -p edulite_v1 -e "DESCRIBE counseling_followups;"
```

Output yang diharapkan:
```
+---------------+---------------------------+------+-----+-------------------+
| Field         | Type                      | Null | Key | Default           |
+---------------+---------------------------+------+-----+-------------------+
| id            | int                       | NO   | PRI | NULL              |
| session_id    | int                       | NO   | MUL | NULL              |
| followup_by   | int                       | NO   | MUL | NULL              |
| followup_date | datetime                  | NO   | MUL | NULL              |
| notes         | text                      | YES  |     | NULL              |
| status        | enum('DONE','PENDING')    | NO   | MUL | PENDING           |
| created_at    | datetime                  | NO   |     | CURRENT_TIMESTAMP |
+---------------+---------------------------+------+-----+-------------------+
```

## Restart Backend Server

Setelah migration berhasil, restart backend server:

```bash
# Tekan Ctrl+C untuk stop server yang sedang running
# Lalu jalankan lagi:
npm run dev
```

## Test API Endpoint

Setelah server running, test endpoint:

```bash
curl -H "Authorization: Bearer <your_token>" \
  http://localhost:4000/api/counseling-followups
```

Jika berhasil, Anda akan mendapat response JSON dengan data followups!

## Troubleshooting

### Error: Table already exists
Tabel sudah dibuat sebelumnya, tidak perlu migration lagi.

### Error: Foreign key constraint fails
Pastikan tabel `counseling_sessions` dan `users` sudah ada di database.

### Error: Access denied
Periksa username dan password MySQL Anda di file `.env`.

## Struktur Migration System

```
src/
├── migrations/
│   ├── 001-create-schools-table.js
│   ├── 002-create-academic-years-table.js
│   ├── ...
│   └── 012-create-counseling-followups-table.js  ← File baru
├── utils/
│   └── migration.js  ← Migration runner
└── migrate.js  ← Entry point untuk npm run migrate
```

Migration system akan:
1. Membaca semua file di folder `migrations/`
2. Cek tabel `SequelizeMigrations` untuk melihat migration mana yang sudah dijalankan
3. Jalankan migration yang belum dijalankan secara berurutan
4. Catat migration yang sudah berhasil ke tabel `SequelizeMigrations`
