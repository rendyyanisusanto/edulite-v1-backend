# Frontend Integration: Achievements Module

## 1. Achievement List Component

```javascript
// components/achievements/AchievementList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AchievementList = () => {
  const [achievements, setAchievements] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    event_type: '',
    level: ''
  });

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await axios.get(
        `http://localhost:4000/api/achievements?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAchievements(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      alert('Gagal memuat data prestasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [page, filters]);

  const eventTypes = ['Lomba', 'Kompetisi', 'Kejuaraan', 'Olimpiade'];
  const levels = ['Sekolah', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional', 'Internasional'];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Data Prestasi</h1>
        
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select
            value={filters.event_type}
            onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
            className="border px-4 py-2 rounded"
          >
            <option value="">Semua Jenis Event</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="border px-4 py-2 rounded"
          >
            <option value="">Semua Tingkat</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ event_type: '', level: '' })}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Achievement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <div key={achievement.id} className="border rounded-lg p-4 shadow-md">
                <div className="mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {achievement.level}
                  </span>
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {achievement.event_type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                
                <div className="text-sm text-gray-500 mb-2">
                  <p>📅 {new Date(achievement.event_date).toLocaleDateString('id-ID')}</p>
                  <p>📍 {achievement.location}</p>
                  <p>🏢 {achievement.organizer}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold mb-1">
                    Peserta: {achievement.participants?.length || 0}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {achievement.participants?.slice(0, 3).map(participant => (
                      <span key={participant.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {participant.student?.full_name || participant.teacher?.full_name}
                      </span>
                    ))}
                    {achievement.participants?.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{achievement.participants.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => window.location.href = `/achievements/${achievement.id}`}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleDelete(achievement.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            
            <span className="text-gray-700">
              Halaman {pagination.page} dari {pagination.totalPages} 
              ({pagination.total} total)
            </span>
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus prestasi ini?')) return;
    
    try {
      await axios.delete(`http://localhost:4000/api/achievements/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Prestasi berhasil dihapus');
      fetchAchievements();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Gagal menghapus prestasi');
    }
  }
};

export default AchievementList;
```

---

## 2. Achievement Form Component

```javascript
// components/achievements/AchievementForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AchievementForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Lomba',
    level: 'Sekolah',
    organizer: '',
    event_date: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const eventTypes = ['Lomba', 'Kompetisi', 'Kejuaraan', 'Olimpiade'];
  const levels = ['Sekolah', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional', 'Internasional'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:4000/api/achievements',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Prestasi berhasil ditambahkan!');
      if (onSuccess) onSuccess(response.data);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        event_type: 'Lomba',
        level: 'Sekolah',
        organizer: '',
        event_date: '',
        location: ''
      });
    } catch (error) {
      console.error('Error creating achievement:', error);
      alert('Gagal menambahkan prestasi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Tambah Prestasi Baru</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Judul Prestasi <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Deskripsi</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Jenis Event <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Tingkat <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Penyelenggara</label>
        <input
          type="text"
          value={formData.organizer}
          onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Tanggal Event</label>
          <input
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Lokasi</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
      >
        {loading ? 'Menyimpan...' : 'Simpan Prestasi'}
      </button>
    </form>
  );
};

export default AchievementForm;
```

---

## 3. Participant Management Component

```javascript
// components/achievements/ParticipantManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParticipantManager = ({ achievementId }) => {
  const [participants, setParticipants] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'student',
    student_id: '',
    teacher_id: '',
    role: 'Peserta',
    notes: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/students', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/teachers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTeachers(response.data.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();

    const payload = {
      student_id: formData.type === 'student' ? parseInt(formData.student_id) : null,
      teacher_id: formData.type === 'teacher' ? parseInt(formData.teacher_id) : null,
      role: formData.role,
      notes: formData.notes
    };

    try {
      const response = await axios.post(
        `http://localhost:4000/api/achievements/${achievementId}/participants`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Peserta berhasil ditambahkan!');
      setParticipants([...participants, response.data]);
      setShowForm(false);
      setFormData({
        type: 'student',
        student_id: '',
        teacher_id: '',
        role: 'Peserta',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Gagal menambahkan peserta: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteParticipant = async (participantId) => {
    if (!confirm('Yakin ingin menghapus peserta ini?')) return;

    try {
      await axios.delete(
        `http://localhost:4000/api/achievements/${achievementId}/participants/${participantId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      alert('Peserta berhasil dihapus');
      setParticipants(participants.filter(p => p.id !== participantId));
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Gagal menghapus peserta');
    }
  };

  const roles = ['Peserta', 'Pelatih', 'Pendamping'];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Daftar Peserta</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {showForm ? 'Tutup Form' : '+ Tambah Peserta'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddParticipant} className="bg-gray-50 p-4 rounded mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Tipe Peserta</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.type === 'student' ? (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Pilih Siswa</label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              >
                <option value="">-- Pilih Siswa --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} - {student.nisn}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Pilih Guru</label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              >
                <option value="">-- Pilih Guru --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name} - {teacher.nip}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Catatan</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              placeholder="Catatan tambahan..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Tambah Peserta
          </button>
        </form>
      )}

      {/* Participant List */}
      <div className="space-y-2">
        {participants.map(participant => (
          <div key={participant.id} className="flex justify-between items-center bg-white p-3 rounded border">
            <div>
              <p className="font-semibold">
                {participant.student?.full_name || participant.teacher?.full_name}
              </p>
              <p className="text-sm text-gray-600">
                {participant.role} • {participant.notes}
              </p>
            </div>
            <button
              onClick={() => handleDeleteParticipant(participant.id)}
              className="text-red-500 hover:text-red-700"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantManager;
```

---

## 4. Certificate Upload Component

```javascript
// components/achievements/CertificateUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';

const CertificateUpload = ({ achievementId, participantId, resultId, currentCertificate }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentCertificate);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Pilih file terlebih dahulu');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await axios.post(
        `http://localhost:4000/api/achievements/${achievementId}/participants/${participantId}/results/${resultId}/certificate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Sertifikat berhasil diupload!');
      setPreview(response.data.certificate_file);
      setFile(null);
    } catch (error) {
      console.error('Error uploading certificate:', error);
      alert('Gagal upload sertifikat: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus sertifikat?')) return;

    try {
      await axios.delete(
        `http://localhost:4000/api/achievements/${achievementId}/participants/${participantId}/results/${resultId}/certificate`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      alert('Sertifikat berhasil dihapus');
      setPreview(null);
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('Gagal menghapus sertifikat');
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded">
      <h4 className="font-semibold mb-3">Upload Sertifikat</h4>
      
      {preview && (
        <div className="mb-4">
          <img src={preview} alt="Certificate" className="max-w-xs rounded border" />
          <button
            onClick={handleDelete}
            className="mt-2 text-red-500 hover:text-red-700 text-sm"
          >
            Hapus Sertifikat
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="flex-1"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Max size: 5MB. Format: JPG, PNG, GIF, WEBP
      </p>
    </div>
  );
};

export default CertificateUpload;
```

---

## 5. Complete Usage Example

```javascript
// pages/AchievementsPage.jsx
import React from 'react';
import AchievementList from '../components/achievements/AchievementList';
import AchievementForm from '../components/achievements/AchievementForm';

const AchievementsPage = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold"
          >
            {showForm ? 'Lihat Daftar Prestasi' : '+ Tambah Prestasi Baru'}
          </button>
        </div>

        {showForm ? (
          <AchievementForm onSuccess={handleSuccess} />
        ) : (
          <AchievementList key={refreshKey} />
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
```

---

## API Service (Recommended Pattern)

```javascript
// services/achievementService.js
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/achievements';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const achievementService = {
  // Achievements
  getAll: (params) => axios.get(API_URL, { ...getAuthHeader(), params }),
  getById: (id) => axios.get(`${API_URL}/${id}`, getAuthHeader()),
  create: (data) => axios.post(API_URL, data, getAuthHeader()),
  update: (id, data) => axios.put(`${API_URL}/${id}`, data, getAuthHeader()),
  delete: (id) => axios.delete(`${API_URL}/${id}`, getAuthHeader()),

  // Participants
  addParticipant: (achievementId, data) => 
    axios.post(`${API_URL}/${achievementId}/participants`, data, getAuthHeader()),
  updateParticipant: (achievementId, participantId, data) =>
    axios.put(`${API_URL}/${achievementId}/participants/${participantId}`, data, getAuthHeader()),
  deleteParticipant: (achievementId, participantId) =>
    axios.delete(`${API_URL}/${achievementId}/participants/${participantId}`, getAuthHeader()),

  // Results
  addResult: (achievementId, participantId, data) =>
    axios.post(`${API_URL}/${achievementId}/participants/${participantId}/results`, data, getAuthHeader()),
  updateResult: (achievementId, participantId, resultId, data) =>
    axios.put(`${API_URL}/${achievementId}/participants/${participantId}/results/${resultId}`, data, getAuthHeader()),
  deleteResult: (achievementId, participantId, resultId) =>
    axios.delete(`${API_URL}/${achievementId}/participants/${participantId}/results/${resultId}`, getAuthHeader()),

  // Certificate
  uploadCertificate: (achievementId, participantId, resultId, file) => {
    const formData = new FormData();
    formData.append('certificate', file);
    return axios.post(
      `${API_URL}/${achievementId}/participants/${participantId}/results/${resultId}/certificate`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
  deleteCertificate: (achievementId, participantId, resultId) =>
    axios.delete(`${API_URL}/${achievementId}/participants/${participantId}/results/${resultId}/certificate`, getAuthHeader()),

  // Documents
  uploadDocument: (achievementId, file, caption, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    if (fileType) formData.append('file_type', fileType);
    return axios.post(
      `${API_URL}/${achievementId}/documents`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
  deleteDocument: (achievementId, documentId) =>
    axios.delete(`${API_URL}/${achievementId}/documents/${documentId}`, getAuthHeader())
};
```

Usage:
```javascript
import { achievementService } from './services/achievementService';

// Get achievements with filters
const response = await achievementService.getAll({
  page: 1,
  limit: 10,
  event_type: 'Olimpiade',
  level: 'Nasional'
});

// Create achievement
const newAchievement = await achievementService.create({
  title: 'Olimpiade Matematika',
  event_type: 'Olimpiade',
  level: 'Nasional'
});

// Upload certificate
await achievementService.uploadCertificate(
  achievementId,
  participantId,
  resultId,
  file
);
```
