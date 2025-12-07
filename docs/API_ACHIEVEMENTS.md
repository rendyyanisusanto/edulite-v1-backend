# API Documentation: Achievements

## Base URL
```
http://localhost:4000/api/achievements
```

## Authentication
Semua endpoint memerlukan Bearer Token di header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Achievement Endpoints

### 1.1 Get All Achievements (with Pagination)
```http
GET /api/achievements
```

**Query Parameters:**
- `page` (optional): Halaman yang ingin ditampilkan (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `event_type` (optional): Filter berdasarkan tipe event
- `level` (optional): Filter berdasarkan level

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "school_id": 1,
      "title": "Olimpiade Matematika Nasional 2025",
      "description": "Kompetisi matematika tingkat nasional",
      "event_type": "Olimpiade",
      "level": "Nasional",
      "organizer": "Kemendikbud",
      "event_date": "2025-08-15",
      "location": "Jakarta",
      "created_at": "2025-11-18T10:00:00.000Z",
      "updated_at": "2025-11-18T10:00:00.000Z",
      "created_by": 1,
      "school": {
        "id": 1,
        "name": "SMKN 1 Jakarta"
      },
      "creator": {
        "id": 1,
        "name": "Admin School",
        "email": "admin@school.com"
      },
      "participants": [
        {
          "id": 1,
          "achievement_id": 1,
          "student_id": 100,
          "teacher_id": null,
          "role": "Peserta",
          "notes": "Juara 1",
          "student": {
            "id": 100,
            "full_name": "Ahmad Fauzi",
            "nisn": "1234567890"
          },
          "teacher": null,
          "results": [
            {
              "id": 1,
              "participant_id": 1,
              "rank": "Juara 1",
              "score": "95",
              "category": "Tunggal",
              "certificate_file": "https://minio.example.com/edulite-students/achievements/certificates/...",
              "certificate_key": "achievements/certificates/...",
              "notes": "Skor tertinggi"
            }
          ]
        }
      ],
      "documents": [
        {
          "id": 1,
          "achievement_id": 1,
          "file_path": "https://minio.example.com/edulite-students/achievements/documents/...",
          "file_key": "achievements/documents/...",
          "caption": "Foto dokumentasi",
          "file_type": "image",
          "created_at": "2025-11-18T10:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 1.2 Get Achievement by ID
```http
GET /api/achievements/:id
```

**Response:** Same as single achievement object above

### 1.3 Create Achievement
```http
POST /api/achievements
```

**Request Body:**
```json
{
  "title": "Olimpiade Matematika Nasional 2025",
  "description": "Kompetisi matematika tingkat nasional",
  "event_type": "Olimpiade",
  "level": "Nasional",
  "organizer": "Kemendikbud",
  "event_date": "2025-08-15",
  "location": "Jakarta"
}
```

**Required Fields:**
- `title`
- `event_type`
- `level`

**Response:**
```json
{
  "id": 1,
  "school_id": 1,
  "title": "Olimpiade Matematika Nasional 2025",
  "description": "Kompetisi matematika tingkat nasional",
  "event_type": "Olimpiade",
  "level": "Nasional",
  "organizer": "Kemendikbud",
  "event_date": "2025-08-15",
  "location": "Jakarta",
  "created_at": "2025-11-18T10:00:00.000Z",
  "updated_at": "2025-11-18T10:00:00.000Z",
  "created_by": 1
}
```

### 1.4 Update Achievement
```http
PUT /api/achievements/:id
```

**Request Body:** Same as create (all fields optional)

### 1.5 Delete Achievement
```http
DELETE /api/achievements/:id
```

**Response:**
```json
{
  "message": "Achievement deleted successfully"
}
```

**Note:** Akan otomatis menghapus:
- Semua participants
- Semua results
- Semua documents dari MinIO
- Semua certificate files dari MinIO

---

## 2. Participant Endpoints

### 2.1 Add Participant
```http
POST /api/achievements/:achievement_id/participants
```

**Request Body:**
```json
{
  "student_id": 100,
  "teacher_id": null,
  "role": "Peserta",
  "notes": "Juara 1"
}
```

**Notes:**
- `student_id` atau `teacher_id` harus diisi (salah satu)
- `role` wajib diisi: "Peserta", "Pelatih", "Pendamping"

**Response:**
```json
{
  "id": 1,
  "achievement_id": 1,
  "student_id": 100,
  "teacher_id": null,
  "role": "Peserta",
  "notes": "Juara 1",
  "student": {
    "id": 100,
    "full_name": "Ahmad Fauzi",
    "nisn": "1234567890"
  },
  "teacher": null
}
```

### 2.2 Update Participant
```http
PUT /api/achievements/:achievement_id/participants/:participant_id
```

**Request Body:** Same as add participant (all fields optional)

### 2.3 Delete Participant
```http
DELETE /api/achievements/:achievement_id/participants/:participant_id
```

**Response:**
```json
{
  "message": "Participant deleted successfully"
}
```

**Note:** Akan otomatis menghapus semua results dan certificate files dari MinIO

---

## 3. Result Endpoints

### 3.1 Add Result
```http
POST /api/achievements/:achievement_id/participants/:participant_id/results
```

**Request Body:**
```json
{
  "rank": "Juara 1",
  "score": "95",
  "category": "Tunggal",
  "notes": "Skor tertinggi"
}
```

**Response:**
```json
{
  "id": 1,
  "participant_id": 1,
  "rank": "Juara 1",
  "score": "95",
  "category": "Tunggal",
  "certificate_file": null,
  "certificate_key": null,
  "notes": "Skor tertinggi"
}
```

### 3.2 Update Result
```http
PUT /api/achievements/:achievement_id/participants/:participant_id/results/:result_id
```

**Request Body:** Same as add result (all fields optional)

### 3.3 Delete Result
```http
DELETE /api/achievements/:achievement_id/participants/:participant_id/results/:result_id
```

**Response:**
```json
{
  "message": "Result deleted successfully"
}
```

**Note:** Akan otomatis menghapus certificate file dari MinIO

---

## 4. Certificate Upload Endpoints

### 4.1 Upload Certificate
```http
POST /api/achievements/:achievement_id/participants/:participant_id/results/:result_id/certificate
Content-Type: multipart/form-data
```

**Form Data:**
- `certificate`: File sertifikat (image atau PDF)

**Response:**
```json
{
  "message": "Certificate uploaded successfully",
  "certificate_file": "https://minio.example.com/edulite-students/achievements/certificates/..."
}
```

**File Constraints:**
- Max size: 5MB
- Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp
- Stored in MinIO bucket: `edulite-students/achievements/certificates/`

### 4.2 Delete Certificate
```http
DELETE /api/achievements/:achievement_id/participants/:participant_id/results/:result_id/certificate
```

**Response:**
```json
{
  "message": "Certificate deleted successfully"
}
```

---

## 5. Document Upload Endpoints

### 5.1 Upload Document
```http
POST /api/achievements/:achievement_id/documents
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File dokumen (image atau dokumen lainnya)
- `caption` (optional): Keterangan dokumen
- `file_type` (optional): "image", "document", "certificate" (default: "document")

**Response:**
```json
{
  "id": 1,
  "achievement_id": 1,
  "file_path": "https://minio.example.com/edulite-students/achievements/documents/...",
  "file_key": "achievements/documents/...",
  "caption": "Foto dokumentasi",
  "file_type": "image",
  "created_at": "2025-11-18T10:00:00.000Z"
}
```

**File Constraints:**
- Max size: 5MB
- Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp
- Stored in MinIO bucket: `edulite-students/achievements/documents/`

### 5.2 Delete Document
```http
DELETE /api/achievements/:achievement_id/documents/:document_id
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

---

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (token invalid/missing)
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Usage Flow

### Scenario: Mencatat prestasi lomba matematika

#### 1. Create Achievement
```bash
curl -X POST http://localhost:4000/api/achievements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Olimpiade Matematika Kota",
    "event_type": "Olimpiade",
    "level": "Kota",
    "event_date": "2025-09-15",
    "location": "Surabaya"
  }'
```

#### 2. Add Student Participant
```bash
curl -X POST http://localhost:4000/api/achievements/1/participants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 100,
    "role": "Peserta"
  }'
```

#### 3. Add Teacher as Coach
```bash
curl -X POST http://localhost:4000/api/achievements/1/participants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": 50,
    "role": "Pelatih"
  }'
```

#### 4. Add Result for Student
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

#### 5. Upload Certificate
```bash
curl -X POST http://localhost:4000/api/achievements/1/participants/1/results/1/certificate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "certificate=@certificate.jpg"
```

#### 6. Upload Documentation Photo
```bash
curl -X POST http://localhost:4000/api/achievements/1/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@event_photo.jpg" \
  -F "caption=Foto saat penyerahan piala" \
  -F "file_type=image"
```

---

## Filter Examples

### Filter by Event Type
```
GET /api/achievements?event_type=Olimpiade&page=1&limit=20
```

### Filter by Level
```
GET /api/achievements?level=Nasional&page=1&limit=20
```

### Combine Filters
```
GET /api/achievements?event_type=Kompetisi&level=Provinsi&page=1&limit=10
```

---

## Notes

1. **File Storage**: Semua file disimpan di MinIO object storage
2. **Auto Delete**: File otomatis terhapus saat record dihapus
3. **School Scoped**: Semua data di-scope berdasarkan `school_id` dari user yang login
4. **Cascade Delete**: Menghapus achievement akan cascade delete semua relasi
5. **Flexible Participants**: Participant bisa siswa atau guru (role: Peserta, Pelatih, Pendamping)
6. **Multiple Results**: Satu participant bisa punya multiple results (misal: tunggal & beregu)
7. **Multiple Documents**: Satu achievement bisa punya banyak dokumentasi

---

## MinIO Bucket Structure

```
edulite-students/
├── achievements/
│   ├── certificates/
│   │   ├── {timestamp}-{filename}
│   │   └── ...
│   └── documents/
│       ├── {timestamp}-{filename}
│       └── ...
```

Pastikan bucket `edulite-students` sudah dibuat di MinIO sebelum upload file.
