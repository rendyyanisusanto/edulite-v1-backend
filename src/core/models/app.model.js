export default (sequelize, DataTypes) => {
  const App = sequelize.define(
    "App",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      base_url: { type: DataTypes.STRING(255), allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "apps",
      timestamps: false,
    }
  );

  App.associate = (models) => {
    App.hasMany(models.SchoolApp, {
      foreignKey: "app_id",
      as: "schoolApps",
    });
  };

  return App;
};
