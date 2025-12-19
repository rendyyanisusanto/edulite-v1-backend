export default (sequelize, DataTypes) => {
  const CounselingFollowup = sequelize.define('CounselingFollowup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'counseling_sessions',
        key: 'id'
      }
    },
    followup_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    followup_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('DONE', 'PENDING'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  }, {
    tableName: 'counseling_followups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // Associations
  CounselingFollowup.associate = (models) => {
    CounselingFollowup.belongsTo(models.CounselingSession, { foreignKey: 'session_id', as: 'counseling_session' });
    CounselingFollowup.belongsTo(models.Teacher, { foreignKey: 'followup_by', as: 'followup_teacher' });
  };

  return CounselingFollowup;
};
