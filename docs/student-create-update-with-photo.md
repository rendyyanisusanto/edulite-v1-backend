# Student Create & Update with Photo Upload

Dokumentasi untuk create dan update student dengan foto sekaligus.

## Create Student with Photo

**POST** `/api/students`

**Content-Type:** `multipart/form-data`

**Form Data Fields:**
```
name: string (required)
school_id: integer (required)
academic_year_id: integer (optional)
grade_id: integer (optional)
class_id: integer (optional)
department_id: integer (optional)
nis: string (optional)
nisn: string (optional)
date_of_birth: date (optional) - format: YYYY-MM-DD
gender: string (optional) - "L" or "P"
address: text (optional)
parent_name: string (optional)
parent_phone: string (optional)
photo: file (optional) - Image file (max 5MB)
```

### Example using cURL:

```bash
curl -X POST http://localhost:4000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Ahmad Fauzi" \
  -F "school_id=1" \
  -F "academic_year_id=1" \
  -F "grade_id=10" \
  -F "class_id=5" \
  -F "nis=12345" \
  -F "nisn=67890" \
  -F "date_of_birth=2005-05-15" \
  -F "gender=L" \
  -F "address=Jl. Sudirman No. 123" \
  -F "parent_name=Budi Santoso" \
  -F "parent_phone=081234567890" \
  -F "photo=@/path/to/photo.jpg"
```

### Example using JavaScript (Fetch):

```javascript
const formData = new FormData();
formData.append('name', 'Ahmad Fauzi');
formData.append('school_id', '1');
formData.append('academic_year_id', '1');
formData.append('grade_id', '10');
formData.append('class_id', '5');
formData.append('nis', '12345');
formData.append('nisn', '67890');
formData.append('date_of_birth', '2005-05-15');
formData.append('gender', 'L');
formData.append('address', 'Jl. Sudirman No. 123');
formData.append('parent_name', 'Budi Santoso');
formData.append('parent_phone', '081234567890');
// Photo is optional
if (photoFile) {
  formData.append('photo', photoFile);
}

fetch('http://localhost:4000/api/students', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Example Response:

```json
{
  "id": 1,
  "name": "Ahmad Fauzi",
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "department_id": null,
  "nis": "12345",
  "nisn": "67890",
  "date_of_birth": "2005-05-15",
  "gender": "L",
  "address": "Jl. Sudirman No. 123",
  "parent_name": "Budi Santoso",
  "parent_phone": "081234567890",
  "photo": "https://objectstorage.simsmk.sch.id/edulite-students/students/1/abc123def456.jpg",
  "photo_key": "students/1/abc123def456.jpg",
  "created_at": "2024-11-18T10:30:00.000Z",
  "updated_at": "2024-11-18T10:30:00.000Z"
}
```

---

## Update Student with Photo

**PUT** `/api/students/:id`

**Content-Type:** `multipart/form-data`

**Form Data Fields:** (Same as Create, all optional)
```
name: string
school_id: integer
academic_year_id: integer
grade_id: integer
class_id: integer
department_id: integer
nis: string
nisn: string
date_of_birth: date - format: YYYY-MM-DD
gender: string - "L" or "P"
address: text
parent_name: string
parent_phone: string
photo: file - Image file (max 5MB)
```

### Example using cURL:

```bash
# Update with photo
curl -X PUT http://localhost:4000/api/students/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Ahmad Fauzi Updated" \
  -F "school_id=1" \
  -F "nis=12345" \
  -F "photo=@/path/to/new-photo.jpg"

# Update without photo (keeps existing photo)
curl -X PUT http://localhost:4000/api/students/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Ahmad Fauzi Updated" \
  -F "nis=12345"
```

### Example using JavaScript (Fetch):

```javascript
const formData = new FormData();
formData.append('name', 'Ahmad Fauzi Updated');
formData.append('school_id', '1');
formData.append('nis', '12345');

// Photo is optional - if provided, will replace old photo
if (newPhotoFile) {
  formData.append('photo', newPhotoFile);
}

