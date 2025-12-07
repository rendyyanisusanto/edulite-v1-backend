# Achievement Management System

Sistem manajemen prestasi siswa dan guru dengan fitur lengkap untuk mencatat kompetisi, peserta, hasil, dan dokumentasi.

## 📋 Fitur Utama

### 1. **Achievement (Prestasi)**
- CRUD prestasi dengan pagination
- Filter berdasarkan jenis event dan tingkat
- Metadata lengkap: judul, deskripsi, penyelenggara, tanggal, lokasi
- Kategori: Lomba, Kompetisi, Kejuaraan, Olimpiade
- Tingkat: Sekolah, Kecamatan, Kabupaten, Provinsi, Nasional, Internasional

### 2. **Participants (Peserta)**
- Tambah siswa sebagai peserta
- Tambah guru sebagai pelatih/pendamping
- Role: Peserta, Pelatih, Pendamping
- Catatan untuk setiap peserta

### 3. **Results (Hasil)**
- Pencatatan hasil per peserta
- Rank: Juara 1, Juara 2, Harapan, Finalis, dll
- Score (nilai jika ada)
- Kategori: Tunggal, Beregu, Putra/Putri
- Upload sertifikat ke MinIO

### 4. **Documents (Dokumentasi)**
- Upload dokumentasi foto/dokumen ke MinIO
- Caption untuk setiap dokumen
- Tipe: image, document, certificate
- Multiple documents per achievement

## 🗄️ Database Schema

### `achievements`
```sql
- id (PK)
- school_id (FK -> schools)
- title
- description
- event_type (Lomba, Kompetisi, dll)
- level (Sekolah, Kecamatan, dll)
- organizer
- event_date
- location
- created_at, updated_at
- created_by (FK -> users)
```

### `achievement_participants`
```sql
- id (PK)
- achievement_id (FK -> achievements)
- student_id (FK -> students, nullable)
- teacher_id (FK -> teachers, nullable)
- role (Peserta, Pelatih, Pendamping)
- notes
```

### `achievement_results`
```sql
- id (PK)
- participant_id (FK -> achievement_participants)
- rank
- score
- category
- certificate_file (URL MinIO)
- certificate_key (Key MinIO)
- notes
```

### `achievement_documents`
```sql
- id (PK)
- achievement_id (FK -> achievements)
- file_path (URL MinIO)
- file_key (Key MinIO)
- caption
- file_type
- created_at
```

## 🚀 Quick Start

### 1. Jalankan Migration
```bash
mysql -u username -p edulite_db < database/migrations/create_achievements_tables.sql
```

### 2. Import Models di Code
Models sudah otomatis ter-register di `src/core/models/index.js`

### 3. Test API Endpoints

#### Create Achievement
```bash
curl -X POST http://localhost:4000/api/achievements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Olimpiade Matematika Nasional",
    "event_type": "Olimpiade",
    "level": "Nasional",
    "event_date": "2025-08-15",
    "location": "Jakarta"
  }'
```

#### Add Participant
```bash
curl -X POST http://localhost:4000/api/achievements/1/participants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 100,
    "role": "Peserta"
  }'
```

#### Add Result
```bash
curl -X POST http://localhost:4000/api/achievements/1/participants/1/results \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rank": "Juara 1",
    "score": "95",
    "category": "Tunggal"
  }'
```

#### Upload Certificate
```bash
curl -X POST http://localhost:4000/api/achievements/1/participants/1/results/1/certificate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "certificate=@certificate.jpg"
```

## 📡 API Endpoints

### Achievements
- `GET /api/achievements` - List all (with pagination & filters)
- `GET /api/achievements/:id` - Get by ID
- `POST /api/achievements` - Create
- `PUT /api/achievements/:id` - Update
- `DELETE /api/achievements/:id` - Delete

### Participants
- `POST /api/achievements/:achievement_id/participants` - Add
- `PUT /api/achievements/:achievement_id/participants/:participant_id` - Update
- `DELETE /api/achievements/:achievement_id/participants/:participant_id` - Delete

### Results
- `POST /api/achievements/:achievement_id/participants/:participant_id/results` - Add
- `PUT /api/achievements/:achievement_id/participants/:participant_id/results/:result_id` - Update
- `DELETE /api/achievements/:achievement_id/participants/:participant_id/results/:result_id` - Delete

### Certificates
- `POST /api/achievements/:achievement_id/participants/:participant_id/results/:result_id/certificate` - Upload
- `DELETE /api/achievements/:achievement_id/participants/:participant_id/results/:result_id/certificate` - Delete

### Documents
- `POST /api/achievements/:achievement_id/documents` - Upload
- `DELETE /api/achievements/:achievement_id/documents/:document_id` - Delete

## 🎯 Use Cases

### Skenario 1: Lomba Matematika Tunggal
1. Create achievement untuk "Olimpiade Matematika Kota"
2. Add siswa sebagai peserta
3. Add guru sebagai pelatih
4. Add result: Juara 1, score 95, category tunggal
5. Upload certificate sertifikat
6. Upload dokumentasi foto

