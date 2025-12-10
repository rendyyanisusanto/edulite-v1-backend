export default (sequelize, DataTypes) => {
  const ParentProfile = sequelize.define(
    "ParentProfile",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [["AYAH", "IBU", "WALI"]],
        },
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      nik: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      occupation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      education: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      is_guardian: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "parent_profiles",
      timestamps: false,
    }
  );

  ParentProfile.associate = (models) => {
    ParentProfile.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "student",
    });
    ParentProfile.hasMany(models.ParentDocument, {
      foreignKey: "parent_id",
      as: "documents",
    });
  };

  return ParentProfile;
};
