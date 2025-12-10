-- Create document_types table
CREATE TABLE IF NOT EXISTS document_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE KEY unique_school_code (school_id, code),
  INDEX idx_school_id (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default document types
INSERT INTO document_types (school_id, code, name, required, description) 
SELECT DISTINCT 
  s.id as school_id,
  dt.code,
  dt.name,
  dt.required,
  dt.description
FROM schools s
CROSS JOIN (
  SELECT 'AKTA' as code, 'Akta Kelahiran' as name, TRUE as required, 'Akta kelahiran siswa' as description
  UNION ALL SELECT 'KK', 'Kartu Keluarga', TRUE, 'Kartu keluarga siswa'
  UNION ALL SELECT 'KTP_AYAH', 'KTP Ayah', TRUE, 'KTP orang tua (ayah)'
  UNION ALL SELECT 'KTP_IBU', 'KTP Ibu', TRUE, 'KTP orang tua (ibu)'
  UNION ALL SELECT 'IJAZAH', 'Ijazah Terakhir', TRUE, 'Ijazah jenjang sebelumnya'
  UNION ALL SELECT 'SKHUN', 'SKHUN', FALSE, 'Surat Keterangan Hasil Ujian Nasional'
  UNION ALL SELECT 'VAKSIN', 'Kartu Vaksin', FALSE, 'Kartu vaksinasi/imunisasi'
  UNION ALL SELECT 'RAPORT', 'Raport', FALSE, 'Raport semester terakhir'
  UNION ALL SELECT 'PAS_FOTO', 'Pas Foto', TRUE, 'Pas foto siswa'
  UNION ALL SELECT 'SURAT_PINDAH', 'Surat Pindah', FALSE, 'Surat pindah sekolah (jika ada)'
  UNION ALL SELECT 'SURAT_KELAKUAN_BAIK', 'Surat Kelakuan Baik', FALSE, 'Surat kelakuan baik dari sekolah sebelumnya'
  UNION ALL SELECT 'KIP', 'Kartu Indonesia Pintar', FALSE, 'KIP/KPS untuk siswa kurang mampu'
  UNION ALL SELECT 'PKH', 'Kartu PKH', FALSE, 'Kartu Program Keluarga Harapan'
  UNION ALL SELECT 'SURAT_KETERANGAN_LAIN', 'Surat Keterangan Lainnya', FALSE, 'Surat keterangan lainnya yang diperlukan'
) dt
WHERE NOT EXISTS (
  SELECT 1 FROM document_types 
  WHERE school_id = s.id AND code = dt.code
);
