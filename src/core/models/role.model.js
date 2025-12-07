export default (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "SuperAdmin, AdminSekolah, Guru, Siswa, Ortu",
      },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "roles",
      timestamps: false,
    }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: "role_id",
      otherKey: "user_id",
      as: "users",
    });
  };

  return Role;
};
