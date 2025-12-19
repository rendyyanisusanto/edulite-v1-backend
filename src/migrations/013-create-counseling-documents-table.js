export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('counseling_documents', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        case_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'counseling_cases',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        document_type: {
            type: Sequelize.ENUM('CASE', 'SESSION', 'FOLLOWUP'),
            allowNull: false,
            comment: 'Tipe dokumen'
        },
        reference_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'ID referensi (session_id atau followup_id)'
        },
        file_path: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        file_name: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        file_size: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Ukuran file dalam bytes'
        },
        mime_type: {
            type: Sequelize.STRING(100),
            allowNull: true
        },
        description: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        created_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    });

    // Indexes
    await queryInterface.addIndex('counseling_documents', ['case_id']);
    await queryInterface.addIndex('counseling_documents', ['document_type']);
    await queryInterface.addIndex('counseling_documents', ['reference_id']);
    await queryInterface.addIndex('counseling_documents', ['created_by']);
};

export const down = async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('counseling_documents');
};
