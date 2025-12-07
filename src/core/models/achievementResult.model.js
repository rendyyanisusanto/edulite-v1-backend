export default (sequelize, DataTypes) => {
  const AchievementResult = sequelize.define(
    "AchievementResult",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      participant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rank: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Juara 1, Juara 2, Harapan, Finalis, dll",
      },
      score: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "jika ada penilaian",
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "tunggal, beregu, putra/putri",
      },
      certificate_file: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL sertifikat di MinIO",
      },
      certificate_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Key file sertifikat di MinIO",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "achievement_results",
      timestamps: false,
    }
  );

  AchievementResult.associate = (models) => {
    AchievementResult.belongsTo(models.AchievementParticipant, {
      foreignKey: "participant_id",
      as: "participant",
    });
  };

  return AchievementResult;
};
