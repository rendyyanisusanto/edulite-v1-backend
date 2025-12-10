export default (sequelize, DataTypes) => {
  const ViolationAction = sequelize.define(
    "ViolationAction",
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
      action_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "violation_actions",
      timestamps: true,
      underscored: true,
    }
  );

  ViolationAction.associate = (models) => {
    ViolationAction.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    ViolationAction.belongsTo(models.ViolationLevel, {
      foreignKey: "level_id",
      as: "level",
    });
    ViolationAction.hasMany(models.StudentViolation, {
      foreignKey: "action_id",
      as: "studentViolations",
    });
  };

  return ViolationAction;
};
