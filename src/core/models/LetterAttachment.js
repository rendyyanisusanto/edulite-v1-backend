export default (sequelize, DataTypes) => {
  const LetterAttachment = sequelize.define(
    "LetterAttachment",
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
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "File size in bytes",
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      caption: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "letter_attachments",
      timestamps: false,
    }
  );

  LetterAttachment.associate = (models) => {
    LetterAttachment.belongsTo(models.IncomingLetter, {
      foreignKey: "incoming_id",
      as: "incomingLetter",
    });
    
    LetterAttachment.belongsTo(models.OutgoingLetter, {
      foreignKey: "outgoing_id",
      as: "outgoingLetter",
    });
  };

  return LetterAttachment;
};
