export default (sequelize, DataTypes) => {
  const OutgoingLetter = sequelize.define(
    "OutgoingLetter",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      letter_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Nomor surat keluar resmi",
      },
      classification: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "UMUM, UNDANGAN, RAHASIA, PENTING",
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      recipient: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      letter_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      send_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      priority: {
        type: DataTypes.STRING(30),
        defaultValue: "NORMAL",
        comment: "LOW, NORMAL, HIGH",
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: "DRAFT",
        comment: "DRAFT, PENDING, APPROVED, SENT, REJECTED, ARCHIVED",
      },
      auto_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Nomor otomatis dari sistem",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "outgoing_letters",
      timestamps: false,
    }
  );

  OutgoingLetter.associate = (models) => {
    OutgoingLetter.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    
    OutgoingLetter.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    
    OutgoingLetter.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });
    
    OutgoingLetter.hasMany(models.LetterAttachment, {
      foreignKey: "outgoing_id",
      as: "attachments",
    });
    
    OutgoingLetter.hasMany(models.LetterApproval, {
      foreignKey: "outgoing_id",
      as: "approvals",
    });
  };

  return OutgoingLetter;
};
