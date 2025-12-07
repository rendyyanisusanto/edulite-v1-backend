# Student Class History API

API untuk mengelola riwayat penempatan kelas siswa (class assignment history).

## Endpoints

### 1. Get All Student Class History (with Pagination)

**GET** `/api/student-class-history`

**Query Parameters:**
- `page` (optional, default: 1) - Nomor halaman
- `limit` (optional, default: 10, max: 100) - Jumlah data per halaman
- `school_id` (optional) - Filter berdasarkan sekolah
- `student_id` (optional) - Filter berdasarkan siswa
- `academic_year_id` (optional) - Filter berdasarkan tahun ajaran
- `grade_id` (optional) - Filter berdasarkan tingkat/grade
- `class_id` (optional) - Filter berdasarkan kelas
- `assignment_type` (optional) - Filter berdasarkan tipe assignment (AUTO, MANUAL)

**Example Request:**
```bash
GET /api/student-class-history?page=1&limit=20&school_id=1&academic_year_id=1
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "school_id": 1,
      "academic_year_id": 1,
      "grade_id": 10,
      "class_id": 5,
      "assigned_by": 2,
      "assignment_type": "MANUAL",
      "created_at": "2024-07-15T10:30:00.000Z",
      "student": {
        "id": 1,
        "name": "Ahmad Fauzi",
        "nis": "12345"
      },
      "school": {
        "id": 1,
        "name": "SMP Negeri 1 Jakarta"
      },
      "academicYear": {
        "id": 1,
        "name": "2024/2025",
        "is_active": true
      },
      "grade": {
        "id": 10,
        "name": "Grade 10",
        "level": 10
      },
      "class": {
        "id": 5,
        "name": "10 TKJ 1"
      },
      "assignedBy": {
        "id": 2,
        "name": "Admin User",
        "email": "admin@school.com"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Student Class History by ID

**GET** `/api/student-class-history/:id`

**Example Request:**
```bash
GET /api/student-class-history/1
```

**Example Response:**
```json
{
  "id": 1,
  "student_id": 1,
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "assigned_by": 2,
  "assignment_type": "MANUAL",
  "created_at": "2024-07-15T10:30:00.000Z",
  "student": {
    "id": 1,
    "name": "Ahmad Fauzi",
    "nis": "12345"
  },
  "school": {
    "id": 1,
    "name": "SMP Negeri 1 Jakarta"
  },
  "academicYear": {
    "id": 1,
    "name": "2024/2025"
  },
  "grade": {
    "id": 10,
    "name": "Grade 10"
  },
  "class": {
    "id": 5,
    "name": "10 TKJ 1"
  },
  "assignedBy": {
    "id": 2,
    "name": "Admin User"
  }
}
```

---

### 3. Create Student Class History

**POST** `/api/student-class-history`

**Request Body:**
```json
{
  "student_id": 1,
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "assigned_by": 2,
  "assignment_type": "MANUAL"
}
```

**Valid Assignment Types:**
- `AUTO` - Penempatan otomatis oleh sistem
- `MANUAL` - Penempatan manual oleh admin/guru

**Example Response:**
```json
{
  "id": 1,
  "student_id": 1,
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "assigned_by": 2,
  "assignment_type": "MANUAL",
  "created_at": "2024-07-15T10:30:00.000Z"
}
```

---

### 4. Update Student Class History

**PUT** `/api/student-class-history/:id`

**Request Body:**
```json
{
  "student_id": 1,
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 6,
  "assigned_by": 2,
  "assignment_type": "MANUAL"
}
```

**Example Response:**
```json
{
  "id": 1,
  "student_id": 1,
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 6,
  "assigned_by": 2,
  "assignment_type": "MANUAL",
  "created_at": "2024-07-15T10:30:00.000Z"
}
```

---

### 5. Delete Student Class History

**DELETE** `/api/student-class-history/:id`

**Example Request:**
```bash
DELETE /api/student-class-history/1
```

**Example Response:**
```json
{
  "message": "Student class history deleted successfully"
}
```

---

### 6. Bulk Assign Students to Class

**POST** `/api/student-class-history/bulk-assign`

Endpoint khusus untuk menempatkan banyak siswa sekaligus ke dalam satu kelas.

**Request Body:**
```json
{
  "student_ids": [1, 2, 3, 4, 5],
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "assigned_by": 2,
  "assignment_type": "MANUAL"
}
```

**Example Response:**
```json
{
  "message": "Successfully assigned 5 students to class",
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "school_id": 1,
      "academic_year_id": 1,
      "grade_id": 10,
      "class_id": 5,
      "assigned_by": 2,
      "assignment_type": "MANUAL",
      "created_at": "2024-07-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "student_id": 2,
      "school_id": 1,
      "academic_year_id": 1,
      "grade_id": 10,
      "class_id": 5,
      "assigned_by": 2,
      "assignment_type": "MANUAL",
      "created_at": "2024-07-15T10:30:00.000Z"
    }
    // ... 3 more records
  ]
}
```

---

## Use Cases

### 1. Penempatan Siswa Baru di Awal Tahun Ajaran
```json
{
  "student_id": 1,
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "assigned_by": 2,
  "assignment_type": "MANUAL"
}
```

### 2. Penempatan Otomatis (Auto-Assignment)
```json
{
  "student_id": 2,
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 6,
  "assigned_by": null,
  "assignment_type": "AUTO"
}
```

### 3. Bulk Assignment untuk 1 Kelas
```bash
POST /api/student-class-history/bulk-assign
{
  "student_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "assigned_by": 2,
  "assignment_type": "MANUAL"
}
```

### 4. Melihat Riwayat Kelas Siswa
```bash
GET /api/student-class-history?student_id=1&school_id=1
```

### 5. Melihat Daftar Siswa di Kelas Tertentu
```bash
GET /api/student-class-history?class_id=5&academic_year_id=1&school_id=1&limit=50
```

---

## Business Logic

### Tracking History
- Setiap kali siswa dipindahkan ke kelas baru, buat record baru (jangan update yang lama)
- Ini memungkinkan tracking riwayat perpindahan kelas siswa

### Auto vs Manual Assignment
- **AUTO**: Digunakan untuk sistem penempatan otomatis berdasarkan algoritma
- **MANUAL**: Digunakan untuk penempatan manual oleh admin/guru

### Best Practices
1. Untuk awal tahun ajaran, gunakan bulk-assign untuk efisiensi
2. Track `assigned_by` untuk audit trail
3. Gunakan filter `academic_year_id` untuk melihat data per tahun ajaran
4. Jangan hapus history kecuali benar-benar salah input

---

## Notes

- Semua endpoint memerlukan authentication token (Bearer token)
- Assignment type harus salah satu dari: AUTO, MANUAL
- Pagination maksimal 100 data per halaman
- Data diurutkan berdasarkan created_at (terbaru dulu)
- Record bersifat immutable untuk tracking history
