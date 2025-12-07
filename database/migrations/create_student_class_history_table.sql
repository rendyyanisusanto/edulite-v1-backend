-- Migration: Create student_class_history table
-- Date: 2025-11-18

USE edulite_db;

-- Create student_class_history table
CREATE TABLE IF NOT EXISTS student_class_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  school_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  grade_id INT NOT NULL,
  class_id INT NOT NULL,
  assigned_by INT NULL COMMENT 'user yang assign kelas',
  assignment_type VARCHAR(20) NOT NULL COMMENT 'AUTO, MANUAL',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_school_id (school_id),
  INDEX idx_academic_year_id (academic_year_id),
  INDEX idx_grade_id (grade_id),
  INDEX idx_class_id (class_id),
  INDEX idx_assignment_type (assignment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
