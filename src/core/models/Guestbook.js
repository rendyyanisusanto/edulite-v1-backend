export default (sequelize, DataTypes) => {
  const Guestbook = sequelize.define(
    "Guestbook",
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
      guest_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      guest_type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: "ORTU, ALUMNI, VENDOR, INSTANSI, DLL",
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      purpose: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Tujuan kunjungan",
      },
      related_person: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Bertemu dengan siapa",
      },
      visit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      checkin_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      checkout_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "IN",
        comment: "IN, OUT",
      },
      note: {
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
      tableName: "guestbooks",
      timestamps: false,
    }
  );

  Guestbook.associate = (models) => {
    Guestbook.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    
    Guestbook.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    
    Guestbook.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });
  };

  return Guestbook;
};
