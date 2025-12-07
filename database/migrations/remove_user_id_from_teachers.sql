-- Migration: Remove user_id from teachers table
-- Date: 2025-11-18

USE edulite_db;

-- Drop foreign key constraint first if exists
ALTER TABLE teachers DROP FOREIGN KEY IF EXISTS teachers_ibfk_1;
ALTER TABLE teachers DROP FOREIGN KEY IF EXISTS fk_teachers_user_id;

-- Drop the user_id column
ALTER TABLE teachers DROP COLUMN IF EXISTS user_id;

-- Ensure school_id is NOT NULL
ALTER TABLE teachers MODIFY COLUMN school_id INT NOT NULL;

-- Ensure proper indexes exist
ALTER TABLE teachers ADD INDEX IF NOT EXISTS idx_school_id (school_id);
ALTER TABLE teachers ADD INDEX IF NOT EXISTS idx_nip (nip);
