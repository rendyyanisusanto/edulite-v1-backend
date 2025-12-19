-- Migration: Create student_certificates table
-- Run this manually if automatic migration fails

CREATE TABLE IF NOT EXISTS student_certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  student_id INT NOT NULL,
  achievement_id INT NULL,
  template_id INT NULL,
  certificate_number VARCHAR(50) NULL COMMENT 'Nomor piagam/sertifikat',
  certificate_title VARCHAR(150) NULL COMMENT 'Judul sertifikat, contoh: Piagam Penghargaan',
  issued_date DATE NULL COMMENT 'Tanggal penerbitan sertifikat',
  file_path VARCHAR(255) NULL COMMENT 'Path file PDF hasil generate di MinIO',
  file_key VARCHAR(255) NULL COMMENT 'Key file di MinIO',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  INDEX idx_school_id (school_id),
  INDEX idx_student_id (student_id),
  INDEX idx_achievement_id (achievement_id),
  INDEX idx_template_id (template_id),
  INDEX idx_certificate_number (certificate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
