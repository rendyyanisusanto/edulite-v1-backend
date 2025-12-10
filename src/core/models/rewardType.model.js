export default (sequelize, DataTypes) => {
  const RewardType = sequelize.define(
    "RewardType",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      level_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "reward_types",
      underscored: true,
      timestamps: true,
    }
  );

  RewardType.associate = (models) => {
    RewardType.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    RewardType.belongsTo(models.RewardLevel, {
      foreignKey: "level_id",
      as: "rewardLevel",
    });
    RewardType.hasMany(models.StudentReward, {
      foreignKey: "type_id",
      as: "studentRewards",
    });
  };

  return RewardType;
};
