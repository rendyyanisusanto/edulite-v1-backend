export const up = async (queryInterface, Sequelize) => {
  // Create violation_levels table
  await queryInterface.createTable('violation_levels', {
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
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'e.g., "Ringan", "Sedang", "Berat"'
    },
    level: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'e.g., 1, 2, 3 for sorting'
    },
    color: {
      type: Sequelize.STRING(7),
      allowNull: true,
      defaultValue: '#FF0000',
      comment: 'Hex color code for UI'
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

  // Create violation_types table
  await queryInterface.createTable('violation_types', {
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
    level_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'violation_levels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'e.g., "Terlambat", "Tidak seragam", "Bolos"'
    },
    code: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Violation code for identification'
    },
    point: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Points deducted for this violation'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
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

  // Create violation_actions table
  await queryInterface.createTable('violation_actions', {
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
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'e.g., "Peringatan", "Orang tua dipanggil", "Skorsing"'
    },
    min_points: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Minimum points required for this action'
    },
    max_points: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Maximum points for this action (optional)'
    },
    action_type: {
      type: Sequelize.ENUM('WARNING', 'PARENT_NOTICE', 'SUSPENSION', 'EXPULSION'),
      allowNull: false,
      defaultValue: 'WARNING'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
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
  await queryInterface.addIndex('violation_levels', ['school_id']);
  await queryInterface.addIndex('violation_levels', ['school_id', 'level'], { unique: true });

  await queryInterface.addIndex('violation_types', ['school_id']);
  await queryInterface.addIndex('violation_types', ['level_id']);
  await queryInterface.addIndex('violation_types', ['code']);
  await queryInterface.addIndex('violation_types', ['is_active']);

  await queryInterface.addIndex('violation_actions', ['school_id']);
  await queryInterface.addIndex('violation_actions', ['action_type']);
  await queryInterface.addIndex('violation_actions', ['is_active']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('violation_actions');
  await queryInterface.dropTable('violation_types');
  await queryInterface.dropTable('violation_levels');
};