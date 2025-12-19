-- Migration: Create counseling_followups table
-- Description: Table untuk menyimpan data tindak lanjut konseling

CREATE TABLE counseling_followups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  followup_by INT NOT NULL,
  
  followup_date DATETIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'DONE, PENDING',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_session_id (session_id),
  INDEX idx_followup_by (followup_by),
  INDEX idx_followup_date (followup_date),
  INDEX idx_status (status),
  FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (followup_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO counseling_followups (
  session_id, followup_by, followup_date, notes, status
) VALUES
(1, 1, '2025-01-12 14:00:00', 'Monitoring progress siswa setelah sesi pertama. Siswa menunjukkan perbaikan dalam komunikasi.', 'DONE'),
(1, 1, '2025-01-19 14:00:00', 'Evaluasi teknik relaksasi yang diajarkan. Perlu sesi lanjutan minggu depan.', 'PENDING'),
(2, 1, '2025-01-13 15:00:00', 'Follow up dengan wali kelas terkait interaksi sosial siswa di kelas.', 'DONE'),
(3, 1, '2025-01-14 10:00:00', 'Koordinasi dengan orang tua untuk sesi keluarga yang dijadwalkan.', 'PENDING'),
(4, 1, '2025-01-17 09:00:00', 'Persiapan tes minat dan bakat untuk siswa. Sudah dijadwalkan untuk minggu depan.', 'DONE');
