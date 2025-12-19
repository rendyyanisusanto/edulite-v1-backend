export default (sequelize, DataTypes) => {
    const CounselingDocument = sequelize.define('CounselingDocument', {
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
        document_type: {
            type: DataTypes.ENUM('CASE', 'SESSION', 'FOLLOWUP'),
            allowNull: false,
            comment: 'Tipe dokumen'
        },
        reference_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID referensi (session_id atau followup_id)'
        },
        file_path: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Ukuran file dalam bytes'
        },
        mime_type: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'counseling_documents',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    // Associations
    CounselingDocument.associate = (models) => {
        CounselingDocument.belongsTo(models.CounselingCase, {
            foreignKey: 'case_id',
            as: 'counseling_case'
        });
        CounselingDocument.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'creator'
        });
    };

    return CounselingDocument;
};
