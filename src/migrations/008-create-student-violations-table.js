export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('student_violations', {
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
    type_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'violation_types',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    action_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'violation_actions',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    reported_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE')
    },
    time: {
      type: Sequelize.TIME,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIME')
    },
    location: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'e.g., "Kelas X", "Lapangan", "Koridor"'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Detailed description of the violation'
    },
    evidence: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Path to evidence file (photo/video)'
    },
    status: {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIONED'),
      defaultValue: 'PENDING'
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Additional notes from teacher/admin'
    },
    parent_notified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether parents have been notified'
    },
    parent_notification_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // Indexes
  await queryInterface.addIndex('student_violations', ['student_id']);
  await queryInterface.addIndex('student_violations', ['type_id']);
  await queryInterface.addIndex('student_violations', ['action_id']);
  await queryInterface.addIndex('student_violations', ['reported_by']);
  await queryInterface.addIndex('student_violations', ['date']);
  await queryInterface.addIndex('student_violations', ['status']);
  await queryInterface.addIndex('student_violations', ['parent_notified']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('student_violations');
};