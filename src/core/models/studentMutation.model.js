export default (sequelize, DataTypes) => {
  const StudentMutation = sequelize.define(
    "StudentMutation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "MASUK, PINDAH, KELUAR",
      },
      from_school: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "sekolah asal (jika MASUK)",
      },
      to_school: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "sekolah tujuan (jika PINDAH/KELUAR)",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "alasan",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "tanggal mutasi",
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "student_mutations",
      timestamps: false,
    }
  );

  StudentMutation.associate = (models) => {
    StudentMutation.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "student",
    });
    StudentMutation.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    StudentMutation.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
  };

  return StudentMutation;
};
