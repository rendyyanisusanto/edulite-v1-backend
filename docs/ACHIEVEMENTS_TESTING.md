# Achievement Management - Testing Guide

## Quick Setup

### 1. Run Migration
```bash
mysql -u root -p edulite_db < database/migrations/create_achievements_tables.sql
```

### 2. Verify Tables Created
```bash
mysql -u root -p edulite_db -e "SHOW TABLES LIKE 'achievement%';"
```

Expected output:
```
achievement_documents
achievement_participants
achievement_results
achievements
```

### 3. Start Server
```bash
npm run dev
```

Server should show:
```
✅ Database connected successfully
🚀 Server running on port 4000
   - Achievements: http://localhost:4000/api/achievements
```

---

## Testing with cURL

### Step 1: Login to Get Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "password123"
  }'
```

Save the `access_token` from response.

---

### Step 2: Create Achievement
```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:4000/api/achievements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Olimpiade Matematika Nasional 2025",
    "description": "Kompetisi matematika tingkat nasional untuk pelajar SMA",
    "event_type": "Olimpiade",
    "level": "Nasional",
    "organizer": "Kemendikbud RI",
    "event_date": "2025-08-15",
    "location": "Jakarta Convention Center"
  }'
```

Expected response:
```json
{
  "id": 1,
  "school_id": 1,
  "title": "Olimpiade Matematika Nasional 2025",
  "event_type": "Olimpiade",
  "level": "Nasional",
  "created_at": "2025-11-18T...",
  ...
}
```

---

### Step 3: Get All Achievements
```bash
curl -X GET "http://localhost:4000/api/achievements?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "data": [...],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### Step 4: Add Student Participant
```bash
# First, get a student ID
curl -X GET "http://localhost:4000/api/students?limit=1" \
  -H "Authorization: Bearer $TOKEN"

# Use student_id from response
STUDENT_ID=100

curl -X POST http://localhost:4000/api/achievements/1/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": '$STUDENT_ID',
    "role": "Peserta",
    "notes": "Wakil dari sekolah"
  }'
```

---

### Step 5: Add Teacher as Coach
```bash
# Get a teacher ID
curl -X GET "http://localhost:4000/api/teachers?limit=1" \
  -H "Authorization: Bearer $TOKEN"

# Use teacher_id from response
TEACHER_ID=50

curl -X POST http://localhost:4000/api/achievements/1/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": '$TEACHER_ID',
    "role": "Pelatih",
    "notes": "Guru pembina matematika"
  }'
```

---

### Step 6: Add Result
```bash
# Use participant_id from previous response
PARTICIPANT_ID=1

curl -X POST http://localhost:4000/api/achievements/1/participants/$PARTICIPANT_ID/results \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rank": "Juara 1",
    "score": "95.5",
    "category": "Tunggal Putra",
    "notes": "Skor tertinggi nasional"
  }'
```

---

### Step 7: Upload Certificate
```bash
# Create a test image first or use existing
RESULT_ID=1

curl -X POST http://localhost:4000/api/achievements/1/participants/$PARTICIPANT_ID/results/$RESULT_ID/certificate \
  -H "Authorization: Bearer $TOKEN" \
  -F "certificate=@/path/to/certificate.jpg"
```

Expected response:
```json
{
  "message": "Certificate uploaded successfully",
  "certificate_file": "https://objectstorage.simsmk.sch.id/edulite-students/achievements/certificates/..."
}
```

---

### Step 8: Upload Documentation
```bash
curl -X POST http://localhost:4000/api/achievements/1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/photo.jpg" \
  -F "caption=Foto penyerahan piala" \
  -F "file_type=image"
```

---

### Step 9: Get Achievement Detail
```bash
curl -X GET http://localhost:4000/api/achievements/1 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Full achievement with participants, results, and documents

---

### Step 10: Filter Achievements
```bash
# Filter by event type
curl -X GET "http://localhost:4000/api/achievements?event_type=Olimpiade" \
  -H "Authorization: Bearer $TOKEN"

# Filter by level
curl -X GET "http://localhost:4000/api/achievements?level=Nasional" \
  -H "Authorization: Bearer $TOKEN"

# Combine filters
curl -X GET "http://localhost:4000/api/achievements?event_type=Olimpiade&level=Nasional&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

### Import Collection
1. Open Postman
2. Import file: `postman_collection.json`
3. Create environment with:
   - `base_url`: `http://localhost:4000`
   - `token`: `your_access_token`

### Test Sequence
1. **Auth** → Login
2. **Achievements** → Create Achievement
3. **Achievements** → Get All Achievements
4. **Participants** → Add Student Participant
5. **Participants** → Add Teacher Coach
6. **Results** → Add Result
7. **Certificates** → Upload Certificate
8. **Documents** → Upload Document
9. **Achievements** → Get Achievement Detail
10. **Achievements** → Delete Achievement

---

## Common Test Scenarios

### Scenario 1: Individual Competition
```bash
# 1. Create achievement
curl -X POST http://localhost:4000/api/achievements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lomba Cerdas Cermat IPA",
    "event_type": "Lomba",
    "level": "Kabupaten",
    "event_date": "2025-09-10"
  }'

# 2. Add one student
curl -X POST http://localhost:4000/api/achievements/2/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_id": 101, "role": "Peserta"}'

# 3. Add result
curl -X POST http://localhost:4000/api/achievements/2/participants/3/results \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rank": "Juara 2", "category": "Tunggal"}'
```

