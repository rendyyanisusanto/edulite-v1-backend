export default (sequelize, DataTypes) => {
  const SchoolApp = sequelize.define(
    "SchoolApp",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: { type: DataTypes.INTEGER, allowNull: false },
      app_id: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING(20), defaultValue: "ACTIVE" },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "school_apps",
      timestamps: false,
    }
  );

  SchoolApp.associate = (models) => {
    SchoolApp.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    SchoolApp.belongsTo(models.App, {
      foreignKey: "app_id",
      as: "app",
    });
  };

  return SchoolApp;
};
