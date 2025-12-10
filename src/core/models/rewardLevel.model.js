export default (sequelize, DataTypes) => {
  const RewardLevel = sequelize.define(
    "RewardLevel",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      min_point: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_point: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "reward_levels",
      underscored: true,
      timestamps: true,
    }
  );

  RewardLevel.associate = (models) => {
    RewardLevel.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    RewardLevel.hasMany(models.RewardType, {
      foreignKey: "level_id",
      as: "rewardTypes",
    });
    RewardLevel.hasMany(models.RewardAction, {
      foreignKey: "level_id",
      as: "rewardActions",
    });
  };

  return RewardLevel;
};
