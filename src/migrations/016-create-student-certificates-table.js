export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_certificates', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        school_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'schools',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        student_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        achievement_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'achievements',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        template_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'certificate_templates',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        certificate_number: {
            type: Sequelize.STRING(50),
            allowNull: true,
            comment: 'Nomor piagam/sertifikat',
        },
        certificate_title: {
            type: Sequelize.STRING(150),
            allowNull: true,
            comment: 'Judul sertifikat, contoh: Piagam Penghargaan',
        },
        issued_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            comment: 'Tanggal penerbitan sertifikat',
        },
        file_path: {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Path file PDF hasil generate di MinIO',
        },
        file_key: {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Key file di MinIO',
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        created_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('student_certificates', ['school_id']);
    await queryInterface.addIndex('student_certificates', ['student_id']);
    await queryInterface.addIndex('student_certificates', ['achievement_id']);
    await queryInterface.addIndex('student_certificates', ['template_id']);
    await queryInterface.addIndex('student_certificates', ['certificate_number']);
};

export const down = async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('student_certificates');
};
