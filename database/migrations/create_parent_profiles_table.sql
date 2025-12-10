-- Migration: Create parent_profiles table
-- Description: Store parent and guardian profiles for students

CREATE TABLE IF NOT EXISTS parent_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  type VARCHAR(20) NOT NULL COMMENT 'AYAH, IBU, WALI',
  full_name VARCHAR(100) NOT NULL,
  nik VARCHAR(30),
  phone VARCHAR(30),
  email VARCHAR(100),
  occupation VARCHAR(100),
  education VARCHAR(100),
  is_guardian BOOLEAN DEFAULT FALSE COMMENT 'Penanggung jawab utama',
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_parent_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_type (type),
  INDEX idx_is_guardian (is_guardian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: Create parent_documents table
-- Description: Store documents for parent profiles

CREATE TABLE IF NOT EXISTS parent_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  document_type VARCHAR(30) NOT NULL COMMENT 'KTP, KK, AKTA, SURAT_WALI, dll',
  document_file VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_document_parent FOREIGN KEY (parent_id) REFERENCES parent_profiles(id) ON DELETE CASCADE,
  INDEX idx_parent_id (parent_id),
  INDEX idx_document_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
