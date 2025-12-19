export default (sequelize, DataTypes) => {
    const CounselingSchedule = sequelize.define('CounselingSchedule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        school_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'schools',
                key: 'id'
            }
        },
        case_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'counseling_cases',
                key: 'id'
            }
        },
        schedule_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        counselor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('UPCOMING', 'DONE', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'UPCOMING'
        }
    }, {
        tableName: 'counseling_schedules',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    // Associations
    CounselingSchedule.associate = (models) => {
        CounselingSchedule.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
        CounselingSchedule.belongsTo(models.CounselingCase, { foreignKey: 'case_id', as: 'counseling_case' });
        CounselingSchedule.belongsTo(models.Teacher, { foreignKey: 'counselor_id', as: 'counselor' });
    };

    return CounselingSchedule;
};
