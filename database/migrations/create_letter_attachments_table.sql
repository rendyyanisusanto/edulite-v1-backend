-- Create letter_attachments table
CREATE TABLE IF NOT EXISTS letter_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  incoming_id INT NULL,
  outgoing_id INT NULL,
  
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT COMMENT 'File size in bytes',
  mime_type VARCHAR(100),
  caption VARCHAR(255),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (incoming_id) REFERENCES incoming_letters(id) ON DELETE CASCADE,
  FOREIGN KEY (outgoing_id) REFERENCES outgoing_letters(id) ON DELETE CASCADE,
  
  INDEX idx_incoming_id (incoming_id),
  INDEX idx_outgoing_id (outgoing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
