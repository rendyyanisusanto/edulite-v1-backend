-- ========================================================
-- MIGRATION: Remove Semester Columns
-- Deskripsi: Menghapus kolom semester dari semua tabel terkait
-- ========================================================

-- Drop stored procedures yang menggunakan semester
DROP PROCEDURE IF EXISTS sp_calculate_student_point_recap;

-- Drop triggers yang menggunakan semester
DROP TRIGGER IF EXISTS trg_update_recap_after_violation_insert;
DROP TRIGGER IF EXISTS trg_update_recap_after_violation_update;
DROP TRIGGER IF EXISTS trg_update_recap_after_reward_insert;
DROP TRIGGER IF EXISTS trg_update_recap_after_reward_update;

-- ========================================================
-- Table: student_point_recap
-- ========================================================

-- Drop index yang ada semester
DROP INDEX idx_semester ON student_point_recap;

-- Hapus unique key lama
ALTER TABLE student_point_recap DROP INDEX unique_student_period;

-- Hapus kolom semester
ALTER TABLE student_point_recap DROP COLUMN semester;

-- Buat unique key baru tanpa semester
ALTER TABLE student_point_recap
  ADD UNIQUE KEY unique_student_period (student_id, academic_year_id);

-- ========================================================
-- Table: class_point_recap
-- ========================================================

-- Drop index yang ada semester
DROP INDEX idx_semester ON class_point_recap;

-- Hapus unique key lama
ALTER TABLE class_point_recap DROP INDEX unique_class_period;

-- Hapus kolom semester
ALTER TABLE class_point_recap DROP COLUMN semester;

-- Buat unique key baru tanpa semester
ALTER TABLE class_point_recap
  ADD UNIQUE KEY unique_class_period (class_id, academic_year_id);

-- ========================================================
-- Table: grade_point_recap
-- ========================================================

-- Drop index yang ada semester
DROP INDEX idx_semester ON grade_point_recap;

-- Hapus unique key lama
ALTER TABLE grade_point_recap DROP INDEX unique_grade_period;

-- Hapus kolom semester
ALTER TABLE grade_point_recap DROP COLUMN semester;

-- Buat unique key baru tanpa semester
ALTER TABLE grade_point_recap
  ADD UNIQUE KEY unique_grade_period (grade_id, academic_year_id);

-- ========================================================
-- Table: point_recap_logs
-- ========================================================

-- Hapus kolom semester
ALTER TABLE point_recap_logs DROP COLUMN semester;

-- ========================================================
-- Update existing data to remove duplicates
-- Since we're removing semester, we need to consolidate data
-- ========================================================

-- Consolidate student_point_recap data
DELETE r1 FROM student_point_recap r1
INNER JOIN student_point_recap r2
  WHERE r1.id > r2.id
  AND r1.student_id = r2.student_id
  AND r1.academic_year_id = r2.academic_year_id;

-- Consolidate class_point_recap data
DELETE r1 FROM class_point_recap r1
INNER JOIN class_point_recap r2
  WHERE r1.id > r2.id
  AND r1.class_id = r2.class_id
  AND r1.academic_year_id = r2.academic_year_id;

-- Consolidate grade_point_recap data
DELETE r1 FROM grade_point_recap r1
INNER JOIN grade_point_recap r2
  WHERE r1.id > r2.id
  AND r1.grade_id = r2.grade_id
  AND r1.academic_year_id = r2.academic_year_id;

-- ========================================================
-- Create new stored procedure tanpa semester
-- ========================================================

DELIMITER $$

