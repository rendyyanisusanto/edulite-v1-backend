export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('counseling_schedules', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        school_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'schools',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
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
        schedule_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        counselor_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        status: {
            type: Sequelize.ENUM('UPCOMING', 'DONE', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'UPCOMING',
            comment: 'UPCOMING, DONE, CANCELLED'
        },
        created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });

    // Indexes
    await queryInterface.addIndex('counseling_schedules', ['school_id']);
    await queryInterface.addIndex('counseling_schedules', ['case_id']);
    await queryInterface.addIndex('counseling_schedules', ['counselor_id']);
    await queryInterface.addIndex('counseling_schedules', ['schedule_date']);
    await queryInterface.addIndex('counseling_schedules', ['status']);
};

export const down = async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('counseling_schedules');
};
