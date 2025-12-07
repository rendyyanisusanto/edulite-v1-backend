export default (sequelize, DataTypes) => {
  const AcademicYear = sequelize.define(
    "AcademicYear",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g., "2024/2025"',
      },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      end_date: { type: DataTypes.DATEONLY, allowNull: false },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "academic_years",
      timestamps: false,
    }
  );

  AcademicYear.associate = (models) => {
    AcademicYear.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
  };

  return AcademicYear;
};
