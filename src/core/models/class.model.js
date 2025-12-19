export default (sequelize, DataTypes) => {
  const ClassRoom = sequelize.define(
    "ClassRoom",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      grade_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "null for elementary/middle",
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g., "10 TKJ 1", "8A", "6B"',
      },
      homeroom_teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      academic_year_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "classes",
      timestamps: false,
    }
  );

  ClassRoom.associate = (models) => {
    ClassRoom.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    ClassRoom.belongsTo(models.Grade, {
      foreignKey: "grade_id",
      as: "grade",
    });
    ClassRoom.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });
    ClassRoom.belongsTo(models.AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academicYear",
    });
    ClassRoom.belongsTo(models.Teacher, {
      foreignKey: "homeroom_teacher_id",
      as: "homeroomTeacher",
    });
    ClassRoom.hasMany(models.Student, {
      foreignKey: "class_id",
      as: "students",
    });
  };

  return ClassRoom;
};
