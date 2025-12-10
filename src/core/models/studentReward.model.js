export default (sequelize, DataTypes) => {
  const StudentReward = sequelize.define(
    "StudentReward",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      evidence_file: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("NEW", "APPROVED", "REJECTED", "ACTIONED"),
        defaultValue: "NEW",
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "student_rewards",
      underscored: true,
      timestamps: true,
    }
  );

  StudentReward.associate = (models) => {
    StudentReward.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "student",
    });
    StudentReward.belongsTo(models.RewardType, {
      foreignKey: "type_id",
      as: "rewardType",
    });
    StudentReward.belongsTo(models.RewardAction, {
      foreignKey: "action_id",
      as: "rewardAction",
    });
    StudentReward.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    StudentReward.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approver",
    });
  };

  return StudentReward;
};
