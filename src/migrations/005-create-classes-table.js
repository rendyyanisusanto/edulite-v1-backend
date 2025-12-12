export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('classes', {
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
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    academic_year_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'academic_years',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'e.g., "X MIPA 1", "VII B"'
    },
    homeroom_teacher_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 40,
      comment: 'Maximum number of students'
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
  await queryInterface.addIndex('classes', ['school_id']);
  await queryInterface.addIndex('classes', ['grade_id']);
  await queryInterface.addIndex('classes', ['academic_year_id']);
  await queryInterface.addIndex('classes', ['homeroom_teacher_id']);
  await queryInterface.addIndex('classes', ['school_id', 'grade_id', 'academic_year_id', 'name'], { unique: true });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('classes');
};