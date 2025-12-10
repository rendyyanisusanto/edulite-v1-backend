# Student Documents Module

Module untuk mengelola dokumen administrasi siswa seperti Akta Kelahiran, KK, KTP Orang Tua, Ijazah, dll.

## Features

### Backend (API)
- ✅ CRUD Document Types (Jenis Dokumen)
- ✅ CRUD Student Documents
- ✅ Upload file dokumen ke MinIO
- ✅ Delete file dokumen
- ✅ Get documents by student
- ✅ Statistics dokumen

### Frontend
- ✅ Halaman list dokumen siswa dengan filter
- ✅ Form tambah/edit dokumen
- ✅ Upload file modal
- ✅ Statistics cards
- ✅ Pagination
- ✅ Integration dengan MinIO untuk file storage

## Database Schema

### Table: `document_types`
Menyimpan jenis-jenis dokumen yang bisa dimiliki siswa.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| school_id | INT | Foreign key ke schools |
| code | VARCHAR(50) | Kode dokumen (AKTA, KK, dll) |
| name | VARCHAR(100) | Nama dokumen |
| required | BOOLEAN | Wajib atau tidak |
| description | TEXT | Deskripsi |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### Table: `student_documents`
Menyimpan dokumen-dokumen yang dimiliki siswa.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| school_id | INT | Foreign key ke schools |
| student_id | INT | Foreign key ke students |
| document_type_id | INT | Foreign key ke document_types |
| document_type | VARCHAR(100) | Nama jenis dokumen |
| document_number | VARCHAR(100) | Nomor dokumen |
| issued_date | DATE | Tanggal terbit |
| document_file | VARCHAR(255) | URL file di MinIO |
| document_key | VARCHAR(255) | Key file di MinIO |
| notes | TEXT | Catatan |
| created_at | TIMESTAMP | Waktu dibuat |
| created_by | INT | Foreign key ke users |
| updated_at | TIMESTAMP | Waktu diupdate |
| updated_by | INT | Foreign key ke users |

## API Endpoints

### Document Types
- `GET /api/student-documents/types` - Get all document types
- `GET /api/student-documents/types/:id` - Get document type by ID
- `POST /api/student-documents/types` - Create document type
- `PUT /api/student-documents/types/:id` - Update document type
- `DELETE /api/student-documents/types/:id` - Delete document type

### Student Documents
- `GET /api/student-documents` - Get all documents with filters
- `GET /api/student-documents/statistics` - Get statistics
- `GET /api/student-documents/student/:student_id` - Get documents by student
- `GET /api/student-documents/:id` - Get document by ID
- `POST /api/student-documents` - Create document
- `PUT /api/student-documents/:id` - Update document
- `DELETE /api/student-documents/:id` - Delete document
- `POST /api/student-documents/:id/upload` - Upload file
- `DELETE /api/student-documents/:id/file` - Delete file only

## Installation

### 1. Run Database Migration

```bash
cd edulite-v1-backend
mysql -u root -p your_database < database/migrations/create_document_types_table.sql
mysql -u root -p your_database < database/migrations/create_student_documents_table.sql
```

### 2. Start Backend Server

```bash
cd edulite-v1-backend
npm run dev
```

### 3. Start Frontend Server

```bash
cd edulite-v1-frontend
npm run dev
```

## Usage

### Akses Menu
1. Login ke admin panel
2. Buka sidebar menu "Manajemen Siswa"
3. Klik "Dokumen Siswa"

### Menambah Dokumen
1. Klik tombol "Tambah Dokumen"
2. Pilih siswa
3. Pilih jenis dokumen atau ketik manual
4. Isi detail dokumen (nomor, tanggal terbit, dll)
5. Upload file (opsional, bisa diupload nanti)
6. Klik "Simpan"

### Upload File
1. Pada list dokumen, cari dokumen yang belum ada file
2. Klik tombol "Upload"
3. Drag & drop atau klik untuk pilih file
4. Klik "Upload"

### Edit Dokumen
1. Klik tombol edit (pensil) pada dokumen
2. Edit informasi yang diperlukan
3. Klik "Update"

### Hapus Dokumen
1. Klik tombol hapus (trash) pada dokumen
2. Konfirmasi penghapusan
3. File akan otomatis terhapus dari MinIO

## Default Document Types

Saat migration, akan otomatis dibuatkan jenis dokumen default:
- Akta Kelahiran (Wajib)
- Kartu Keluarga (Wajib)
- KTP Ayah (Wajib)
- KTP Ibu (Wajib)
- Ijazah Terakhir (Wajib)
- SKHUN
- Kartu Vaksin
- Raport
- Pas Foto (Wajib)
- Surat Pindah
- Surat Kelakuan Baik
- KIP
- PKH
- Surat Keterangan Lainnya

## File Storage

File dokumen disimpan di MinIO dengan struktur:
```
bucket: edulite
path: student-documents/[filename]
```

Format file yang didukung:
- PDF
- JPG/JPEG
- PNG
- DOC/DOCX

Maksimal ukuran file: 10MB

## Notes

- Setiap school memiliki document types sendiri
- File otomatis terhapus dari MinIO saat dokumen dihapus
- Support upload file saat create atau upload terpisah setelah create
- Dokumen bisa difilter berdasarkan siswa atau jenis dokumen
