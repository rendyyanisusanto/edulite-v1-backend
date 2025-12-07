export default (sequelize, DataTypes) => {
  const LetterDisposition = sequelize.define(
    "LetterDisposition",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      incoming_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      from_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      to_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      instruction: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Isi instruksi disposisi",
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: "PENDING",
        comment: "PENDING, ON_PROGRESS, DONE",
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Batas waktu penyelesaian",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "letter_dispositions",
      timestamps: false,
    }
  );

  LetterDisposition.associate = (models) => {
    LetterDisposition.belongsTo(models.IncomingLetter, {
      foreignKey: "incoming_id",
      as: "incomingLetter",
    });
    
    LetterDisposition.belongsTo(models.User, {
      foreignKey: "from_user_id",
      as: "fromUser",
    });
    
    LetterDisposition.belongsTo(models.User, {
      foreignKey: "to_user_id",
      as: "toUser",
    });
    
    LetterDisposition.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
  };

  return LetterDisposition;
};
