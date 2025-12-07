-- Create outgoing_letters table
CREATE TABLE IF NOT EXISTS outgoing_letters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  
  letter_number VARCHAR(100) COMMENT 'Nomor surat keluar resmi',
  classification VARCHAR(50) COMMENT 'UMUM, UNDANGAN, RAHASIA, PENTING',
  subject VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  letter_date DATE NOT NULL,
  send_date DATE,
  
  priority VARCHAR(30) DEFAULT 'NORMAL' COMMENT 'LOW, NORMAL, HIGH',
  status VARCHAR(30) DEFAULT 'DRAFT' COMMENT 'DRAFT, PENDING, APPROVED, SENT, REJECTED, ARCHIVED',
  
  auto_number VARCHAR(100) COMMENT 'Nomor otomatis dari sistem',
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
  INDEX idx_letter_date (letter_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
