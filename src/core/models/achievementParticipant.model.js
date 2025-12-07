export default (sequelize, DataTypes) => {
  const AchievementParticipant = sequelize.define(
    "AchievementParticipant",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      achievement_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "jika peserta adalah siswa",
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "jika pendamping/pelatih guru",
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Peserta, Pelatih, Pendamping",
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "achievement_participants",
      timestamps: false,
    }
  );

  AchievementParticipant.associate = (models) => {
    AchievementParticipant.belongsTo(models.Achievement, {
      foreignKey: "achievement_id",
      as: "achievement",
    });
    AchievementParticipant.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "student",
    });
    AchievementParticipant.belongsTo(models.Teacher, {
      foreignKey: "teacher_id",
      as: "teacher",
    });
    AchievementParticipant.hasMany(models.AchievementResult, {
      foreignKey: "participant_id",
      as: "results",
    });
  };

  return AchievementParticipant;
};
