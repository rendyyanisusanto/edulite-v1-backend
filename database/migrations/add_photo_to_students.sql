-- Migration: Add photo fields to students table
-- Date: 2025-11-18

USE edulite_db;

-- Add photo and photo_key columns to students table
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS photo VARCHAR(500) NULL COMMENT 'URL foto siswa di MinIO' AFTER parent_phone,
  ADD COLUMN IF NOT EXISTS photo_key VARCHAR(255) NULL COMMENT 'Key file di MinIO' AFTER photo;
