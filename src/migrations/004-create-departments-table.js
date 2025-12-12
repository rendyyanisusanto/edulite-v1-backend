export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('departments', {
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
      comment: 'e.g., "Science", "Social Studies", "Language"'
    },
    code: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Department code for identification'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    head_teacher_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
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
  await queryInterface.addIndex('departments', ['school_id']);
  await queryInterface.addIndex('departments', ['school_id', 'code'], { unique: true });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('departments');
};