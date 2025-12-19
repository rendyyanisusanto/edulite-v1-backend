export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('counseling_followups', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        session_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'counseling_sessions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        followup_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        followup_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        notes: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM('DONE', 'PENDING'),
            allowNull: false,
            defaultValue: 'PENDING',
            comment: 'DONE, PENDING'
        },
        created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });

    // Indexes
    await queryInterface.addIndex('counseling_followups', ['session_id']);
    await queryInterface.addIndex('counseling_followups', ['followup_by']);
    await queryInterface.addIndex('counseling_followups', ['followup_date']);
    await queryInterface.addIndex('counseling_followups', ['status']);
};

export const down = async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('counseling_followups');
};
