export default (sequelize, DataTypes) => {
  const CounselingSession = sequelize.define('CounselingSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    case_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'counseling_cases',
        key: 'id'
      }
    },
    counselor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    session_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('OFFLINE', 'ONLINE', 'CALL'),
      allowNull: false,
      defaultValue: 'OFFLINE'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'lama sesi dalam menit'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    next_plan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'rencana tindak lanjut'
    }
  }, {
    tableName: 'counseling_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Associations
  CounselingSession.associate = (models) => {
    CounselingSession.belongsTo(models.CounselingCase, { foreignKey: 'case_id', as: 'counseling_case' });
    CounselingSession.belongsTo(models.Teacher, { foreignKey: 'counselor_id', as: 'counselor' });
  };

  return CounselingSession;
};