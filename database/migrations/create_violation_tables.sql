-- Create violation_levels table
CREATE TABLE IF NOT EXISTS violation_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  min_point INT NOT NULL,
  max_point INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  INDEX idx_school_id (school_id)
);

-- Create violation_types table
CREATE TABLE IF NOT EXISTS violation_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  level_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  point INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (level_id) REFERENCES violation_levels(id) ON DELETE CASCADE,
  INDEX idx_school_id (school_id),
  INDEX idx_level_id (level_id)
);

-- Create violation_actions table
CREATE TABLE IF NOT EXISTS violation_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  level_id INT NOT NULL,
  action_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (level_id) REFERENCES violation_levels(id) ON DELETE CASCADE,
  INDEX idx_school_id (school_id),
  INDEX idx_level_id (level_id)
);

-- Create student_violations table
CREATE TABLE IF NOT EXISTS student_violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  type_id INT NOT NULL,
  action_id INT NULL,
  date DATE NOT NULL,
  location VARCHAR(100),
  description TEXT,
  evidence_file VARCHAR(255),
  status VARCHAR(30) DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  approved_by INT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES violation_types(id) ON DELETE CASCADE,
  FOREIGN KEY (action_id) REFERENCES violation_actions(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_type_id (type_id),
  INDEX idx_action_id (action_id),
  INDEX idx_status (status),
  INDEX idx_date (date)
);
