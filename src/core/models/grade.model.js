export default (sequelize, DataTypes) => {
  const Grade = sequelize.define(
    "Grade",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g., "Grade 1", "Grade 10"',
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "e.g., 1, 2, 3, ... for sorting",
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "grades",
      timestamps: false,
    }
  );

  Grade.associate = (models) => {
    Grade.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    Grade.hasMany(models.ClassRoom, {
      foreignKey: "grade_id",
      as: "classes",
    });
  };

  return Grade;
};
