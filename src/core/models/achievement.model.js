export default (sequelize, DataTypes) => {
  const Achievement = sequelize.define(
    "Achievement",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      event_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Lomba, Kompetisi, Kejuaraan, Olimpiade, dll",
      },
      level: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Sekolah, Kecamatan, Kabupaten, Provinsi, Nasional, Internasional",
      },
      organizer: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      event_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "achievements",
      timestamps: false,
    }
  );

  Achievement.associate = (models) => {
    Achievement.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    Achievement.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    Achievement.hasMany(models.AchievementParticipant, {
      foreignKey: "achievement_id",
      as: "participants",
    });
    Achievement.hasMany(models.AchievementDocument, {
      foreignKey: "achievement_id",
      as: "documents",
    });
  };

  return Achievement;
};
