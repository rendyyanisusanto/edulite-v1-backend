export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('academic_years', {
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
      comment: 'e.g., "2024/2025"'
    },
    start_date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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
  await queryInterface.addIndex('academic_years', ['school_id']);
  await queryInterface.addIndex('academic_years', ['school_id', 'is_active']);
  await queryInterface.addIndex('academic_years', ['school_id', 'name'], { unique: true });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('academic_years');
};