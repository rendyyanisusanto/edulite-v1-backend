export default (sequelize, DataTypes) => {
  const RewardAction = sequelize.define(
    "RewardAction",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      level_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "reward_actions",
      underscored: true,
      timestamps: true,
    }
  );

  RewardAction.associate = (models) => {
    RewardAction.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    RewardAction.belongsTo(models.RewardLevel, {
      foreignKey: "level_id",
      as: "rewardLevel",
    });
    RewardAction.hasMany(models.StudentReward, {
      foreignKey: "action_id",
      as: "studentRewards",
    });
  };

  return RewardAction;
};
