export default (sequelize, DataTypes) => {
  const LetterApproval = sequelize.define(
    "LetterApproval",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      incoming_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      outgoing_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "APPROVE, REJECT, SEND, CLOSE",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "letter_approvals",
      timestamps: false,
    }
  );

  LetterApproval.associate = (models) => {
    LetterApproval.belongsTo(models.IncomingLetter, {
      foreignKey: "incoming_id",
      as: "incomingLetter",
    });
    
    LetterApproval.belongsTo(models.OutgoingLetter, {
      foreignKey: "outgoing_id",
      as: "outgoingLetter",
    });
    
    LetterApproval.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return LetterApproval;
};
