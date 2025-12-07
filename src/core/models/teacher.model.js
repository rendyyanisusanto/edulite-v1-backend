export default (sequelize, DataTypes) => {
  const Teacher = sequelize.define(
    "Teacher",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: { type: DataTypes.STRING(100), allowNull: true },
      nip: { type: DataTypes.STRING(50), allowNull: true },
      position: { type: DataTypes.STRING(100), allowNull: true },
      subject: { type: DataTypes.STRING(100), allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "teachers",
      timestamps: false,
    }
  );

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
  };

  return Teacher;
};
