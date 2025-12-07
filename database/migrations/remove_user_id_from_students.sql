-- Migration: Remove user_id from students table
-- Date: 2025-11-18

USE edulite_db;

-- Drop foreign key constraint first if exists
ALTER TABLE students DROP FOREIGN KEY IF EXISTS students_ibfk_1;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_user_id;

-- Drop the user_id column
ALTER TABLE students DROP COLUMN IF EXISTS user_id;

-- Drop student_number column if exists (not used in new schema)
ALTER TABLE students DROP COLUMN IF EXISTS student_number;

-- Add new columns if they don't exist
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS nis VARCHAR(50) NULL AFTER department_id,
  ADD COLUMN IF NOT EXISTS nisn VARCHAR(50) NULL AFTER nis,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL AFTER nisn,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(10) NULL COMMENT 'L atau P' AFTER date_of_birth,
  ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER gender,
  ADD COLUMN IF NOT EXISTS parent_name VARCHAR(100) NULL AFTER address,
  ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(30) NULL AFTER parent_name;

-- Add indexes if they don't exist
ALTER TABLE students ADD INDEX IF NOT EXISTS idx_nis (nis);
ALTER TABLE students ADD INDEX IF NOT EXISTS idx_nisn (nisn);

-- Update name column to NOT NULL if needed
ALTER TABLE students MODIFY COLUMN name VARCHAR(255) NOT NULL;

-- Update school_id to NOT NULL if needed
ALTER TABLE students MODIFY COLUMN school_id INT NOT NULL;
