-- Add card-related fields to students table
-- Note: Run this only if columns don't exist

-- Check and add rfid_code if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'rfid_code';
SET @query = IF(@col_exists = 0, 'ALTER TABLE students ADD COLUMN rfid_code VARCHAR(100) NULL COMMENT "Kode RFID kartu siswa"', 'SELECT "Column rfid_code already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add qr_code if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'qr_code';
SET @query = IF(@col_exists = 0, 'ALTER TABLE students ADD COLUMN qr_code TEXT NULL COMMENT "URL atau encoding QR code (base64 data URL)"', 'SELECT "Column qr_code already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add barcode if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'barcode';
SET @query = IF(@col_exists = 0, 'ALTER TABLE students ADD COLUMN barcode TEXT NULL COMMENT "Barcode kartu siswa (base64 data URL)"', 'SELECT "Column barcode already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add card_template_id if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'card_template_id';
SET @query = IF(@col_exists = 0, 'ALTER TABLE students ADD COLUMN card_template_id INT NULL COMMENT "Template kartu yang digunakan"', 'SELECT "Column card_template_id already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add card_number if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'card_number';
SET @query = IF(@col_exists = 0, 'ALTER TABLE students ADD COLUMN card_number VARCHAR(100) NULL COMMENT "Nomor kartu siswa (auto generate)"', 'SELECT "Column card_number already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes (check if they exist first)
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND INDEX_NAME = 'idx_card_number';
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_card_number ON students(card_number)', 'SELECT "Index idx_card_number already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND INDEX_NAME = 'idx_rfid_code';
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_rfid_code ON students(rfid_code)', 'SELECT "Index idx_rfid_code already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND INDEX_NAME = 'idx_card_template_id';
SET @query = IF(@idx_exists = 0, 'CREATE INDEX idx_card_template_id ON students(card_template_id)', 'SELECT "Index idx_card_template_id already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = 'edulite_v1' AND TABLE_NAME = 'students' AND CONSTRAINT_NAME = 'fk_students_card_template';
SET @query = IF(@fk_exists = 0, 'ALTER TABLE students ADD CONSTRAINT fk_students_card_template FOREIGN KEY (card_template_id) REFERENCES card_templates(id) ON DELETE SET NULL', 'SELECT "Foreign key fk_students_card_template already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
