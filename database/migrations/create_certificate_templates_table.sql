-- Migration: Create certificate_templates table
-- Date: 2025-12-15
-- Description: Table untuk menyimpan template sertifikat prestasi siswa

-- Create certificate_templates table
CREATE TABLE IF NOT EXISTS certificate_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  
  name VARCHAR(100) NOT NULL COMMENT 'Nama template (e.g., Sertifikat Prestasi Akademik)',
  description TEXT COMMENT 'Deskripsi template',
  
  background_image VARCHAR(255) COMMENT 'URL gambar background template (JPG/PNG) di MinIO',
  background_image_key VARCHAR(255) COMMENT 'Key file background image di MinIO',
  background_fit VARCHAR(20) DEFAULT 'cover' COMMENT 'cover, contain, fill, center',
  
  orientation VARCHAR(20) NOT NULL DEFAULT 'portrait' COMMENT 'portrait atau landscape',
  certificate_width INT DEFAULT 800 COMMENT 'Lebar sertifikat dalam pixel',
  certificate_height INT DEFAULT 600 COMMENT 'Tinggi sertifikat dalam pixel',
  
  layout JSON COMMENT 'Posisi dan styling untuk setiap field dinamis (nama, lomba, dll)',
  
  is_default BOOLEAN DEFAULT FALSE COMMENT 'Template default untuk sekolah',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status aktif template',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  
  CONSTRAINT chk_orientation CHECK (orientation IN ('portrait', 'landscape')),
  CONSTRAINT chk_background_fit CHECK (background_fit IN ('cover', 'contain', 'fill', 'center'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_certificate_templates_school ON certificate_templates(school_id);
CREATE INDEX idx_certificate_templates_active ON certificate_templates(is_active);
CREATE INDEX idx_certificate_templates_default ON certificate_templates(is_default);
CREATE INDEX idx_certificate_templates_orientation ON certificate_templates(orientation);

-- Insert sample template for testing (optional)
-- INSERT INTO certificate_templates (school_id, name, description, orientation, layout, is_active) 
-- VALUES (
--   1, 
--   'Sertifikat Prestasi Akademik', 
--   'Template sertifikat untuk prestasi akademik siswa',
--   'portrait',
--   '{"student_name": {"x": 100, "y": 200, "fontSize": 24}, "nis": {"x": 100, "y": 250, "fontSize": 18}}',
--   TRUE
-- );
