export default (sequelize, DataTypes) => {
  const CardTemplate = sequelize.define(
    "CardTemplate",
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
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      background_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      background_fit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "cover",
      },
      orientation: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "portrait",
        validate: {
          isIn: [["portrait", "landscape"]],
        },
      },
      card_width: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 300,
      },
      card_height: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 450,
      },
      layout: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: { elements: [] },
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: "card_templates",
      timestamps: false,
    }
  );

  CardTemplate.associate = (models) => {
    CardTemplate.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    CardTemplate.hasMany(models.Student, {
      foreignKey: "card_template_id",
      as: "students",
    });
  };

  return CardTemplate;
};
