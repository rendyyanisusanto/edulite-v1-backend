export default (sequelize, DataTypes) => {
  const Department = sequelize.define(
    "Department",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'e.g., "Science", "Social", "Computer Engineering"',
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'e.g., "IPA", "IPS", "TKJ"',
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "departments",
      timestamps: false,
    }
  );

  Department.associate = (models) => {
    Department.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    Department.hasMany(models.ClassRoom, {
      foreignKey: "department_id",
      as: "classes",
    });
  };

  return Department;
};
