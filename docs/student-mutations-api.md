# Student Mutations API

API untuk mengelola mutasi siswa (masuk, pindah, keluar).

## Endpoints

### 1. Get All Student Mutations (with Pagination)

**GET** `/api/student-mutations`

**Query Parameters:**
- `page` (optional, default: 1) - Nomor halaman
- `limit` (optional, default: 10, max: 100) - Jumlah data per halaman
- `school_id` (optional) - Filter berdasarkan sekolah
- `student_id` (optional) - Filter berdasarkan siswa
- `type` (optional) - Filter berdasarkan tipe (MASUK, PINDAH, KELUAR)

**Example Request:**
```bash
GET /api/student-mutations?page=1&limit=10&school_id=1&type=MASUK
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "school_id": 1,
      "type": "MASUK",
      "from_school": "SD Negeri 1 Jakarta",
      "to_school": null,
      "reason": "Pindah dari sekolah lama",
      "date": "2024-07-15",
      "created_at": "2024-07-15T10:30:00.000Z",
      "created_by": 2,
      "student": {
        "id": 1,
        "name": "Ahmad Fauzi",
        "nis": "12345"
      },
      "school": {
        "id": 1,
        "name": "SMP Negeri 1 Jakarta"
      },
      "creator": {
        "id": 2,
        "name": "Admin User",
        "email": "admin@school.com"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Student Mutation by ID

**GET** `/api/student-mutations/:id`

**Example Request:**
```bash
GET /api/student-mutations/1
```

**Example Response:**
```json
{
  "id": 1,
  "student_id": 1,
  "school_id": 1,
  "type": "MASUK",
  "from_school": "SD Negeri 1 Jakarta",
  "to_school": null,
  "reason": "Pindah dari sekolah lama",
  "date": "2024-07-15",
  "created_at": "2024-07-15T10:30:00.000Z",
  "created_by": 2,
  "student": {
    "id": 1,
    "name": "Ahmad Fauzi",
    "nis": "12345"
  },
  "school": {
    "id": 1,
    "name": "SMP Negeri 1 Jakarta"
  },
  "creator": {
    "id": 2,
    "name": "Admin User",
    "email": "admin@school.com"
  }
}
```

---

### 3. Create Student Mutation

**POST** `/api/student-mutations`

**Request Body:**
```json
{
  "student_id": 1,
  "school_id": 1,
  "type": "MASUK",
  "from_school": "SD Negeri 1 Jakarta",
  "to_school": null,
  "reason": "Pindah dari sekolah lama karena orang tua pindah tugas",
  "date": "2024-07-15",
  "created_by": 2
}
```

**Valid Types:**
- `MASUK` - Siswa masuk/pindahan dari sekolah lain
- `PINDAH` - Siswa pindah ke sekolah lain
- `KELUAR` - Siswa keluar dari sekolah

**Field Usage by Type:**
- **MASUK**: Isi `from_school`, `to_school` = null
- **PINDAH**: Isi `to_school`, `from_school` = null atau nama sekolah saat ini
- **KELUAR**: Isi `to_school`, `from_school` = null

**Example Response:**
```json
{
  "id": 1,
  "student_id": 1,
  "school_id": 1,
  "type": "MASUK",
  "from_school": "SD Negeri 1 Jakarta",
  "to_school": null,
  "reason": "Pindah dari sekolah lama karena orang tua pindah tugas",
  "date": "2024-07-15",
  "created_at": "2024-07-15T10:30:00.000Z",
  "created_by": 2
}
```

---

### 4. Update Student Mutation

**PUT** `/api/student-mutations/:id`

**Request Body:**
```json
{
  "student_id": 1,
  "school_id": 1,
  "type": "MASUK",
  "from_school": "SD Negeri 1 Jakarta (Updated)",
  "to_school": null,
  "reason": "Updated reason",
  "date": "2024-07-15"
}
```

**Example Response:**
```json
{
  "id": 1,
  "student_id": 1,
  "school_id": 1,
  "type": "MASUK",
  "from_school": "SD Negeri 1 Jakarta (Updated)",
  "to_school": null,
  "reason": "Updated reason",
  "date": "2024-07-15",
  "created_at": "2024-07-15T10:30:00.000Z",
  "created_by": 2
}
```

---

### 5. Delete Student Mutation

**DELETE** `/api/student-mutations/:id`

**Example Request:**
```bash
DELETE /api/student-mutations/1
```

**Example Response:**
```json
{
  "message": "Student mutation deleted successfully"
}
```

---

## Use Cases

### 1. Siswa Masuk Baru (dari sekolah lain)
```json
{
  "student_id": 1,
  "school_id": 1,
  "type": "MASUK",
  "from_school": "SD Negeri 5 Bandung",
  "to_school": null,
  "reason": "Orang tua pindah kerja ke Jakarta",
  "date": "2024-07-15",
  "created_by": 2
}
```

### 2. Siswa Pindah ke Sekolah Lain
```json
{
  "student_id": 2,
  "school_id": 1,
  "type": "PINDAH",
  "from_school": null,
  "to_school": "SMP Negeri 3 Surabaya",
  "reason": "Mengikuti orang tua pindah ke Surabaya",
  "date": "2024-08-20",
  "created_by": 2
}
```

### 3. Siswa Keluar
```json
{
  "student_id": 3,
  "school_id": 1,
  "type": "KELUAR",
  "from_school": null,
  "to_school": "Homeschooling",
  "reason": "Pindah ke sistem homeschooling",
  "date": "2024-09-10",
  "created_by": 2
}
```

---

## Notes

- Semua endpoint memerlukan authentication token (Bearer token)
- Type harus salah satu dari: MASUK, PINDAH, KELUAR
- Date format: YYYY-MM-DD
- Pagination maksimal 100 data per halaman
- Data diurutkan berdasarkan tanggal mutasi (terbaru dulu)
