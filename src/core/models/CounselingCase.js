export default (sequelize, DataTypes) => {
  const CounselingCase = sequelize.define('CounselingCase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    source: {
      type: DataTypes.ENUM('GURU', 'ORTU', 'SISWA', 'BK', 'SISTEM'),
      allowNull: false,
      defaultValue: 'SISTEM'
    },
    issue_title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    issue_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM('RINGAN', 'SEDANG', 'BERAT'),
      allowNull: false,
      defaultValue: 'RINGAN'
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'WAITING_PARENT', 'RESOLVED', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'counseling_cases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Associations
  CounselingCase.associate = (models) => {
    CounselingCase.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
    CounselingCase.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    CounselingCase.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    CounselingCase.belongsTo(models.User, { foreignKey: 'updated_by', as: 'updater' });
  };

  return CounselingCase;
};