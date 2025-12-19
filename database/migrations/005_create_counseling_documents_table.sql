-- Migration: Create counseling_documents table
-- Description: Table untuk menyimpan dokumen pendukung konseling

CREATE TABLE counseling_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  document_type ENUM('CASE', 'SESSION', 'FOLLOWUP') NOT NULL COMMENT 'Tipe dokumen',
  reference_id INT COMMENT 'ID referensi (session_id atau followup_id)',
  
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT COMMENT 'Ukuran file dalam bytes',
  mime_type VARCHAR(100),
  description VARCHAR(255),
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,

  INDEX idx_case_id (case_id),
  INDEX idx_document_type (document_type),
  INDEX idx_reference_id (reference_id),
  INDEX idx_created_by (created_by),
  
  FOREIGN KEY (case_id) REFERENCES counseling_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO counseling_documents (
  case_id, document_type, reference_id, file_path, file_name, file_size, mime_type, description, created_by
) VALUES
(1, 'CASE', NULL, 'counseling-documents/cases/1/1702456789_laporan_awal.pdf', 'laporan_awal.pdf', 245678, 'application/pdf', 'Laporan awal kasus konseling', 1),
(1, 'SESSION', 1, 'counseling-documents/sessions/1/1702456890_catatan_sesi.pdf', 'catatan_sesi.pdf', 189234, 'application/pdf', 'Catatan hasil sesi konseling pertama', 1),
(2, 'CASE', NULL, 'counseling-documents/cases/2/1702457000_foto_dokumentasi.jpg', 'foto_dokumentasi.jpg', 567890, 'image/jpeg', 'Foto dokumentasi kasus', 1),
(1, 'FOLLOWUP', 1, 'counseling-documents/followups/1/1702457100_laporan_followup.pdf', 'laporan_followup.pdf', 123456, 'application/pdf', 'Laporan tindak lanjut', 1);
