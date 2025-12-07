# EduLite Backend API Documentation

Backend API untuk sistem manajemen sekolah multi-tenant EduLite.

## 🚀 Instalasi

```bash
# Install dependencies
npm install

# Setup database
# 1. Buat database MySQL dengan nama 'edulite_db'
# 2. Copy .env.example ke .env dan sesuaikan konfigurasi

# Run development server
npm run dev
```

## 📋 Endpoints

### Authentication

#### POST /api/auth/login
Login user
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "refresh_token": "eyJhbGciOiJIUzI1...",
  "expires_at": "2024-01-01T10:00:00.000Z",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/refresh
Refresh access token
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1..."
}
```

#### POST /api/auth/logout
Logout (requires auth token)

#### GET /api/auth/profile
Get current user profile (requires auth token)

---

### Schools

#### GET /api/schools
Get all schools (SuperAdmin only)

#### GET /api/schools/:id
Get school by ID

#### POST /api/schools
Create new school (SuperAdmin only)
```json
{
  "code": "SCH001",
  "name": "SD Negeri 1",
  "domain": "sdn1.edulite.id",
  "address": "Jl. Raya No. 123",
  "phone": "021-12345678",
  "logo": "https://example.com/logo.png",
  "status": "ACTIVE"
}
```

#### PUT /api/schools/:id
Update school

#### DELETE /api/schools/:id
Delete school (SuperAdmin only)

---

### Users

#### GET /api/users
Get all users (Admin and above)

Query params:
- `school_id` (optional): Filter by school

#### GET /api/users/:id
Get user by ID

#### POST /api/users
Create new user (Admin and above)
```json
{
  "school_id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "guru",
  "is_active": true
}
```

#### PUT /api/users/:id
Update user

#### DELETE /api/users/:id
Delete user (Admin and above)

---

### Students

#### GET /api/students
Get all students (Guru and Admin)

Query params:
- `school_id` (optional): Filter by school

#### GET /api/students/:id
Get student by ID

#### POST /api/students
Create new student (Admin only)
```json
{
  "user_id": 5,
  "school_id": 1,
  "nis": "12345",
  "nisn": "0012345678",
  "class_name": "5A",
  "date_of_birth": "2015-05-15",
  "gender": "L",
  "address": "Jl. Contoh No. 45",
  "parent_name": "Bapak John",
  "parent_phone": "081234567890"
}
```

#### PUT /api/students/:id
Update student (Admin only)

#### DELETE /api/students/:id
Delete student (Admin only)

---

### Teachers

#### GET /api/teachers
Get all teachers (Guru and Admin)

Query params:
- `school_id` (optional): Filter by school

#### GET /api/teachers/:id
Get teacher by ID

#### POST /api/teachers
Create new teacher (Admin only)
```json
{
  "user_id": 6,
  "school_id": 1,
  "nip": "198505152010011001",
  "position": "Guru Kelas",
  "subject": "Matematika"
}
```

#### PUT /api/teachers/:id
Update teacher (Admin only)

#### DELETE /api/teachers/:id
Delete teacher (Admin only)

---

### Roles

#### GET /api/roles
Get all roles

#### GET /api/roles/:id
Get role by ID

#### POST /api/roles
Create new role (SuperAdmin only)
```json
{
  "name": "Guru",
  "description": "Guru yang mengajar di sekolah"
}
```

#### PUT /api/roles/:id
Update role (SuperAdmin only)

#### DELETE /api/roles/:id
Delete role (SuperAdmin only)

---

### Apps

#### GET /api/apps
Get all apps

#### GET /api/apps/:id
Get app by ID

#### POST /api/apps
Create new app (SuperAdmin only)
```json
{
  "code": "SIS",
  "name": "Student Information System",
  "description": "Sistem Informasi Siswa",
  "base_url": "https://sis.edulite.id"
}
```

#### PUT /api/apps/:id
Update app (SuperAdmin only)

#### DELETE /api/apps/:id
Delete app (SuperAdmin only)

---

### School Apps

#### GET /api/school-apps
Get all school apps

Query params:
- `school_id` (optional): Filter by school

#### GET /api/school-apps/:id
Get school app by ID

#### POST /api/school-apps
Activate app for school (Admin)
```json
{
  "school_id": 1,
  "app_id": 2,
  "status": "ACTIVE"
}
```

#### PUT /api/school-apps/:id
Update school app (Admin)

#### DELETE /api/school-apps/:id
Deactivate app for school (Admin)

---

## 🔐 Authentication

Semua endpoint (kecuali login) memerlukan token JWT di header:

```
Authorization: Bearer <access_token>
```

## 👥 User Roles

- `superadmin`: Akses penuh ke semua endpoint
- `admin`: Admin sekolah, dapat mengelola data di sekolahnya
- `guru`: Dapat melihat data siswa dan guru
- `siswa`: Akses terbatas
- `ortu`: Akses terbatas untuk orang tua

## 📊 Database Schema

Database menggunakan MySQL dengan Sequelize ORM. Struktur tabel:
- schools
- users
- students
- teachers
- roles
- user_roles
- apps
- school_apps
- sessions
- academic_years
- grades
- departments
- classes
- student_mutations
- student_class_history
- **achievements** ⭐ NEW
- **achievement_participants** ⭐ NEW
- **achievement_results** ⭐ NEW
- **achievement_documents** ⭐ NEW

## 🔧 Environment Variables

```
DB_HOST=localhost
DB_NAME=edulite_db
DB_USER=root
DB_PASS=
PORT=4000
JWT_SECRET=your-secret-key-here
```

## 🎯 New Features

### Achievement Management System ⭐
Sistem lengkap untuk mengelola prestasi siswa dan guru:
- **Achievements**: Pencatatan kompetisi/lomba dengan metadata lengkap
- **Participants**: Peserta (siswa) dan pendamping (guru)
- **Results**: Hasil lomba dengan rank, score, category
- **Documents**: Upload foto/dokumen ke MinIO
- **Certificates**: Upload sertifikat ke MinIO

**Dokumentasi Lengkap:**
- [Achievement API Documentation](./docs/API_ACHIEVEMENTS.md)
- [Achievement Frontend Guide](./docs/FRONTEND_ACHIEVEMENTS.md)
- [Achievement README](./docs/ACHIEVEMENTS_README.md)

**Endpoints:**
- `GET /api/achievements` - List dengan pagination & filter
- `POST /api/achievements` - Create prestasi
- `POST /api/achievements/:id/participants` - Add peserta
- `POST /api/achievements/:id/participants/:pid/results` - Add hasil
- `POST /api/achievements/:id/participants/:pid/results/:rid/certificate` - Upload sertifikat
- `POST /api/achievements/:id/documents` - Upload dokumentasi

### Photo Upload System 📸
- Student photo upload ke MinIO
- Achievement certificates upload
- Achievement documents upload
- Auto-delete files saat record dihapus
- Max file size: 5MB

### Student Management
- Student mutations (MASUK, PINDAH, KELUAR)
- Student class history dengan bulk assignment
- Pagination pada semua endpoints

## 📝 Notes

- Semua endpoint yang memerlukan autentikasi akan mengembalikan status 401 jika token tidak valid
- Endpoint dengan role restriction akan mengembalikan status 403 jika user tidak memiliki akses
- Session disimpan di database dan token akan expired setelah 2 jam
- File storage menggunakan MinIO object storage
- Pagination default: 10 items per page, max: 100 items
