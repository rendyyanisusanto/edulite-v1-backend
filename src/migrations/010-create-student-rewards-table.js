export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('student_rewards', {
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
        model: 'reward_types',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    action_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'reward_actions',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    given_by: {
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
      comment: 'e.g., "Kelas X", "Assembly Hall", "Lab"'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Detailed description of the reward/achievement'
    },
    evidence: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Path to evidence file (photo/video/certificate)'
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
    public_announcement: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether announced publicly (assembly, newsletter, etc.)'
    },
    announcement_date: {
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
  await queryInterface.addIndex('student_rewards', ['student_id']);
  await queryInterface.addIndex('student_rewards', ['type_id']);
  await queryInterface.addIndex('student_rewards', ['action_id']);
  await queryInterface.addIndex('student_rewards', ['given_by']);
  await queryInterface.addIndex('student_rewards', ['date']);
  await queryInterface.addIndex('student_rewards', ['status']);
  await queryInterface.addIndex('student_rewards', ['parent_notified']);
  await queryInterface.addIndex('student_rewards', ['public_announcement']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('student_rewards');
};