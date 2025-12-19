-- Migration: Create counseling_sessions table
-- Description: Table untuk menyimpan data sesi konseling

CREATE TABLE counseling_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  counselor_id INT NOT NULL,

  session_date DATETIME NOT NULL,
  method VARCHAR(30) NOT NULL COMMENT 'OFFLINE, ONLINE, CALL',
  duration INT NOT NULL COMMENT 'lama sesi dalam menit',

  notes TEXT,
  next_plan TEXT COMMENT 'rencana tindak lanjut',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_case_id (case_id),
  INDEX idx_counselor_id (counselor_id),
  INDEX idx_session_date (session_date),
  INDEX idx_method (method),
  FOREIGN KEY (case_id) REFERENCES counseling_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO counseling_sessions (
  case_id, counselor_id, session_date, method, duration, notes, next_plan
) VALUES
(1, 1, '2025-01-10 10:00:00', 'OFFLINE', 60, 'Siswa merasa lebih terbuka tentang masalahnya setelah beberapa sesi', 'Lanjutkan dengan teknik relaksasi'),
(1, 1, '2025-01-17 10:00:00', 'ONLINE', 45, 'Sesi online berjalan baik, siswa menunjukkan kemajuan', 'Evaluasi progress minggu depan'),
(2, 1, '2025-01-11 13:30:00', 'OFFLINE', 50, 'Diskusi tentang cara meningkatkan interaksi sosial di kelas', 'Role play dengan teman sebaya'),
(3, 1, '2025-01-12 09:00:00', 'CALL', 30, 'Orang tua melaporkan anak mulai lebih terbuka di rumah', 'Jadwalkan sesi keluarga'),
(4, 1, '2025-01-15 14:00:00', 'OFFLINE', 75, 'Eksplorasi akar masalah motivasi belajar yang menurun', 'Tes minat dan bakat');