CREATE PROCEDURE sp_calculate_student_point_recap(
  IN p_student_id INT,
  IN p_school_id INT,
  IN p_academic_year_id INT
)
BEGIN
  DECLARE v_total_violations INT DEFAULT 0;
  DECLARE v_total_violation_points INT DEFAULT 0;
  DECLARE v_total_rewards INT DEFAULT 0;
  DECLARE v_total_reward_points INT DEFAULT 0;
  DECLARE v_net_points INT DEFAULT 0;

  -- Hitung total pelanggaran dan poin pelanggaran (hanya yang APPROVED dan ACTIONED)
  SELECT
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(vt.point), 0)
  INTO v_total_violations, v_total_violation_points
  FROM student_violations sv
  INNER JOIN violation_types vt ON sv.type_id = vt.id
  INNER JOIN students s ON sv.student_id = s.id
  WHERE sv.student_id = p_student_id
    AND s.school_id = p_school_id
    AND s.academic_year_id = p_academic_year_id
    AND sv.status IN ('APPROVED', 'ACTIONED');

  -- Hitung total reward dan poin reward (hanya yang APPROVED dan ACTIONED)
  SELECT
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(rt.point), 0)
  INTO v_total_rewards, v_total_reward_points
  FROM student_rewards sr
  INNER JOIN reward_types rt ON sr.type_id = rt.id
  INNER JOIN students s ON sr.student_id = s.id
  WHERE sr.student_id = p_student_id
    AND s.school_id = p_school_id
    AND s.academic_year_id = p_academic_year_id
    AND sr.status IN ('APPROVED', 'ACTIONED');

  -- Hitung net points
  SET v_net_points = v_total_reward_points - v_total_violation_points;

  -- Insert or Update
  INSERT INTO student_point_recap (
    student_id, school_id, academic_year_id,
    total_violations, total_violation_points,
    total_rewards, total_reward_points,
    net_points, calculated_at
  ) VALUES (
    p_student_id, p_school_id, p_academic_year_id,
    v_total_violations, v_total_violation_points,
    v_total_rewards, v_total_reward_points,
    v_net_points, NOW()
  )
  ON DUPLICATE KEY UPDATE
    total_violations = v_total_violations,
    total_violation_points = v_total_violation_points,
    total_rewards = v_total_rewards,
    total_reward_points = v_total_reward_points,
    net_points = v_net_points,
    calculated_at = NOW();

END$$

DELIMITER ;

-- ========================================================
-- Create new triggers tanpa semester
-- ========================================================

-- Trigger untuk auto-update rekapitulasi saat ada perubahan pada student_violations
DELIMITER $$

CREATE TRIGGER trg_update_recap_after_violation_insert
AFTER INSERT ON student_violations
FOR EACH ROW
BEGIN
  DECLARE v_school_id INT;
  DECLARE v_academic_year_id INT;

  -- Get student info
  SELECT school_id, academic_year_id
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;

  -- Recalculate if status is APPROVED or ACTIONED
  IF NEW.status IN ('APPROVED', 'ACTIONED') THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id);
  END IF;
END$$

CREATE TRIGGER trg_update_recap_after_violation_update
AFTER UPDATE ON student_violations
FOR EACH ROW
BEGIN
  DECLARE v_school_id INT;
  DECLARE v_academic_year_id INT;

  SELECT school_id, academic_year_id
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;

  -- Recalculate if status changed to/from APPROVED or ACTIONED
  IF OLD.status != NEW.status OR OLD.type_id != NEW.type_id THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id);
  END IF;
END$$

DELIMITER ;

-- Trigger untuk auto-update rekapitulasi saat ada perubahan pada student_rewards
DELIMITER $$

CREATE TRIGGER trg_update_recap_after_reward_insert
AFTER INSERT ON student_rewards
FOR EACH ROW
BEGIN
  DECLARE v_school_id INT;
  DECLARE v_academic_year_id INT;

  SELECT school_id, academic_year_id
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;

  IF NEW.status IN ('APPROVED', 'ACTIONED') THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id);
  END IF;
END$$

CREATE TRIGGER trg_update_recap_after_reward_update
AFTER UPDATE ON student_rewards
FOR EACH ROW
BEGIN
  DECLARE v_school_id INT;
  DECLARE v_academic_year_id INT;

  SELECT school_id, academic_year_id
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;

  IF OLD.status != NEW.status OR OLD.type_id != NEW.type_id THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id);
  END IF;
END$$

DELIMITER ;