### Skenario 2: Kompetisi Beregu
1. Create achievement untuk "Kompetisi Robotik Provinsi"
2. Add 3 siswa sebagai peserta
3. Add guru sebagai pendamping
4. Add result untuk setiap siswa: Juara 2, category beregu
5. Upload certificate untuk tim
6. Upload dokumentasi kegiatan

### Skenario 3: Multiple Kategori
1. Create achievement "Olimpiade Sains"
2. Add siswa A sebagai peserta
3. Add result 1: Juara 1, category Fisika
4. Add result 2: Juara 2, category Kimia
5. Upload 2 certificate berbeda

## 🔐 Security & Validation

- ✅ Authentication required (JWT Bearer Token)
- ✅ School-scoped data (semua query filtered by school_id)
- ✅ File size limit: 5MB
- ✅ Allowed file types: image/jpeg, image/jpg, image/png, image/gif, image/webp
- ✅ Cascade delete dengan auto file cleanup
- ✅ Validation: participant harus punya student_id ATAU teacher_id

## 📦 File Storage

Files disimpan di MinIO dengan struktur:
```
edulite-students/
├── achievements/
│   ├── certificates/
│   │   └── {timestamp}-{filename}
│   └── documents/
│       └── {timestamp}-{filename}
```

## 🎨 Frontend Integration

Lihat file dokumentasi lengkap:
- **API Documentation**: `docs/API_ACHIEVEMENTS.md`
- **Frontend Examples**: `docs/FRONTEND_ACHIEVEMENTS.md`

Contoh komponen React tersedia untuk:
- Achievement list dengan pagination
- Achievement form
- Participant management
- Certificate upload
- Document upload

## ⚡ Performance

- Pagination default: 10 items per page
- Max limit: 100 items per page
- Indexes pada: school_id, event_type, level
- Eager loading relations untuk mengurangi N+1 queries

## 🔄 Cascade Delete Behavior

Ketika achievement dihapus:
1. Semua participants terhapus
2. Semua results terhapus
3. Semua documents terhapus
4. Semua certificate files di MinIO terhapus
5. Semua document files di MinIO terhapus

Ketika participant dihapus:
1. Semua results terhapus
2. Semua certificate files di MinIO terhapus

## 📊 Reporting Ideas (Future Enhancement)

- Total prestasi per tingkat (Nasional, Provinsi, dll)
- Total prestasi per jenis event
- Top students dengan prestasi terbanyak
- Achievement timeline per academic year
- Export data prestasi ke PDF/Excel
- Statistik pelatih terbaik

## 🐛 Troubleshooting

### Error: "Achievement not found"
- Pastikan achievement ID valid
- Pastikan achievement belongs to school_id user yang login

### Error: "Either student_id or teacher_id is required"
- Participant harus punya salah satu: student_id atau teacher_id
- Tidak boleh kosong kedua-duanya

### File Upload Error
- Pastikan file size < 5MB
- Pastikan file type adalah gambar
- Pastikan MinIO bucket "edulite-students" sudah dibuat
- Check MinIO credentials di config/minio.js

### Cascade Delete Tidak Bekerja
- Pastikan foreign key constraint ON DELETE CASCADE sudah di-set
- Jalankan ulang migration jika perlu

## 📝 Example Data

```javascript
// Achievement Example
{
  "title": "Olimpiade Sains Nasional 2025",
  "description": "Kompetisi sains tingkat nasional",
  "event_type": "Olimpiade",
  "level": "Nasional",
  "organizer": "Kemendikbud RI",
  "event_date": "2025-08-15",
  "location": "Jakarta Convention Center"
}

// Participant Example (Student)
{
  "student_id": 100,
  "role": "Peserta",
  "notes": "Wakil dari SMKN 1 Jakarta"
}

// Participant Example (Teacher)
{
  "teacher_id": 50,
  "role": "Pelatih",
  "notes": "Guru Pembina Matematika"
}

// Result Example
{
  "rank": "Juara 1",
  "score": "95.5",
  "category": "Tunggal Putra",
  "notes": "Skor tertinggi se-Indonesia"
}
```

## 🎓 Best Practices

1. **Selalu tambah achievement dulu** sebelum participants
2. **Tambah participants dulu** sebelum results
3. **Upload certificate** setelah result dibuat
4. **Gunakan filter** untuk performa lebih baik di list besar
5. **Backup files** sebelum delete achievement besar
6. **Validasi input** di frontend sebelum kirim ke API
7. **Handle loading states** saat upload file
8. **Show preview** sebelum upload file

## 📚 Related Documentation

- [API Documentation](./API_ACHIEVEMENTS.md)
- [Frontend Integration Guide](./FRONTEND_ACHIEVEMENTS.md)
- [MinIO Setup Guide](./MINIO_SETUP.md)
- [Database Schema](../database/schema.sql)
- [Migration Files](../database/migrations/)

## 🤝 Contributing

Fitur yang bisa ditambahkan:
- [ ] Bulk import participants dari Excel
- [ ] Email notification saat prestasi baru ditambahkan
- [ ] Achievement templates untuk event recurring
- [ ] Integration dengan sistem sertifikat digital
- [ ] Public achievement gallery/showcase
- [ ] Export laporan prestasi per periode

---

**Version**: 1.0.0  
**Last Updated**: 18 November 2025  
**Author**: Backend Team
