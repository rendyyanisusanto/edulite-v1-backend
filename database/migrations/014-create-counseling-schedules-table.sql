-- Migration: Create counseling_schedules table
-- Created: 2025-12-13
-- Description: Table untuk menyimpan jadwal konseling

-- Create table
CREATE TABLE IF NOT EXISTS `counseling_schedules` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `school_id` INT NOT NULL,
    `case_id` INT NOT NULL,
    `schedule_date` DATETIME NOT NULL,
    `counselor_id` INT NOT NULL COMMENT 'Guru BK yang menjadwalkan',
    `status` ENUM('UPCOMING', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING' COMMENT 'UPCOMING, DONE, CANCELLED',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_counseling_schedules_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_counseling_schedules_case` 
        FOREIGN KEY (`case_id`) REFERENCES `counseling_cases` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_counseling_schedules_counselor` 
        FOREIGN KEY (`counselor_id`) REFERENCES `teachers` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX `idx_counseling_schedules_school_id` ON `counseling_schedules` (`school_id`);
CREATE INDEX `idx_counseling_schedules_case_id` ON `counseling_schedules` (`case_id`);
CREATE INDEX `idx_counseling_schedules_counselor_id` ON `counseling_schedules` (`counselor_id`);
CREATE INDEX `idx_counseling_schedules_schedule_date` ON `counseling_schedules` (`schedule_date`);
CREATE INDEX `idx_counseling_schedules_status` ON `counseling_schedules` (`status`);

-- Rollback script (uncomment to drop table)
-- DROP TABLE IF EXISTS `counseling_schedules`;
