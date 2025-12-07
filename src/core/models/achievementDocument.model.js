export default (sequelize, DataTypes) => {
  const AchievementDocument = sequelize.define(
    "AchievementDocument",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      achievement_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: "URL dokumen di MinIO",
      },
      file_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Key file di MinIO",
      },
      caption: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      file_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "image, document, certificate",
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "achievement_documents",
      timestamps: false,
    }
  );

  AchievementDocument.associate = (models) => {
    AchievementDocument.belongsTo(models.Achievement, {
      foreignKey: "achievement_id",
      as: "achievement",
    });
  };

  return AchievementDocument;
};
