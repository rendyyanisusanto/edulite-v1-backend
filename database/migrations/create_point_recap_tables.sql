-- ========================================================
-- MIGRATION: Create Point Recap Tables (Updated - No Semester)
-- Deskripsi: Tabel untuk rekapitulasi poin pelanggaran dan reward siswa
-- ========================================================

-- Table: student_point_recap
-- Menyimpan rekapitulasi poin per siswa per periode
CREATE TABLE IF NOT EXISTS student_point_recap (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  school_id INT NOT NULL,
  academic_year_id INT NOT NULL,

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
  UNIQUE KEY unique_student_period (student_id, academic_year_id),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year_id),
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
  UNIQUE KEY unique_class_period (class_id, academic_year_id),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year_id),

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
  UNIQUE KEY unique_grade_period (grade_id, academic_year_id),
  INDEX idx_school (school_id),
  INDEX idx_academic_year (academic_year_id),

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