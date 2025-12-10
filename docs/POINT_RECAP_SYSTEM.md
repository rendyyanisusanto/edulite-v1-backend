# Point Recap System - Rekapitulasi Poin Pelanggaran & Reward

## Overview
Sistem Rekapitulasi Poin adalah fitur untuk menghitung, memantau, dan mengelola akumulasi poin pelanggaran dan reward siswa. Sistem ini mendukung rekapitulasi per siswa, per kelas, dan per tingkat dengan periode semester.

## Database Schema

### 1. Table: student_point_recap
Menyimpan rekapitulasi poin per siswa per periode.

**Columns:**
- `id` - Primary key
- `student_id` - Foreign key ke tabel students
- `school_id` - Foreign key ke tabel schools
- `academic_year_id` - Foreign key ke tabel academic_years
- `semester` - 1 (Ganjil) atau 2 (Genap)
- `total_violations` - Total jumlah pelanggaran
- `total_violation_points` - Total poin pelanggaran
- `total_rewards` - Total jumlah reward
- `total_reward_points` - Total poin reward
- `net_points` - Poin bersih (reward - violation)
- `status` - ACTIVE atau ARCHIVED
- `calculated_at` - Timestamp kalkulasi terakhir

**Unique Index:** `(student_id, academic_year_id, semester)`

### 2. Table: class_point_recap
Menyimpan rekapitulasi poin per kelas per periode.

**Key Metrics:**
- Total siswa di kelas
- Statistik pelanggaran dan reward
- Rata-rata poin per siswa
- Distribusi siswa berdasarkan kategori poin (positif/negatif/netral)

### 3. Table: grade_point_recap
Menyimpan rekapitulasi poin per tingkat kelas per periode.

**Key Metrics:**
- Total siswa dan kelas
- Statistik agregat pelanggaran dan reward
- Rata-rata poin tingkat

### 4. Table: point_recap_logs
Log history kalkulasi rekapitulasi.

## Stored Procedure

### sp_calculate_student_point_recap
Stored procedure untuk menghitung rekapitulasi poin siswa.

**Parameters:**
- `p_student_id` - ID siswa
- `p_school_id` - ID sekolah
- `p_academic_year_id` - ID tahun ajaran
- `p_semester` - Semester (1 atau 2)

**Logic:**
1. Hitung total pelanggaran dan poin (hanya status APPROVED & ACTIONED)
2. Hitung total reward dan poin (hanya status APPROVED & ACTIONED)
3. Hitung net_points = total_reward_points - total_violation_points
4. Insert or update ke tabel student_point_recap

**Semester Filter:**
- Semester 1: Bulan 7-12 (Juli-Desember)
- Semester 2: Bulan 1-6 (Januari-Juni)

## Database Triggers

### Auto-Update Triggers
Sistem menggunakan triggers untuk otomatis update rekapitulasi saat:

1. **trg_update_recap_after_violation_insert**
   - Trigger AFTER INSERT pada student_violations
   - Auto-recalculate jika status APPROVED/ACTIONED

2. **trg_update_recap_after_violation_update**
   - Trigger AFTER UPDATE pada student_violations
   - Auto-recalculate jika status atau type berubah

3. **trg_update_recap_after_reward_insert**
   - Trigger AFTER INSERT pada student_rewards
   - Auto-recalculate jika status APPROVED/ACTIONED

4. **trg_update_recap_after_reward_update**
   - Trigger AFTER UPDATE pada student_rewards
   - Auto-recalculate jika status atau type berubah

## API Endpoints

### 1. GET /api/point-recap/students
Mendapatkan rekapitulasi poin siswa dengan filter.

