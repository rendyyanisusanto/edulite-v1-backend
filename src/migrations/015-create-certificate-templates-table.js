export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('certificate_templates', {
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
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: 'Nama template (e.g., Sertifikat Prestasi Akademik)'
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Deskripsi template'
        },
        background_image: {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'URL gambar background template (JPG/PNG) di MinIO'
        },
        background_image_key: {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Key file background image di MinIO'
        },
        background_fit: {
            type: Sequelize.STRING(20),
            allowNull: true,
            defaultValue: 'cover',
            comment: 'cover, contain, fill, center'
        },
        orientation: {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: 'portrait',
            comment: 'portrait atau landscape'
        },
        certificate_width: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 800,
            comment: 'Lebar sertifikat dalam pixel'
        },
        certificate_height: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 600,
            comment: 'Tinggi sertifikat dalam pixel'
        },
        layout: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Posisi dan styling untuk setiap field dinamis (nama, lomba, dll)'
        },
        is_default: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Template default untuk sekolah'
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Status aktif template'
        },
        created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
    });

    // Indexes
    await queryInterface.addIndex('certificate_templates', ['school_id'], {
        name: 'idx_certificate_templates_school'
    });
    await queryInterface.addIndex('certificate_templates', ['is_active'], {
        name: 'idx_certificate_templates_active'
    });
    await queryInterface.addIndex('certificate_templates', ['is_default'], {
        name: 'idx_certificate_templates_default'
    });
    await queryInterface.addIndex('certificate_templates', ['orientation'], {
        name: 'idx_certificate_templates_orientation'
    });
};

export const down = async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('certificate_templates');
};
