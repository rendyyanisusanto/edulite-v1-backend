export default (sequelize, DataTypes) => {
  const ParentDocument = sequelize.define(
    "ParentDocument",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      document_type: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      document_file: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "parent_documents",
      timestamps: false,
    }
  );

  ParentDocument.associate = (models) => {
    ParentDocument.belongsTo(models.ParentProfile, {
      foreignKey: "parent_id",
      as: "parent",
    });
  };

  return ParentDocument;
};
