-- Migration: Remove user_id from students table
-- Date: 2025-11-18

USE edulite_db;

-- Drop foreign key constraints
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND CONSTRAINT_NAME = 'students_ibfk_1') > 0,
  'ALTER TABLE students DROP FOREIGN KEY students_ibfk_1',
  'SELECT ''No students_ibfk_1 to drop'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND CONSTRAINT_NAME = 'fk_students_user_id') > 0,
  'ALTER TABLE students DROP FOREIGN KEY fk_students_user_id',
  'SELECT ''No fk_students_user_id to drop'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop columns if they exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'user_id') > 0,
  'ALTER TABLE students DROP COLUMN user_id',
  'SELECT ''No user_id column to drop'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'student_number') > 0,
  'ALTER TABLE students DROP COLUMN student_number',
  'SELECT ''No student_number column to drop'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add new columns if they don't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'nis') = 0,
  'ALTER TABLE students ADD COLUMN nis VARCHAR(50) NULL AFTER department_id',
  'SELECT ''nis column already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'nisn') = 0,
  'ALTER TABLE students ADD COLUMN nisn VARCHAR(50) NULL AFTER nis',
  'SELECT ''nisn column already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'date_of_birth') = 0,
  'ALTER TABLE students ADD COLUMN date_of_birth DATE NULL AFTER nisn',
  'SELECT ''date_of_birth column already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'gender') = 0,
  'ALTER TABLE students ADD COLUMN gender VARCHAR(10) NULL COMMENT ''L atau P'' AFTER date_of_birth',
  'SELECT ''gender column already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'address') = 0,
  'ALTER TABLE students ADD COLUMN address TEXT NULL AFTER gender',
  'SELECT ''address column already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'parent_name') = 0,
  'ALTER TABLE students ADD COLUMN parent_name VARCHAR(100) NULL AFTER address',
  'SELECT ''parent_name column already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND COLUMN_NAME = 'parent_phone') = 0,
  'ALTER TABLE students ADD COLUMN parent_phone VARCHAR(30) NULL AFTER parent_name',
  'SELECT ''parent_phone column already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes if they don't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND INDEX_NAME = 'idx_nis') = 0,
  'ALTER TABLE students ADD INDEX idx_nis (nis)',
  'SELECT ''idx_nis already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE()
   AND TABLE_NAME = 'students'
   AND INDEX_NAME = 'idx_nisn') = 0,
  'ALTER TABLE students ADD INDEX idx_nisn (nisn)',
  'SELECT ''idx_nisn already exists'''
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update column properties
ALTER TABLE students MODIFY COLUMN name VARCHAR(255) NOT NULL;
ALTER TABLE students MODIFY COLUMN school_id INT NOT NULL;