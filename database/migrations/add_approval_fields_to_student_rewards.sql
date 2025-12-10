-- Add approved_at and rejection_reason columns to student_rewards table

ALTER TABLE student_rewards 
ADD COLUMN approved_at DATETIME NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at;
