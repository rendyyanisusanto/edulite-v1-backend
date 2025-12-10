export default (sequelize, DataTypes) => {
  const ViolationType = sequelize.define(
    "ViolationType",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      level_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "violation_types",
      timestamps: true,
      underscored: true,
    }
  );

  ViolationType.associate = (models) => {
    ViolationType.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    ViolationType.belongsTo(models.ViolationLevel, {
      foreignKey: "level_id",
      as: "level",
    });
    ViolationType.hasMany(models.StudentViolation, {
      foreignKey: "type_id",
      as: "studentViolations",
    });
  };

  return ViolationType;
};
