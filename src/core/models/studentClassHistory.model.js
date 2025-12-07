export default (sequelize, DataTypes) => {
  const StudentClassHistory = sequelize.define(
    "StudentClassHistory",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      academic_year_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      grade_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "user yang assign kelas",
      },
      assignment_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "AUTO, MANUAL",
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "student_class_history",
      timestamps: false,
    }
  );

  StudentClassHistory.associate = (models) => {
    StudentClassHistory.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "student",
    });
    StudentClassHistory.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    StudentClassHistory.belongsTo(models.AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academicYear",
    });
    StudentClassHistory.belongsTo(models.Grade, {
      foreignKey: "grade_id",
      as: "grade",
    });
    StudentClassHistory.belongsTo(models.ClassRoom, {
      foreignKey: "class_id",
      as: "class",
    });
    StudentClassHistory.belongsTo(models.User, {
      foreignKey: "assigned_by",
      as: "assignedBy",
    });
  };

  return StudentClassHistory;
};
