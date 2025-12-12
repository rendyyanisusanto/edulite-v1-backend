export const up = async (queryInterface, Sequelize) => {
  // Create student_point_recap table
  await queryInterface.createTable('student_point_recap', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    school_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    academic_year_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'academic_years',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Poin Pelanggaran
    total_violations: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Total jumlah pelanggaran'
    },
    total_violation_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Total poin pelanggaran'
    },
    // Poin Reward
    total_rewards: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Total jumlah reward'
    },
    total_reward_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Total poin reward'
    },
    // Poin Akumulasi
    net_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Poin bersih (reward - violation)'
    },
    // Status
    status: {
      type: Sequelize.STRING(30),
      defaultValue: 'ACTIVE',
      comment: 'ACTIVE, ARCHIVED'
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    // Timestamps
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    },
    calculated_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Waktu terakhir kalkulasi'
    }
  });

  // Create class_point_recap table
  await queryInterface.createTable('class_point_recap', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    class_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    school_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    academic_year_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'academic_years',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Statistik Siswa
    total_students: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Total siswa di kelas'
    },
    // Statistik Pelanggaran
    total_violations: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_violation_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    avg_violation_points: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    // Statistik Reward
    total_rewards: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_reward_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    avg_reward_points: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    // Poin Bersih
    total_net_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    avg_net_points: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    // Ranking
    students_with_negative_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    students_with_positive_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    students_with_zero_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    // Timestamps
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    },
    calculated_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Create grade_point_recap table
  await queryInterface.createTable('grade_point_recap', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    grade_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'grades',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    school_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    academic_year_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'academic_years',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Statistik Siswa
    total_students: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_classes: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    // Statistik Pelanggaran
    total_violations: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_violation_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    avg_violation_points: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    // Statistik Reward
    total_rewards: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_reward_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    avg_reward_points: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    // Poin Bersih
    total_net_points: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    avg_net_points: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    // Timestamps
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    },
    calculated_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Create point_recap_logs table
  await queryInterface.createTable('point_recap_logs', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    school_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    academic_year_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'academic_years',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    recap_type: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'STUDENT, CLASS, GRADE'
    },
    total_processed: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'COMPLETED',
      comment: 'PROCESSING, COMPLETED, FAILED'
    },
    error_message: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    processed_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    processed_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Indexes for student_point_recap
  await queryInterface.addIndex('student_point_recap', ['student_id'], { unique: true });
  await queryInterface.addIndex('student_point_recap', ['school_id']);
  await queryInterface.addIndex('student_point_recap', ['academic_year_id']);
  await queryInterface.addIndex('student_point_recap', ['net_points']);
  await queryInterface.addIndex('student_point_recap', ['status']);

  // Indexes for class_point_recap
  await queryInterface.addIndex('class_point_recap', ['class_id'], { unique: true });
  await queryInterface.addIndex('class_point_recap', ['school_id']);
  await queryInterface.addIndex('class_point_recap', ['academic_year_id']);

  // Indexes for grade_point_recap
  await queryInterface.addIndex('grade_point_recap', ['grade_id'], { unique: true });
  await queryInterface.addIndex('grade_point_recap', ['school_id']);
  await queryInterface.addIndex('grade_point_recap', ['academic_year_id']);

  // Indexes for point_recap_logs
  await queryInterface.addIndex('point_recap_logs', ['school_id']);
  await queryInterface.addIndex('point_recap_logs', ['recap_type']);
  await queryInterface.addIndex('point_recap_logs', ['status']);
  await queryInterface.addIndex('point_recap_logs', ['processed_at']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('point_recap_logs');
  await queryInterface.dropTable('grade_point_recap');
  await queryInterface.dropTable('class_point_recap');
  await queryInterface.dropTable('student_point_recap');
};