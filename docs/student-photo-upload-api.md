# Student Photo Upload API

API untuk upload dan manage foto siswa menggunakan MinIO object storage.

## MinIO Configuration

```javascript
Endpoint: https://objectstorage.simsmk.sch.id
Access Key: rendy
Secret Key: Tahutelor123
Bucket: edulite-students
Force Path Style: true (WAJIB untuk MinIO)
```

## Installation

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
```

## Endpoints

### 1. Upload Student Photo

**POST** `/api/students/:id/photo`

**Authentication:** Required (Bearer token)
**Authorization:** superadmin, admin only
**Content-Type:** multipart/form-data

**Form Data:**
- `photo` (file) - Image file (JPEG, PNG, GIF, WebP)
  - Max size: 5MB
  - Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp

**Example Request using cURL:**
```bash
curl -X POST http://localhost:4000/api/students/1/photo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

**Example Request using JavaScript (Fetch):**
```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

fetch('http://localhost:4000/api/students/1/photo', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Example Request using Postman:**
1. Method: POST
2. URL: http://localhost:4000/api/students/1/photo
3. Headers:
   - Authorization: Bearer YOUR_TOKEN
4. Body:
   - Select "form-data"
   - Key: photo (select File type)
   - Value: Select file from computer

**Example Response (Success):**
```json
{
  "message": "Photo uploaded successfully",
  "photo": "https://objectstorage.simsmk.sch.id/edulite-students/students/1/a1b2c3d4e5f6.jpg",
  "photo_key": "students/1/a1b2c3d4e5f6.jpg"
}
```

**Error Responses:**

```json
// Student not found
{
  "message": "Student not found"
}

// No file uploaded
{
  "message": "No file uploaded"
}

// Invalid file type
{
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
}

// File too large
{
  "message": "File is too large. Maximum size is 5MB."
}

// Upload failed
{
  "message": "Failed to upload file: [error details]"
}
```

---

### 2. Delete Student Photo

**DELETE** `/api/students/:id/photo`

**Authentication:** Required (Bearer token)
**Authorization:** superadmin, admin only

**Example Request:**
```bash
curl -X DELETE http://localhost:4000/api/students/1/photo \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response (Success):**
```json
{
  "message": "Photo deleted successfully"
}
```

**Error Responses:**

```json
// Student not found
{
  "message": "Student not found"
}

// No photo to delete
{
  "message": "Student has no photo"
}

// Delete failed
{
  "message": "Failed to delete file: [error details]"
}
```

---

### 3. Get Student with Photo

**GET** `/api/students/:id`

Endpoint yang sudah ada, sekarang akan include field `photo` dan `photo_key`.

**Example Response:**
```json
{
  "id": 1,
  "name": "Ahmad Fauzi",
  "school_id": 1,
  "nis": "12345",
  "nisn": "67890",
  "date_of_birth": "2005-05-15",
  "gender": "L",
  "address": "Jl. Sudirman No. 123",
  "parent_name": "Budi Santoso",
  "parent_phone": "081234567890",
  "photo": "https://objectstorage.simsmk.sch.id/edulite-students/students/1/a1b2c3d4e5f6.jpg",
  "photo_key": "students/1/a1b2c3d4e5f6.jpg",
  "created_at": "2024-07-15T10:30:00.000Z",
  "updated_at": "2024-07-20T14:25:00.000Z",
  "school": {
    "id": 1,
    "name": "SMP Negeri 1 Jakarta"
  },
  "grade": {
    "id": 10,
    "name": "Grade 10"
  },
  "class": {
    "id": 5,
    "name": "10 TKJ 1"
  }
}
```

---

## File Storage Structure in MinIO

```
edulite-students/
└── students/
    ├── 1/                          # school_id
    │   ├── abc123def456.jpg        # random filename
    │   ├── xyz789uvw012.png
    │   └── ...
    ├── 2/
    │   └── ...
    └── ...
```

---

## Frontend Integration Examples

### React with Axios

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function StudentPhotoUpload({ studentId, token }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);

    setUploading(true);

    try {
      const response = await axios.post(
        `http://localhost:4000/api/students/${studentId}/photo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload success:', response.data);
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </div>
  );
}

export default StudentPhotoUpload;
```

### Vue.js

```vue
<template>
  <div>
    <input type="file" @change="handleFileChange" accept="image/*" />
    <button @click="uploadPhoto" :disabled="uploading">
      {{ uploading ? 'Uploading...' : 'Upload Photo' }}
    </button>
  </div>
</template>

<script>
export default {
  props: ['studentId', 'token'],
  data() {
    return {
      selectedFile: null,
      uploading: false
    };
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadPhoto() {
      if (!this.selectedFile) {
        alert('Please select a file');
        return;
      }

      const formData = new FormData();
      formData.append('photo', this.selectedFile);

      this.uploading = true;

      try {
        const response = await fetch(
          `http://localhost:4000/api/students/${this.studentId}/photo`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`
            },
            body: formData
          }
        );

        const data = await response.json();
        console.log('Upload success:', data);
        alert('Photo uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload photo');
      } finally {
        this.uploading = false;
      }
    }
  }
};
</script>
```

---

## Important Notes

1. **File Size Limit:** Maximum 5MB per file
2. **Allowed Formats:** JPEG, JPG, PNG, GIF, WebP
3. **Auto Replacement:** Uploading new photo will automatically delete old photo
4. **Cascade Delete:** Deleting student will automatically delete their photo from MinIO
5. **Filename:** System generates unique random filename to avoid conflicts
6. **Organization:** Photos organized by school_id in folder structure

---

## Security Considerations

1. Photos are stored with unique random filenames
2. Only authenticated users with proper roles can upload/delete
3. File type validation on server-side
4. File size validation to prevent abuse
5. Old photos automatically cleaned up when replaced or student deleted

---

## Troubleshooting

### "Failed to upload file" error
- Check MinIO credentials in config/minio.js
- Verify MinIO bucket exists (edulite-students)
- Check network connectivity to MinIO endpoint
- Verify MinIO bucket permissions

### "Invalid file type" error
- Ensure file is image format (JPEG, PNG, GIF, WebP)
- Check file extension matches actual file type

### "File is too large" error
- Compress image before upload
- Resize image to smaller dimensions
- Current limit is 5MB (can be adjusted in middleware/upload.js)