fetch('http://localhost:4000/api/students/1', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Example Response:

```json
{
  "id": 1,
  "name": "Ahmad Fauzi Updated",
  "school_id": 1,
  "academic_year_id": 1,
  "grade_id": 10,
  "class_id": 5,
  "department_id": null,
  "nis": "12345",
  "nisn": "67890",
  "date_of_birth": "2005-05-15",
  "gender": "L",
  "address": "Jl. Sudirman No. 123",
  "parent_name": "Budi Santoso",
  "parent_phone": "081234567890",
  "photo": "https://objectstorage.simsmk.sch.id/edulite-students/students/1/xyz789uvw012.jpg",
  "photo_key": "students/1/xyz789uvw012.jpg",
  "created_at": "2024-11-18T10:30:00.000Z",
  "updated_at": "2024-11-18T11:45:00.000Z"
}
```

---

## Frontend Integration Examples

### React Component - Create Student Form

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function CreateStudentForm({ token }) {
  const [formData, setFormData] = useState({
    name: '',
    school_id: '',
    nis: '',
    nisn: '',
    date_of_birth: '',
    gender: 'L',
    address: '',
    parent_name: '',
    parent_phone: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    // Append photo if selected
    if (photo) {
      data.append('photo', photo);
    }

    try {
      const response = await axios.post(
        'http://localhost:4000/api/students',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Student created:', response.data);
      alert('Student created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        school_id: '',
        nis: '',
        nisn: '',
        date_of_birth: '',
        gender: 'L',
        address: '',
        parent_name: '',
        parent_phone: '',
      });
      setPhoto(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      
      <input
        type="number"
        name="school_id"
        placeholder="School ID"
        value={formData.school_id}
        onChange={handleChange}
        required
      />
      
      <input
        type="text"
        name="nis"
        placeholder="NIS"
        value={formData.nis}
        onChange={handleChange}
      />
      
      <input
        type="text"
        name="nisn"
        placeholder="NISN"
        value={formData.nisn}
        onChange={handleChange}
      />
      
      <input
        type="date"
        name="date_of_birth"
        value={formData.date_of_birth}
        onChange={handleChange}
      />
      
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
      >
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>
      
      <textarea
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
      />
      
      <input
        type="text"
        name="parent_name"
        placeholder="Parent Name"
        value={formData.parent_name}
        onChange={handleChange}
      />
      
      <input
        type="text"
        name="parent_phone"
        placeholder="Parent Phone"
        value={formData.parent_phone}
        onChange={handleChange}
      />
      
      <div>
        <label>Photo (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  );
}

export default CreateStudentForm;
```

### React Component - Update Student Form

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UpdateStudentForm({ studentId, token }) {
  const [formData, setFormData] = useState({
    name: '',
    school_id: '',
    nis: '',
    // ... other fields
  });
  const [photo, setPhoto] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch student data
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/students/${studentId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setFormData(response.data);
        setCurrentPhoto(response.data.photo);
      } catch (error) {
        console.error('Error fetching student:', error);
      }
    };

    fetchStudent();
  }, [studentId, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key] && key !== 'photo' && key !== 'photo_key') {
        data.append(key, formData[key]);
      }
    });

    // Append new photo if selected
    if (photo) {
      data.append('photo', photo);
    }

    try {
      const response = await axios.put(
        `http://localhost:4000/api/students/${studentId}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Student updated:', response.data);
      alert('Student updated successfully!');
      setCurrentPhoto(response.data.photo);
      setPhoto(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Same input fields as create form */}
      
      <div>
        <label>Current Photo:</label>
        {currentPhoto && (
          <img src={currentPhoto} alt="Student" style={{ width: 100 }} />
        )}
        
        <label>Upload New Photo (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        {photo && <p>New photo selected: {photo.name}</p>}
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Student'}
      </button>
    </form>
  );
}

export default UpdateStudentForm;
```

---

## Important Notes

1. **Photo is Optional:** Both create and update work without photo
2. **Auto Replace:** Update with new photo will automatically delete old photo
3. **Keep Existing:** Update without photo keeps existing photo
4. **Content-Type:** Must use `multipart/form-data` for file upload
5. **File Validation:** Only images (JPEG, PNG, GIF, WebP), max 5MB
6. **Error Handling:** If photo upload fails, student is still created/updated without photo

---

## Postman Testing

### Create Student:
1. Method: POST
2. URL: `http://localhost:4000/api/students`
3. Headers:
   - Authorization: `Bearer YOUR_TOKEN`
4. Body: (select `form-data`)
   - name: `Ahmad Fauzi` (text)
   - school_id: `1` (text)
   - nis: `12345` (text)
   - photo: (File - select image)

### Update Student:
1. Method: PUT
2. URL: `http://localhost:4000/api/students/1`
3. Headers:
   - Authorization: `Bearer YOUR_TOKEN`
4. Body: (select `form-data`)
   - name: `Ahmad Fauzi Updated` (text)
   - photo: (File - select new image) [OPTIONAL]
