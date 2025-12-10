export default (sequelize, DataTypes) => {
  const ViolationLevel = sequelize.define(
    "ViolationLevel",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Ringan, Sedang, Berat",
      },
      min_point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Minimal poin",
      },
      max_point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Batas poin",
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "violation_levels",
      timestamps: true,
      underscored: true,
    }
  );

  ViolationLevel.associate = (models) => {
    ViolationLevel.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    ViolationLevel.hasMany(models.ViolationType, {
      foreignKey: "level_id",
      as: "violationTypes",
    });
    ViolationLevel.hasMany(models.ViolationAction, {
      foreignKey: "level_id",
      as: "violationActions",
    });
  };

  return ViolationLevel;
};
