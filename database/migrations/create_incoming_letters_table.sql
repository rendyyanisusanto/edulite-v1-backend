-- Create incoming_letters table
CREATE TABLE IF NOT EXISTS incoming_letters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  
  letter_number VARCHAR(100) COMMENT 'Nomor surat eksternal dari pengirim',
  classification VARCHAR(50) COMMENT 'UMUM, UNDANGAN, RAHASIA, PENTING',
  subject VARCHAR(255) NOT NULL,
  sender VARCHAR(255) NOT NULL,
  received_date DATE NOT NULL,
  letter_date DATE COMMENT 'Tanggal surat dari pengirim',
  
  priority VARCHAR(30) DEFAULT 'NORMAL' COMMENT 'LOW, NORMAL, HIGH',
  status VARCHAR(30) DEFAULT 'BARU' COMMENT 'BARU, DISPOSISI, PROSES, SELESAI, ARSIP',
  
  auto_number VARCHAR(100) COMMENT 'Nomor otomatis di-generate sistem',
  description TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_school_id (school_id),
  INDEX idx_status (status),
  INDEX idx_classification (classification),
  INDEX idx_received_date (received_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
