export const up = async (queryInterface, Sequelize) => {
  // Create reward_levels table
  await queryInterface.createTable('reward_levels', {
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
      comment: 'e.g., "Bronze", "Silver", "Gold"'
    },
    level: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'e.g., 1, 2, 3 for sorting'
    },
    color: {
      type: Sequelize.STRING(7),
      allowNull: true,
      defaultValue: '#00FF00',
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

  // Create reward_types table
  await queryInterface.createTable('reward_types', {
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
        model: 'reward_levels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'e.g., "Juara kelas", "Bersih", "Tepat waktu"'
    },
    code: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Reward code for identification'
    },
    point: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Points awarded for this reward'
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

  // Create reward_actions table
  await queryInterface.createTable('reward_actions', {
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
      comment: 'e.g., "Sertifikat", "Piala", "Uang jajan"'
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
      type: Sequelize.ENUM('CERTIFICATE', 'TROPHY', 'MONEY', 'PRIVILEGE', 'OTHER'),
      allowNull: false,
      defaultValue: 'CERTIFICATE'
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
  await queryInterface.addIndex('reward_levels', ['school_id']);
  await queryInterface.addIndex('reward_levels', ['school_id', 'level'], { unique: true });

  await queryInterface.addIndex('reward_types', ['school_id']);
  await queryInterface.addIndex('reward_types', ['level_id']);
  await queryInterface.addIndex('reward_types', ['code']);
  await queryInterface.addIndex('reward_types', ['is_active']);

  await queryInterface.addIndex('reward_actions', ['school_id']);
  await queryInterface.addIndex('reward_actions', ['action_type']);
  await queryInterface.addIndex('reward_actions', ['is_active']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('reward_actions');
  await queryInterface.dropTable('reward_types');
  await queryInterface.dropTable('reward_levels');
};