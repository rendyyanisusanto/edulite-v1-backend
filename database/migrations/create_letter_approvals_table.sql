-- Create letter_approvals table
CREATE TABLE IF NOT EXISTS letter_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  incoming_id INT NULL,
  outgoing_id INT NULL,
  
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT 'APPROVE, REJECT, SEND, CLOSE',
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (incoming_id) REFERENCES incoming_letters(id) ON DELETE CASCADE,
  FOREIGN KEY (outgoing_id) REFERENCES outgoing_letters(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_incoming_id (incoming_id),
  INDEX idx_outgoing_id (outgoing_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
