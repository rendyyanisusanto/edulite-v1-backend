export default (sequelize, DataTypes) => {
  const StudentDocument = sequelize.define(
    "StudentDocument",
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
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      document_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      document_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      document_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      issued_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      document_file: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      document_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      notes: {
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
      tableName: "student_documents",
      timestamps: false,
    }
  );

  StudentDocument.associate = (models) => {
    StudentDocument.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    StudentDocument.belongsTo(models.Student, {
      foreignKey: "student_id",
      as: "student",
    });
    StudentDocument.belongsTo(models.DocumentType, {
      foreignKey: "document_type_id",
      as: "documentTypeInfo",
    });
    StudentDocument.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    StudentDocument.belongsTo(models.User, {
      foreignKey: "updated_by",
      as: "updater",
    });
  };

  return StudentDocument;
};
