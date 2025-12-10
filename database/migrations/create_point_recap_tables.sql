-- ========================================================
-- MIGRATION: Create Point Recap Tables
-- Deskripsi: Tabel untuk rekapitulasi poin pelanggaran dan reward siswa
-- ========================================================

-- Table: student_point_recap
-- Menyimpan rekapitulasi poin per siswa per periode
CREATE TABLE IF NOT EXISTS student_point_recap (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  school_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  semester INT NOT NULL COMMENT '1 = Ganjil, 2 = Genap',
  
  -- Poin Pelanggaran
  total_violations INT DEFAULT 0 COMMENT 'Total jumlah pelanggaran',
  total_violation_points INT DEFAULT 0 COMMENT 'Total poin pelanggaran',
  
  -- Poin Reward
  total_rewards INT DEFAULT 0 COMMENT 'Total jumlah reward',
  total_reward_points INT DEFAULT 0 COMMENT 'Total poin reward',
  
  -- Poin Akumulasi
  net_points INT DEFAULT 0 COMMENT 'Poin bersih (reward - violation)',
  
  -- Status
  status VARCHAR(30) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, ARCHIVED',
  notes TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  calculated_at DATETIME COMMENT 'Waktu terakhir kalkulasi',
  
  -- Indexes
  UNIQUE KEY unique_student_period (student_id, academic_year_id, semester),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year_id),
  INDEX idx_semester (semester),
  INDEX idx_net_points (net_points),
  INDEX idx_status (status),
  
  -- Foreign Keys
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: class_point_recap
-- Menyimpan rekapitulasi poin per kelas per periode
CREATE TABLE IF NOT EXISTS class_point_recap (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  school_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  semester INT NOT NULL COMMENT '1 = Ganjil, 2 = Genap',
  
  -- Statistik Siswa
  total_students INT DEFAULT 0 COMMENT 'Total siswa di kelas',
  
  -- Statistik Pelanggaran
  total_violations INT DEFAULT 0,
  total_violation_points INT DEFAULT 0,
  avg_violation_points DECIMAL(10,2) DEFAULT 0,
  
  -- Statistik Reward
  total_rewards INT DEFAULT 0,
  total_reward_points INT DEFAULT 0,
  avg_reward_points DECIMAL(10,2) DEFAULT 0,
  
  -- Poin Bersih
  total_net_points INT DEFAULT 0,
  avg_net_points DECIMAL(10,2) DEFAULT 0,
  
  -- Ranking
  students_with_negative_points INT DEFAULT 0,
  students_with_positive_points INT DEFAULT 0,
  students_with_zero_points INT DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  calculated_at DATETIME,
  
  -- Indexes
  UNIQUE KEY unique_class_period (class_id, academic_year_id, semester),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year_id),
  INDEX idx_semester (semester),
  
  -- Foreign Keys
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: grade_point_recap
-- Menyimpan rekapitulasi poin per tingkat kelas per periode
CREATE TABLE IF NOT EXISTS grade_point_recap (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grade_id INT NOT NULL,
  school_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  semester INT NOT NULL COMMENT '1 = Ganjil, 2 = Genap',
  
  -- Statistik Siswa
  total_students INT DEFAULT 0,
  total_classes INT DEFAULT 0,
  
  -- Statistik Pelanggaran
  total_violations INT DEFAULT 0,
  total_violation_points INT DEFAULT 0,
  avg_violation_points DECIMAL(10,2) DEFAULT 0,
  
  -- Statistik Reward
  total_rewards INT DEFAULT 0,
  total_reward_points INT DEFAULT 0,
  avg_reward_points DECIMAL(10,2) DEFAULT 0,
  
  -- Poin Bersih
  total_net_points INT DEFAULT 0,
  avg_net_points DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  calculated_at DATETIME,
  
  -- Indexes
  UNIQUE KEY unique_grade_period (grade_id, academic_year_id, semester),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year_id),
  INDEX idx_semester (semester),
  
  -- Foreign Keys
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: point_recap_logs
-- Log history kalkulasi rekapitulasi
CREATE TABLE IF NOT EXISTS point_recap_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  semester INT NOT NULL,
  recap_type VARCHAR(20) NOT NULL COMMENT 'STUDENT, CLASS, GRADE',
  total_processed INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'COMPLETED' COMMENT 'PROCESSING, COMPLETED, FAILED',
  error_message TEXT,
  processed_by INT,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_school (school_id),
  INDEX idx_type (recap_type),
  INDEX idx_status (status),
  INDEX idx_processed_at (processed_at),
  
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stored Procedure untuk menghitung rekapitulasi per siswa
DELIMITER $$

