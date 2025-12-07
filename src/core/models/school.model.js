export default (sequelize, DataTypes) => {
  const School = sequelize.define(
    "School",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        comment: "Kode unik tiap sekolah",
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      domain: { type: DataTypes.STRING(255), allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      phone: { type: DataTypes.STRING(30), allowNull: true },
      logo: { type: DataTypes.STRING(255), allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "ACTIVE",
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "schools",
      timestamps: false,
    }
  );

  School.associate = (models) => {
    School.hasMany(models.User, {
      foreignKey: "school_id",
      as: "users",
    });
    School.hasMany(models.SchoolApp, {
      foreignKey: "school_id",
      as: "apps",
    });
  };

  return School;
};
