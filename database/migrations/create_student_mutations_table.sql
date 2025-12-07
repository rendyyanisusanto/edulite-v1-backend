-- Migration: Create student_mutations table
-- Date: 2025-11-18

USE edulite_db;

-- Create student_mutations table
CREATE TABLE IF NOT EXISTS student_mutations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  school_id INT NOT NULL,
  type VARCHAR(20) NOT NULL COMMENT 'MASUK, PINDAH, KELUAR',
  from_school VARCHAR(255) NULL COMMENT 'sekolah asal (jika MASUK)',
  to_school VARCHAR(255) NULL COMMENT 'sekolah tujuan (jika PINDAH/KELUAR)',
  reason TEXT NULL COMMENT 'alasan',
  date DATE NOT NULL COMMENT 'tanggal mutasi',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_school_id (school_id),
  INDEX idx_type (type),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