**Query Parameters:**
- `academic_year_id` - Filter tahun ajaran (required)
- `semester` - Filter semester (required)
- `grade_id` - Filter tingkat kelas (optional)
- `class_id` - Filter kelas (optional)
- `student_id` - Filter siswa tertentu (optional)
- `sort_by` - Field untuk sorting (default: net_points)
- `sort_order` - ASC atau DESC (default: DESC)
- `page` - Halaman pagination (default: 1)
- `limit` - Items per halaman (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": 123,
      "nis": "12345",
      "nisn": "0012345678",
      "student_name": "Ahmad Rizki",
      "class_name": "X RPL 1",
      "grade_name": "X",
      "total_violations": 5,
      "total_violation_points": 25,
      "total_rewards": 8,
      "total_reward_points": 40,
      "net_points": 15,
      "point_category": "POSITIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

### 2. GET /api/point-recap/students/:id
Mendapatkan detail poin siswa tertentu.

**Query Parameters:**
- `academic_year_id` - Tahun ajaran (optional)
- `semester` - Semester (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "recap": {
      "student_name": "Ahmad Rizki",
      "nis": "12345",
      "class_name": "X RPL 1",
      "total_violations": 5,
      "total_violation_points": 25,
      "total_rewards": 8,
      "total_reward_points": 40,
      "net_points": 15
    },
    "violations": [
      {
        "id": 1,
        "date": "2024-09-15",
        "type_name": "Terlambat",
        "level_name": "Ringan",
        "point": 5,
        "location": "Gerbang Sekolah"
      }
    ],
    "rewards": [
      {
        "id": 1,
        "date": "2024-09-20",
        "type_name": "Juara Lomba",
        "level_name": "Sedang",
        "point": 10,
        "location": "Aula Sekolah"
      }
    ]
  }
}
```

### 3. GET /api/point-recap/classes
Mendapatkan rekapitulasi poin per kelas.

**Query Parameters:**
- `academic_year_id` - Tahun ajaran
- `semester` - Semester
- `grade_id` - Filter tingkat (optional)
- `page` - Pagination
- `limit` - Items per halaman

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "class_name": "X RPL 1",
      "grade_name": "X",
      "total_students": 32,
      "total_violations": 45,
      "total_violation_points": 225,
      "total_rewards": 68,
      "total_reward_points": 340,
      "avg_net_points": 3.59,
      "students_with_positive_points": 20,
      "students_with_negative_points": 8,
      "students_with_zero_points": 4
    }
  ]
}
```

### 4. GET /api/point-recap/grades
Mendapatkan rekapitulasi poin per tingkat.

**Query Parameters:**
- `academic_year_id` - Tahun ajaran
- `semester` - Semester

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "grade_name": "X",
      "level": 10,
      "total_students": 128,
      "total_classes": 4,
      "total_violations": 180,
      "total_violation_points": 900,
      "total_rewards": 272,
      "total_reward_points": 1360,
      "avg_net_points": 3.59
    }
  ]
}
```

### 5. POST /api/point-recap/calculate
Menghitung ulang rekapitulasi poin.

**Request Body:**
```json
{
  "academic_year_id": 1,
  "semester": 1,
  "student_id": 123  // optional, jika kosong hitung semua siswa
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rekapitulasi berhasil dihitung untuk 120 siswa"
}
```

### 6. GET /api/point-recap/dashboard
Mendapatkan statistik dashboard.

**Query Parameters:**
- `academic_year_id` - Tahun ajaran (required)
- `semester` - Semester (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "total_students": 120,
      "total_violations": 450,
      "total_violation_points": 2250,
      "total_rewards": 680,
      "total_reward_points": 3400,
      "total_net_points": 1150,
      "avg_net_points": 9.58,
      "students_with_positive": 80,
      "students_with_negative": 30,
      "students_with_zero": 10
    },
    "topStudents": [
      {
        "student_name": "Ahmad Rizki",
        "nis": "12345",
        "class_name": "X RPL 1",
        "net_points": 45,
        "total_rewards": 10,
        "total_violations": 1
      }
    ],
    "bottomStudents": [...],
    "classRanking": [...]
  }
}
```

### 7. GET /api/point-recap/export
Export data rekapitulasi.

