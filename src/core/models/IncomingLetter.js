export default (sequelize, DataTypes) => {
  const IncomingLetter = sequelize.define(
    "IncomingLetter",
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
        comment: "Nomor surat eksternal dari pengirim",
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
      sender: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      received_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      letter_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Tanggal surat dari pengirim",
      },
      priority: {
        type: DataTypes.STRING(30),
        defaultValue: "NORMAL",
        comment: "LOW, NORMAL, HIGH",
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: "BARU",
        comment: "BARU, DISPOSISI, PROSES, SELESAI, ARSIP",
      },
      auto_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Nomor otomatis di-generate sistem",
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
      tableName: "incoming_letters",
      timestamps: false,
    }
  );

  IncomingLetter.associate = (models) => {
    IncomingLetter.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    
    IncomingLetter.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    
    IncomingLetter.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });
    
    IncomingLetter.hasMany(models.LetterAttachment, {
      foreignKey: "incoming_id",
      as: "attachments",
    });
    
    IncomingLetter.hasMany(models.LetterApproval, {
      foreignKey: "incoming_id",
      as: "approvals",
    });
    
    IncomingLetter.hasMany(models.LetterDisposition, {
      foreignKey: "incoming_id",
      as: "dispositions",
    });
  };

  return IncomingLetter;
};
