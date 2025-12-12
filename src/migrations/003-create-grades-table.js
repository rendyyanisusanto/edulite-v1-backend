export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('grades', {
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
      comment: 'e.g., "Grade 1", "Grade 10"'
    },
    level: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'e.g., 1, 2, 3, ... for sorting'
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
  await queryInterface.addIndex('grades', ['school_id']);
  await queryInterface.addIndex('grades', ['school_id', 'level'], { unique: true });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('grades');
};