### Scenario 2: Team Competition
```bash
# 1. Create achievement
curl -X POST http://localhost:4000/api/achievements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kompetisi Robotik Provinsi",
    "event_type": "Kompetisi",
    "level": "Provinsi"
  }'

# 2. Add multiple students
for STUDENT_ID in 101 102 103; do
  curl -X POST http://localhost:4000/api/achievements/3/participants \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"student_id\": $STUDENT_ID, \"role\": \"Peserta\"}"
done

# 3. Add teacher as coach
curl -X POST http://localhost:4000/api/achievements/3/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"teacher_id": 51, "role": "Pelatih"}'

# 4. Add team result
curl -X POST http://localhost:4000/api/achievements/3/participants/4/results \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rank": "Juara 1", "category": "Beregu"}'
```

---

## Error Cases to Test

### 1. Missing Required Fields
```bash
curl -X POST http://localhost:4000/api/achievements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Test without title"}'
```
Expected: `400 Bad Request - title, event_type, and level are required`

### 2. Invalid Participant (No student_id nor teacher_id)
```bash
curl -X POST http://localhost:4000/api/achievements/1/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "Peserta"}'
```
Expected: `400 Bad Request - Either student_id or teacher_id is required`

### 3. Unauthorized Access
```bash
curl -X GET http://localhost:4000/api/achievements
```
Expected: `401 Unauthorized`

### 4. File Too Large
```bash
# Create a file larger than 5MB
dd if=/dev/zero of=large.jpg bs=1M count=6

curl -X POST http://localhost:4000/api/achievements/1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large.jpg"
```
Expected: `400 Bad Request - File too large`

### 5. Invalid File Type
```bash
curl -X POST http://localhost:4000/api/achievements/1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf"
```
Expected: `400 Bad Request - Only images allowed`

---

## Verification Queries

### Check Data in Database
```sql
-- Check achievements
SELECT * FROM achievements;

-- Check participants with names
SELECT 
  ap.*,
  s.full_name as student_name,
  t.full_name as teacher_name
FROM achievement_participants ap
LEFT JOIN students s ON ap.student_id = s.id
LEFT JOIN teachers t ON ap.teacher_id = t.id;

-- Check results with participant info
SELECT 
  ar.*,
  ap.role,
  s.full_name as participant_name
FROM achievement_results ar
JOIN achievement_participants ap ON ar.participant_id = ap.id
LEFT JOIN students s ON ap.student_id = s.id;

-- Check documents
SELECT * FROM achievement_documents;

-- Full achievement report
SELECT 
  a.title,
  a.level,
  a.event_type,
  COUNT(DISTINCT ap.id) as total_participants,
  COUNT(DISTINCT ar.id) as total_results,
  COUNT(DISTINCT ad.id) as total_documents
FROM achievements a
LEFT JOIN achievement_participants ap ON a.id = ap.achievement_id
LEFT JOIN achievement_results ar ON ap.id = ar.participant_id
LEFT JOIN achievement_documents ad ON a.id = ad.achievement_id
GROUP BY a.id;
```

---

## Performance Testing

### Load Test (Create 100 Achievements)
```bash
#!/bin/bash
TOKEN="your_token_here"

for i in {1..100}; do
  curl -X POST http://localhost:4000/api/achievements \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Test Achievement $i\",
      \"event_type\": \"Lomba\",
      \"level\": \"Sekolah\"
    }" &
done
wait
echo "Load test completed"
```

### Pagination Test
```bash
# Test with different page sizes
for LIMIT in 10 25 50 100; do
  echo "Testing with limit=$LIMIT"
  time curl -X GET "http://localhost:4000/api/achievements?page=1&limit=$LIMIT" \
    -H "Authorization: Bearer $TOKEN" -o /dev/null -s
done
```

---

## Cleanup

### Delete Test Data
```sql
-- Delete all achievements (will cascade delete everything)
DELETE FROM achievements WHERE title LIKE 'Test%';

-- Or delete specific achievement
DELETE FROM achievements WHERE id = 1;

-- Verify cleanup
SELECT COUNT(*) FROM achievements;
SELECT COUNT(*) FROM achievement_participants;
SELECT COUNT(*) FROM achievement_results;
SELECT COUNT(*) FROM achievement_documents;
```

---

## MinIO Verification

### Check Uploaded Files
```bash
# Using MinIO Client (mc)
mc ls objectstorage/edulite-students/achievements/certificates/
mc ls objectstorage/edulite-students/achievements/documents/
```

### Manual File Cleanup (if needed)
```bash
# Remove all achievement files
mc rm --recursive --force objectstorage/edulite-students/achievements/
```

---

## Expected Success Indicators

✅ **All tables created** without errors  
✅ **Can create achievement** and get ID back  
✅ **Can add participants** (both student and teacher)  
✅ **Can add results** for participants  
✅ **Can upload certificate** and get MinIO URL  
✅ **Can upload documents** and get MinIO URL  
✅ **Pagination works** correctly  
✅ **Filters work** (event_type, level)  
✅ **Cascade delete** removes all related data  
✅ **Files auto-delete** from MinIO on record delete  
✅ **School scoping** works (only see own school data)

---

## Troubleshooting

### Issue: Migration Error
```
Error: Table 'achievements' already exists
```
**Solution:** Drop tables first, then re-run migration:
```sql
DROP TABLE IF EXISTS achievement_documents;
DROP TABLE IF EXISTS achievement_results;
DROP TABLE IF EXISTS achievement_participants;
DROP TABLE IF EXISTS achievements;
```

### Issue: MinIO Upload Error
```
Error: Access Denied
```
**Solution:** Check MinIO credentials in `config/minio.js` and bucket exists

### Issue: Foreign Key Error
```
Error: Cannot add or update a child row
```
**Solution:** Ensure referenced records exist (student_id, teacher_id, achievement_id)

---

**Ready to test!** 🚀
