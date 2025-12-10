export default (sequelize, DataTypes) => {
  const StudentViolation = sequelize.define(
    "StudentViolation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      evidence_file: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "URL file bukti di MinIO",
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: "NEW",
        comment: "NEW, APPROVED, REJECTED, ACTIONED",
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "student_violations",
      timestamps: true,
      underscored: true,
    }
  );

  StudentViolation.associate = (models) => {
    StudentViolation.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "student",
    });
    StudentViolation.belongsTo(models.ViolationType, {
      foreignKey: "type_id",
      as: "type",
    });
    StudentViolation.belongsTo(models.ViolationAction, {
      foreignKey: "action_id",
      as: "action",
    });
    StudentViolation.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    StudentViolation.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approver",
    });
  };

  return StudentViolation;
};
