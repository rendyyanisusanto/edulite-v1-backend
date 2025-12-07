-- Migration: Create achievements tables
-- Date: 2025-11-18

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL COMMENT 'Lomba, Kompetisi, Kejuaraan, Olimpiade, dll',
  level VARCHAR(50) NOT NULL COMMENT 'Sekolah, Kecamatan, Kabupaten, Provinsi, Nasional, Internasional',
  organizer VARCHAR(255),
  event_date DATE,
  location VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create achievement_participants table
CREATE TABLE IF NOT EXISTS achievement_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  achievement_id INT NOT NULL,
  student_id INT NULL COMMENT 'jika peserta adalah siswa',
  teacher_id INT NULL COMMENT 'jika pendamping/pelatih guru',
  role VARCHAR(50) NOT NULL COMMENT 'Peserta, Pelatih, Pendamping',
  notes VARCHAR(255),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  CHECK (student_id IS NOT NULL OR teacher_id IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create achievement_results table
CREATE TABLE IF NOT EXISTS achievement_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  `rank` VARCHAR(50) COMMENT 'Juara 1, Juara 2, Harapan, Finalis, dll',
  score VARCHAR(50) COMMENT 'jika ada penilaian',
  category VARCHAR(100) COMMENT 'tunggal, beregu, putra/putri',
  certificate_file VARCHAR(500) COMMENT 'URL sertifikat di MinIO',
  certificate_key VARCHAR(255) COMMENT 'Key file sertifikat di MinIO',
  notes TEXT,
  FOREIGN KEY (participant_id) REFERENCES achievement_participants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create achievement_documents table
CREATE TABLE IF NOT EXISTS achievement_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  achievement_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL COMMENT 'URL dokumen di MinIO',
  file_key VARCHAR(255) NOT NULL COMMENT 'Key file di MinIO',
  caption VARCHAR(255),
  file_type VARCHAR(50) COMMENT 'image, document, certificate',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_achievements_school ON achievements(school_id);
CREATE INDEX idx_achievements_event_type ON achievements(event_type);
CREATE INDEX idx_achievements_level ON achievements(level);
CREATE INDEX idx_achievement_participants_achievement ON achievement_participants(achievement_id);
CREATE INDEX idx_achievement_participants_student ON achievement_participants(student_id);
CREATE INDEX idx_achievement_participants_teacher ON achievement_participants(teacher_id);
CREATE INDEX idx_achievement_results_participant ON achievement_results(participant_id);
CREATE INDEX idx_achievement_documents_achievement ON achievement_documents(achievement_id);
