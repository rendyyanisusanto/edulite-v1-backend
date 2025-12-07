-- Create letter_dispositions table
CREATE TABLE IF NOT EXISTS letter_dispositions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  incoming_id INT NOT NULL,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  
  instruction TEXT NOT NULL COMMENT 'Isi instruksi disposisi',
  status VARCHAR(30) DEFAULT 'PENDING' COMMENT 'PENDING, ON_PROGRESS, DONE',
  due_date DATE COMMENT 'Batas waktu penyelesaian',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  
  FOREIGN KEY (incoming_id) REFERENCES incoming_letters(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_incoming_id (incoming_id),
  INDEX idx_from_user_id (from_user_id),
  INDEX idx_to_user_id (to_user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
