-- Migration: Create counseling_cases table
-- Description: Table untuk menyimpan data kasus konseling siswa

CREATE TABLE counseling_cases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  student_id INT NOT NULL,

  source VARCHAR(30) NOT NULL COMMENT 'GURU, ORTU, SISWA, BK, SISTEM',
  issue_title VARCHAR(150) NOT NULL,
  issue_description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL COMMENT 'emosional, sosial, belajar, disiplin, dll',
  level VARCHAR(20) NOT NULL COMMENT 'RINGAN, SEDANG, BERAT',

  status VARCHAR(30) NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN, IN_PROGRESS, WAITING_PARENT, RESOLVED, CLOSED',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT DEFAULT NULL,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,

  INDEX idx_school_id (school_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_level (level),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO counseling_cases (
  school_id, student_id, source, issue_title, issue_description,
  category, level, status, created_by
) VALUES
(1, 1, 'GURU', 'Sering Terlambat', 'Siswa sering terlambat masuk kelas dan tidak ada alasan yang jelas',
 'disiplin', 'SEDANG', 'OPEN', 1),
(1, 1, 'SISWA', 'Sulit Bergaul', 'Merasa kesulitan bergaul dengan teman-teman sekelas',
 'sosial', 'RINGAN', 'IN_PROGRESS', 1),
(1, 2, 'ORTU', 'Anak Menjadi Pendiam', 'Anak menjadi lebih pendiam dan menarik diri dari lingkungan sosial',
 'emosional', 'BERAT', 'WAITING_PARENT', 1),
(1, 3, 'BK', 'Motivasi Belajar Menurun', 'Siswa kehilangan motivasi belajar dan nilai-nilai menurun drastis',
 'belajar', 'SEDANG', 'OPEN', 1);