CREATE PROCEDURE sp_calculate_student_point_recap(
  IN p_student_id INT,
  IN p_school_id INT,
  IN p_academic_year_id INT,
  IN p_semester INT
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
    AND sv.status IN ('APPROVED', 'ACTIONED')
    AND (
      (p_semester = 1 AND MONTH(sv.date) BETWEEN 7 AND 12)
      OR (p_semester = 2 AND MONTH(sv.date) BETWEEN 1 AND 6)
    );
  
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
    AND sr.status IN ('APPROVED', 'ACTIONED')
    AND (
      (p_semester = 1 AND MONTH(sr.date) BETWEEN 7 AND 12)
      OR (p_semester = 2 AND MONTH(sr.date) BETWEEN 1 AND 6)
    );
  
  -- Hitung net points
  SET v_net_points = v_total_reward_points - v_total_violation_points;
  
  -- Insert or Update
  INSERT INTO student_point_recap (
    student_id, school_id, academic_year_id, semester,
    total_violations, total_violation_points,
    total_rewards, total_reward_points,
    net_points, calculated_at
  ) VALUES (
    p_student_id, p_school_id, p_academic_year_id, p_semester,
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

-- Trigger untuk auto-update rekapitulasi saat ada perubahan pada student_violations
DELIMITER $$

CREATE TRIGGER trg_update_recap_after_violation_insert
AFTER INSERT ON student_violations
FOR EACH ROW
BEGIN
  DECLARE v_school_id INT;
  DECLARE v_academic_year_id INT;
  DECLARE v_semester INT;
  
  -- Get student info
  SELECT school_id, academic_year_id 
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;
  
  -- Determine semester
  SET v_semester = IF(MONTH(NEW.date) BETWEEN 7 AND 12, 1, 2);
  
  -- Recalculate if status is APPROVED or ACTIONED
  IF NEW.status IN ('APPROVED', 'ACTIONED') THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id, v_semester);
  END IF;
END$$

CREATE TRIGGER trg_update_recap_after_violation_update
AFTER UPDATE ON student_violations
FOR EACH ROW
BEGIN
  DECLARE v_school_id INT;
  DECLARE v_academic_year_id INT;
  DECLARE v_semester INT;
  
  SELECT school_id, academic_year_id 
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;
  
  SET v_semester = IF(MONTH(NEW.date) BETWEEN 7 AND 12, 1, 2);
  
  -- Recalculate if status changed to/from APPROVED or ACTIONED
  IF OLD.status != NEW.status OR OLD.type_id != NEW.type_id THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id, v_semester);
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
  DECLARE v_semester INT;
  
  SELECT school_id, academic_year_id 
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;
  
  SET v_semester = IF(MONTH(NEW.date) BETWEEN 7 AND 12, 1, 2);
  
  IF NEW.status IN ('APPROVED', 'ACTIONED') THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id, v_semester);
  END IF;
END$$

CREATE TRIGGER trg_update_recap_after_reward_update
AFTER UPDATE ON student_rewards
FOR EACH ROW
BEGIN
  DECLARE v_school_id INT;
  DECLARE v_academic_year_id INT;
  DECLARE v_semester INT;
  
  SELECT school_id, academic_year_id 
  INTO v_school_id, v_academic_year_id
  FROM students WHERE id = NEW.student_id;
  
  SET v_semester = IF(MONTH(NEW.date) BETWEEN 7 AND 12, 1, 2);
  
  IF OLD.status != NEW.status OR OLD.type_id != NEW.type_id THEN
    CALL sp_calculate_student_point_recap(NEW.student_id, v_school_id, v_academic_year_id, v_semester);
  END IF;
END$$

DELIMITER ;