**Query Parameters:**
- `academic_year_id` - Tahun ajaran
- `semester` - Semester
- `grade_id` - Filter tingkat (optional)
- `class_id` - Filter kelas (optional)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Data siap untuk diekspor"
}
```

## Frontend Components

### 1. PointRecapPage.vue
Halaman utama rekapitulasi poin dengan fitur:

**Features:**
- Tab navigation (Per Siswa, Per Kelas, Per Tingkat)
- Dashboard statistics cards
- Advanced filtering (tahun ajaran, semester, tingkat, kelas)
- Pagination untuk data siswa
- Detail modal untuk melihat breakdown poin siswa
- Calculate modal untuk recalculate rekap
- Export to CSV functionality

**UI Components:**
- Statistics cards dengan icon dan warna berbeda
- Filter cards dengan multiple dropdowns
- Responsive table dengan color-coded points
- Modal untuk detail dan kalkulasi
- Pagination dengan ellipsis

### 2. pointRecapService.js
Service untuk handle API calls ke backend.

**Methods:**
- `getStudentPointRecap(params)` - Get student recap list
- `getStudentPointDetail(studentId, params)` - Get student detail
- `getClassPointRecap(params)` - Get class recap
- `getGradePointRecap(params)` - Get grade recap
- `calculatePointRecap(data)` - Trigger recalculation
- `getDashboardStats(params)` - Get dashboard stats
- `exportPointRecap(params)` - Export data

## Business Logic

### Point Calculation Rules

1. **Status Filter**
   - Hanya pelanggaran/reward dengan status APPROVED atau ACTIONED yang dihitung
   - Status NEW dan REJECTED tidak masuk perhitungan

2. **Semester Filter**
   - Semester 1: Transaksi bulan Juli-Desember (7-12)
   - Semester 2: Transaksi bulan Januari-Juni (1-6)

3. **Net Points Calculation**
   ```
   net_points = total_reward_points - total_violation_points
   ```

4. **Point Category**
   - POSITIVE: net_points > 0
   - NEGATIVE: net_points < 0
   - NEUTRAL: net_points = 0

### Aggregation Logic

**Class Level:**
- Sum all student violations/rewards in class
- Calculate averages
- Count students by category

**Grade Level:**
- Aggregate from all classes in grade
- Calculate overall statistics

## Usage Guide

### 1. Setup Database
```bash
# Run migration
mysql -u username -p database_name < database/migrations/create_point_recap_tables.sql
```

### 2. Calculate Initial Recap
```bash
# Via API atau frontend
POST /api/point-recap/calculate
{
  "academic_year_id": 1,
  "semester": 1
}
```

### 3. Access Point Recap Page
Navigate to: `/admin/point-recap`

### 4. Filter Data
1. Pilih Tahun Ajaran (required)
2. Pilih Semester (required)
3. Optional: Filter by Grade/Class
4. Click tab untuk melihat Per Siswa/Kelas/Tingkat

### 5. View Detail
Click tombol "Detail" pada baris siswa untuk melihat:
- Info siswa lengkap
- Daftar semua pelanggaran
- Daftar semua reward

### 6. Recalculate
1. Click tombol "Hitung Ulang Rekap"
2. Pilih tahun ajaran dan semester
3. Konfirmasi
4. Sistem akan recalculate untuk semua siswa

### 7. Export Data
1. Set filter yang diinginkan
2. Click tombol "Export Excel"
3. File CSV akan terdownload

## Performance Optimization

1. **Indexing**
   - Composite index pada (student_id, academic_year_id, semester)
   - Index pada school_id, net_points untuk sorting

2. **Triggers**
   - Auto-update hanya untuk status yang relevant
   - Minimal query dalam trigger

3. **Pagination**
   - Default 50 items per page
   - Efficient counting query

4. **Caching**
   - Dashboard stats dapat di-cache
   - Class/Grade recap relatif stabil

## Testing Checklist

- [ ] Insert pelanggaran baru → rekap auto-update
- [ ] Insert reward baru → rekap auto-update
- [ ] Update status violation → rekap recalculate
- [ ] Filter by semester correctly
- [ ] Pagination works correctly
- [ ] Export generates correct CSV
- [ ] Detail modal shows complete data
- [ ] Dashboard stats accurate
- [ ] Class/Grade aggregation correct
- [ ] Negative points displayed correctly

## Future Enhancements

1. **Trend Analysis**
   - Chart perkembangan poin per bulan
   - Comparison antar semester

2. **Alert System**
   - Notifikasi untuk siswa dengan poin sangat negatif
   - Warning untuk kelas dengan rata-rata rendah

3. **Advanced Export**
   - PDF report dengan charts
   - Excel dengan formatting

4. **Ranking System**
   - Peringkat per kelas
   - Peringkat per tingkat
   - Hall of fame

5. **Point History**
   - Timeline view poin siswa
   - History changes

## Troubleshooting

**Q: Rekap tidak update otomatis?**
A: Pastikan triggers sudah ter-install dengan benar. Cek status violation/reward apakah APPROVED/ACTIONED.

**Q: Total tidak sesuai?**
A: Jalankan recalculation manual via API atau frontend.

**Q: Export tidak berfungsi?**
A: Pastikan ada data dengan filter yang dipilih. Check console untuk error.

**Q: Dashboard stats kosong?**
A: Harus pilih tahun ajaran dan semester terlebih dahulu.

---

**Author:** EduLite Development Team
**Last Updated:** December 2024
**Version:** 1.0.0
